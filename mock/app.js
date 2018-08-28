angular.module('todoApp', ['softgrid.directive','ngSanitize'])
    .controller('TodoListController', function($timeout) {

        var vm = this;

        vm.teste = "Adolfinho";

        function _gerarGrid() {

            var _sub = [
                {status: {id: 1, nome: "Em execução" } , nome: "Mariana", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 0},
                {status: {id: 1, nome: "Em execução" } ,nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 5},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 10},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 15},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: true, progresso: 20},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 25},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 30},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 35},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: true, progresso: 40},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 45},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 50},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 55},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 60},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 65},
                {status: {id: 1, nome: "Em execução" } , nome: "Opa", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 70},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 75},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 80},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 85},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: true, progresso: 90},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 95},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 100},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 11},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: true, progresso: 54},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 83},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 78},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 12},
                {status: {id: 1, nome: "Em execução" } , nome: "Jack", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0202"}], ativo: false, progresso: 27},
                {status: {id: 1, nome: "Em execução" } , nome: "Nunes", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0303"}], ativo: false, progresso: 45},
                {status: {id: 1, nome: "Em execução" } , nome: "Peixoto", cargo: "Programador", contato: [{tipo: "residencial", telefone: "12 90101-0404"}], ativo: false, progresso: 18}
            ];

            var dataSelect = [
                {id: 1, nome: "Em execução"},
                {id: 2, nome: "Pendente"},
                {id: 3, nome: "Cancelado"}
            ];

            vm.colunas = [
                {type: "checkbox", title: "Selecionar", callback: opa, item: "ativo" },
                {title: "Nome",     item: function(item){return item.nome}, edit: { item: "nome", function: _editar, width: "100%"}},
                {title: "Cargo",    item: function(item){return item.cargo}, align: "center", click: opa},
                {title: "Telefone", item: function(item){return 0}, width: "100px", popOver: true},
                {type: "select", title: "Status", item: 'status', data: dataSelect, field: { text: 'nome', value: 'id' },
                callback: _callBackApprove},
                {title: "Cargo A", default: false, item: function(item){return item.cargo + "A"}},
                {title: "Cargo B", default: false, item: function(item){return item.cargo + "B"}},
                {title: "Cargo C", default: false, item: function(item){return item.cargo + "C"}},
                {
                    type: "favorite",
                    title: "Favorito",
                    item: function(item){return item.ativo; },
                    callback: _teste,
                    show: function(item) { return true; }
                }
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

            vm.controles.showAction = _showMenu;

            //vm.controles.favorite = { title: "Favoritar", function: _editar, item: function(item){ return item.ativo }, width: 50, show: function(item){ return item.ativo === false;} };

            vm.subgrid = {};
            vm.subgrid.item = function (item) { return item.contato };

            vm.subgrid.cols = [
                {title: "Nome",     item: function(item){return item.tipo}, edit: { item: "nome", function: _editar, width: "100%"}},
                {title: "Telefone", item: function(item){return item.telefone}}
            ];

            vm.subgrid.hide = {all:true};

            vm.store = {enabled: true, id: "GRID1" }

            vm.acoes = [
                {title: "Editar",   icon: "fa fa-info-circle", function: _teste, show: _showItemA },
                {title: "Excluir",  icon: "fa fa-wrench",      function: _teste, show: _showItemB},
                {title: "Bloquear", icon: "fa fa-calculator",  function: _bloquear}
            ];

//checkbox
            vm.controles.checkBox = {
                function: _teste,
                item: "ativo"
            };

            vm.controles.approve = { showCol: false, show: _showApprove, callback: _callBackApprove };
            vm.controles.filtered = [];

            vm.controles.rowColor = corLinha;

        }

        function trocarCorLinha(item){
            return item.ativo;
        }

        function corLinha(item){
            return item.ativo ? "red" : "";
        }

        function opa(item){
            console.log(item);
        }

        function _bloquear(item){
            console.log("bloquear");
            console.log(item);
        }
        function _callBackApprove(item, aprovado)
        {
            item.ativo = !item.ativo;
            console.log(item + "|" + aprovado);
        }

        function _showApprove(item){
            return item.progresso > 50;
        }

        function _showMenu(item){

            return item.progresso > 0
        }

        function _showItemA(item){
            return item.progresso > 10 && item.progresso < 20
        }

        function _showItemB(item){
            return item.progresso < 10;
        }

        function _showItemC(item){
            return item.progresso > 90;
        }

        function _editar(item){

            item.ativo = true;
            console.log(item);
        }

        function _teste(item){
            item.ativo = !item.ativo;
            console.log(item);
        }

        _gerarGrid();

        $timeout(function(){$('[data-toggle="tooltip"]').tooltip();}, 200);

        vm.setarTudo = function(){
            angular.forEach(vm.data, function(item){
                item.ativo = true;
            });
        }
    });