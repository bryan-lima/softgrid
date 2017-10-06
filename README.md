# Softgrid
Diretiva de grid para Angularjs com Bootstrap e Font Awesome.

# Instalação

bower install softgrid

bower install softgrid --save

**Importante**: Injetar modulo 'softgrid.directive' no projeto.

## Utilização

//HTML

`<softgrid cols="vm.colunas" actions="vm.acoes" data="vm.data"> </softgrid>`

// JAVASCRIPT

     function _gerarGrid() {

         vm.colunas = [
             {title: "Nome",     item: function(item){return item.nome}},
             {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
             {title: "Telefone", item: function(item){return item.contato.telefone}}
         ];

         vm.acoes = [
             {title: "Editar",   icon: "fa fa-info-circle", function: _teste},
             {title: "Excluir",  icon: "fa fa-wrench",      function: _teste},
             {title: "Bloquear", icon: "fa fa-calculator",  function: _teste}
         ];

         vm.data = [
                      {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}},
                      {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}},
                      {nome: "Peixoto", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0404"}}
                    ];
     }

     function _teste(item){
          alert(item);
     }

## Atributos

### cols

Define as colunas da grid.

`<softgrid cols="vm.colunas"> </softgrid>`

     vm.colunas = [
        {title: "Nome",     item: function(item){return item.nome}},
        {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
        {title: "Telefone", item: function(item){return item.contato.telefone}}
     ];
     
Propriedade | Função | Valores | Exemplo
------------ |--------|--------|--------
title | Define o header da coluna | string | "Nome do Usuário"
item| Define a propriedade do objeto que aparece na coluna | function | function(item){ return item.nome }
align| Alinhamento do texto na coluna | "left", "center", "right"| "center"
maxLength| Tamanho máximo de caracteres na coluna | int | 20
popOver| Mostra a coluna em um balão | boolean | true
     
 

### actions

Cria um botão de menu (hamburguer) em cada linha da grid contendo a ação desejada.

`<softgrid actions="vm.acoes"></softgrid>`

     vm.acoes = [
        {title: "Editar",   icon: "fa fa-info-circle", function: _editarUsuario},
        {title: "Excluir",  icon: "fa fa-wrench",      function: _excluirUsuario},
        {title: "Bloquear", icon: "fa fa-calculator",  function: _bloquearUsuario}
     ];

### data

Um array contendo os objetos que deverão ser carregados na grid.

`<softgrid data="vm.data"> </softgrid>`

     vm.data = [
                 {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}},
                 {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}},
                 {nome: "Peixoto", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0404"}}
               ];

### width

Define um tamanho fixo de largura para a grid.

`<softgrid cols="vm.colunas" actions="vm.acoes" data="vm.data" width="1000"> </softgrid>`

### hide

Um objeto passado como atributo da diretiva informando os controles que deverão ser escondidos.

`<softgrid cols="vm.colunas" actions="vm.acoes" data="vm.data" hide="vm.esconder"> </softgrid>`

Controles para Esconder |
------------ |
filter |
options|
pagination|
     
     
     
     //Esconder os controles um por um:
     vm.esconder = {filter: true};
     
     //Esconder todos os controles:
     vm.esconder = {all: true};
     


### template

Define uma classe CSS customizada para a grid.

### subgrid

Define uma sub-grid em cada linha da grid para mostrar objetos-filhos de algum item do array.



