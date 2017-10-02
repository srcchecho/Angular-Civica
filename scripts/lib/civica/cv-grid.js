/// <reference path="./_cv-app.ts" />
var cvGrid;
(function (cvGrid) {
    'use strict';
    var CVGridConstantes = (function () {
        function CVGridConstantes() {
        }
        return CVGridConstantes;
    }());
    CVGridConstantes.TIPO_COLUMNA_STRING = "string";
    CVGridConstantes.TIPO_COLUMNA_FECHA = "fecha";
    CVGridConstantes.TIPO_COLUMNA_NUMERO = "numero";
    CVGridConstantes.TIPO_COLUMNA_ICONO = "icono";
    cvGrid.CVGridConstantes = CVGridConstantes;
    /**
     * Clase con metodos de utilidad para la gestión del UI Grid adaptado a Civica
     */
    var CVGridUtil = (function () {
        function CVGridUtil() {
        }
        /**
         * Inicia el Grid con los valores por defecto, como por ejemplo los templates, si no se ha definido ninguno
         */
        CVGridUtil.iniciarGrid = function (gridOption, configuracion, servicioCache) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOption)
                && !cvUtil.Utilidades.comprobarObjetoVacio(gridOption.columnDefs)) {
                if (cvUtil.Utilidades.comprobarObjetoVacio(gridOption.rowTemplate)
                    && !cvUtil.Utilidades.comprobarObjetoVacio(configuracion.gridRowTemplate)) {
                    gridOption.rowTemplate = cvUtil.Utilidades.getPlantilla(configuracion.gridRowTemplate, servicioCache);
                }
                // Añadir el celltemplate por defecto a cada columna (si no se ha definido antes)
                gridOption.columnDefs.forEach(function (col) {
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.headerCellTemplate)
                        && !cvUtil.Utilidades.comprobarObjetoVacio(configuracion.gridHeaderCellTemplate)) {
                        col.headerCellTemplate = cvUtil.Utilidades.getPlantilla(configuracion.gridHeaderCellTemplate, servicioCache);
                    }
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.cellClass))
                        col.cellClass = "alineacionVerticalCelda";
                    else
                        col.cellClass += " alineacionVerticalCelda";
                    if (col.tipoColumna == CVGridConstantes.TIPO_COLUMNA_ICONO)
                        col.cellClass += " cv-grid-celda-icono";
                    else if (col.tipoColumna == CVGridConstantes.TIPO_COLUMNA_NUMERO) {
                        col.sortingAlgorithm = cvUtil.Utilidades.ordenarNumeroStringFn;
                    }
                    else if (col.tipoColumna == CVGridConstantes.TIPO_COLUMNA_FECHA) {
                        col.sortingAlgorithm = cvUtil.Utilidades.ordenarFechaStringFn;
                    }
                    //Tooltip de la cabecera
                    col.headerTooltip = col.displayName;
                    // si no estÃ¡ definido se mostrarÃ¡ por defecto el tooltip
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.defaultCellTooltip)) {
                        //var resultado = cvUtil.Utilidades.tooltipCell(propiedades);
                        col.cellTooltip = function (row, col) {
                            /*if(col.displayName=='Proyecto')
                                console.log('cellTooltip: R='+row+'. C='+col.displayName);*/
                            var propiedad = "";
                            if (col.field.indexOf('.') == -1) {
                                /*if(col.displayName=='Proyecto')
                                    console.log('cellTooltip2: R='+row+'. C='+col.field);
                                */
                                propiedad = col.field;
                            }
                            else
                                propiedad = col.field.replace(/\./g, "']['");
                            try {
                                /*if(col.displayName=='Proyecto')
                                        console.log("cellTooltip3: row.entity" + "['" + propiedad + "']"+(eval("row.entity" + "['" + propiedad + "']")));
                                */
                                var tooltip = eval("row.entity" + "['" + propiedad + "']");
                                if (tooltip != undefined)
                                    return tooltip;
                                else {
                                    //Si es una funciÃ³n getNombrePropiedad() se transforma en nombrePropiedad
                                    if (col.field.indexOf('(') != -1) {
                                        try {
                                            /*propiedad = propiedad.replace("(", "");
                                            propiedad = propiedad.replace(")", "");*/
                                            //propiedad = propiedad[3].toLowerCase() + propiedad.slice(4, propiedad.length);
                                            propiedad = propiedad.replace("['", "");
                                            propiedad = propiedad.replace("']", ".");
                                            return eval("row.entity" + "." + propiedad + "");
                                        }
                                        catch (e2) {
                                        }
                                    }
                                }
                            }
                            catch (e) {
                                //console.log(e);
                                //Captura el error cuando la entidad tiene valores nulos y no se muestra valor
                            }
                        };
                    }
                });
            }
        };
        CVGridUtil.guardarEstado = function (gridApi, gridState, positionSave) {
            //Por defecto guardar en posicion 0
            if (cvUtil.Utilidades.comprobarObjetoVacio(positionSave))
                positionSave = 0;
            gridState[positionSave] = gridApi.saveState.save();
        };
        CVGridUtil.recuperarEstadoFiltros = function (gridState, positionRestore, gridOptions) {
            //Por defecto restaurar posicion 0
            if (cvUtil.Utilidades.comprobarObjetoVacio(positionRestore))
                positionRestore = 0;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridState)
                && !cvUtil.Utilidades.comprobarObjetoVacio(gridState[positionRestore])) {
                //scope.gridApi.saveState.restore(scope, gridState[positionRestore]);
                gridOptions.mostrarFiltros = true;
                /*var i: number = 0;
                gridState[positionRestore].columns.forEach((col: uiGrid.saveState.ISavedColumn) => {
                    gridOptions.columnDefs[i].filters = col.filters;
                    i++;
                });*/
                this.recuperarEstadoFiltrosGrid(gridState[positionRestore], gridOptions);
            }
        };
        CVGridUtil.recuperarEstadoFiltrosGrid = function (gridState, gridOptions) {
            var i = 0;
            gridState.columns.forEach(function (col) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.columnDefs[i].filters)) {
                    var j = 0;
                    gridOptions.columnDefs[i].filters.forEach(function (filter) {
                        filter.term = col.filters[j].term;
                        j++;
                    });
                }
                //gridOptions.columnDefs[i].filters = col.filters;
                i++;
            });
        };
        CVGridUtil.recuperarEstadoOrdenacionGrid = function (gridState, gridOptions) {
            var i = 0;
            gridState.columns.forEach(function (col) {
                gridOptions.columnDefs[i].sort = col.sort;
                i++;
            });
        };
        CVGridUtil.calcularAlturaGrid = function (gridApi, gridOptions, subFilterRows) {
            var alturaGrid = 0;
            var alturaGridAdicional = gridOptions.headerRowHeight + gridOptions.tamaAdicionalPaginacion;
            //var alturaMinimaGrid:number=0;
            // Elementos que está mostrando en pantalla
            //var numElementosVisibles:number=100;
            var elementoInicial = ((gridOptions.paginationCurrentPage - 1) * gridOptions.paginationPageSize) + 1;
            //var elementoFinal:number= Math.min(gridOptions.paginationCurrentPage * gridOptions.paginationPageSize, gridOptions.totalItems);
            //Utilización de la filas visibles para ajustar el tamaño cuando se utilicen los subfiltros de la barra del grid
            var totalItems = gridOptions.totalItems;
            if (subFilterRows != null)
                totalItems = subFilterRows;
            var elementoFinal = Math.min(gridOptions.paginationCurrentPage * gridOptions.paginationPageSize, totalItems);
            var elementosPantalla = (elementoFinal - elementoInicial) + 1;
            if (elementosPantalla > gridOptions.paginationPageSize) {
                alturaGrid = (gridOptions.rowHeight * gridOptions.paginationPageSize) + alturaGridAdicional;
                // $scope.vm.altura = contador*60 +50;
                gridApi.grid.gridHeight = alturaGrid;
            }
            else {
                //f(elementosPantalla > 0){
                alturaGrid = (gridOptions.rowHeight * elementosPantalla) + alturaGridAdicional;
                gridApi.grid.gridHeight = alturaGrid;
                //}
                //else
                //alturaGrid = alturaMinimaGrid;
            }
            return alturaGrid;
        };
        return CVGridUtil;
    }());
    cvGrid.CVGridUtil = CVGridUtil;
})(cvGrid || (cvGrid = {}));
