import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuLateralComponent } from './component/menu-lateral/menu-lateral';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuLateralComponent],
  templateUrl: './app.html'
})
export class App{}
