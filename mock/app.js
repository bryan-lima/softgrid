angular.module('todoApp', ['softgrid.directive','ngSanitize'])
    .controller('TodoListController', function() {

        var vm = this;

        vm.teste = "Adolfinho";

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

            vm.controles = {};
            vm.controles.read = {title:'teste',action:_teste};
            vm.controles.fullScreenTitle = "Esconder filtros";
        }

        function _teste(item){
            alert(item);
        }

        _gerarGrid();

    });