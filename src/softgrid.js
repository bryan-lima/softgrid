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
				fullscreen: "="
			},
			templateUrl: "softgrid.html",
			link: function (scope, element, attrs) {

				scope.sg_currentPage = 1;   //controla paginacao da grid
                scope.sg_linesPerPageInput = 10;
				scope.sg_linesPerPage = 10; //controla o maximo de linhas por pagina
				scope.sg_orderBy = '';         //controla a ordenacao da grid
				scope.sg_filterSearch = '';

                var flag = false;

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
                scope.sg_sort = function (col) {

                    if(scope.data.length > 0) {

                        scope.reverse = (scope.sg_orderBy !== null && scope.sg_orderBy === col.item) ? !scope.reverse : false;
                        scope.data = $filter('orderBy')(scope.data, col.item, scope.reverse);
                        scope.sg_orderBy = scope.sgControls.orderBy = col.item;
						scope.sg_orderByCol = col;

                        flag = true;
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

				function _init(){

					//define a largura da coluna de acoes
					scope.larguraColunaAcoes = 0;

					if(scope.subgrid)
						scope.larguraColunaAcoes += 60;
					if(scope.actions.length > 0)
						scope.larguraColunaAcoes += 60;

					//define a largura da coluna de controles
					scope.larguraColunaControles = 0;

					if(scope.sgControls.create)
                        scope.larguraColunaControles += 60;

                    if(scope.sgControls.read)
                        scope.larguraColunaControles += 60;

                    if(scope.sgControls.update)
                        scope.larguraColunaControles += 60;

                    if(scope.sgControls.delete)
                        scope.larguraColunaControles += 60;

                    //mostra todas linhas caso esconda paginacao

					if(scope.hide){

					if(scope.hide.pagination == true || scope.hide.all == true)
						scope.sg_linesPerPage = 999;

                    }
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

                    if(angular.isDefined(scope.sgControls.orderBy))
                        scope.sg_sort({item: scope.sgControls.orderBy});
                });

                scope.$watch('sg_linesPerPageInput', function () {

                    if(scope.sg_linesPerPageInput > 0)
						scope.sg_linesPerPage = parseInt(scope.sg_linesPerPageInput);

                });

                _init();
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
