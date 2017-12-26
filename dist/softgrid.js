(function () {
	'use strict';

	angular.module('softgrid.directive', ['base64'])
		.directive('softgrid', softGrid);

	softGrid.$injector = ['$filter', '$base64','$timeout'];

	/** @ngInject */
	function softGrid($filter, $base64, $timeout) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				data: "=",
				cols: "=",
				width: "=",
				actions: "=",
				hide: "=",
				subgrid: "=",
				template: "=",
				sgControls: "=",
				sgMenu: "=",
				sgStore: "="
			},
			templateUrl: "softgrid.html",
			link: function (scope, element, attrs) {

				scope.sg_currentPage = 1;   //controla paginacao da grid
                scope.sg_linesPerPageInput = 10;
				scope.sg_linesPerPage = 10; //controla o maximo de linhas por pagina
				scope.sg_orderBy = '';         //controla a ordenacao da grid
				scope.sg_filterSearch = '';

                scope.larguraColunaControles = 0;

                scope.sg_selected = false;

                var flag = false;
				var firstLoad = true;

				//change page
				scope.sg_changePage = function (value) {

					if (value == -1 && scope.sg_currentPage > 1)
						scope.sg_currentPage = scope.sg_currentPage - 1;
					else if (value == -1 && scope.sg_currentPage == 1)
						scope.sg_currentPage = scope.totalPages;
					else if (value == 0 && scope.sg_currentPage == scope.totalPages)
						scope.sg_currentPage = 1;
					else if (value == 0 && scope.sg_currentPage < scope.totalPages)
						scope.sg_currentPage = scope.sg_currentPage + 1;
					else
						scope.sg_currentPage = value;

					_atualizarPaginacao();

				};

				//change lines per page
				scope.sg_changeLinesPerPage = function (value) {

					if ((value == -1 && scope.sg_linesPerPageInput > 10) || value == 1)
                        scope.sg_linesPerPageInput = scope.sg_linesPerPageInput + (value * 10);

				}

                //sort rows of the grid
                scope.sg_sort = function (col, colIndex) {

                    if(scope.data.length > 0) {

                        scope.sg_orderByColIndex = colIndex;
                        scope.reverse = (scope.sg_orderBy !== null && scope.sg_orderByColIndex === colIndex) ? !scope.reverse : false;
                        scope.data = $filter('orderBy')(scope.data, col.item, scope.reverse);
                        scope.sg_orderBy = col.item;

                        flag = true;

                        if(!firstLoad)
                        	_saveStorage();
                    }
                }

				//apply mask to column
				scope.sg_mask = function (colType, text) {

					if (colType == "phone")
						return maskPhone(text);
					else if (colType == "mail")
						return maskEmail(text);
					else
						return text;
				}

				//select all items of the row
				scope.sg_selectAll = function (){

					if(scope.dataFiltered){

						if(scope.dataFiltered.length > 0){

                            scope.sg_selected = !scope.sg_selected;

                            angular.forEach(scope.dataFiltered, function(row) {

                            	if(scope.sgControls.select.item)
                                	row[scope.sgControls.select.item] = scope.sg_selected;
                            });

                            scope.sgControls.select.callback(scope.dataFiltered);

						}
                    }
				}

				//export grid data to excel
				function sg_excel() {

					var html = createTable();
					var downloadLink = document.getElementById("softDownload");
					downloadLink.href = 'data:application/vnd.ms-excel;base64,' + $base64.encode(html);


					downloadLink.download = 'Planilha_' + new Date().toLocaleDateString() + '.xls';
					downloadLink.click();
					downloadLink.href = "";
					downloadLink.download = "";

				}

				//control
				scope.sg_hook = function () {

					_atualizarPaginacao();
					_hookDropDown();
				}

				function createTable() {

					var table = "<table>";

					var i = 0;

					table += "<tr>";

					for (i = 0; i < scope.cols.length; i++) {
						table += "<td><b>" + scope.cols[i].title + "</b></td>";
					}

					table += "</tr>";

					var a;

					for (i = 0; i < scope.data.length; i++) {

						table += "<tr>";

						for (a = 0; a < scope.cols.length; a++) {

							var valor = scope.data[i][a];

							table += "<td>";

							table += scope.data[i][a] ? scope.data[i][a] : '-';

							table += "</td>";
						}

						table += "</tr>";
					}

					table += "</table>";

					return table;
				}

				function _atualizarPaginacao() {

					if(scope.data){
					scope.totalPages = scope.data.length / scope.sg_linesPerPage;
					scope.totalPages = scope.totalPages > parseInt(scope.totalPages) ? parseInt(scope.totalPages) + 1 : scope.totalPages;

					scope.soft_pages = [];

					scope.soft_pages.push({ "text": "<span class='fa fa-chevron-left'></span>", "value": -1, "active": false });

					if (scope.totalPages > 1)
						scope.soft_pages.push({ "text": 1 + "..", "value": 1, "active": scope.sg_currentPage == 1 });

					var _pg = scope.sg_currentPage;

					for (var i = 2; i < scope.totalPages; i++) {

						var _active = i == _pg ? true : false;

						if ((i < _pg + 3) || (_pg <= 3 && i <= 6)) {
							if ((_pg >= 3 && i > _pg - 3) || (_pg <= 3 && i <= 5) || (_pg >= 3 && i >= _pg && i <= _pg - 3) || (_pg >= scope.totalPages - 3 && i >= scope.totalPages - 5) || (_pg <= 3 && i <= 6)) {
								scope.soft_pages.push({ "text": i, "value": i, "active": _active });
							}
						}
					}

					scope.soft_pages.push({ "text": ".." + scope.totalPages, "value": scope.totalPages, "active": scope.sg_currentPage == scope.totalPages });

					scope.soft_pages.push({ "text": "<span class='fa fa-chevron-right'></span>", "value": 0, "active": false });
                    }
				}

				function maskEmail(text) {
					return "<a href='mailto:" + text + "'><span class='fa fa-envelope-o'></span> " + text + "</a>";
				}

				function maskPhone(text) {

					text = text.replace(/\D/g, "");
					text = text.replace(/^(\d{2})(\d)/g, "($1) $2");
					text = text.replace(/(\d)(\d{4})$/, "$1-$2");

					return text
				}

                // *** FUNÇÕES PARA EXPORTAR EXCEL

				scope.softGridToExcel = function () {
					var _corCabecalhoFundo = '#FA6938';
					var _corCabecalhoFonte = '#FFFFFF';
					var _grossuraCabecalhoFonte = 800;
					var _corCorpoFundo = '#FFFFFF';
					var _corCorpoFonte = '#000000';
					var _grossuraCorpoFonte = 100;
					var _corSubTabelaFundo = '#DDDDDD';
					var _corSubTabelaFonte = '#000000';
					var _grossuraSubTabelaFonte = 800;
					//sg_excel();
					var retorno = gerarTabela(scope.cols, scope.data, [], [], 0, scope.cols.length);
					var html = gerarHTML(retorno);
					dispararDownloadXLSHTML(html);
				}

				function dispararDownloadXLSHTML(html) {
					var encodedUri = 'data:application/vnd.ms-excel;base64,' + $base64.encode(html);
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", (new Date()).toLocaleString());
					document.body.appendChild(link); // Required for FF
					link.click();
					document.body.removeChild(link);
				}

				function gerarHTML(lista) {
					var table = '<table border="3" cellpadding="3" cellspacing="3"><tbody>';
					lista.forEach(function (level1) {
						var tr = '<tr>';
						level1.forEach(function (level2) {
							if (level2) {
								tr += '<td style="color:' + level2.corFonte + ';background-color:' + level2.corFundo + ';font-weight:' + level2.grossuraFonte + '; ">' + level2.valor + '</td>';
							}
							else {
								tr += '<td></td>';
							}
						});
						tr += '</tr>';
						table += tr;
					});
					table += '</tbody></table>';
					return table;
				};

				function gerarTabela(colunas, linhas, subTabelas, linhasAdicionais, celulaInicial, totalCelulas, html) {
					var _conteudo = [];
					_conteudo = _conteudo.concat(gerarCabecalho(colunas, totalCelulas, celulaInicial));
					_conteudo = _conteudo.concat(gerarLinha(colunas, subTabelas, linhasAdicionais, linhas, totalCelulas, celulaInicial));
					if (html) {
						return gerarHTML(_conteudo);
					}
					else {
						return _conteudo;
					}
				};

				function gerarCabecalho(colunas, totalCelulas, celulaInicial) {
					var _retorno = [];
					var _celulas = new Array(totalCelulas);
					colunas.forEach(function(coluna){
                        _celulas[celulaInicial] = {
                            valor: coluna.title,
                            corFundo: '#FA6938',
                            corFonte: '#FFFFFF',
                            grossuraFonte: 800
                        };
                        celulaInicial++;
					});
					/*angular.element(colunas).each(function (iC, coluna) {
						_celulas[celulaInicial] = {
							valor: coluna.title,
							corFundo: '#FA6938',
							corFonte: '#FFFFFF',
							grossuraFonte: 800,
						};
						celulaInicial++;
					});*/
					_retorno.push(_celulas);
					return _retorno;
				};

				function gerarLinha(colunas, subTabelas, linhasAdicionais, linhas, totalCelulas, celulaInicial) {
					var _retorno = [];

					linhas.forEach(function (linha) {
						var _celulas = new Array(totalCelulas);
						var _celulaInicial = celulaInicial;
						colunas.forEach(function (coluna) {
							_celulas[_celulaInicial] = {
								valor: obterColunaListaValor(linha, coluna),
								corFundo: '#FFFFFF',
								corFonte: '#000000',
								grossuraFonte: 100,
							};
							_celulaInicial++;
						});
						_retorno.push(_celulas);
					});

					return _retorno;
				};

				function obterColunaListaValor(linha, coluna) {
					var valor = '';
					if (linha) {
						valor = angular.isFunction(coluna.item) ? coluna.item(linha) : linha[coluna.propriedade];
					}
					if (!valor)
						valor = ' - ';

					return valor;
				};

				// *** FIM FUNÇÕES PARA EXPORTAR EXCEL

				// *** FUNÇÕES PARA REDIMENSIONAR COLUNA ***

                scope.redimensionandoColuna = false;
				scope.elementoRedimensionado = undefined;
				scope.posicaoElementoX = 0;
				scope.larguraElementoX = 0;

				function _configurarRedimensionarColuna(){

                    $(".softgrid th").mousedown(function(e) {

                        scope.elementoRedimensionado = $(this);
                        scope.redimensionandoColuna = true;
                        scope.posicaoElementoX = e.pageX;
                        scope.larguraElementoX = $(this).width();

                    });

                    $(document).mousemove(function(e) {

                        if(scope.redimensionandoColuna) {
                            $(scope.elementoRedimensionado).width(scope.larguraElementoX + (e.pageX - scope.posicaoElementoX));
                        }

                    });

                    $(document).mouseup(function() {

                        if(scope.redimensionandoColuna) {
                            scope.redimensionandoColuna = false;
                            scope.$apply();
                        }

                    });

                }

                // *** FIM FUNÇÕES PARA REDIMENSIONAR COLUNA ***

				// *** FUNÇÃO PARA EDITAR COLUNA ***

				scope.sg_edit = function(row, col, newvalue, scope){

					row[col.edit.item] = newvalue;
					scope.editing = false;
					col.edit.function(row);
				}

				scope.sg_openEdit = function(ngScope, event){

					if(!ngScope.col.edit)
						return;

					ngScope.editing = !ngScope.editing;

					var td = angular.element(event.target).parent().parent(); //nao me orgulho disso
					var inpt = td.children()[0];

                    $timeout(function() {

                    	if(inpt.value !== "")
                            inpt.select();
						else
                        	inpt.focus();

                    }, 200) ;

				}

				// *** FIM FUNÇÃO PARA EDITAR COLUNA ***

                function _hookDropDown() {

					//posiciona o dropdown embaixo do botao clicado
                    $(".softgrid-container .dropdown").on('click', function () {

                    	var _btn = $(this);
                    	var _btnTop = _btn.offset().top;
                    	var _btnHeight = $(this).height();

                    	var _dropdown = _btn.find('.dropdown-menu');

                    	var _btnf = $(this).find('.btn');
                    	var _btnfLeft = _btnf.offset().left;

                    	var _scrollTop = $(window).scrollTop();

                    	_dropdown.css('top', (_btnTop + _btnHeight) - _scrollTop);
                        _dropdown.css('left', _btnfLeft );
                    });

                    //recalcula a posicao do dropdown de acordo com o scroll
                    $(window).scroll(function () {

                        var _button = $(".softgrid .dropdown.open");

                        if (_button.length > 0) {

                            var _dropdown = _button.find(".dropdown-menu");
                            var _scrollTop = $(this).scrollTop();
                            _dropdown.css('top', (_button.offset().top + _button.height()) - _scrollTop);

                        }
                    });

                }

                $timeout(_configurarRedimensionarColuna, 500);

				//watchers
                scope.$watch('data', function () {

                    if (flag) {
                        flag = false;
                        return;
                    }

                    if(scope.sgControls){

						if(angular.isDefined(scope.sgControls.orderBy))
							scope.sg_sort({item: scope.sgControls.orderBy});
                    }

                    if(scope.data){

                    	if(scope.data.length > 0){

                    		if(firstLoad){ //primeira vez que carregou os dados

								if(scope.sgStore)
									_loadStorage();

								firstLoad = false;
                            }
						}
					}

					_atualizarPaginacao();
                });

                scope.$watch('sg_linesPerPageInput', function () {

                    if(scope.sg_linesPerPageInput > 0)
                    {
						scope.sg_linesPerPage = parseInt(scope.sg_linesPerPageInput);

						if(!firstLoad)
							_saveStorage();
                    }

                });

                scope.$watch('sgControls', function (){

                    //define a largura da coluna de controles

                    if(angular.isDefined(scope.sgControls) && scope.sgControls){

						if(scope.sgControls.create)
							scope.larguraColunaControles += 60;

						if(scope.sgControls.read)
							scope.larguraColunaControles += 60;

						if(scope.sgControls.update)
							scope.larguraColunaControles += 60;

						if(scope.sgControls.delete)
							scope.larguraColunaControles += 60;
                	}

				});

                scope.$watch('hide', function(){

                    if(scope.hide){
                        //mostra todas linhas caso esconda paginacao
                        if(scope.hide.pagination == true || scope.hide.all == true)
                            scope.sg_linesPerPage = 999;
                    }

				});

                scope.$watch('subgrid', _calcularTamanhoColunaAcoes);

                scope.$watch('actions', _calcularTamanhoColunaAcoes);

                scope.$watch('sg_currentPage', function(){

                	if(!firstLoad)
                		_saveStorage();

				});

                function _calcularTamanhoColunaAcoes(){

                    //define a largura da coluna de acoes
                    scope.larguraColunaAcoes = 0;

                    if(scope.subgrid)
                        scope.larguraColunaAcoes += 60;

                    if(scope.actions){

						if(scope.actions.length > 0)
							scope.larguraColunaAcoes += 60;

                    }
                }

                function _saveStorage(){

                	if(!scope.sgStore)
                		return;

					if(!scope.sgStore.enabled)
						return;

					var _properties = {

						linesPerPage: scope.sg_linesPerPage,
						currentPage: scope.sg_currentPage,
						orderBy: { item: scope.sg_orderBy.toString(), reverse: !scope.reverse, index: scope.sg_orderByColIndex }

					};

                    localStorage.setItem("SG-STORE_" + scope.sgStore.id, angular.toJson(_properties));
				}

                function _loadStorage(){

					if(!scope.sgStore)
						return;

					if(!scope.sgStore.enabled)
						return;

					var _properties = angular.fromJson(localStorage.getItem("SG-STORE_" + scope.sgStore.id));

					if(!_properties)
						return;

					scope.sg_linesPerPage = scope.sg_linesPerPageInput =  _properties.linesPerPage;
					scope.sg_currentPage = _properties.currentPage;

					if(_properties.orderBy.item !== "")
					{
						var _item = {item: eval('(' + _properties.orderBy.item + ')')} ;

                        scope.reverse = _properties.orderBy.reverse;
						scope.sg_sort(_item, _properties.orderBy.index);
                    }

					_atualizarPaginacao();
				}
            }
		};

	}

	//diretiva para popover
	/*angular.module('softgrid.directive').directive('popover', function () {
		return function (scope, elem) {
			elem.popover();
		}
	});*/



})();

