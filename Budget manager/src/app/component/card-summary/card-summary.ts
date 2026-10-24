import { Component, Input } from "@angular/core";
import { NgClass } from '@angular/common';

@Component({
  imports: [NgClass],
  selector: "app-card-summary",
  styleUrl: "./card-summary.css",
  templateUrl: "./card-summary.html",
})
export class CardSummary {
    // Define o texto que ficará em cima
    @Input() label: String = 'Padrão';
    // Define o número (0 padrão)
    @Input() number: Number = 0;
    // Define o texto que ficará em baixo
    @Input() sub: String = 'Padrão';

}
