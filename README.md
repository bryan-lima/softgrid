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

### actions

### data

### width

### hide

### template

### subgrid



