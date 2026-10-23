import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [RouterLink],
  templateUrl: 'menu-lateral.html',
  styleUrls: ['menu-lateral.css']
})
export class MenuLateralComponent {}