import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { MenuTop } from '../../component/menu-top/menu-top';
import { Orcamento, OrcamentoFormDraft } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const EXEMPLO: Orcamento = {
  id_orcamento: 'EXEMPLO-TESTE-01',
  nome_projeto: 'Projeto fictício de demonstração',
  data_orcamento: '2026-01-15',
  arquiteto: 'Arquiteto de exemplo',
  cliente: 'Cliente de demonstração',
  prazo_de_entrega: 'Prazo ilustrativo',
  valor_total: 15,
  status: 'Em produção',
  itens: [
    {
      descricao: 'Item de teste: móvel pequeno usado apenas para demonstrar a prévia.',
      med_largura: 0.1, med_altura: 0.1, med_profundidade: 0.1,
      metro_movel3: 0.001, material_por_metro3: 10000,
      insumos: 2, taxa_mao_de_obra: 3, valor: 15,
    },
  ],
};

function ehOrcamento(valor: unknown): valor is Orcamento {
  if (!valor || typeof valor !== 'object') return false;
  const orcamento = valor as Partial<Orcamento>;
  return typeof orcamento.nome_projeto === 'string' && Array.isArray(orcamento.itens);
}

function ehRascunho(valor: unknown): valor is OrcamentoFormDraft {
  if (!valor || typeof valor !== 'object') return false;
  const rascunho = valor as Partial<OrcamentoFormDraft>;
  return typeof rascunho.projeto === 'string' && Array.isArray(rascunho.itens);
}

@Component({
  imports: [MenuTop],
  selector: 'app-preview',
  styleUrl: './preview.css',
  templateUrl: './preview.html',
})
export class Preview {
  private readonly rota = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servico = inject(OrcamentoService);
  private readonly estado = this.router.getCurrentNavigation()?.extras.state ?? history.state;
  private readonly rascunhoFormulario = ehRascunho(this.estado?.['rascunhoFormulario'])
    ? this.estado['rascunhoFormulario']
    : undefined;
  readonly retornoPreview =
    typeof this.estado?.['retornoPreview'] === 'string' &&
    (this.estado['retornoPreview'].startsWith('/orcamento/') ||
      this.estado['retornoPreview'] === '/dashboard')
      ? this.estado['retornoPreview']
      : '/dashboard';

  readonly orcamentoSelecionado = toSignal(
    this.rota.queryParamMap.pipe(
      switchMap((parametros) => {
        const id = parametros.get('id');
        if (id) return this.servico.obterOrcamento(id);
        const orcamento = this.estado?.['orcamentoPreview'];
        return of(ehOrcamento(orcamento) ? orcamento : EXEMPLO);
      }),
    ),
    { initialValue: null },
  );

  async voltar(): Promise<void> {
    const orcamento = this.orcamentoSelecionado();
    const id = orcamento?.id_orcamento;
    if (id && this.rascunhoFormulario) {
      this.servico.guardarRascunho(id, this.rascunhoFormulario);
    }
    await this.router.navigateByUrl(this.retornoPreview);
  }

  formatarReais(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor ?? 0));
  }

  imprimir(): void {
    window.print();
  }

  formatarMetros(valor: number): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  calcularMetade(orcamento: Orcamento): number {
    return Number(orcamento.valor_total ?? 0) / 2;
  }
// Ajustando datas aqui:
  formatarDataExtensa(texto: string): string {
    const dataIso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto ?? '');
    const dataBr = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texto ?? '');
    if (dataIso) return `${+dataIso[3]} de ${MESES[+dataIso[2] - 1]} de ${dataIso[1]}`;
    if (dataBr) return `${+dataBr[1]} de ${MESES[+dataBr[2] - 1]} de ${dataBr[3]}`;
    return texto ?? '';
  }

  montarCodigo(orcamento: Orcamento): string {
    const id = orcamento.id_orcamento ?? '';
    if (id.startsWith('PN-')) return id;
    return id ? 'PN-' + id.slice(0, 6).toUpperCase() : 'PN';
  }

  statusEhProducao(status: string): boolean {
    return this.normalizarStatus(status) === 'em producao';
  }

  statusEhFinalizado(status: string): boolean {
    const normalizado = this.normalizarStatus(status);
    return normalizado === 'finalizado' || normalizado === 'finalizados';
  }

  private normalizarStatus(status: string): string {
    return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}