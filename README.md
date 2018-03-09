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
type | Define o tipo da Coluna | string | "text"
title | Define o header da coluna | string | "Nome do Usuário"
item| Define a propriedade do objeto que aparece na coluna | function | function(item){ return item.nome }
align| Alinhamento do texto na coluna | "left", "center", "right"| "center"
maxLength| Tamanho máximo de caracteres na coluna | int | 20
popOver| Mostra a coluna em um balão | boolean | true
     
 ### Tipos de Colunas
 
 Checkbox
   { type: "checkbox", title: "Selecionar", callback: function, item: row.item }
   
 Subgrid  
   { type: "subgrid", title: "Detalhes", item: row.item }
   
  Menu
   { type: "menu", title: "Opções", showRow: scope.sgControls.showAction, menu: scope.actions }
   
  Action
   { type: "action", title: "Imprimir", callback: function, icon: "fa-printer") }
   
  Switch
   { type: "switch", title: "Ativar/Desativer", item: row.item, callback: function }
   
  Favorite  
   { type: "favorite", title: "Favorito", item: row.item, callback: function, showRow: function }
   
  Progress
   { type: "progress", title: "Progresso", class: function, item: row.item }
   
  Approve
   { type: "approve", title: "Aprovação", showCol: function, showRow: function, callback: function }

### data

Um array contendo os objetos que deverão ser carregados na grid.

`<softgrid data="vm.data"> </softgrid>`

     vm.data = [
                 {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}},
                 {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}},
                 {nome: "Peixoto", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0404"}}
               ];

### sg-controls
     
Controles fullscren:

     vm.controls.fullscreen = {on: "Mostrar filtros", off: "Esconder filtros", top: 60, zindex: 999}; //todos opcionais
        
Dados Filtrados (v1.3.5)

     vm.controls.filtered = [];
     
     //basta inicializar este objeto para diretiva retornar os dados que estao filtrados na grid
            
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