angular.module('softgrid.directive').run(['$templateCache', function($templateCache) {$templateCache.put('softgrid.html','\n<div class="softgrid-display" ng-class="{\'softgrid-display-fullscreen\': softgrid.fullscreen}" ng-style="sgControls.fullscreen && softgrid.fullscreen ? { \'z-index\': sgControls.fullscreen.zindex, \'top\': sgControls.fullscreen.top + \'px\'} : \'\'">\n\n    <div class="grid-controles" ng-style="sgControls.fullscreen && softgrid.fullscreen ? { \'z-index\': (sgControls.fullscreen.zindex + 1), \'top\': (sgControls.fullscreen.top) + \'px\'} : \'\'">\n\n        <div class="row" ng-hide="hide.all">\n\n            <div class="col-md-3">\n\n                <div ng-hide="hide.filter || hide.all">\n\n                    <label>Filtrar</label>\n                    <div class="input-group">\n                        <span class="input-group-addon" id="filtro-addon"><span class="fa fa-search"></span></span>\n                        <input type="text" class="form-control" ng-model="sg_filter" placeholder="Palavra-chave" aria-describedby="filtro-addon">\n                    </div>\n\n                </div>\n\n            </div>\n\n            <div class="col-md-3">\n\n                <div class="row">\n\n                    <div class="col-md-6">\n                        <div class="form-group" ng-hide="hide.linesPage || hide.all || hide.pagination" style="margin-bottom: 0;">\n\n                            <label>Linhas por p\xE1gina</label>\n\n                            <div class="input-group" style="width: 120px;">\n\n                        <span class="input-group-btn">\n                            <button class="btn btn-default" type="button" ng-click="sg_changeLinesPerPage(-1)">-</button>\n                        </span>\n\n                                <input class="form-control" ng-model="sg_linesPerPageInput">\n\n                                <span class="input-group-btn">\n\t\t\t\t\t\t\t<button class="btn btn-default" type="button" ng-click="sg_changeLinesPerPage(1)">+</button>\n\t\t\t\t\t\t</span>\n\n                            </div>\n\n                        </div>\n\n                    </div>\n\n                    <div class="col-md-6">\n\n                        <div ng-hide="hide.options || hide.all">\n\n                            <label>Op\xE7\xF5es</label>\n\n                            <div class="input-group">\n                                <input type="text" class="form-control" aria-label="..." value="{{data.length}} encontrado(s)" disabled="true">\n                                <div class="input-group-btn">\n                                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="fa fa-bars"></span></button>\n                                    <ul class="dropdown-menu dropdown-menu-right">\n                                        <li ng-repeat="item in sgMenu">\n                                            <a ng-click="item.function()"><span class="{{item.icon}}"></span> {{item.title}}</a>\n                                        </li>\n                                        <li role="separator" class="divider" ng-show="sgMenu"></li>\n                                        <li ng-if="sgControls.select"><a ng-click="sg_selectAll()"><span class="fa fa-check"></span> Selecionar Todos</a></li>\n                                        <li><a ng-click="softGridToExcel()"><span class="fa fa-file-excel-o"></span> Gerar Excel</a></li>\n                                    </ul>\n                                </div>\n                            </div>\n\n                            <div ng-if="!subgrid">\n                                <a href="#" ng-show="false"  id="softDownload"></a>\n                            </div>\n\n                        </div>\n\n                    </div>\n\n                </div>\n\n            </div>\n\n            <div class="col-md-2">\n\n                <div ng-hide="hide.fullscreen || hide.all">\n\n                    <label>&nbsp;</label><br>\n                    <button class="btn btn-default" ng-click="softgrid.fullscreen = softgrid.fullscreen ? false : true"><span class="fa fa-expand" ng-class="{\'fa-compress\': softgrid.fullscreen}"></span>\n\n                        {{ softgrid.fullscreen ? (sgControls.fullscreen.on ? sgControls.fullscreen.on : \'Tela normal\') : (sgControls.fullscreen.off ? sgControls.fullscreen.off : \'Tela cheia\') }}\n\n                    </button>\n\n                </div>\n\n            </div>\n\n            <div class="col-md-4">\n\n                <nav aria-label="Page navigation" class="pull-right" ng-hide="hide.pagination || hide.all">\n\n                    <label>Pagina\xE7\xE3o</label>\n\n                        <ul class="pagination">\n\n                            <li ng-repeat="soft_page in soft_pages" ng-class="{\'active\': soft_page.active}">\n                                <a ng-click="sg_changePage(soft_page.value)" ng-bind-html="soft_page.text"></a>\n                            </li>\n\n                        </ul>\n\n                </nav>\n\n            </div>\n\n        </div>\n\n    </div>\n\n    <div class="row">\n\n        <div class="col-md-12">\n\n                <div class="softgrid-container">\n\n                    <div ng-style=" width ? { \'width\': width + \'px\' } : { \'width\': \'100%\' }">\n\n                        <table ng-attr-id="{{!subgrid ? \'none\': \'softgrid\'}}" class="softgrid {{template}}" >\n\n                            <thead>\n\n                                <th ng-show="actions.length > 0 || subgrid">\n\n                                </th>\n\n\t\t\t\t\t\t\t\t<th ng-show="sgControls.create || sgControls.read || sgControls.update || sgControls.delete" style="text-align: center;">\n\t\t\t\t\t\t\t\t\tA\xE7\xF5es\n\t\t\t\t\t\t\t\t</th>\n\n                                <th ng-repeat="col in cols track by $index" ng-show="!col.hide" style="text-align:center;">\n\n                                  <span class="title" ng-click="sg_sort(col, $index)">\n\n\t\t\t\t\t\t\t\t\t  {{col.title}}\n\n\t\t\t\t\t\t\t\t\t  <span ng-show="$index === sg_orderByColIndex" class="fa fa-sort-amount-asc" ng-class="{\'fa-sort-amount-desc\' : reverse}"></span>\n\n\t\t\t\t\t\t\t\t  </span>\n\n                                </th>\n\n\t\t\t\t\t\t\t\t<th ng-show="sgControls.active" style="text-align: center;">\n\t\t\t\t\t\t\t\t\t{{sgControls.activeTitle}}\n\t\t\t\t\t\t\t\t</th>\n\n                                <th ng-if="sgControls.favorite" style="text-align: center;">\n\n                                    {{sgControls.favorite.title ? sgControls.favorite.title : \'Favorito\'}}\n\n                                </th>\n\n                                <th ng-if="sgControls.progress" style="text-align: center;">\n\n                                    {{sgControls.progress.title ? sgControls.progress.title : \'Progresso\'}}\n\n                                </th>\n\n                            </thead>\n\n                            <tbody>\n\n                                <tr ng-init="$last ? sg_hook() : angular.noop()" ng-class="{\'soft-row-striped\': ($index%2)}" ng-repeat-start="row in (dataFiltered = (data | filter: sg_filter | limitTo: sg_linesPerPage : ((sg_currentPage * sg_linesPerPage) - sg_linesPerPage))) track by $index" ng-style="sgControls.changeRowColor(row) === true && {\'background-color\': (sgControls.rowColor ? sgControls.rowColor :\'#e59482\')}" >\n\n                                    <td ng-show="subgrid || actions.length > 0" style="text-align:center; width: {{larguraColunaAcoes}}px">\n\n                                                <!-- bot\xE3o para exibir sub tabela -->\n                                                <button ng-show="subgrid" type="button" class="btn btn-default btn-sm btn-subgrid" ng-click="showSubGrid = showSubGrid ? false : true" style="float: left;">\n                                                    <span class="fa fa-expand" ng-class="{\'fa-compress\': showSubGrid}"></span>\n                                                </button>\n\n                                                <div class="dropdown" ng-show="actions">\n\n                                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                                                        <span class="fa fa-bars"></span>\n                                                    </button>\n\n                                                    <ul class="dropdown-menu dropdown-menu-left">\n                                                        <li ng-repeat="action in actions"><a ng-click="action.function(row)"><span class="{{action.icon}}"></span> {{action.title}}</a></li>\n                                                    </ul>\n\n                                                </div>\n\n                                    </td>\n\n\t\t\t\t\t\t\t\t\t<!-- column to actions -->\n\t\t\t\t\t\t\t\t\t<td ng-if="sgControls.create || sgControls.read || sgControls.update || sgControls.delete" style="text-align:center; width: {{larguraColunaControles}}px">\n\n\n\t\t\t\t\t\t\t\t\t\t<button ng-show="sgControls.create" type="button" class="btn btn-default btn-sm" ng-click="sgControls.create.action(row)" title="{{ sgControls.create.title ? sgControls.create.title : \'Criar\' }}">\n\t\t\t\t\t\t\t\t\t\t\t<span class="fa" ng-class="sgControls.create.icon ? sgControls.create.icon : \'fa-plus\'"></span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\n\t\t\t\t\t\t\t\t\t\t<button ng-show="sgControls.read" type="button" class="btn btn-default btn-sm"   ng-click="sgControls.read.action(row)" title="{{ sgControls.read.title ? sgControls.read.title : \'Ver\' }}">\n\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-search"></span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\n\t\t\t\t\t\t\t\t\t\t<button ng-show="sgControls.update" type="button" class="btn btn-default btn-sm" ng-click="sgControls.update.action(row)" title="{{ sgControls.update.title ? sgControls.update.title : \'Atualizar\' }}">\n\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-pencil"></span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\n\t\t\t\t\t\t\t\t\t\t<button ng-show="sgControls.delete" type="button" class="btn btn-default btn-sm" ng-click="sgControls.delete.action(row)" title="{{ sgControls.delete.title ? sgControls.delete.title : \'Deletar\' }}">\n\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-trash"></span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\n\t\t\t\t\t\t\t\t\t</td>\n\n                                    <!-- data columns-->\n                                    <td ng-repeat="col in cols track by $index" ng-init="$parent.editing = false" class="opafion">\n\n                                        <input ng-show="editing" ng-init="newvalue = col.item(row)" class="edit-input" ng-model="newvalue" ng-blur="sg_edit(row, col, newvalue, this)" style="width: {{col.edit.width}};">\n\n                                        <div ng-show="!editing" ng-dblclick="sg_openEdit(this, $event)" ng-style="col.align ? { \'text-align\': col.align} : { \'text-align\': \'left\' }">\n\n                                            <label ng-bind-html="sg_mask(col.type, (col.item(row) | limitTo: (col.maxLength ? col.maxLength : 999)))" style="width: 100%;">\n\n                                            </label>\n\n                                            <!--<label style="text-decoration: underline; cursor: pointer" ng-show="col.popOver"   popover data-toggle="popover" data-trigger="hover" data-content="{{col.item(row)}}">{{(col.item(row) | limitTo: (col.maxLength ? col.maxLength : 999))}}</label>-->\n\n                                        </div>\n\n                                    </td>\n\n\t\t\t\t\t\t\t\t\t<!-- Coluna para checkbox -->\n\t\t\t\t\t\t\t\t\t<td style="text-align: center;" ng-show="sgControls.active">\n\t\t\t\t\t\t\t\t\t\t<label class="switch">\n\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" ng-checked="sgControls.activeCol(row)" ng-click="sgControls.activeFunction(row)">\n\t\t\t\t\t\t\t\t\t\t\t<div class="slider round"></div>\n\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t</td>\n\n                                    <!-- Coluna para favoritos -->\n                                    <td ng-if="sgControls.favorite" style="text-align: center; width: 50px;">\n\n                                        <span ng-show="sgControls.favorite.show(row)" class="fa fa-star" ng-class="{\'active\': sgControls.favorite.item(row)}" ng-click="sgControls.favorite.function(row)"></span>\n\n                                    </td>\n\n                                    <!-- Coluna para progresso -->\n                                    <td ng-if="sgControls.progress" style="text-align: center; width: 50px;">\n\n                                        <div class="progress">\n\n                                            <div class="progress-bar {{sgControls.progress.class ? sgControls.progress.class(row) : \'\'}}" role="progressbar" style="width: {{sgControls.progress.item(row)}}%;">\n                                                {{sgControls.progress.item(row)}}%\n                                            </div>\n\n                                        </div>\n\n                                    </td>\n\n                                </tr>\n                                <tr ng-repeat-end="" ng-show="subgrid" ng-hide="!showSubGrid" ng-class="{\'soft-row-striped\': ($index%2)}"> <!-- Linha para Subtabela -->\n\n                                    <td colspan="{{cols.length + 3}}">\n\n                                        <div class="soft-subgrid-container">\n\n                                            <div ng-if="subgrid">\n\n                                                <softgrid  cols="subgrid.cols" actions="subgrid.actions" data="subgrid.object ? row[subgrid.object] : subgrid.item(row)" hide="subgrid.hide" template="\'soft-subgrid\'" sg-controls="subgrid.controls" subgrid="subgrid.subgrid"></softgrid>\n\n                                            </div>\n\n                                        </div>\n\n                                    </td>\n\n                                </tr>\n\n                                <!-- Exibe uma linha caso n\xE3o haja dados -->\n                                <tr ng-show="!data || data.length <= 0" style="text-align: center;">\n\n                                    <td colspan="{{cols.length + 3}} ">\n                                    N\xE3o h\xE1 dados a serem exibidos.\n                                    </td>\n\n                                </tr>\n\n                            </tbody>\n\n                        </table>\n\n                    </div>\n\n                </div>\n\n        </div>\n\n    </div>\n\n    <div class="row" ng-hide="hide.pagination || hide.all">\n\n        <div class="col-md-12">\n\n            <nav aria-label="...">\n                <ul class="pager" style="margin-top: 5px;">\n                    <li class="previous"><button class="btn btn-default pull-left" ng-click="sg_changePage(-1)"><span aria-hidden="true">&larr;</span> P\xE1gina anterior</button></li>\n                    <li class="next"><button class="btn btn-default pull-right" ng-click="sg_changePage(0)">Pr\xF3xima p\xE1gina <span aria-hidden="true">&rarr;</span></button></li>\n                </ul>\n            </nav>\n\n        </div>\n\n    </div>\n\n</div>\n\n');}]);