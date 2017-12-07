angular.module('todoApp', ['softgrid.directive','ngSanitize'])
    .controller('TodoListController', function() {

        var vm = this;

        vm.teste = "Adolfinho";

        function _gerarGrid() {

            var _sub = [
                {nome: "Opa", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Opa", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false},
                {nome: "Peixoto", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0404"}, ativo: false}
            ];

            vm.colunas = [
                {title: "Nome",     item: function(item){return item.nome}, edit: { item: "nome", function: _editar, width: "100%"}},
                {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
                {title: "Telefone", item: function(item){return item.contato.telefone}}
            ];

            vm.acoes = [
                {title: "Editar",   icon: "fa fa-info-circle", function: _teste},
                {title: "Excluir",  icon: "fa fa-wrench",      function: _teste},
                {title: "Bloquear", icon: "fa fa-calculator",  function: _teste}
            ];

            vm.data = _sub;

            vm.menu = [{title: "Cadastrar", icon: "fa fa-plus", function: _teste}];

            vm.controles = {};
            vm.controles.fullscreen = {on: "Mostrar filtros", off: "Esconder filtros", top: 60, zindex: 999};

            vm.controles.active = false;
            vm.controles.activeTitle = "Ativar/Desativar";
            vm.controles.activeCol = function(item){return item.ativo};
            vm.controles.activeFunction = _teste;

            vm.controles.favorite = { title: "Favoritar", function: _editar, item: function(item){ return item.ativo }, width: 50 };

            vm.subgrid = {};
            vm.subgrid.object = "sub";
            vm.subgrid.cols = [
                {title: "Nome",     item: function(item){return item.nome}, edit: { item: "nome", function: _editar, width: "100%"}},
                {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
                {title: "Telefone", item: function(item){return item.contato.telefone}}
            ];

            vm.subgrid.hide = {all:true};

        }

        function _editar(item){

            item.ativo = true;
            console.log(item);
        }

        function _teste(item){
            alert(item);
        }

        _gerarGrid();

    });