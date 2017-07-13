(function () {
    'use strict';

    angular.module('softgrid.directive', [])
        .directive('softgrid', softGrid);

    /** @ngInject */
    function softGrid(){

    return {
        restrict: 'E',
        replace: true,
        scope:{
            data: "=",
            cols: "=",
            width: "=",
            actions: "=",
            hide: "=",
            subgrid: "=",
            template: "="
        },
        templateUrl: 'app/components/softgrid/softgrid.html',
        link: function(scope, element, attrs){

           // scope.dados = scope[attrs.dados];
           // scope.colunas = scope[attrs.colunas];

            scope.linhaMin = 0;

            //controla o maximo de linhas por pagina
            scope.linhaMax = 10;

            //controla a ordenacao da grid
            scope.softOrdem = '';

            //controla paginacao da grid
            scope.softPagina = 1;

            //controla o limite de linhas por pagina
            scope.softLimite = 10;

           // scope.acoes = scope[attrs.acoes];

            scope.softGridToExcel = function() {

                var html = createTable();
                var downloadLink = document.getElementById("softDownload");
                downloadLink.href = 'data:application/vnd.ms-excel;base64,' + $.base64.encode(html);

                downloadLink.download = 'Planilha_' + new Date().toLocaleDateString() + '.xls';
                downloadLink.click();
                downloadLink.href = "";
                downloadLink.download = "";

            }

            function createTable(){

                var table = "<table>";

                var i = 0;

                table += "<tr>";

                for(i = 0; i < scope.cols.length; i++){
                    table += "<td><b>" + scope.cols[i].title + "</b></td>";
                }

                table += "</tr>";

                var a;

                for(i = 0; i < scope.data.length; i++){

                    table += "<tr>";

                    for(a = 0; a < scope.cols.length; a++){

                        table += "<td>";

                        table += scope.cols[a].item ? scope.data[i][scope.cols[a].item] : scope.data[i][scope.cols[a].subitem.a][scope.cols[a].subitem.b];

                        table += "</td>";
                    }

                    table += "</tr>";
                }

                table += "</table>";

                return table;
            }

            $(".softgrid-container .dropdown").on('click', function() {
                $(this).find('.dropdown-menu').css('top',$(this).offset().top + 28);
                $(this).find('.dropdown-menu').css('left',$(this).offset().left);
            });

        }
    };

    }

    //diretiva para popover
    angular.module('softgrid.directive').directive('popover', function() {
        return function(scope, elem) {
            elem.popover();
        }
    });

})();
