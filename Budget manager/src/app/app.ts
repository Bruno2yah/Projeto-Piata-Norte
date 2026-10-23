import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuLateralComponent } from './component/menu-lateral/menu-lateral';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuLateralComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  exibirMenu = false;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.monitorarNavegacao();
  }

  monitorarNavegacao(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlAtual = event.urlAfterRedirects || event.url;
      this.exibirMenu = this.verificarSeExibeMenu(urlAtual);
    });
  }

  verificarSeExibeMenu(url: string): boolean {
    const paginasComMenu = ['/dashboard', '/orcamento','/preview'];
    return paginasComMenu.includes(url);
  }
}