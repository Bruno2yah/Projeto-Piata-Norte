import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  formularioCadastro = new FormGroup({
    nome: new FormControl('', [
      Validators.required
    ]),
    sobrenome: new FormControl('', [
      Validators.required
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    senha: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
    confirmar: new FormControl('', [
      Validators.required
    ]),

    termos: new FormControl(false, [
      Validators.requiredTrue
    ]) 

  });

  mensagemSucesso='';

  validarCadastro(){
    console.log('foi executado');
    this.formularioCadastro.markAllAsTouched();

    const senha= this.formularioCadastro.get('senha')?.value;
    const confirmarControle = this.formularioCadastro.get('confirmar');
    const confirmar= confirmarControle?.value;

    if(senha && confirmar && senha !== confirmar) {
      confirmarControle?.setErrors({
        ...confirmarControle.errors,
        senhaDiferente: true
      });
      this.mensagemSucesso='';
      return;
    }

    if (confirmarControle?.hasError('senhaDiferente')){
      confirmarControle.updateValueAndValidity();
    }
    if (this.formularioCadastro.invalid){
      this.mensagemSucesso='';
      return;
    }
    this.mensagemSucesso='Cadastro validado com sucesso!';
  }
}