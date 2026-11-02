import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { CardSummary } from '../../component/card-summary/card-summary';
import { MenuTop } from '../../component/menu-top/menu-top';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento';

@Component({
  selector: 'app-dashboard',
  imports: [MenuTop, FormsModule, CardSummary, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly orcamentoService = inject(OrcamentoService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  listaOrcamentos: Orcamento[] = [];
  carregando = true;
  erro = '';
  erroExclusao = '';
  mensagemAcao = '';
  orcamentoParaExcluir: Orcamento | null = null;
  duplicandoId: string | null = null;
  excluindo = false;

  constructor() {
    this.orcamentoService
      .obterOrcamentos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (orcamentos) => {
        this.listaOrcamentos = [...orcamentos].sort(
          (a, b) =>
            this.dataEmMilissegundos(b.data_orcamento) -
            this.dataEmMilissegundos(a.data_orcamento),
        );
        this.carregando = false;
        this.changeDetector.detectChanges();
        },
        error: (erro) => {
        console.error('Erro ao carregar os orçamentos:', erro);
        this.erro = 'Não foi possível carregar os orçamentos. Tente novamente.';
        this.carregando = false;
        this.changeDetector.detectChanges();
        },
      });
  }

  get totalEmProducao(): number {
    return this.listaOrcamentos.filter((orcamento) => orcamento.status === 'Em produção').length;
  }

  get totalFinalizados(): number {
    return this.listaOrcamentos.filter(
      (orcamento) => orcamento.status === 'Finalizado' || orcamento.status === 'Finalizados',
    ).length;
  }

  async duplicarOrcamento(orcamento: Orcamento): Promise<void> {
    this.erro = '';
    this.mensagemAcao = '';
    this.duplicandoId = orcamento.id_orcamento ?? null;

    const copia: Orcamento = {
      ...orcamento,
      data_orcamento: this.hojeIso(),
      itens: (orcamento.itens ?? []).map((item) => ({ ...item })),
    };
    delete copia.id_orcamento;

    try {
      await this.orcamentoService.criarOrcamento(copia);
      this.mensagemAcao = 'Orçamento duplicado com sucesso.';
    } catch (erro) {
      console.error('Erro ao duplicar o orçamento:', erro);
      this.erro = 'Não foi possível duplicar o orçamento. Tente novamente.';
    } finally {
      this.duplicandoId = null;
      this.changeDetector.detectChanges();
    }
  }

  solicitarExclusao(orcamento: Orcamento): void {
    this.erro = '';
    this.erroExclusao = '';
    this.mensagemAcao = '';
    this.orcamentoParaExcluir = orcamento;
  }

  cancelarExclusao(): void {
    if (this.excluindo) return;
    this.orcamentoParaExcluir = null;
    this.erroExclusao = '';
  }

  @HostListener('document:keydown.escape')
  aoPressionarEscape(): void {
    if (this.orcamentoParaExcluir) this.cancelarExclusao();
  }

  async confirmarExclusao(): Promise<void> {
    const id = this.orcamentoParaExcluir?.id_orcamento;
    if (!id) {
      this.erroExclusao = 'Não foi possível identificar o orçamento para excluir.';
      return;
    }

    this.excluindo = true;
    this.erroExclusao = '';

    try {
      await this.orcamentoService.eliminarOrcamento(id);
      this.orcamentoParaExcluir = null;
      this.mensagemAcao = 'Orçamento excluído com sucesso.';
    } catch (erro) {
      console.error('Erro ao excluir o orçamento:', erro);
      this.erroExclusao = 'Não foi possível excluir o orçamento. Tente novamente.';
    } finally {
      this.excluindo = false;
      this.changeDetector.detectChanges();
    }
  }

  formatarData(data?: string): string {
    if (!data) return '—';
    const dataConvertida = this.converterData(data);
    if (!dataConvertida) return String(data);

    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(dataConvertida);
  }

  private dataEmMilissegundos(data: unknown): number {
    return this.converterData(data)?.getTime() ?? 0;
  }

  private hojeIso(): string {
    const data = new Date();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mes}-${dia}`;
  }

  private converterData(data: unknown): Date | null {
    const dataConvertida =
      data instanceof Timestamp
        ? data.toDate()
        : typeof data === 'string'
          ? new Date(data)
          : null;

    return dataConvertida && !Number.isNaN(dataConvertida.getTime())
      ? dataConvertida
      : null;
  }
}
