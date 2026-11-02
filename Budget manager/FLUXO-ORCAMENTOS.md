# Fluxo de criação, listagem e edição de orçamentos

Este documento descreve como o formulário de orçamento e o dashboard trabalham juntos, como os dados são persistidos no Cloud Firestore e o que acontece em cada ação.

## Visão geral

O fluxo usa:

- **Rotas Angular** para distinguir a criação da edição.
- **`Formulario`** para validar, montar e salvar os dados.
- **`OrcamentoService`** como camada de acesso à coleção `orcamentos`.
- **`Dashboard`** para listar os documentos e encaminhar cada orçamento para edição.
- **`Orcamento` e `ItemOrcamento`** para tipar os dados utilizados pela aplicação.

O caminho de criação é `/orcamento`. A edição usa `/orcamento/:id`, onde `:id` é o ID automático do documento no Firestore.

No formulário, **Adicionar móvel** insere um item vazio. Cada cartão de móvel também tem **Remover móvel**; a lista mantém pelo menos um item, então a remoção fica desabilitada quando só resta um.

## 1. Entrada no formulário

Há dois atalhos para criar um orçamento:

1. O item **Novo orçamento** do menu lateral.
2. O botão **Novo orçamento** no dashboard.

Ambos navegam para `/orcamento`, sem ID. Nessa situação, o formulário começa vazio, com um item de móvel em branco. O usuário pode adicionar outros itens pelo botão **Adicionar móvel**.

Para editar, o usuário clica em **Editar** na linha desejada do dashboard. O link passa `item.id_orcamento` como parâmetro e abre `/orcamento/:id`.

As duas rotas apontam para o mesmo componente `Formulario`; é a presença do ID que determina o modo:

| Rota | Modo | Ação ao salvar |
|---|---|---|
| `/orcamento` | Criação | Insere um novo documento |
| `/orcamento/:id` | Edição | Atualiza o documento existente |

## 2. Modelo dos dados

O modelo principal `Orcamento` contém:

- `id_orcamento`: ID do documento, preenchido na leitura pelo Firestore; não precisa existir como campo gravado no documento.
- `nome_projeto`, `data_orcamento`, `cliente` e `status`.
- `arquiteto`, `prazo_de_entrega` e `pagamento`, que são opcionais.
- `valor_total`.
- `itens`, uma lista de `ItemOrcamento`.

Cada `ItemOrcamento` guarda descrição, dimensões, volume, custo de material por volume, insumos, mão de obra e valor do item.

O ID exibido no dashboard corresponde ao ID do documento no Firestore. Ao consultar a coleção, `collectionData` o adiciona ao objeto com a opção `idField: 'id_orcamento'`.

## 3. Criação de um orçamento

No modo de criação:

1. O usuário preenche os dados do cliente, arquiteto, projeto, prazo, pagamento e móveis.
2. O formulário exige cliente, projeto, prazo, nome do móvel, medidas e valor da madeira. As medidas são validadas para aceitar números inteiros ou decimais.
3. Antes de salvar, os valores monetários e as medidas são convertidos para números. A entrada aceita formatos como `2700`, `2.700` e `2.700,50`.
4. Para cada móvel, o formulário calcula o volume (`largura × altura × profundidade`), o custo por volume e o total do móvel (`madeira + insumos + mão de obra`).
5. O formulário monta o objeto `Orcamento`, define a data atual no formato `AAAA-MM-DD` e usa **Em produção** como status inicial.
6. `OrcamentoService.criarOrcamento()` usa `addDoc()` para criar um documento em `orcamentos`. O Firestore gera o ID do documento.
7. Após a gravação, a aplicação navega para `/dashboard`.

Se a validação falhar, o formulário mostra uma mensagem e marca os campos inválidos. Se a gravação falhar, o erro é registrado no console e uma mensagem é exibida no formulário.

## 4. Carregamento e listagem no dashboard

Ao abrir o dashboard, `Dashboard` assina o Observable retornado por `obterOrcamentos()`. O serviço consulta a coleção inteira `orcamentos` com `collectionData()`. A assinatura permanece ativa, então alterações na coleção podem refletir na lista sem uma consulta manual adicional.

Quando os documentos chegam:

1. O dashboard ordena a lista pela data, da mais recente para a mais antiga.
2. A data pode vir como texto ou como `Timestamp`; o dashboard converte ambos para ordenar e exibir no formato brasileiro.
3. A tela atualiza a detecção de mudanças para exibir a resposta assíncrona do Firestore.
4. Os cartões de resumo calculam o total de orçamentos, os que estão **Em produção** e os **Finalizados**.
5. Cada linha exibe projeto, cliente, arquiteto, data e status. Campos opcionais ausentes são apresentados com um valor alternativo.

Durante a consulta, a página informa que está carregando. Se a consulta falhar, exibe uma mensagem de erro; se a coleção não tiver documentos, informa que nenhum orçamento foi cadastrado.

## 5. Edição de um orçamento

Ao acessar `/orcamento/:id`:

