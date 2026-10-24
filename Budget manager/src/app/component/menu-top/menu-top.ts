import { Component, Input } from "@angular/core";

@Component({
  imports: [],
  selector: "app-menu-top",
  styleUrl: "./menu-top.css",
  templateUrl: "./menu-top.html",
})
export class MenuTop {
    // Isso faz com que seja selecionado em toda página o nome da pagina atual
    // de padrão fica como inicio
    @Input() paginaAtual: string = 'Início';
}
