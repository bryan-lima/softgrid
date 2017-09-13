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
        templateUrl: '../bower_components/softgrid/softgrid.html',
        link: function(scope, element, attrs){

           // scope.dados = scope[attrs.dados];
           // scope.colunas = scope[attrs.colunas];

            scope.linhaMin = 0;

            //controla o maximo de linhas por pagina
            scope.linesPerPage = 10;

            //controla a ordenacao da grid
            scope.softOrdem = '';

            //controla paginacao da grid
            scope.soft_pagina_atual = 1;

            //controla o limite de linhas por pagina
            scope.softLimite = 10;

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

            scope.softHook = function(){

                _atualizarPaginacao();
                _hookDropDown();

            }

            //**----- PAGINAÇÃO -----**

            function _atualizarPaginacao(){

                scope.totalPages = scope.data.length / scope.linesPerPage;
                scope.totalPages = scope.totalPages > parseInt(scope.totalPages) ? parseInt(scope.totalPages) + 1 : scope.totalPages;

                scope.soft_pages = [];

                scope.soft_pages.push({"text": "<span class='fa fa-chevron-left'></span>", "value": -1, "active": false});

                if(scope.totalPages > 1)
                    scope.soft_pages.push({"text": 1 + "..", "value": 1, "active": scope.soft_pagina_atual == 1});

                var _pg = scope.soft_pagina_atual;

                for(var i = 2; i < scope.totalPages; i++){

                    var _active = i == _pg ? true : false;

                    if((i < _pg + 3) || (_pg <= 3 && i <= 6))
                    {
                        if( (_pg >= 3 && i > _pg - 3) || (_pg <= 3 && i <= 5) || (_pg >= 3 && i >= _pg && i <= _pg - 3) || (_pg >= scope.totalPages - 3 && i >= scope.totalPages - 5) || (_pg <=  3 && i <=  6))
                        {
                            scope.soft_pages.push({"text": i, "value": i, "active": _active});
                        }

                    }
                }

                scope.soft_pages.push({"text": ".." + scope.totalPages, "value": scope.totalPages, "active": scope.soft_pagina_atual == scope.totalPages});

                scope.soft_pages.push({"text": "<span class='fa fa-chevron-right'></span>", "value": 0, "active": false});

            }

            scope.soft_ChangePage = function(value){

                if(value == -1 && scope.soft_pagina_atual > 1)
                    scope.soft_pagina_atual = scope.soft_pagina_atual - 1;
                else if(value == -1 && scope.soft_pagina_atual == 1)
                    scope.soft_pagina_atual = scope.totalPages;
                else if(value == 0 && scope.soft_pagina_atual == scope.totalPages)
                    scope.soft_pagina_atual = 1;
                else if(value == 0 && scope.soft_pagina_atual < scope.totalPages)
                    scope.soft_pagina_atual = scope.soft_pagina_atual + 1;
                else
                    scope.soft_pagina_atual = value;

                _atualizarPaginacao();

            };

            //**----- END PAGINATION -----**

            //**----- MASKS -----**
            scope.softMask = function(colType, text){

                if(colType == "phone")
                    return maskPhone(text);
                else if(colType == "mail")
                    return maskEmail(text);
                else
                    return text;
            }

            function maskEmail(text){
                return "<a href='mailto:" + text + "'><span class='fa fa-envelope-o'></span> " + text + "</a>";
            }

            function maskPhone(text){

                text = text.replace(/\D/g,"");
                text = text.replace(/^(\d{2})(\d)/g,"($1) $2");
                text = text.replace(/(\d)(\d{4})$/,"$1-$2");

                return text
            }
            //**----- END MASKS -----**

            function _hookDropDown(){

                $(".softgrid-container .dropdown").on('click', function() {
                    $(this).find('.dropdown-menu').css('top',$(this).offset().top + 28);
                    $(this).find('.dropdown-menu').css('left',$(this).offset().left);
                });
            }

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
