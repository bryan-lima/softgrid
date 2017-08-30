# Softgrid
Diretiva de grid para Angularjs com Bootstrap e Font Awesome.

## Utilização

`<softgrid cols="vm.colunas" actions="vm.acoes" data="vm.data"> </softgrid>`

function _gerarGridUsuario() {
     
    vm.colunas = [
        {title: "Nome",     item: function(item){return item.nome}},
        {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
        {title: "Telefone", item: function(item){return item.contato.telefone}}
    ];

    vm.acoes = [
        {title: "Editar",   icon: "fa fa-info-circle", function: _editarUsuario},
        {title: "Excluir",  icon: "fa fa-wrench",      function: _excluirUsuario},
        {title: "Bloquear", icon: "fa fa-calculator",  function: _bloquearUsuario}
    ];
    
    vm.data = _listaPessoas;
}

## Atributos

### cols

Define as colunas da grid.

### actions

Cria um botão de menu (hamburguer) em cada linha da grid contendo a ação desejada. 

### data

Um array contendo os objetos que deverão ser carregados na grid.

### width

Define um tamanho fixo de largura para a grid.

### hide

Um objeto passado como atributo da diretiva informando os controles que deverão ser escondidos.

### template

Define uma classe CSS customizada para a grid.

### subgrid

Define uma sub-grid em cada linha da grid para mostrar objetos-filhos de algum item do array.



