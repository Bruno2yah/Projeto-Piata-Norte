import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { MenuTop } from '../../component/menu-top/menu-top';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Exemplo do protótipo qu aparece quando a URL não tem id 
const EXEMPLO: Orcamento = {
  id_orcamento: 'PN-2026-014',
  nome_projeto: 'Cozinha e sala - Apê Horizonte',
  data_orcamento: '2026-10-16',
  arquiteto: 'Arquiteta Beatriz Costa',
  cliente: 'Ana Martins',
  prazo_de_entrega: '35 dias úteis',
  valor_total: 7000,
  status: 'Em produção',
  itens: [
    {
      descricao: 'Fabricar e instalar armário inferior para cozinha, com acabamento em MDF amadeirado.',
      med_largura: 3, med_altura: 0.9, med_profundidade: 0.6,
      metro_movel3: 1.62, material_por_metro3: 1666.67,
      insumos: 520, taxa_mao_de_obra: 1000, valor: 4220,
    },
    {
      descricao: 'Fabricar e instalar painel com rack para sala, com acabamento em MDF amadeirado.',
      med_largura: 2, med_altura: 2.4, med_profundidade: 0.35,
      metro_movel3: 1.68, material_por_metro3: 1071.43,
      insumos: 280, taxa_mao_de_obra: 700, valor: 2780,
    },
  ],
};

@Component({
  imports: [MenuTop, RouterLink],
  selector: 'app-preview',
  styleUrl: './preview.css',
  templateUrl: './preview.html',
})
export class Preview {
  private rota = inject(ActivatedRoute);
  private servico = inject(OrcamentoService);

  // O id vem na URL: /preview?id=XXXX
  orcamentoSelecionado = toSignal(
    this.rota.queryParamMap.pipe(
      switchMap((parametros) => {
        const id = parametros.get('id');

        // Sem id na URL mostra o exemplo do protótipo
        if (!id) return of<Orcamento | undefined>(EXEMPLO);

        // Com id busca esse orçamento no Firestore
        return this.servico.obterOrcamentos().pipe(
          map((lista) => {
            return lista.find((orcamento) => orcamento.id_orcamento === id);
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  formatarReais(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor ?? 0));
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
}