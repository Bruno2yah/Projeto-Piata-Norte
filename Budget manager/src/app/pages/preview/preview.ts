import { Component } from '@angular/core';
import { MenuTop } from '../../component/menu-top/menu-top';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MenuTop, RouterLink],
  selector: 'app-preview',
  styleUrl: './preview.css',
  templateUrl: './preview.html',
})
export class Preview {}
