import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuTop } from '../../component/menu-top/menu-top';
import { ItemOrcamento, Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento';

function numero(valor: string | number | null | undefined): number {
  if (typeof valor === 'number') return valor;
  let texto = (valor ?? '').toString().replace(/[R$\s]/g, '');
  if (!texto) return 0;
  if (texto.includes(',')) {
    texto = texto.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(texto)) {
    texto = texto.replace(/\./g, '');
  }
  const n = Number(texto);
  return Number.isFinite(n) ? n : 0;
}

const arredondar = (n: number, casas = 2) => Math.round(n * 10 ** casas) / 10 ** casas;
const SO_NUMERO = /^\s*\d+([.,]\d+)?\s*$/;

@Component({
  imports: [MenuTop, RouterLink, ReactiveFormsModule],
  selector: 'app-formulario',
  standalone: true,
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrcamentoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly statusInicial = 'Em produção';
  readonly orcamentoId = this.route.snapshot.paramMap.get('id');

  salvando = false;
  salvandoStatus = false;
  carregando = !!this.orcamentoId;
  orcamentoEncontrado = false;
  erro = '';
  private orcamentoOriginal?: Orcamento;

  readonly form = this.fb.nonNullable.group({
    cliente: ['', Validators.required],
    arquiteto: [''],
    projeto: ['', Validators.required],
    pagamento: [''],
    prazo: ['', Validators.required],
    itens: this.fb.nonNullable.array([this.novoItem()]),
  });

  constructor() {
    if (!this.orcamentoId) return;

    this.form.disable();
    this.service
      .obterOrcamento(this.orcamentoId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (orcamento) => {
          if (!orcamento) {
            this.erro = 'Orçamento não encontrado.';
          } else {
            this.orcamentoOriginal = orcamento;
            this.preencherFormulario(orcamento);
            this.orcamentoEncontrado = true;
            this.form.enable();
          }
          this.carregando = false;
          this.changeDetector.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao carregar o orçamento:', erro);
          this.erro = 'Não foi possível carregar o orçamento. Tente novamente.';
          this.carregando = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  get itens() {
    return this.form.controls.itens;
  }

  get valorTotal(): number {
    return this.itens.controls.reduce((total, _, indice) => total + this.subtotal(indice), 0);
  }

  get statusAtual(): string | null {
    return this.orcamentoOriginal?.status ?? null;
  }

  get statusFinalizado(): boolean {
    return this.statusAtual === 'Finalizado' || this.statusAtual === 'Finalizados';
  }

  async alternarStatus(): Promise<void> {
    if (!this.orcamentoId || !this.orcamentoOriginal || this.salvandoStatus) return;

    const novoStatus = this.statusFinalizado ? 'Em produção' : 'Finalizado';
    this.salvandoStatus = true;
    this.erro = '';

    try {
      await this.service.atualizarOrcamento(this.orcamentoId, { status: novoStatus });
      this.orcamentoOriginal = { ...this.orcamentoOriginal, status: novoStatus };
    } catch (erro) {
      console.error('Erro ao alterar o status do orçamento:', erro);
      this.erro = 'Não foi possível alterar o status do orçamento. Tente novamente.';
    } finally {
      this.salvandoStatus = false;
      this.changeDetector.detectChanges();
    }
  }

  private novoItem(inicial: Partial<Record<string, string>> = {}) {
    return this.fb.nonNullable.group({
      nome: [inicial['nome'] ?? '', Validators.required],
      descricao: [inicial['descricao'] ?? ''],
      comprimento: [inicial['comprimento'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      altura: [inicial['altura'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      profundidade: [inicial['profundidade'] ?? '', [Validators.required, Validators.pattern(SO_NUMERO)]],
      madeira: [inicial['madeira'] ?? '', Validators.required],
      insumos: [inicial['insumos'] ?? '0'],
      maoDeObra: [inicial['maoDeObra'] ?? '0'],
    });
  }

  private preencherFormulario(orcamento: Orcamento): void {
    this.form.patchValue({
      cliente: orcamento.cliente,
      arquiteto: orcamento.arquiteto ?? '',
      projeto: orcamento.nome_projeto,
      pagamento: orcamento.pagamento ?? '',
      prazo: orcamento.prazo_de_entrega ?? '',
    });

    this.itens.clear();
    for (const item of orcamento.itens ?? []) {
      const separador = item.descricao.indexOf(': ');
      const nome = separador >= 0 ? item.descricao.slice(0, separador) : item.descricao;
      const descricao = separador >= 0 ? item.descricao.slice(separador + 2) : '';
      const custoMadeira = item.valor > 0
        ? Math.max(0, item.valor - item.insumos - item.taxa_mao_de_obra)
        : item.material_por_metro3 * item.metro_movel3;

      this.itens.push(this.novoItem({
        nome,
        descricao,
        comprimento: String(item.med_largura),
        altura: String(item.med_altura),
        profundidade: String(item.med_profundidade),
        madeira: String(arredondar(custoMadeira)),
        insumos: String(item.insumos),
        maoDeObra: String(item.taxa_mao_de_obra),
      }));
    }

    if (this.itens.length === 0) this.itens.push(this.novoItem());
  }

  adicionarMovel(): void {
    this.itens.push(this.novoItem());
  }

  removerMovel(indice: number): void {
    if (this.itens.length <= 1) return;
    this.itens.removeAt(indice);
  }

  subtotal(indice: number): number {
    const v = this.itens.at(indice).getRawValue();
    return numero(v.madeira) + numero(v.insumos) + numero(v.maoDeObra);
  }

  brl(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  async salvar(): Promise<void> {
    this.erro = '';

    if (this.carregando || !this.orcamentoOriginal && this.orcamentoId) {
      this.erro = 'Aguarde o carregamento do orçamento antes de salvar.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Preencha cliente, projeto, prazo e os dados de cada móvel (medidas só com números).';
      return;
    }

    const v = this.form.getRawValue();
    const itens: ItemOrcamento[] = v.itens.map((i) => {
      const largura = numero(i.comprimento);
      const altura = numero(i.altura);
      const profundidade = numero(i.profundidade);
      const volume = largura * altura * profundidade;
      const madeira = numero(i.madeira);
      const insumos = numero(i.insumos);
      const maoDeObra = numero(i.maoDeObra);
      const nome = i.nome.trim();
      const descricao = i.descricao.trim();

      return {
        descricao: descricao ? `${nome}: ${descricao}` : nome,
        med_largura: largura,
        med_altura: altura,
        med_profundidade: profundidade,
        metro_movel3: arredondar(volume, 3),
        material_por_metro3: volume > 0 ? arredondar(madeira / volume) : 0,
        insumos,
        taxa_mao_de_obra: maoDeObra,
        valor: arredondar(madeira + insumos + maoDeObra),
      };
    });

    const orcamento: Orcamento = {
      nome_projeto: v.projeto.trim(),
      data_orcamento: this.orcamentoOriginal?.data_orcamento ?? this.hojeIso(),
      cliente: v.cliente.trim(),
      prazo_de_entrega: v.prazo.trim(),
      valor_total: arredondar(itens.reduce((soma, item) => soma + item.valor, 0)),
      status: this.orcamentoOriginal?.status ?? this.statusInicial,
      itens,
    };

    orcamento.arquiteto = v.arquiteto.trim();
    orcamento.pagamento = v.pagamento.trim();

    this.salvando = true;
    try {
      if (this.orcamentoId) {
        await this.service.atualizarOrcamento(this.orcamentoId, orcamento);
      } else {
        await this.service.criarOrcamento(orcamento);
      }
      await this.router.navigate(['/dashboard']);
    } catch (erro) {
      console.error('Erro ao salvar o orçamento:', erro);
      this.erro = 'Não foi possível salvar o orçamento. Tente novamente.';
    } finally {
      this.salvando = false;
    }
  }

  private hojeIso(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
