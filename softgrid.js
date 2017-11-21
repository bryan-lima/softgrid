(function () {
	'use strict';

	angular.module('softgrid.directive', [])
		.directive('softgrid', softGrid);

	/** @ngInject */
	function softGrid($filter, $base64) {

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
				controls: "=",
				fullscreen: "="
			},
			template: _template,
			link: function (scope, element, attrs) {

				scope.sg_currentPage = 1;   //controla paginacao da grid
				scope.sg_linesPerPage = 10; //controla o maximo de linhas por pagina
				scope.sg_orderBy = '';         //controla a ordenacao da grid
				scope.sg_filter = '';
				
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

					if ((value == -1 && scope.sg_linesPerPage > 10) || value == 1)
						scope.sg_linesPerPage = scope.sg_linesPerPage + (value * 10);

				}

				//sort rows of the grid
				scope.sg_sort = function (item) {

					scope.reverse = (scope.sg_orderBy !== null && scope.sg_orderBy === item) ? !scope.reverse : false;
					scope.data = $filter('orderBy')(scope.data, item, scope.reverse);
					scope.sg_orderBy = item;

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

				//control some shit
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
					link.setAttribute("download", ('teste.xls'));
					document.body.appendChild(link); // Required for FF
					link.click();
					document.body.removeChild(link);
				}

				function gerarHTML(lista) {
					var table = '<table border="3" cellpadding="3" cellspacing="3"><tbody>';
					angular.element(lista).each(function (iLV1, level1) {
						var tr = '<tr>';
						angular.element(level1).each(function (iLV2, level2) {
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
					angular.element(colunas).each(function (iC, coluna) {
						_celulas[celulaInicial] = {
							valor: coluna.title,
							corFundo: '#FA6938',
							corFonte: '#FFFFFF',
							grossuraFonte: 800,
						};
						celulaInicial++;
					});
					_retorno.push(_celulas);
					return _retorno;
				};

				function gerarLinha(colunas, subTabelas, linhasAdicionais, linhas, totalCelulas, celulaInicial) {
					var _retorno = [];

					angular.element(linhas).each(function (iL, linha) {
						var _celulas = new Array(totalCelulas);
						var _celulaInicial = celulaInicial;
						angular.element(colunas).each(function (iC, coluna) {
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

				function _hookDropDown() {

					$(".softgrid-container .dropdown").on('click', function () {
						$(this).find('.dropdown-menu').css('top', $(this).offset().top + 28);
						$(this).find('.dropdown-menu').css('left', $(this).offset().left);
					});
				}
			}
		};

	}

	//diretiva para popover
	angular.module('softgrid.directive').directive('popover', function () {
		return function (scope, elem) {
			elem.popover();
		}
	});



})();

var _template = '\n' +
	'<div class="softgrid-display" ng-class="{\'softgrid-display-fullscreen\': softgrid.fullscreen}">\n' +
	'\n' +
	'    <div class="grid-controles">\n' +
	'\n' +
	'        <div class="row" ng-hide="hide.all">\n' +
	'\n' +
	'            <div class="col-md-3">\n' +
	'\n' +
	'                <div ng-hide="hide.filter || hide.all">\n' +
	'\n' +
	'                    <label>Filtrar</label>\n' +
	'                    <div class="input-group">\n' +
	'                        <span class="input-group-addon" id="filtro-addon"><span class="fa fa-search"></span></span>\n' +
	'                        <input type="text" class="form-control" ng-model="sg_filter" placeholder="Palavra-chave" aria-describedby="filtro-addon">\n' +
	'                    </div>\n' +
	'\n' +
	'                </div>\n' +
	'\n' +
	'            </div>\n' +
	'\n' +
	'            <div class="col-md-2">\n' +
	'\n' +
	'                <div class="form-group" ng-hide="hide.linesPage || hide.all">\n' +
	'\n' +
	'                    <label>Linhas por página</label>\n' +
	'\n' +
	'                    <div class="input-group" style="width: 120px;">\n' +
	'\n' +
	'                        <span class="input-group-btn">\n' +
	'                            <button class="btn btn-default" type="button" ng-click="sg_changeLinesPerPage(-1)">-</button>\n' +
	'                        </span>\n' +
	'\n' +
	'                        <input class="form-control" value="{{sg_linesPerPage}}">\n' +
	'\n' +
	'                        <span class="input-group-btn">\n' +
	'\t\t\t\t\t\t\t<button class="btn btn-default" type="button" ng-click="sg_changeLinesPerPage(1)">+</button>\n' +
	'\t\t\t\t\t\t</span>\n' +
	'\n' +
	'                    </div>\n' +
	'\n' +
	'                </div>\n' +
	'\n' +
	'            </div>\n' +
	'\n' +
	'            <div class="col-md-2">\n' +
	'\n' +
	'                <div ng-hide="hide.options || hide.all">\n' +
	'\n' +	
	'                    <label>Opções</label>\n' +
	'                    <div class="input-group">\n' +
	'                        <input type="text" class="form-control" aria-label="..." value="{{data.length}} encontrado(s)" disabled="true">\n' +
	'                        <div class="input-group-btn">\n' +
	'                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="fa fa-bars"></span></button>\n' +
	'                            <ul class="dropdown-menu dropdown-menu-right">\n' +
	'                                <li ng-repeat="item in menu">\n' +
	'                                    <a ng-click="item.function()"><span class="{{item.icon}}"></span> {{item.title}}</a>\n' +
	'                                </li>\n' +
	'                                <li role="separator" class="divider" ng-show="menu"></li>\n' +
	'                                <li><a ng-click="softGridToExcel()"><span class="fa fa-file-excel-o"></span> Gerar Excel</a></li>\n' +
	'                                <!--<li><a ng-click="softgrid.fullscreen = softgrid.fullscreen ? false : true"><span class="fa fa-arrows-alt"></span> Tela Cheia</a></li>-->\n' +
	'                            </ul>\n' +
	'                        </div>\n' +
	'                    </div>\n' +
	'\n' +
	'                    <div ng-if="!subgrid">\n' +
	'                    <a href="#" ng-show="false"  id="softDownload"></a>\n' +
	'                    </div>\n' +
	'                </div>\n' +
	'\n' +
	'            </div>\n' +
	'\n' +
	'            <div class="col-md-2" ng-show="fullscreen">\n' +
	'\n' +
	'            <label ng-show="softgrid.fullscreen">Mostrar Filtro</label>' +
	'            <label ng-hide="softgrid.fullscreen">Esconder Filtro</label><br/>\n' +
	'\n' +
	' 				<button class="btn btn-default" ng-show="softgrid.fullscreen"><a style="color: black" ng-click="softgrid.fullscreen = softgrid.fullscreen ? false : true" ><span class="fa fa-arrows-alt"></span> Mostrar Filtro</a></button>\n' +
	' 				<button class="btn btn-default" ng-hide="softgrid.fullscreen"><a style="color: black" ng-click="softgrid.fullscreen = softgrid.fullscreen ? false : true" ><span class="fa fa-arrows-alt"></span> Esconder Filtro</a></button>\n' +
	'            </div>\n' +
	'\n' +
	'            <div class="col-md-3">\n' +
	'\n' +
	'                <nav aria-label="Page navigation" class="pull-right" ng-hide="hide.pagination || hide.all">\n' +
	'\n' +
	'                    <label>Paginação</label>\n' +
	'\n' +
	'                        <ul class="pagination">\n' +
	'\n' +
	'                            <li ng-repeat="soft_page in soft_pages" ng-class="{\'active\': soft_page.active}">\n' +
	'                                <a ng-click="sg_changePage(soft_page.value)" ng-bind-html="soft_page.text"></a>\n' +
	'                            </li>\n' +
	'\n' +
	'                        </ul>\n' +
	'\n' +
	'                </nav>\n' +
	'\n' +
	'            </div>\n' +
	'\n' +
	'        </div>\n' +
	'\n' +
	'    </div>\n' +
	'\n' +
	'    <div class="row">\n' +
	'\n' +
	'        <div class="col-md-12">\n' +
	'\n' +
	'                <div class="softgrid-container">\n' +
	'\n' +
	'                    <div ng-style=" width ? { \'width\': width + \'px\' } : { \'width\': \'100%\' }">\n' +
	'\n' +
	'                        <table ng-attr-id="{{!subgrid ? \'none\': \'softgrid\'}}" class="softgrid {{template}}" >\n' +
	'\n' +
	'                            <thead>\n' +
	'\n' +
	'                                <th ng-show="actions.length > 0 || subgrid" style="text-align:center;">\n' +
	'\n' +
	'                                </th>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t<th ng-show="controls.create || controls.read || controls.update || controls.delete" style="text-align: center;">\n' +
	'\t\t\t\t\t\t\t\t\tAções\n' +
	'\t\t\t\t\t\t\t\t</th>\n' +
	'\n' +
	'                                <th ng-repeat="col in cols" ng-show="!col.hide" style="text-align:center;">\n' +
	'\n' +
	'                                  <span class="title" ng-click="sg_sort(col.item)">\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t  {{col.title}}\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t  <span ng-show="col.item == sg_orderBy" class="fa fa-sort-amount-asc" ng-class="{\'fa-sort-amount-desc\' : reverse}"></span>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t  </span>\n' +
	'\n' +
	'                                </th>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t<th ng-show="controls.active" style="text-align: center;">\n' +
	'\t\t\t\t\t\t\t\t\t{{controls.activeTitle}}\n' +
	'\t\t\t\t\t\t\t\t</th>\n' +
	'\n' +
	'                            </thead>\n' +
	'\n' +
	'                            <tbody>\n' +
	'\n' +
	'                                <tr ng-init="$last ? sg_hook() : angular.noop()" ng-class="{\'soft-row-striped\': ($index%2)}" ng-repeat-start="row in (dataFiltered = (data | limitTo: sg_linesPerPage : ((sg_currentPage * sg_linesPerPage) - sg_linesPerPage))) track by $index" ng-style="controls.changeRowColor(row) === true && {\'background-color\': (controls.rowColor ? controls.rowColor :\'#e59482\')}" >\n' +
	'\n' +
	'                                    <td  ng-show="subgrid || actions.length > 0" style="text-align:center;">\n' +
	'\n' +
	'                                        <div class="input-group" style="{{controls.actionColWidth ? \'width:\' + controls.actionColWidth + \'px\' : \'\'}}">\n' +
	'\n' +
	'                                            <div class="input-group-btn" >\n' +
	'\n' +
	'                                                <!-- botão para exibir sub tabela -->\n' +
	'                                                <button ng-show="subgrid" type="button" class="btn btn-default btn-sm" ng-click="showSubGrid = showSubGrid ? false : true">\n' +
	'                                                    <span class="fa fa-expand" ng-class="{\'fa-compress\': showSubGrid}"></span>\n' +
	'                                                </button>\n' +
	'\n' +
	'                                            </div>\n' +
	'\n' +
	'                                            <div class="input-group-btn" >\n' +
	'<div ng-repeat="action in actions" class="dropdown">' +
	'<button type="button" class="btn btn-default btn-sm">' +
	'		<a ng-click="action.function(row)"><span class="{{action.icon}}"></span></a>' +
	'	</button>' +
	'</div>' +
	// '                                                <div class="dropdown">\n' +
	// '\n' +
	// '                                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n' +
	// '                                                        <span class="fa fa-bars"></span>\n' +
	// '                                                    </button>\n' +
	// '\n' +
	// '                                                    <ul class="dropdown-menu dropdown-menu-left">\n' +
	// '                                                        <li ng-repeat="action in actions"><a ng-click="action.function(row)"><span class="{{action.icon}}"></span> {{action.title}}</a></li>\n' +
	// '                                                    </ul>\n' +
	// '\n' +
	// '                                                </div>\n' +
	'                                            </div>\n' +
	'\n' +
	'                                        </div>\n' +
	'\n' +
	'                                    </td>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t<!-- column to actions -->\n' +
	'\t\t\t\t\t\t\t\t\t<td ng-show="controls.create || controls.read || controls.update || controls.delete" style="text-align:center;">\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t\t<button ng-show="controls.create" type="button" class="btn btn-default btn-sm" ng-click="controls.create.action(row)" title="{{ controls.create.title ? controls.create.title : \'Criar\' }}">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-plus"></span>   {{ controls.create.title }}\n' +
	'\t\t\t\t\t\t\t\t\t\t</button>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t\t<button ng-show="controls.read" type="button" class="btn btn-default btn-sm"   ng-click="controls.read.action(row)" title="{{ controls.read.title ? controls.read.title : \'Ver\' }}">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-search"></span> {{ controls.read.title }}\n' +
	'\t\t\t\t\t\t\t\t\t\t</button>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t\t<button ng-show="controls.update" type="button" class="btn btn-default btn-sm" ng-click="controls.update.action(row)" title="{{ controls.update.title ? controls.update.title : \'Atualizar\' }}">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-pencil"></span> {{ controls.update.title }}\n' +
	'\t\t\t\t\t\t\t\t\t\t</button>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t\t<button ng-show="controls.delete" type="button" class="btn btn-default btn-sm" ng-click="controls.delete.action(row)" title="{{ controls.delete.title ? controls.delete.title : \'Deletar\' }}">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<span class="fa fa-trash"></span>  {{ controls.delete.title }}\n' +
	'\t\t\t\t\t\t\t\t\t\t</button>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t</td>\n' +
	'\n' +
	'                                    <!-- data columns-->\n' +
	'                                    <td ng-repeat="col in cols">\n' +
	'\n' +
	'                                        <div ng-style="col.align ? { \'text-align\': col.align} : { \'text-align\': \'left\' }"> <!--div para controlar o alinhamento-->\n' +
	'\n' +
	'                                            <label ng-hide="col.popOver">\n' +
	'\n' +
	'                                                <div ng-if="col.item(row)">\n' +
	'\n' +
	'                                                    <span ng-bind-html="temp = sg_mask(col.type, (col.item(row) | limitTo: (col.maxLength ? col.maxLength : 999)))"></span>\n' +
	'\n' +
	'                                                </div>\n' +
	'\n' +
	'                                                <div ng-if="!col.item(row)">\n' +
	'\n' +
	'                                                    <font color="red">x</font>\n' +
	'\n' +
	'                                                </div>\n' +
	'\n' +
	'                                            </label>\n' +
	'\n' +
	'                                            <label style="text-decoration: underline; cursor: pointer" ng-show="col.popOver"   popover data-toggle="popover" data-trigger="hover" data-content="{{col.item(row)}}">{{(col.item(row) | limitTo: (col.maxLength ? col.maxLength : 999))}}</label>\n' +
	'\n' +
	'                                        </div>\n' +
	'\n' +
	'                                    </td>\n' +
	'\n' +
	'\t\t\t\t\t\t\t\t\t<!-- Coluna para checkbox -->\n' +
	'\t\t\t\t\t\t\t\t\t<td style="text-align: center;" ng-show="controls.active">\n' +
	'\t\t\t\t\t\t\t\t\t\t<label class="switch">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" ng-checked="controls.activeCol(row)" ng-click="controls.activeFunction(row)">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t<div class="slider round"></div>\n' +
	'\t\t\t\t\t\t\t\t\t\t</label>\n' +
	'\t\t\t\t\t\t\t\t\t</td>\n' +
	'\n' +
	'                                </tr>\n' +
	'                                <tr ng-repeat-end="" ng-show="subgrid" ng-hide="!showSubGrid" ng-class="{\'soft-row-striped\': ($index%2)}"> <!-- Linha para Subtabela -->\n' +
	'\n' +
	'                                    <td colspan="{{cols.length + 3}}">\n' +
	'\n' +
	'                                        <div class="soft-subgrid-container">\n' +
	'\n' +
	'                                            <div ng-if="subgrid">\n' +
	'\n' +
	'                                                <softgrid  cols="subgrid.cols" actions="subgrid.actions" data="row[subgrid.object]" hide="subgrid.hide" template="\'soft-subgrid\'" controls="subgrid.controls"></softgrid>\n' +
	'\n' +
	'                                            </div>\n' +
	'\n' +
	'                                        </div>\n' +
	'\n' +
	'                                    </td>\n' +
	'\n' +
	'                                </tr>\n' +
	'\n' +
	'                                <!-- Exibe uma linha caso não haja dados -->\n' +
	'                                <tr ng-show="!data || data.length <= 0" style="text-align: center;">\n' +
	'\n' +
	'                                    <td colspan="{{cols.length + 3}} ">\n' +
	'                                    Não há dados a serem exibidos.\n' +
	'                                    </td>\n' +
	'                                </tr>\n' +
	'\n' +
	'                            </tbody>\n' +
	'\n' +
	'                        </table>\n' +
	'\n' +
	'                    </div>\n' +
	'\n' +
	'                </div>\n' +
	'\n' +
	'\n' +
	'        </div>\n' +
	'\n' +
	'    </div>\n' +
	'\n' +
	'    <div class="row" ng-hide="hide.pagination || hide.all">\n' +
	'\n' +
	'        <div class="col-md-12">\n' +
	'\n' +
	'            <nav ng-show="mostrarBotoesPaginas" aria-label="...">\n' +
	'                <ul class="pager" style="margin-top: 5px;">\n' +
	'                    <li class="previous"><button class="btn btn-default pull-left" ng-click="soft_ChangePage(-1)"><span aria-hidden="true">&larr;</span> Página anterior</button></li>\n' +
	'                    <li class="next"><button class="btn btn-default pull-right" ng-click="soft_ChangePage(0)">Próxima página <span aria-hidden="true">&rarr;</span></button></li>\n' +
	'                </ul>\n' +
	'            </nav>\n' +
	'\n' +
	'        </div>\n' +
	'\n' +
	'    </div>\n' +
	'\n' +
	'</div>\n';