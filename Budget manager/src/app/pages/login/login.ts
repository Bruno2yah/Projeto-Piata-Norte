import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  formularioLogin=new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    senha:new FormControl('', [
      Validators.required
    ])
  });
  mensagemSucesso='';

  validarLogin(){
    if (this.formularioLogin.invalid){
      this.formularioLogin.markAllAsTouched();
      this.mensagemSucesso = '';
      return;
    }
    this.mensagemSucesso='Campos preenchidos corretamente!';
  }
  senhaVisivel=false;
  alternarSenha(){
    this.senhaVisivel=!this.senhaVisivel;
  }
}