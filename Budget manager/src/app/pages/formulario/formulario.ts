import { Component } from '@angular/core';
import { MenuTop } from '../../component/menu-top/menu-top';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuTop, RouterLink],
  selector: 'app-formulario',
  standalone: true,
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {}