1. `Formulario` obtém o ID pela rota e desabilita o formulário enquanto carrega o documento.
2. `OrcamentoService.obterOrcamento(id)` consulta `orcamentos/{id}` por meio de `docData()`.
3. Quando o documento chega, o formulário preenche cliente, arquiteto, projeto, prazo, pagamento e os campos de cada móvel. Enquanto os dados não chegam, o botão de salvar permanece desabilitado.
4. Os dados dos móveis são reconstruídos a partir dos campos armazenados em `itens`. A descrição salva pode combinar nome e descrição; no carregamento, o formulário separa esses valores pelo primeiro `: `.
5. O usuário altera os campos necessários e seleciona **Atualizar orçamento**.
6. O formulário recalcula os itens e o total, preserva a data e o status originais e chama `OrcamentoService.atualizarOrcamento(id, dados)`.
7. O serviço usa `updateDoc()` no documento existente. Portanto, a edição não cria outro orçamento.
8. Após a atualização, a aplicação volta para `/dashboard`, cuja lista recebe os dados atualizados.

Na edição também é possível alterar o status do projeto:

- Para um orçamento **Em produção**, o botão **Finalizar projeto** atualiza imediatamente o status para **Finalizado**.
- Para um orçamento **Finalizado**, o botão **Voltar para produção** restaura o status **Em produção**.
- A alteração usa `atualizarOrcamento(id, { status })`, sem criar documento nem sobrescrever os demais campos. Enquanto a gravação está em andamento, o botão fica desabilitado. Se houver erro, o status permanece como estava e uma mensagem é exibida.

Se o documento não existir ou não puder ser carregado, a tela informa o problema. Se a atualização falhar, permanece no formulário e apresenta uma mensagem de erro.

## 6. Persistência no serviço

`OrcamentoService` centraliza as operações da coleção `orcamentos`:

| Método | Operação Firestore | Uso |
|---|---|---|
| `obterOrcamentos()` | `collectionData()` | Lista e observa todos os orçamentos |
| `obterOrcamento(id)` | `docData()` | Observa um orçamento para edição |
| `criarOrcamento(orcamento)` | `addDoc()` | Insere um documento novo |
| `atualizarOrcamento(id, dados)` | `updateDoc()` | Atualiza o documento selecionado |
| `eliminarOrcamento(id)` | `deleteDoc()` | Remove um documento |

## 7. Campos opcionais e observações

- Documentos antigos podem não conter `pagamento`; nesse caso, o campo aparece vazio na edição.
- `id_orcamento` é adicionado à resposta da consulta a partir do ID do documento. Não é necessário armazená-lo manualmente.
- O modelo não tem um campo de editor; por isso, o dashboard exibe `—` nessa coluna.
- O status inicial de novos documentos é **Em produção**. Na edição, o usuário pode alternar entre **Em produção** e **Finalizado**.
- A edição preserva a data original do orçamento, em vez de substituí-la pela data em que o usuário fez a alteração.
- O total e os valores por móvel são calculados a partir dos campos do formulário, não de valores fixos na tela.
- O ambiente do projeto deve usar uma única versão compatível do Firebase. Nesta implementação, `firebase` foi alinhado à versão 12 usada pelo AngularFire para evitar incompatibilidade de tipos entre instâncias da API Firestore.

## 8. Duplicação e exclusão pelo dashboard

Cada orçamento listado também possui as ações **Duplicar** e **Excluir**.

As ações de linha usam o mesmo estilo tipográfico e de link, com a exclusão distinguida apenas por uma tonalidade vermelha mais escura.

### Duplicar

1. A ação cria uma cópia dos campos do orçamento selecionado, incluindo os itens e seus custos.
2. O ID do documento original é removido da cópia. `addDoc()` cria um documento novo e o Firestore atribui outro ID.
3. A data da cópia é definida como a data atual; os demais dados, incluindo o status, são preservados.
4. O dashboard continua ouvindo a coleção, então a cópia aparece na lista após a confirmação do Firestore.
5. A interface informa sucesso ou mostra um erro sem esconder a falha.

### Excluir

1. A ação **Excluir** abre um modal com o nome do projeto e o cliente, deixando claro que a exclusão não pode ser desfeita.
2. **Manter orçamento** fecha o modal sem alterar o documento. A tecla Escape também cancela a confirmação.
3. **Sim, excluir** chama `eliminarOrcamento(id)`, que usa `deleteDoc()` para remover o documento.
4. Enquanto a operação está em andamento, os controles ficam desabilitados para evitar ações concorrentes.
5. Se a operação falhar, o modal permanece aberto e apresenta o erro. Se for concluída, o modal fecha e o dashboard mostra uma confirmação.

## Arquivos envolvidos

- `src/app/app.routes.ts`: rotas de criação e edição.
- `src/app/pages/formulario/formulario.ts` e `formulario.html`: formulário, validação, carregamento, cálculos e salvamento.
- `src/app/pages/dashboard/dashboard.ts`, `dashboard.html` e `dashboard.css`: leitura, apresentação, navegação para edição, duplicação e confirmação de exclusão.
- `src/app/services/orcamento.ts`: operações no Firestore.
- `src/app/models/orcamento.model.ts`: tipos dos documentos e itens.
- `package.json` e `package-lock.json`: versões das dependências.

## Validação realizada

O build de desenvolvimento Angular foi executado com sucesso. As rotas de criação e edição foram verificadas no navegador; a tela de edição carregou um documento existente e exibiu os campos e os móveis correspondentes. Os testes unitários não foram executados porque o pacote `vitest` não estava disponível no ambiente de validação.
