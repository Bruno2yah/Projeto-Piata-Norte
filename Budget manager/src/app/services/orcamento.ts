import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, docData, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Orcamento } from '../models/orcamento.model';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoService {
  private firestore: Firestore = inject(Firestore);
  private orcamentosRef = collection(this.firestore, 'orcamentos');

  // Consulta todos os orçamentos no Firestore em tempo real
  obterOrcamentos(): Observable<Orcamento[]> {
    return collectionData(this.orcamentosRef, { idField: 'id_orcamento' }) as Observable<Orcamento[]>;
  }

  obterOrcamento(id: string): Observable<Orcamento | undefined> {
    const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
    return docData(orcamentoRef, { idField: 'id_orcamento' }) as Observable<Orcamento | undefined>;
  }

  // Grava um novo orçamento
  criarOrcamento(orcamento: Orcamento) {
    return addDoc(this.orcamentosRef, orcamento);
  }

  atualizarOrcamento(id: string, orcamento: Partial<Omit<Orcamento, 'id_orcamento'>>) {
    const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
    return updateDoc(orcamentoRef, orcamento);
  }

  // Remove um orçamento pelo ID
  eliminarOrcamento(id: string) {
    const docRef = doc(this.firestore, `orcamentos/${id}`);
    return deleteDoc(docRef);
  }
}