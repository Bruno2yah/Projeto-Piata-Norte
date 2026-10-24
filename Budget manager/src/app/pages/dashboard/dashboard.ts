import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuTop } from '../../component/menu-top/menu-top';
import { CardSummary } from '../../component/card-summary/card-summary';
import { RouterLink } from '@angular/router';

interface Orcamento {
  codigo: string;
  titulo: string;
  subtitulo?: string;
  cliente: string;
  arquiteto: string;
  data: string;
  status: 'Em produção' | 'Finalizado';
  editor: string;
  destaque?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [MenuTop, FormsModule, CardSummary, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  listaOrcamentos: Orcamento[] = [
    {
      titulo: 'Cozinha e sala · Apê Horizonte',
      codigo: 'PN-2026-014',
      subtitulo: 'exemplo principal',
      cliente: 'Ana Martins',
      arquiteto: 'Beatriz Costa',
      data: '16/10/2026',
      status: 'Em produção',
      editor: 'Não informado',
    },
    {
      titulo: 'Cozinha · Apê Jardim',
      codigo: 'PN-2026-013',
      cliente: 'Lucas Ferreira',
      arquiteto: 'Beatriz Costa',
      data: '14/10/2026',
      status: 'Em produção',
      editor: 'Não informado',
    },
    {
      titulo: 'Sala · Casa Pátio',
      codigo: 'PN-2026-012',
      cliente: 'Clara Souza',
      arquiteto: 'Rafael Lima',
      data: '10/10/2026',
      status: 'Finalizado',
      editor: 'Não informado',
    },
    {
      titulo: 'Cozinha · Casa Vista',
      codigo: 'PN-2026-011',
      cliente: 'Pedro Rocha',
      arquiteto: 'Sem arquiteto',
      data: '08/10/2026',
      status: 'Em produção',
      editor: 'Não informado',
    },
    {
      titulo: 'Sala · Apê Cedro',
      codigo: 'PN-2026-010',
      cliente: 'Lia Carvalho',
      arquiteto: 'Rafael Lima',
      data: '03/10/2026',
      status: 'Finalizado',
      editor: 'Não informado',
    },
  ];
}