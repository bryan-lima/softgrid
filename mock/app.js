angular.module('todoApp', ['softgrid.directive','ngSanitize'])
    .controller('TodoListController', function() {

        var vm = this;

        vm.teste = "Adolfinho";

        function _gerarGrid() {

            var _sub = [
                {nome: "<div class='width: 10%; background-color: red; height: 10px;'></div>", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 0},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 5},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 10},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 15},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true, progresso: 20},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 25},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 30},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 35},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true, progresso: 40},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 45},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 50},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 55},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 60},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 65},
                {nome: "Opa", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 70},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 75},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 80},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 85},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true, progresso: 90},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 95},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 100},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 11},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: true, progresso: 54},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 83},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 78},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 12},
                {nome: "Jack", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0202"}, ativo: false, progresso: 27},
                {nome: "Nunes", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0303"}, ativo: false, progresso: 45},
                {nome: "Peixoto", cargo: "Programador", contato: {tipo: "residencial", telefone: "12 90101-0404"}, ativo: false, progresso: 18}
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
            vm.controles.select = {all: true, item: "ativo", callback: _teste};

            vm.controles.fullscreen = {on: "Mostrar filtros", off: "Esconder filtros"};

            vm.controles.active = false;
            vm.controles.activeTitle = "Ativar/Desativar";
            vm.controles.activeCol = function(item){return item.ativo};
            vm.controles.activeFunction = _teste;

            vm.controles.create = {title:"Imprimir", icon: "fa-print", action: _teste};

            vm.controles.progress = { item: function (item) { return item.progresso ;}, title: "Conclusão", class: function (item){ return 'progress-bar-success'}};

            //vm.controles.favorite = { title: "Favoritar", function: _editar, item: function(item){ return item.ativo }, width: 50, show: function(item){ return item.ativo === false;} };

            vm.subgrid = {};
            vm.subgrid.item = function (item) { return item.sub };

            vm.subgrid.cols = [
                {title: "Nome",     item: function(item){return item.nome}, edit: { item: "nome", function: _editar, width: "100%"}},
                {title: "Cargo",    item: function(item){return item.cargo}, align: "center"},
                {title: "Telefone", item: function(item){return item.contato.telefone}}
            ];

            vm.subgrid.hide = {all:true};

            vm.store = {enabled: true, id: "GRID1" }



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