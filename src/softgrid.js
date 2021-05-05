(function () {
	'use strict';

	angular.module('softgrid.directive', ['base64'])
		.directive('softgrid', softGrid);

	softGrid.$injector = ['$filter', '$base64','$timeout', '$compíle'];

	/** @ngInject */
	function softGrid($filter, $base64, $timeout, $compile) {
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
			link: function (scope, element) {

				var enableLog = false;

				scope.loading = false;
				scope.container = $(element[0]).find(".softgrid-container")[0];
				scope.configuration = $(element[0]).find(".softgrid-configuration")[0];

				scope.sg_currentPage = 1;   //controla paginacao da grid
                scope.sg_linesPerPageInput = 10;
				scope.sg_linesPerPage = 10; //controla o maximo de linhas por pagina
				scope.sg_orderBy = '';         //controla a ordenacao da grid
				scope.sg_filterSearch = '';

                scope.larguraColunaControles = 0;

                scope.sg_selected = false;
                scope.sg_checked = false;

                scope.filteredData = [];
                scope.sg_filter = "";
                scope.sg_cols = [];

				var firstLoad = true;

				//change page
				scope.sg_changePage = function (value) {

					if(enableLog)
						console.log("sg_changePage");

					if (value === -1 && scope.sg_currentPage > 1)
						scope.sg_currentPage = scope.sg_currentPage - 1;
					else if (value === -1 && scope.sg_currentPage === 1)
						scope.sg_currentPage = scope.totalPages;
					else if (value === 0 && scope.sg_currentPage === scope.totalPages)
						scope.sg_currentPage = 1;
					else if (value === 0 && scope.sg_currentPage < scope.totalPages)
						scope.sg_currentPage = scope.sg_currentPage + 1;
					else
						scope.sg_currentPage = value;

					_atualizarPaginacao();
                    _getFilteredData();

				};

				//change lines per page
				scope.sg_changeLinesPerPage = function (value) {

					if ((value === -1 && scope.sg_linesPerPageInput > 10) || value === 1)
                        scope.sg_linesPerPageInput = scope.sg_linesPerPageInput + (value * 10);

                    if(enableLog)
                        console.log("sg_changeLinesPerPage");
				};

                //sort rows of the grid
                scope.sg_sort = function (col, colIndex, auto) {

                    if(enableLog)
                        console.log("sg_sort");

                	if(angular.isUndefined(scope.filteredData))
                		return;

                    if(scope.filteredData.length > 0) {

                        if(scope.sg_orderBy !== null && scope.sg_orderByColIndex === colIndex && scope.reverse && !auto){

                            scope.sg_orderBy = null;
                            scope.reverse = false;
                            scope.sg_orderByColIndex = -1;

                            if(!firstLoad)
                                _saveStorage();

                            _renderizarTabela();

                            return;
                        }

                        if(!auto){
                            if(scope.sg_orderBy !== null && scope.sg_orderByColIndex !== colIndex)
                                scope.reverse = false;

                            if(scope.sg_orderBy !== null && scope.sg_orderByColIndex === colIndex)
                                scope.reverse = true;
                        }

                        scope.sg_orderByColIndex = colIndex;
                        scope.filteredData = $filter('orderBy')(scope.filteredData, col.item, scope.reverse);
                        scope.sg_orderBy = col.item;

                        if(!firstLoad)
                            _saveStorage();
                    }

                    _atualizarPaginacao();
                    _renderizarTabela();
                };

				//apply mask to column
				scope.sg_mask = function (colType, text) {

					if (colType === "phone")
						return maskPhone(text);
					else if (colType === "mail")
						return maskEmail(text);
					else if(colType === "date")
						return $filter('date')(text, 'dd/MM/yyyy');
					else
						return text;
				};

				//select all items of the row
				scope.sg_selectAll = function (){

					if(scope.filteredData){

						if(scope.filteredData.length > 0){

                            scope.sg_selected = !scope.sg_selected;

                            angular.forEach(scope.filteredData, function(row) {

                            	if(scope.sgControls.select.item)
                                	row[scope.sgControls.select.item] = scope.sg_selected;
                            });

                            scope.sgControls.select.callback(scope.filteredData);

						}
                    }
				};

                //checka os itens de cada linha
                scope.sg_checkAll = function (i){

                    if(scope.filteredData){

                        if(scope.filteredData.length > 0){

                            scope.sg_checked = !scope.sg_checked;

                            angular.forEach(scope.filteredData, function(row) {

                                if(scope.sg_cols[i].item)
                                    row[scope.sg_cols[i].item] = scope.sg_checked;
                            });

                            scope.sg_cols[i].callback(scope.filteredData);

                            _renderizarTabela();
                        }
                    }
                };

                //check coluna filtro
				scope.sg_checkCol = function(col, event){

                	col.checked = !col.checked;

                	event.stopPropagation();

                	_getFilteredData();

				};

                //filter
				function _getFilteredData(){

                    if(enableLog)
                        console.log("getFilteredData");

                    scope.filteredData = scope.data;

                    if(scope.sg_filter === "" || scope.sg_filter === null || angular.isUndefined(scope.sg_filter)) {

                    	scope.sg_sort({ item: scope.sg_orderBy }, scope.sg_orderByColIndex, true);
                        return;
                    }

                    var _colsToFilter = scope.cols.filter(function (array_item) { return array_item.checked });

                    if(_colsToFilter.length <= 0)
						_colsToFilter = scope.sg_cols;

                        scope.filteredData = scope.filteredData.filter(function (array_item)
                        {
                            var _filter = false;

                            var i;

                            for(i = 0; i < _colsToFilter.length; i++)
                            {
                            	if(_colsToFilter[i].type !== "text" && _colsToFilter[i].type !== "html" && _colsToFilter[i].type !== "date" && angular.isDefined(_colsToFilter[i].type))
                            		continue;

                                if(!_colsToFilter[i].item || typeof _colsToFilter[i].item === 'string'  )
                                	continue;

                                var _text =  _colsToFilter[i].item(array_item);

                                if(_text === null || _text === undefined)
                                	continue;

                                if(typeof _text !== 'string')
                                	_text = _text.toString();

                                _text = removeAccents(_text);
                                
								var _filterText = removeAccents(scope.sg_filter);

                                if(_text.indexOf(_filterText) > -1)
                                {
                                    _filter = true;
                                    break;
                                }
                            }

                            return _filter;
                        });

					if(scope.sgControls)
					{
						if(angular.isDefined(scope.sgControls.filtered))
						{
							scope.sgControls.filtered = scope.filteredData;
						}
					}

                    scope.sg_sort({ item: scope.sg_orderBy }, scope.sg_orderByColIndex, true);
                }

                function removeAccents(string) {

                	if(!string)
                		return string;

                	string = string.toUpperCase();

                    var mapaAcentosHex 	= {
                        a : /[\xE0-\xE6]/g,
                        e : /[\xE8-\xEB]/g,
                        i : /[\xEC-\xEF]/g,
                        o : /[\xF2-\xF6]/g,
                        u : /[\xF9-\xFC]/g,
                        c : /\xE7/g,
                        n : /\xF1/g
                    };

                    var toReplace = [ ["Á", "A"], ["À", "A"], ["Â", "A"], ["Ã", "A"],
                        ["É", "E"], ["È", "E"], ["Ê", "E"],
                        ["Í", "I"], ["Ì", "I"], ["Î", "I"],
                        ["Ó", "O"], ["Ò", "O"], ["Ô", "O"], ["Õ", "O"],
                        ["Ú", "U"], ["Ù", "U"], ["Û", "U"]];

                    for ( var letra in mapaAcentosHex ) {
                        var expressaoRegular = mapaAcentosHex[letra];
                        string = string.replace( expressaoRegular, letra );
                    }

                    var i;

                    for(i = 0; i < toReplace.length; i++){
                        string = string.replace(toReplace[i][0], toReplace[i][1]);
                    }

                    return string.toUpperCase();
                }

				//control
				scope.sg_hook = function () {

					_atualizarPaginacao();
					_hookDropDown();
				};

				//exportar grid para excel
				scope.exportExcel = function() {

					var byteCharacters = createTable();
					var byteNumbers = new Array(byteCharacters.length);
					for (var i = 0; i < byteCharacters.length; i++) {
						byteNumbers[i] = byteCharacters.charCodeAt(i);
					}
					var byteArray = new Uint8Array(byteNumbers);
					var blob = new Blob([byteArray], {type: "data:application/vnd.ms-excel"});

					var link = document.createElement("a");
					link.setAttribute("href", URL.createObjectURL(blob));
					link.setAttribute("download", (new Date()).toLocaleString() + ".xls");
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

				};

				function createTable() {

					var table = "<table border='1' cellpadding='5'>";

					var i = 0;

					table += "<tr bgcolor='orange'>";

					var subGridTitle = null;

					for (i = 0; i < scope.cols.length; i++) {

						if(scope.cols[i].type != "subgrid")
						{
							if(angular.isFunction(scope.cols[i].item))
								table += "<td><b>" + scope.cols[i].title + "</b></td>";
                        }
						else
                            subGridTitle = scope.cols[i].title;

					}

					if(subGridTitle != null)
						table += "<td align='center'><b>" + subGridTitle + "</b>";

					table += "</tr>";

					var a;

					for (i = 0; i < scope.data.length; i++) {

						var subgrid = null;

						table += "<tr valign='top'>";

						for (a = 0; a < scope.cols.length; a++) {

							if(scope.cols[a].type != "subgrid")
							{
								var valor = '';

								if (scope.data[i])
									valor = angular.isFunction(scope.cols[a].item) ? scope.cols[a].item(scope.data[i]) : scope.data[i][scope.cols[a].propriedade];

								if (!valor)
									valor = ' - ';

								if(angular.isString(valor))
									valor = removerCaracteresInvalidos(valor);

                                if(angular.isFunction(scope.cols[a].item))
								{
									table += "<td>";

									table += valor;

									table += "</td>";
								}

							}
							else
								subgrid = scope.cols[a];

						}

                        if(subgrid != null){

                            var _subColunas = subgrid.cols;
                            var _subItens = subgrid.item(scope.data[i]);

                            if(_subItens.length > 0)
                            {
                                table += "<td bgcolor='#F6F6F6'>";

									table += "<table border='1'>";

										table += "<tr>";

										angular.forEach(_subColunas, function(coluna){

											table += "<td><b>";

											table += coluna.title;

											table += "</b></td>";
										});

										table += "</tr>";

										angular.forEach(_subItens, function(item){

											table += "<tr>";

											angular.forEach(_subColunas, function(coluna){

												var valor = '';

												if (item)
													valor = angular.isFunction(coluna.item) ? coluna.item(item) : item[coluna.propriedade];

												if (!valor)
													valor = ' - ';

												if(angular.isString(valor))
													valor = removerCaracteresInvalidos(valor);

												table += "<td>";

												table += valor;

												table += "</td>";
											});

											table += "</tr>";

										});

									table += "</table>";

                                table += "</td>";
                            }

                        }

						table += "</tr>";
					}

					table += "</table>";

					return table;
				}

				//exportar grid para PDF
				scope.exportarPDF = function(){

                    scope.loading = true;

                    var _container = $(element[0]).find(".softgrid-container")[0];

                    var cache_width = $(_container).width(); //Criado um cache do CSS
                    var cache_cols = scope.sg_cols;
                    var cache_lines = scope.sg_linesPerPage;

                    var a4  =[ 595.28,  921.89]; // Widht e Height de uma folha a4

                    scope.sg_cols = cache_cols.filter(function(col){ return angular.isFunction(col.item) && col.type != 'subgrid'; });
                    scope.sg_linesPerPage = scope.data.length;

                    _renderizarTabela();

                    $timeout(function(){

                        var _orientacao = 'landscape';

                        // Setar o width da div no formato a4
                        $(_container).width((a4[1])).css('max-width','none');
                        $(_container).css('max-height','none');
                        $(_container).height(_container.clientHeight);
                        $(_container).css("position", "fixed");
                        $(_container).css("top", "0");
                        $(_container).css("left", "0");
                        $(".softgrid th").css("padding", "1px");

                        $timeout(function(){

                            var _node = $(element[0]).find(".softgrid-container")[0];

                            domtoimage.toPng(_node, { quality: 0.75, bgcolor: "#FFFFFF", height: _container.clientHeight, width: a4[1] })
                                .then(function (dataUrl) {

                                    var img = new Image();

                                    img.onload = function(){
                                        var doc = new jsPDF( { unit:'px', format:'a4', orientation: _orientacao } );
                                        var _altura = 589;
                                        for (var i = 0; i <= _container.clientHeight / _altura; i++) {

                                            var srcImg  = img;
                                            var sX      = 0;
                                            var sY      = _altura*i;
                                            var sWidth  = 978;
                                            var sHeight = _altura;
                                            var dX      = 0;
                                            var dY      = 0;
                                            var dWidth  = 908;
                                            var dHeight = _altura;

                                            window.onePageCanvas = document.createElement("canvas");
                                            onePageCanvas.setAttribute('width', 978);
                                            onePageCanvas.setAttribute('height', _altura);
                                            var ctx = onePageCanvas.getContext('2d');

                                            ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

                                            // document.body.appendChild(canvas);
                                            var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

                                            var width         = onePageCanvas.width;
                                            var height        = onePageCanvas.clientHeight;

                                            if (i > 0) {
                                                doc.addPage();
                                            }

                                            doc.setPage(i+1);
                                            doc.addImage(canvasDataURL, 'PNG', 10, 10, (width*.72), (height*.71));

                                        }

                                        doc.save((new Date()).toLocaleString() + '.pdf');

                                        //Retorna ao CSS normal
                                        $(_container).width(cache_width);
                                        $(_container).height('auto');
                                        $(_container).css("position", "relative");
                                        $(".softgrid th").css("padding", "5px");
                                        scope.sg_cols = cache_cols;
                                        scope.sg_linesPerPage = cache_lines;
                                        _renderizarTabela();
                                        scope.loading = false;
                                        scope.$apply();
                                    };

                                    img.src = dataUrl;
                                });
                        }, 1000);

                    }, 1000);

				};

				function _atualizarPaginacao() {

					if(scope.data){

                        if(enableLog)
                            console.log("atualizarPaginacao");

                        scope.totalPages = scope.filteredData.length / scope.sg_linesPerPage;
                        scope.totalPages = scope.totalPages > parseInt(scope.totalPages) ? parseInt(scope.totalPages) + 1 : scope.totalPages;
                        scope.sg_currentPage = scope.totalPages < scope.sg_currentPage ? scope.totalPages : scope.sg_currentPage;

						scope.soft_pages = [];

						scope.soft_pages.push({ "text": "<span class='fa fa-chevron-left'></span>", "value": -1, "active": false });

						if (scope.totalPages > 1)
							scope.soft_pages.push({ "text": 1 + "..", "value": 1, "active": scope.sg_currentPage === 1 });

						var _pg = scope.sg_currentPage;

						for (var i = 2; i < scope.totalPages; i++) {

							var _active = i == _pg ? true : false;

							if ((i < _pg + 3) || (_pg <= 3 && i <= 6)) {
								if ((_pg >= 3 && i > _pg - 3) || (_pg <= 3 && i <= 5) || (_pg >= 3 && i >= _pg && i <= _pg - 3) || (_pg >= scope.totalPages - 3 && i >= scope.totalPages - 5) || (_pg <= 3 && i <= 6)) {
									scope.soft_pages.push({ "text": i, "value": i, "active": _active });
								}
							}
						}

						scope.soft_pages.push({ "text": ".." + scope.totalPages, "value": scope.totalPages, "active": scope.sg_currentPage === scope.totalPages });

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

                function removerCaracteresInvalidos(string)
                {
                    return string.replace("\\", "").replace("\"", "").replace("“", "").replace("”", "").replace("‘", "").replace("’", "").replace("º", "").replace("–", "");
                }

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

                function _obterColuna(index){
				    return scope.sg_cols[index];
                }

                function _obterLinha(index){
                    return scope.showData[index];
                }

				scope.sg_edit = function(div){

                    if(scope.sg_editandoColunaValor !== null && scope.sg_editandoColunaValor !== ""){
                        var _coluna = _obterColuna(scope.sg_editandoColunaIndex);
                        scope.showData[scope.sg_editandoLinhaIndex][_coluna.edit.item] = scope.sg_editandoColunaValor;
                        _coluna.edit.function(_obterLinha(scope.sg_editandoLinhaIndex));
                    }

                    scope.sg_editandoColuna = false;
                    scope.sg_editandoColunaValor = null;
                    scope.sg_editandoLinhaIndex = 0;
                    scope.sg_editandoColunaIndex = 0;

					_renderizarTabela();
				};

				scope.sg_editandoColuna = false;
				scope.sg_editandoColunaValor = null;
				scope.sg_editandoLinhaIndex = 0;
				scope.sg_editandoColunaIndex = 0;

				scope.sg_openEdit = function(colunaIndex, linhaIndex, event){

					if(scope.sg_editandoColuna)
						return;

					scope.sg_editandoColuna = true;
					scope.sg_editandoColunaIndex = colunaIndex;
					scope.sg_editandoLinhaIndex = linhaIndex;
					scope.sg_editandoValor = scope.sg_cols[colunaIndex].item(scope.showData[linhaIndex]);

					var _coluna = event.currentTarget;

                    var _inputHtml = "<input " +
						"id='sg_edit_input' " +
						"class='edit-input' " +
						"ng-model='sg_editandoColunaValor' " +
						"ng-blur='sg_edit(this)' " +
                        "tooltip data-toggle='tooltip' data-placement='top' title='Digite o novo valor. Valor atual: " + scope.sg_editandoValor + "'"+
						"style='color: black !important; width: " + scope.sg_cols[colunaIndex].edit.width + ";'>";

                    angular.element(_coluna).append( $compile( _inputHtml )(scope) );

                    $(_coluna).find("label").css("display", "none");

                    var inpt = $("#sg_edit_input");
                    $timeout(function() {

                    	if(inpt.value !== "")
                            inpt.select();
						else
                        	inpt.focus();

                    }, 200) ;

				};

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
				scope.$watch('showData', function(newNames, oldNames){

					$timeout(_renderizarTabela, 200);

				}, true);

                scope.$watch('data', function () {

                    if(enableLog)
                        console.log("dataWatcher");

                    _getFilteredData();

                    if(scope.sg_orderBySaved){

                        scope.sg_orderByColIndex = -1;

                        if(angular.isDefined(scope.sg_orderBySaved))
                            scope.sg_sort(scope.sg_orderBySaved, scope.sg_orderByColIndexSaved, true);
                    }

                    if(scope.data){

                        if(scope.data.length > 0){

                            if(firstLoad){ //primeira vez que carregou os dados

                                if(scope.sgStore)
                                    _loadStorage();

                                firstLoad = false;
                            }
                            else // se recarregar dados da grid
                            {
                                scope.sg_currentPage = 1; //reseta pagina
                            }
                        }
                    }

                    _atualizarPaginacao();
                });

                scope.$watch('sg_linesPerPageInput', function () {

                    if(enableLog)
                        console.log("linesPerPageInputWatcher");

                    if(scope.sg_linesPerPageInput > 0){

						scope.sg_linesPerPage = parseInt(scope.sg_linesPerPageInput);

						if(!firstLoad)
							_saveStorage();

						_getFilteredData();
                    }

                });

                scope.$watch('sgControls', function (){

                    if(enableLog)
                        console.log("sgControlsWatcher");

                    //define a largura da coluna de controles
                    if(angular.isDefined(scope.sgControls) && scope.sgControls){

                    	scope.sgControls.checkAll = scope.sg_checkAll;

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

                    if(enableLog)
                        console.log("hideWatcher");

                    if(scope.hide){
                        //mostra todas linhas caso esconda paginacao
                        if(scope.hide.pagination === true || scope.hide.all === true)
                            scope.sg_linesPerPage = 999;
                    }

				});

                scope.$watch('subgrid', _calcularTamanhoColunaAcoes);

                scope.$watch('actions', _calcularTamanhoColunaAcoes);

                scope.$watch('sg_currentPage', function(){

                    if(enableLog)
                        console.log("currentPageWatcher");

                	if(!firstLoad)
                		_saveStorage();

				});

				scope.$watch('sg_filter', function(){

                    if(enableLog)
                        console.log("filterWatcher");

					//_getFilteredData();

                    scope.sg_changePage(1);

				});

				scope.$watch('filteredData', function(){
					scope.linhaSelecionadaIndex = null;
				});

				var flagCol = true;

                scope.$watch('cols', function(){

                    if(enableLog)
                        console.log("colsWatcher");

                	_controlesParaColunas();

                });

                function _controlesParaColunas(){

                    var _colunas = [];

                    if(angular.isDefined(scope.cols)){
                        if(scope.cols.length > 0)
                        {
                            <!-- Coluna para Checkbox -->
                            if(scope.sgControls)
                                if (scope.sgControls.checkBox)
                                    _colunas.push( { type: "checkbox", title: "Selecionar", callback: scope.sgControls.checkBox.function, item: scope.sgControls.checkBox.item } );

                            <!-- Coluna para subgrid -->
                            if (scope.subgrid)
                                _colunas.push( { type: "subgrid", title: "Detalhes", item: scope.subgrid.item, cols: scope.subgrid.cols, menu: scope.subgrid.actions, hide: scope.subgrid.hide, subgrid: scope.subgrid.subgrid } );

                            <!-- Coluna para menu -->
                            if(scope.actions) {
                                if (scope.actions.length > 0) {
                                	var a = { type: "menu", title: "Opções", menu: scope.actions };
                                	if(angular.isDefined(scope.sgControls)){
                                		if(angular.isDefined(scope.sgControls.showAction))
                                			a.showRow = scope.sgControls.showAction;
									}
                                    _colunas.push(a);
                                }
                            }

                            <!-- Coluna para Ações -->
                            if(scope.sgControls) {

                                if (scope.sgControls.create)
                                    _colunas.push( { type: "action", title: (scope.sgControls.create.title ? scope.sgControls.create.title : 'Criar'), callback: scope.sgControls.create.action, icon: (scope.sgControls.create.icon ? scope.sgControls.create.icon : "fa-plus") } );

                                if (scope.sgControls.read)
                                    _colunas.push( { type: "action", title: (scope.sgControls.read.title ? scope.sgControls.read.title : 'Ver'), callback: scope.sgControls.read.action, icon: (scope.sgControls.read.icon ? scope.sgControls.read.icon : "fa-search") } );

                                if (scope.sgControls.update)
                                    _colunas.push( { type: "action", title: (scope.sgControls.update.title ? scope.sgControls.update.title : 'Criar'), callback: scope.sgControls.update.action, icon: (scope.sgControls.update.icon ? scope.sgControls.update.icon : "fa-pencil") } );


                                if (scope.sgControls.delete)
                                    _colunas.push( { type: "action", title: (scope.sgControls.delete.title ? scope.sgControls.delete.title : 'Criar'), callback: scope.sgControls.delete.action, icon: (scope.sgControls.delete.icon ? scope.sgControls.delete.icon : "fa-trash") } );

                            }

                            _colunas = _colunas.concat(scope.cols);

                            <!-- Coluna para ativo -->
                            if(scope.sgControls)
                                if (scope.sgControls.active)
                                    _colunas.push( { type: "switch", title: (scope.sgControls.activeTitle ? scope.sgControls.activeTitle : "Ativo"), item: scope.sgControls.activeCol, callback: scope.sgControls.activeFunction } );

                            <!-- Coluna para favoritos -->
                            if(scope.sgControls)
                                if (scope.sgControls.favorite)
                                    _colunas.push( { type: "favorite", title: "Favorito", item: scope.sgControls.favorite.item, callback: scope.sgControls.favorite.function, showRow: scope.sgControls.favorite.show } );

                            <!-- Coluna para progresso -->
                            if(scope.sgControls)
                                if (scope.sgControls.progress)
                                    _colunas.push( { type: "progress", title: "Progresso", class: scope.sgControls.progress.class, item: scope.sgControls.progress.item } );

                            <!-- Coluna para Aprovacao -->
                            if(scope.sgControls)
                                if (scope.sgControls.approve && scope.sgControls.approve.showCol)
                                    _colunas.push( { type: "approve", title: "Aprovação", showCol: scope.sgControls.approve.showCol, showRow: scope.sgControls.approve.show, callback: scope.sgControls.approve.callback } );

                            if(flagCol){
                                scope.cols = _colunas;
                                scope.sg_cols = scope.cols.filter(function(item) { return angular.isUndefined(item.default) || item.default === true; } );
                                flagCol = false;
                            }

                            _getFilteredData();
                        }
                    }

				}

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

                    var _properties = {};

                    _properties.linesPerPage = scope.sg_linesPerPage;
                    _properties.currentPage = scope.sg_currentPage;

                    if(scope.sg_orderBy !== null)
                    {
                        _properties.orderBy = { item: scope.sg_orderBy.toString(), reverse: scope.reverse, index: scope.sg_orderByColIndex };
                        scope.sg_orderByColIndexSaved = _properties.orderBy.index;
                        scope.sg_orderBySaved = { item: scope.sg_orderBy };
                    }
                    else
                    {
                        scope.sg_orderBySaved = null;
                        scope.sg_orderByColIndexSaved = null;
                    }

                    var _colunas = [];
                    var i = 0;
                    angular.forEach(scope.sg_cols, function(coluna){
						_colunas.push( { col: removeAccents(coluna.title).replace(" ", ""), index: i } ) ;
						i++;
					});

                    _properties.cols = _colunas;

                    localStorage.setItem("SG-STORE_" + scope.sgStore.id, angular.toJson(_properties));

                    if(enableLog)
                        console.log("_saveStorage");
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

                    if(_properties.orderBy)
                    {
                        if(_properties.orderBy.item !== "")
                        {
                            var _item = {item: eval('(' + _properties.orderBy.item + ')')} ;

                            scope.sg_orderByColIndexSaved = _properties.orderBy.index;
                            scope.sg_orderBySaved = _item;

                            scope.reverse = _properties.orderBy.reverse;
                            scope.sg_sort(_item, _properties.orderBy.index, true);
                        }
                    }

                    if(_properties.cols){

                    	_controlesParaColunas();

                    	var _colunas = [];
						var _limpar = false;

                    	angular.forEach(_properties.cols, function(col){
                    		var _col = scope.cols.filter(function (item) { return removeAccents(item.title).replace(" ", "") === col.col; })[0];

                    		if(_col)
                    			_colunas.push(_col);
                    		else
                    			_limpar = true;
                        });

                        scope.sg_cols = _colunas;

                        if(_limpar)
                        	scope.limparConfiguracaoColuna();

                        _getFilteredData();
                    }

                    if(enableLog)
                        console.log("_loadStorage");

                    _atualizarPaginacao();
                }

                //novas funcoes
				scope.abrirConfiguracao = function(){

                	scope.configuracaoAberta = !scope.configuracaoAberta;

                	if(scope.configuracaoAberta){
                        $(scope.configuration).css("width", "200px");
                        $(scope.configuration).css("border", "1px solid #ccc");
						$(scope.container).css("min-height", "300px");
                        _getFilteredData();
                    }
					else{
                        $(scope.configuration).css("width", "0");
                        $(scope.configuration).css("border", "0");
                        $timeout(function(){$(scope.container).css("min-height", "0")}, 500);
                        _getFilteredData();
                        _configurarRedimensionarColuna();
					}
                };

                function _alterarColunas(colToID, colFromID){

                	var _colunas = [];
					var _colunaNova = {};

					angular.forEach(scope.cols, function(coluna){

						if(removeAccents(coluna.title).replace(" ", "") === colFromID)
							_colunaNova = coluna;

					});

                    angular.forEach(scope.sg_cols, function(coluna){

                        if(removeAccents(coluna.title).replace(" ", "") === colToID)
                            _colunas.push(_colunaNova);

                        if(removeAccents(coluna.title).replace(" ", "") !== colFromID)
                        	_colunas.push(coluna);

                    });

                    scope.sg_cols = _colunas;

                    _saveStorage();

                	_getFilteredData();
				}

				scope.removerColuna = function(coluna){

                	scope.sg_cols = scope.sg_cols.filter(function(col) { return col.title !== coluna.title ; } );
					_saveStorage();

					_getFilteredData();
				};

                scope.sg_selecionarLinha = function(index){

                	if(angular.isDefined(scope.linhaSelecionadaIndex))
                        $("#sg_linha_" + scope.linhaSelecionadaIndex).removeClass("active");

                	scope.linhaSelecionadaIndex = index;

                    $("#sg_linha_" + index).addClass("active");

                };

				function _renderizarTabela()	{

                    if(enableLog)
                        console.log("_renderizarTabela");

					$(scope.container).html("");
                    $(scope.configuration).html("");

                    var enabledSubgrid = false;
					var _tabela = [];

                	_tabela.push("<div style='" + (scope.width ? "width:" + scope.width + "px" : "width: 100%") + "'>");

                		_tabela.push("<table width='100%' " + (scope.subgrid ? "id='softgrid'" : "") + " class='softgrid " + scope.template + "'>");

							//cabecalho
							_tabela.push("<thead>");

								var i = 0;
								angular.forEach(scope.sg_cols, function(col){

                                    _tabela.push("<th id='sg_col_" + removeAccents(col.title).replace(" ", "") + "' class='softgrid-th-drop'>");

									_tabela.push("<span class='fa fa-arrow-left'></span>");

									_tabela.push("<span class='title' ng-click='sg_sort(sg_cols[" + i + "], " + i + ")'>");

									_tabela.push(col.title);

									if(i === scope.sg_orderByColIndex)
										_tabela.push("<span class='fa " + (scope.reverse ? "fa-sort-amount-desc" : "fa-sort-amount-asc" ) + "'></span>");

									_tabela.push("</span>");

									if(col.type === "checkbox")
										_tabela.push("<input style='margin: 0px 0px 0px 5px;' type='checkbox' " + (scope.sg_checked ? "checked" : "") + " ng-click='sg_checkAll(" + i + ")'>");

									if(scope.configuracaoAberta)
                                        _tabela.push("<span class='fa fa-times pull-right' ng-click='removerColuna(sg_cols[" + i + "])'></span>");

									_tabela.push("</th>");

									i++;
								});

                    		_tabela.push("</thead>");

							//corpo
							_tabela.push("<tbody>");

                    		scope.showData = $filter('limitTo')(scope.filteredData, scope.sg_linesPerPage, (scope.sg_currentPage * scope.sg_linesPerPage) - scope.sg_linesPerPage);

								var il = 0;

								angular.forEach(scope.showData, function(linha){

									var _corLinha = "";

                                    if(scope.sgControls) {
                                        if (scope.sgControls.changeRowColor && typeof scope.sgControls.rowColor === 'string' ) {
                                            if (scope.sgControls.changeRowColor(linha) === true)
                                                    _corLinha = "style='background-color: " + scope.sgControls.rowColor + "'";
                                        }
                                        else
                                        {
                                        	if(angular.isDefined(scope.sgControls.rowColor))
                                            	_corLinha = "style='background-color: " + scope.sgControls.rowColor(linha) + "'";
                                        }
                                    }

									_tabela.push("<tr id='sg_linha_" + il + "' ng-click='sg_selecionarLinha(" + il + ")' class='soft-row " + (il%2 ? "soft-row-striped" : "" ) + (scope.linhaSelecionadaIndex === il ? '' : '') + "' " + _corLinha +">");

                                                var i = 0;
                                                angular.forEach(scope.sg_cols, function(col){

                                                	var _align = col.type !== "text" && col.type !== "html" && angular.isDefined(col.type) ? "text-align: center;" : "";
													col.width = col.type !== "text" && col.type !== "html" && angular.isDefined(col.type) && angular.isUndefined(col.width) ? "110px;" : col.width;

													var _style = col.style ? col.style(linha) : "";

                                                	_tabela.push("<td style='" + _style + _align + (col.width ? "width: " + col.width : "") + "'>");

                                                    if(angular.isUndefined(col.type) || col.type === "text" || col.type === "html" || col.type === "date"){

                                                        var _editar = col.edit ? "title='Clique aqui para editar' ng-click='sg_openEdit(" + i + ", " + il + ", $event)'" : "";

                                                        _tabela.push("<div " + _editar + " style='" + (col.align ? ("text-align: " + col.align + ";") : "text-align: left;") + "'>");

                                                        if(!col.popOver){

                                                            _tabela.push("<label style='width: 100%; " + _style + "'>");

                                                            if(angular.isFunction(col.click))
                                                            	_tabela.push("<a style='color: #f39c12; cursor: pointer; font-weight: bold' ng-click='sg_cols[" + i + "].click(showData[" + il + "])'>");

                                                            _tabela.push(scope.sg_mask(col.type, col.item(linha)));

                                                            if(angular.isFunction(col.click))
                                                                _tabela.push("</a>");

                                                            _tabela.push("</label>");

                                                        }
                                                        else{
                                                            _tabela.push("<label style='text-decoration: underline; cursor: pointer' popover data-toggle='popover' data-trigger='hover' data-content='" + col.item(linha) + "'>" + $filter('limitTo')(col.item(linha), (col.maxLength ? col.maxLength : 999)) + "</label>");
                                                        }
                                                    }
                                                    else if(col.type === "checkbox"){
                                                        _tabela.push("<input type='checkbox' ng-click='sg_cols[" + i + "].callback(showData[" + il + "])' " + (linha[scope.sg_cols[i].item] ? "checked" : "") + ">");
                                                    }
                                                    else if(col.type === "subgrid"){
                                                        _tabela.push("<button type='button' class='btn btn-default btn-sm btn-subgrid' ng-click='abrirSubGrid(" + i + "," + il + ")'>");
                                                        _tabela.push("<span class='fa " + (scope.showSubGrid ? "fa-compress" : "fa-expand") + "'></span></button>");
                                                        enabledSubgrid = true;
                                                    }
                                                    else if(col.type === "menu"){

                                                        if(angular.isDefined(col.showRow) && !col.showRow(linha)) {
                                                            i++;
                                                            return;
                                                        }
                                                        _tabela.push("<div class='dropdown'>");
                                                        _tabela.push("<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>");
                                                        _tabela.push("<span class='fa fa-bars'></span></button>");
                                                        _tabela.push("<ul class='dropdown-menu dropdown-menu-left'>");
                                                        var ai = 0;
                                                        angular.forEach(col.menu, function (action) {

                                                            if(angular.isDefined(action.show) && !action.show(linha)) {
                                                                ai++;
                                                                return;
                                                            }

                                                            _tabela.push("<li>");
                                                            _tabela.push("<a ng-click='sg_cols[" + i + "].menu[" + ai + "].function(showData[" + il + "])'><span class='" + action.icon + "'></span>  " + action.title + "</a>");
                                                            _tabela.push("</li>");

                                                            ai++;
                                                        });
                                                        _tabela.push("</ul></div>");
                                                    }
                                                    else if(col.type === "action"){
                                                        _tabela.push("<button class='btn btn-default btn-sm' ng-click='sg_cols[" + i + "].callback(showData[" + il + "])' title='" + col.title + "'>");
                                                        _tabela.push("<span class='fa " + col.icon + "'></span></button>");
                                                    }
                                                    else if(col.type === "switch"){
                                                        _tabela.push("<label class='switch'>");
                                                        _tabela.push("<input type='checkbox' ng-click='sg_cols[" + i + "].callback(showData[" + il + "])' " + (scope.sg_cols[i].item(linha) ? "checked" : "") + ">");
                                                        _tabela.push("<div class='slider round'></div>");
                                                        _tabela.push("</label>");
                                                    }
                                                    else if(col.type === "favorite"){

                                                        if(angular.isDefined(col.show) && !col.show(linha)){
                                                            i++;
                                                            return;
                                                        }

                                                        _tabela.push("<span class='fa fa-star " + (col.item(linha) ? "active" : "") + "' ng-click='sg_favoritar(" + i + ", " + il + ")'></span>");
                                                    }
                                                    else if(col.type === "progress"){
                                                        _tabela.push("<div class='progress'>");
                                                        _tabela.push("<div class='progress-bar " + (col.class ? col.class(linha) : "") + "' role='progressbar' style='width: " + col.item(linha) + "%;'>");
                                                        _tabela.push(col.item(linha) + "%</div></div>");
                                                    }
                                                    else if(col.type === "approve"){

                                                        if(!col.showCol(linha) || !col.showRow(linha)){
                                                            i++;
                                                            return;
                                                        }

                                                        _tabela.push("<button title='Aprovar' class='btn btn-default btn-sm' ng-click='sg_cols[" + i + "].callback(showData[" + il + "], true)'><span class='fa fa-thumbs-up'></span></button>");
                                                        _tabela.push("<button title='Reprovar' class='btn btn-default btn-sm' ng-click='sg_cols[" + i + "].callback(showData[" + il + "], false)'><span class='fa fa-thumbs-down'></span></button>");
                                                    }
													else if(col.type === "select"){

                                                        _tabela.push("<div class='dropdown softgrid-dropdown-container'>");
                                                        _tabela.push("<button type='button' class='btn btn-default btn-sm dropdown-toggle softgrid-dropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>");
                                                        _tabela.push("<span class='fa fa-caret-down'></span>" + scope.showData[il][scope.sg_cols[i].item][scope.sg_cols[i].field.text] + "</button>");
                                                        _tabela.push("<ul class='dropdown-menu dropdown-menu-left'>");

                                                        var ai = 0;

                                                        angular.forEach(col.data, function (item) {

                                                            _tabela.push("<li>");
                                                            _tabela.push("<a ng-click='sg_select(" + i + ", " + il + ", " + ai + ")'> " +  item[col.field.text] + "</a>");
                                                            _tabela.push("</li>");

                                                            ai++;
                                                        });

                                                        _tabela.push("</ul></div>");

													}
                                                    _tabela.push("</div></td>");

                                                    i++;
                                                });

									_tabela.push("</tr>");

                                    <!-- Subgrid -->
									if(enabledSubgrid){
										_tabela.push("<tr style='display: none' class='" + (il%2 ? "soft-row-striped" : "") + "'>");

										_tabela.push("<td id='sg_subgrid_" + il + "' colspan='" + scope.sg_cols.length + "'>");

										_tabela.push("</td>");

										_tabela.push("</tr>");
                                    }

									il++;
								});

								if(angular.isDefined(scope.showData) && scope.showData.length <= 0){
									_tabela.push("<tr><td style='text-align: center;' colspan='" + scope.sg_cols.length + "'>Não há dados a serem exibidos.</td></tr>");
								}

							_tabela.push("</tbody>");

						_tabela.push("</table>");

					_tabela.push("</div>");

                    angular.element(scope.container).append( $compile(_tabela.join(""))(scope) );

                    var _configHtml = "<h5><label class='label label-primary'>Customizar Colunas</label></h5>";
					var _exibindoTodas = true;

                    angular.forEach(scope.cols, function(col) {

                    	var _col = scope.sg_cols.filter(function(coluna){ return coluna.title === col.title; });

                        if( (col.default === false && _col.length <= 0) || ( (angular.isUndefined(col.default) || col.default === true) && _col.length <= 0))
						{
							_configHtml += "<div id='sg_col_" + removeAccents(col.title).replace(" ", "") + "' class='softgrid-configuration-col'>" + col.title + "</div>";
							_exibindoTodas = false;
						}

                    });

                    if(_exibindoTodas)
                    	_configHtml += "<small>Todas as colunas estão sendo exibidas.</small>";

                    _configHtml += "<a href='javascript:void(0)' ng-click='limparConfiguracaoColuna()'>Limpar alterações</a>";

                    angular.element(scope.configuration).append( $compile(_configHtml)(scope) );

                    if(scope.configuracaoAberta){
						_configurarDrop();
						_configurarDrag();
                    }

                    _hookDropDown();
				}

				scope.sg_select = function(indexColuna, indexLinha, indexItem){

					scope.sg_cols[indexColuna].callback(scope.showData[indexLinha], scope.sg_cols[indexColuna].data[indexItem]);
                    scope.showData[indexLinha][scope.sg_cols[indexColuna].item][scope.sg_cols[indexColuna].field.text] = scope.sg_cols[indexColuna].data[indexItem][scope.sg_cols[indexColuna].field.text];
                    scope.showData[indexLinha][scope.sg_cols[indexColuna].item][scope.sg_cols[indexColuna].field.value] = scope.sg_cols[indexColuna].data[indexItem][scope.sg_cols[indexColuna].field.value];

				};

				scope.sg_favoritar = function(ic, il){

                    scope.sg_cols[ic].callback(scope.showData[il]);

                    $timeout(_renderizarTabela, 1000);

				};

				scope.limparConfiguracaoColuna = function(){
					scope.sg_cols = scope.cols.filter(function(item){ return angular.isUndefined(item.default) || item.default === true;});
					_saveStorage();
					_renderizarTabela();
				};

				scope.abrirSubGrid = function(indexCol, indexRow){

					if($("#sg_subgrid_" + indexRow).hasClass("active")){
                        $("#sg_subgrid_" + indexRow).html("");
                        $("#sg_subgrid_" + indexRow).removeClass("active");
                        $($("#sg_subgrid_" + indexRow).parent()).css("display", "none");
					}
					else {

                        var _subgrid = [];

                        _subgrid.push("<div class='soft-subgrid-container'>");

                        _subgrid.push("<softgrid cols='sg_cols[" + indexCol + "].cols' actions='sg_cols[" + indexCol + "].menu' data='sg_cols[" + indexCol + "].item(showData[" + indexRow + "])' hide='sg_cols[" + indexCol + "].hide' sg-controls='sg_cols[" + indexCol + "].controls' subgrid='sg_cols[" + indexCol + "].subgrid' template=\"'soft-subgrid'\"></softgrid>");

                        _subgrid.push("</div>");

                        angular.element($("#sg_subgrid_" + indexRow)).append( $compile(_subgrid.join(""))(scope) );
                        $("#sg_subgrid_" + indexRow).addClass("active");

                        $($("#sg_subgrid_" + indexRow).parent()).css("display", "table-row");
					}
				};

                function _configurarDrag() {

                    //configura items que podem ser arrastados
                    angular.forEach($(scope.configuration).find(".softgrid-configuration-col"), function (value, key) {

                        var element = angular.element(value);

                        if (element.attr("draggable") === "true") return;

                        element.attr("draggable", "true");

                        element.on('dragstart', _aoArrastarTarefa);

                        element.on('dragend', _aoPararArrastarTarefa);

                    });

                }

                function _aoArrastarTarefa(event) {

                	if(event.dataTransfer)
                    	event.dataTransfer.setData("Text", event.target.id);
                	else
                		event.originalEvent.dataTransfer.setData("Text", event.target.id);

                }

                function _aoPararArrastarTarefa(event) {



                }

                function _configurarDrop() {

                    //configura areas de drop
                    angular.forEach($(scope.container).find(".softgrid-th-drop"), function (value, key) {

                        var element = angular.element(value);

                        if(!element.hasClass("softgrid-th-drop"))
                        	return;

                        if (element.attr("draggable") === "true") return;

                        element.attr("draggable", "true");

                        element.on('dragstart', _aoArrastarTarefa);

                        element.on('dragover', function (event) {
                            event.preventDefault();
                        });

                        element.on('dragenter', function (event) {

                        	$(event.target).addClass("active");

                        });

                        element.on('dragleave', function (event) {

                            $(event.target).removeClass("active");

                        });

                        element.on('drop', _aoDroparTarefa);

                    });

                }

                function _aoDroparTarefa(event) {

                    event.preventDefault();

                    var _colFromID = "";

                    if(event.dataTransfer)
                        _colFromID = event.dataTransfer.getData("Text").replace("sg_col_", "");
                    else
                        _colFromID = event.originalEvent.dataTransfer.getData("Text").replace("sg_col_", "");;

                    var _colToID = event.target.id.replace("sg_col_", "");

                    _alterarColunas(_colToID, _colFromID);
                }
            }
		};
	}

	//diretiva para popover
	angular.module('softgrid.directive').directive('popover', function () {
		return function (scope, elem) {
			 $(elem).popover();
		}
	});

    //diretiva para tooltip
    angular.module('softgrid.directive').directive('tooltip', function () {
        return function (scope, elem) {
            $(elem).tooltip();
        }
    });

})();
