/// <reference path="./_cv-app.ts" />
var cvController;
(function (cvController) {
    'use strict';
    var CVBaseController = (function () {
        function CVBaseController($rootScope, $location, mensajePopup, cvPopup, $filter, uiGridExporterConstants, uiGridExporterService, $mdDialog, $timeout, $interval, servicioSeguridad, servicioCache, servicioConfiguracion) {
            var _this = this;
            this.mensajePopup = mensajePopup;
            this.cvPopup = cvPopup;
            this.$filter = $filter;
            this.uiGridExporterConstants = uiGridExporterConstants;
            this.uiGridExporterService = uiGridExporterService;
            this.$mdDialog = $mdDialog;
            this.$timeout = $timeout;
            this.$interval = $interval;
            this.servicioSeguridad = servicioSeguridad;
            this.servicioCache = servicioCache;
            this.servicioConfiguracion = servicioConfiguracion;
            this.venEsperaVisible = false;
            this.nombreMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            this.rootScope = $rootScope;
            this.location = $location;
            this.filter = $filter;
            //
            this.rootScope.mostrarVentanaEspera = false;
            this.rootScope.bloquearVentanaEspera = false;
            this.rootScope.mostrarTituloEditar = false;
            // Ventana ocupado
            this.rootScope.$on('busy.begin', function (evt, config) {
                // console.log('A mostrar la ventana....');
                if (!_this.rootScope.bloquearVentanaEspera)
                    _this.mostrarVentanaEspera();
            });
            this.rootScope.$on('busy.end', function (evt, config) {
                _this.ocultarVentanaEspera();
            });
            this.rootScope.paramPagina = new Object();
            //this.rootScope.version = TrazabilidadConstantes.VERSION;
            /*this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
            
            this.$interval(() => {
                this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
            }, 60000);*/
            this.rootScope.$on('$locationChangeSuccess', function () { return _this.locationChanged(event); });
            this.rootScope.gridState = new Array();
            this.rootScope.mostarBotonCrear = false;
            this.rootScope.mostrarBotonCerrar = false;
            this.rootScope.mostarBotonMensaje = false;
            this.rootScope.mostrarBotonVolver = false;
            this.rootScope.login = false;
            this.rootScope.tituloEditar = "";
        }
        /**Busca coincidencias entre el texto y la propiedades de la entidad del listado
         * columnas: campos o propiedades de la entidad.
         * texto: termino a buscar
         * listado: lista de entidades a filtrar
        */
        CVBaseController.prototype.buscador = function (columnas, texto, listado) {
            var resultado = new Array();
            if (!cvUtil.Utilidades.comprobarObjetoVacio(texto)
                && !cvUtil.Utilidades.comprobarObjetoVacio(columnas)) {
                for (var i = 0; i < columnas.length; i++) {
                    var c = columnas[i];
                    var json = {};
                    json = JSON.parse(this.construirJson(columnas[i], texto));
                    //json[columnas[i]] = texto;
                    var filterJson = this.filter('filter')(listado, json);
                    if (!cvUtil.Utilidades.comprobarObjetoVacio(filterJson)) {
                        for (var j = 0; j < filterJson.length; j++) {
                            var elemento = filterJson[j];
                            if (!cvUtil.Utilidades.contiene(resultado, elemento))
                                resultado.push(elemento);
                        }
                    }
                }
                return resultado;
            }
            else
                return listado;
        };
        /**Busca coincidencias entre el texto y la propiedades de la entidad del listado
             * columnas: campos o propiedades de la entidad.
             * texto: termino a buscar
             * listado: lista de entidades a filtrar
            */
        CVBaseController.prototype.buscador2 = function (columnas, texto, listado) {
            var _this = this;
            console.log("La hora de inicio era:" + new Date());
            var resultado = new Array();
            if (!cvUtil.Utilidades.comprobarObjetoVacio(texto)
                && !cvUtil.Utilidades.comprobarObjetoVacio(columnas)) {
                var texto2 = texto.toLowerCase();
                listado.forEach(function (elemento) {
                    var encontrado = false;
                    for (var i = 0; (i < columnas.length && !encontrado); i++) {
                        var ele = _this.obtenerPropiedad(columnas[i], elemento);
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(ele)) {
                            var ele2 = ele.toString().toLowerCase();
                            if (ele2.includes(texto2))
                                encontrado = true;
                        }
                    }
                    if (encontrado)
                        resultado.push(elemento);
                });
                console.log("La hora de fin era:" + new Date());
                return resultado;
            }
            else
                return listado;
        };
        CVBaseController.prototype.obtenerPropiedad = function (columna, Elemento) {
            var ele;
            var pos = columna.indexOf('.');
            if (pos == -1) {
                ele = Elemento[columna];
            }
            else {
                var count = (columna.match(new RegExp("\\.", "g")) || []).length;
                var strings = columna.split(".");
                ele = columna[strings[0]];
                if (!cvUtil.Utilidades.comprobarObjetoVacio(ele)) {
                    for (var i = 1; i <= count && ele != null; i++) {
                        ele = !cvUtil.Utilidades.comprobarObjetoVacio(ele[strings[i]]) ? ele[strings[i]] : null;
                    }
                }
            }
            return ele;
        };
        CVBaseController.prototype.construirJson = function (field, texto) {
            var jsonStr;
            var pos = field.indexOf('.');
            if (pos == -1) {
                jsonStr = "{" + field + ": '" + texto + "'}";
            }
            else {
                var count = (field.match(new RegExp("\\.", "g")) || []).length;
                jsonStr = "{" + field.replace(new RegExp("\\.", "g"), ":{") + ": '" + texto + "'";
                for (var i = 0; i <= count; i++) {
                    jsonStr += '}';
                }
            }
            return JSON.stringify(eval("(" + jsonStr + ")"));
        };
        /**
        * Path para llegar a la carpeta views
        **/
        CVBaseController.prototype.mostrarVentanaEsperaPlantilla = function (pathViews) {
            if (pathViews === void 0) { pathViews = ""; }
            this.venEspera = this.cvPopup.mostrar(pathViews + "templates/ventanaEspera.html");
        };
        CVBaseController.prototype.ocultarVentanaEsperaPlantilla = function () {
            this.cvPopup.cerrar(this.venEspera);
        };
        CVBaseController.prototype.mostrarVentanaEspera = function () {
            this.rootScope.mostrarVentanaEspera = true;
            /*if (!this.venEsperaVisible) {
                this.venEspera = this.cvPopup.mostrar("templates/ventanaEspera.html");
                this.venEsperaVisible = true;
            }*/
        };
        CVBaseController.prototype.ocultarVentanaEspera = function () {
            /*if (this.venEsperaVisible) {
                this.cvPopup.cerrar(this.venEspera);
                this.venEsperaVisible = false;
             }*/
            this.rootScope.mostrarVentanaEspera = false;
        };
        CVBaseController.prototype.bloquearVentanaEspera = function () {
            this.rootScope.bloquearVentanaEspera = true;
        };
        CVBaseController.prototype.desBloquearVentanaEspera = function () {
            this.rootScope.bloquearVentanaEspera = false;
        };
        CVBaseController.prototype.fijarVersion = function (v) {
            this.servicioCache.setVersionApp(v);
            //this.rootScope.version = v;
        };
        /*fijarVersion(v: string) {

            this.rootScope.version = v;
        }*/
        /**
         * Guarda los filtros del grid.
         * controller: Controlador desde que se llama a la función
         * posicion: null -> Ventanas distintas a crear parte de carga
         *           0    -> Ventana parte de carga tab pedidos.
         *           1    -> Ventana parte de carga tab devoluciones.
         */
        CVBaseController.prototype.guardarFiltrosGrid = function (controller, posicion) {
            //Se llama a null para ventanas distintas a los tab de crear parte de carga
            if (posicion == null) {
                this.rootScope.gridState = new Array();
                posicion = 0;
            }
            cvGrid.CVGridUtil.guardarEstado(controller.gridApi, this.rootScope.gridState, posicion);
        };
        /**
         * Restaura los filtros del grid.
         * controller: Controlador desde que se llama a la función
         * posicion: null -> Ventanas distintas a crear parte de carga
         *           0    -> Ventana parte de carga tab pedidos.
         *           1    -> Ventana parte de carga tab devoluciones.
         */
        CVBaseController.prototype.restaurarFiltrosGrid = function (posicion, gridOptions) {
            if (posicion == null) {
                posicion = 0;
            }
            cvGrid.CVGridUtil.recuperarEstadoFiltros(this.rootScope.gridState, posicion, gridOptions);
        };
        CVBaseController.prototype.guardarEstadoController = function (controller) {
            var estado = new Object();
            cvUtil.Utilidades.copiarListaPropiedades(controller, estado, controller.variablesEstado);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope.gridApi))
                estado['estadoGrid'] = controller.bScope.gridApi.saveState.save();
            return estado;
        };
        CVBaseController.prototype.recuperarEstadoController = function (controller, estado) {
            cvUtil.Utilidades.copiarPropiedades(estado, controller);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope.gridApi)
                && !cvUtil.Utilidades.comprobarObjetoVacio(estado)) {
                var estadoGrid = estado['estadoGrid'];
                controller.bScope.gridApi.saveState.restore(controller.bScope, estadoGrid);
                cvGrid.CVGridUtil.recuperarEstadoFiltrosGrid(estadoGrid, controller.gridOptions);
                cvGrid.CVGridUtil.recuperarEstadoOrdenacionGrid(estadoGrid, controller.gridOptions);
            }
        };
        // Navegacion de paginas
        CVBaseController.prototype.navegarA = function (pagina, param) {
            if (param === void 0) { param = ""; }
            // Si param es una cadena vacia mantiene los que había
            // Para eliminar los parametros usar null
            if (param != "")
                this.rootScope.paramPagina[pagina] = param;
            this.location.path(pagina);
        };
        CVBaseController.prototype.navegarAPagina = function (param) {
            this.rootScope.paramPagina[param.pathOrigen] = param.paramOrigen;
            if (param.paramDestino == null) {
                if (param.refrescarDestino)
                    this.rootScope.paramPagina[param.pathDestino] = null;
            }
            else
                this.rootScope.paramPagina[param.pathDestino] = param.paramDestino;
            if (param.anadirParamDestino != null) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(this.rootScope.paramPagina[param.pathDestino]))
                    cvUtil.Utilidades.copiarPropiedades(param.anadirParamDestino, this.rootScope.paramPagina[param.pathDestino]);
                else
                    this.rootScope.paramPagina[param.pathDestino] = param.anadirParamDestino;
            }
            this.location.path(param.pathDestino);
        };
        CVBaseController.prototype.navegarAPaginaController = function (controller, param) {
            var pathController = controller.URL_CONTROLLER;
            var scope = controller.bScope;
            var estado = this.guardarEstadoController(controller);
            param.pathOrigen = pathController;
            param.paramOrigen = estado;
            this.navegarAPagina(param);
        };
        CVBaseController.prototype.locationChanged = function (event) {
            var path = this.location.path();
            /*switch (path) {
                case '/pedidoTrz':
                    break;
                case '/etiquetas':
                default:
     
                    break;
            }*/
            //alert('Evento2=' + this.location.path());       	
            //this.rootScope.$broadcast('cambiarPaginaEvent');
        };
        // Cliclo de Vida
        CVBaseController.prototype.iniciar = function (pagina, iniciarCallBack, funcionalidad) {
            var _this = this;
            if (funcionalidad === void 0) { funcionalidad = ""; }
            this.servicioSeguridad.extraerUsuarioIdentificado(function (data) {
                _this.setUsuarioIdentificado(data);
                // Podría comprobar si es una URL Valida
                if (_this.location.path() == '/index.html' || _this.location.path() == '/') {
                    _this.irPaginaPrincipal();
                    return;
                }
                // Si se ha añadido la funcionalidad se comprueba
                if (!cvUtil.Utilidades.comprobarObjetoVacio(funcionalidad)) {
                    if (!_this.comprobarAccesoUsuario(funcionalidad, "No tiene acceso a la función seleccionada", true)) {
                        _this.mensajePopup.mostrarError("Acceso no autorizado", "", undefined, _this.irPaginaPrincipal);
                        _this.irPaginaPrincipal();
                        return;
                    }
                }
                // Recupera los parametros y los pasa al callBack
                // Elimina el parametro de sesion  
                var param = _this.rootScope.paramPagina[pagina];
                // Comentando esto los parámetros no se pierden y funciona correctamenta al volver atras
                //this.rootScope.paramPagina[pagina] = null;
                iniciarCallBack(param);
            });
        };
        CVBaseController.prototype.comprobarAccesoFuncionalidad = function (funcionalidad) {
            return this.comprobarAccesoUsuario(funcionalidad, "", false);
        };
        CVBaseController.prototype.comprobarAccesoUsuario = function (funcionalidad, mensajeError, mostrarError) {
            if (mostrarError === void 0) { mostrarError = true; }
            var u = this.getUsuarioIdentificado();
            var permitido = this.servicioSeguridad.compruebaFuncionalidadPerfilUsuario(u, funcionalidad);
            if (!permitido && mostrarError) {
                this.mensajePopup.mostrarError("Acceso no autorizado", mensajeError);
            }
            return permitido;
        };
        /**
         * La operacion indica si se las funcionalidades se comprueban con AND o OR (usando esas cadenas).
         * En el array de funcionalidades se pasan variables para evaluar que contienen el verdadero valor
         * de la funcionalidad. Con esto se facilita el uso de constantes.
         * Devuelve true si se tiene acceso o false en caso de no tenerlo.
         */
        CVBaseController.prototype.comprobarAccesoUsuarioFunEval = function (funcionalidades, operacion) {
            var _this = this;
            if (operacion === void 0) { operacion = "OR"; }
            if (cvUtil.Utilidades.comprobarObjetoVacio(funcionalidades))
                return true;
            var hayPermitidos = false;
            var hayNoPermitidos = false;
            var u = this.getUsuarioIdentificado();
            funcionalidades.forEach(function (fun) {
                var valor = eval(fun);
                var permitido = _this.servicioSeguridad.compruebaFuncionalidadPerfilUsuario(u, valor);
                if (!permitido)
                    hayNoPermitidos = true;
                else
                    hayPermitidos = true;
            });
            var salida = false;
            if (operacion == "AND") {
                if (!hayNoPermitidos)
                    salida = true;
            }
            else if (operacion == "OR") {
                if (hayPermitidos)
                    salida = true;
            }
            return salida;
        };
        CVBaseController.prototype.irPaginaPrincipal = function () {
            this.location.path("/");
        };
        CVBaseController.prototype.mostrar = function (parametros) {
        };
        CVBaseController.prototype.refrescar = function (parametros) {
        };
        CVBaseController.prototype.setController = function (controller) {
            this.rootScope.controller = controller;
        };
        CVBaseController.prototype.mostrarBtCrear = function (mostrar) {
            this.rootScope.mostarBotonCrear = mostrar;
        };
        CVBaseController.prototype.mostrarBtnCerrar = function (mostrar) {
            this.rootScope.mostrarBotonCerrar = mostrar;
        };
        CVBaseController.prototype.mostrarBtMensaje = function (mostrar) {
            this.rootScope.mostarBotonMensaje = mostrar;
        };
        CVBaseController.prototype.mostrarBtVolver = function (mostrar) {
            this.rootScope.mostrarBotonVolver = mostrar;
        };
        CVBaseController.prototype.clasePantalla = function (clase) {
            this.rootScope.clasePantalla = clase;
        };
        CVBaseController.prototype.login = function (login) {
            this.rootScope.login = login;
        };
        CVBaseController.prototype.irCrear = function () {
            var ctrl = this.rootScope.controller;
            /*            if (ctrl instanceof app.ListaEscenariosController)
                            (<app.ListaEscenariosController>ctrl).abrirCrear();
                        else if (ctrl instanceof app.ListaPresupuestosController)
                            (<app.ListaPresupuestosController>ctrl).abrirCrear();*/
        };
        CVBaseController.prototype.abrirMensaje = function () {
            var ctrl = this.rootScope.controller;
            /*            if (ctrl instanceof app.TrazabilidadBotellaController)
                            (<app.TrazabilidadBotellaController>ctrl).abrirMensaje();
                        if (ctrl instanceof app.TrazabilidadLoteController)
                            (<app.TrazabilidadLoteController>ctrl).abrirMensaje();*/
        };
        CVBaseController.prototype.volver = function () {
            /*this.rootScope.controladorActual.volver();*/
            console.log('salirDetalle');
            var ctrl = this.rootScope.controller;
            /*if (ctrl instanceof app.DetallePresupuestoController)
               (<app.DetallePresupuestoController>ctrl).volverListado('R');*/
        };
        CVBaseController.prototype.setNombreBoton = function (nombreBoton) {
            this.rootScope.nombreBoton = nombreBoton;
        };
        CVBaseController.prototype.setBreadcrumb = function (breadcrumb) {
            this.rootScope.breadcrumb = breadcrumb;
        };
        CVBaseController.prototype.setTituloPagina = function (tituloPagina) {
            this.rootScope.tituloPagina = tituloPagina;
        };
        CVBaseController.prototype.setMostrarTituloEditar = function (mostrarTituloEditar) {
            this.rootScope.mostrarTituloEditar = mostrarTituloEditar;
        };
        CVBaseController.prototype.setTituloEditar = function (tituloEditar) {
            this.rootScope.tituloEditar = tituloEditar;
        };
        CVBaseController.prototype.setTituloApartado = function (titulo) {
            this.rootScope.tituloApartado = titulo;
        };
        CVBaseController.prototype.setUsuarioIdentificado = function (u) {
            this.rootScope.usuarioIdentificado = u;
        };
        CVBaseController.prototype.getUsuarioIdentificado = function () {
            return this.rootScope.usuarioIdentificado;
        };
        CVBaseController.prototype.comprobarFormularioValido = function (formulario) {
            if (formulario.$valid)
                return true;
            var valido = true;
            // Comprobar que alguno de los campos no validos están visibles
            if (this.comprobarElementosVisibles(formulario.$error.required))
                valido = false;
            if (this.comprobarElementosVisibles(formulario.$error.pattern))
                valido = false;
            if (this.comprobarElementosVisibles(formulario.$error.valid))
                valido = false;
            if (this.comprobarElementosVisibles(formulario.$error.minlength))
                valido = false;
            if (this.comprobarElementosVisibles(formulario.$error.maxlegth))
                valido = false;
            if (this.comprobarElementosVisibles(formulario.$error.format))
                valido = false;
            if (!valido)
                this.mostrarMensajeErrorFormulario(formulario);
            return valido;
        };
        /**
        * Indica si alguno de los elementos del array es visible
        **/
        CVBaseController.prototype.comprobarElementosVisibles = function (lista) {
            if (typeof lista != 'undefined') {
                for (var i = 0; i < lista.length; i++) {
                    if (this.comprobarElementoVisible(lista[i]))
                        return true;
                }
            }
            return false;
        };
        CVBaseController.prototype.comprobarElementoVisible = function (el) {
            //var salida: boolean = expect(el.hasClass('ng-hide')).toBe(false);
            if (cvUtil.Utilidades.comprobarObjetoVacio(el.$name))
                return true;
            var eljq = $('[name=' + el.$name + ']');
            var salida = eljq.is(":visible");
            return salida;
        };
        CVBaseController.prototype.mostrarMensajeErrorFormulario = function (formulario) {
            //$document.            
            var mensaje = "<div layout='column' layout-align='start center'><div layout='row' flex='100'>";
            mensaje += "<h2 class='cv-no-margin'>Por favor, revise los siguientes campos del formulario antes de continuar:</h2></div>";
            mensaje += "<div layout='column' class='campos-formulario'>";
            if (typeof formulario.$error.required != 'undefined') {
                for (var i = 0; i < formulario.$error.required.length; i++) {
                    if (this.comprobarElementoVisible(formulario.$error.required[i]))
                        mensaje += "<div layout='row'><h3 class='cv-no-margin'>El campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.required[i].$name]) + "</span> es obligatorio.</h3></div>";
                }
            }
            if (typeof formulario.$error.pattern != 'undefined') {
                for (var i = 0; i < formulario.$error.pattern.length; i++) {
                    var tipoValor = formulario.tiposCampos[formulario.$error.pattern[i].$name];
                    if (tipoValor == 'integer')
                        if (this.comprobarElementoVisible(formulario.$error.pattern[i]))
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El valor del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.pattern[i].$name]) + "</span> no es correcto. Debe ser un número entero.</h3></div>";
                }
            }
            if (typeof formulario.$error.valid != 'undefined') {
                for (var i = 0; i < formulario.$error.valid.length; i++)
                    if (this.comprobarElementoVisible(formulario.$error.valid[i]))
                        mensaje += "<div layout='row'><h3 class='cv-no-margin'>El valor del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.valid[i].$name]) + "</span> no es correcto</h3></div>";
            }
            if (typeof formulario.$error.minlength != 'undefined') {
                for (var i = 0; i < formulario.$error.minlength.length; i++) {
                    if (this.comprobarElementoVisible(formulario.$error.minlength[i])) {
                        var el = $('[name=' + formulario.$error.minlength[i].$name + ']');
                        var minlen = el.attr("ng-minlength");
                        var maxlen = el.attr("ng-maxlength");
                        if (minlen == maxlen)
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El tamaño del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.minlength[i].$name]) + "</span> deber ser de " + minlen + " caracteres</h3></div>";
                        else
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El tamaño del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.minlength[i].$name]) + "</span> debe estar entre " + minlen + " y " + maxlen + " caracteres</h3></div>";
                    }
                }
            }
            if (typeof formulario.$error.maxlength != 'undefined') {
                for (var i = 0; i < formulario.$error.maxlength.length; i++) {
                    if (this.comprobarElementoVisible(formulario.$error.maxlength[i])) {
                        var el = $('[name=' + formulario.$error.maxlength[i].$name + ']');
                        var minlen = el.attr("ng-minlength");
                        var maxlen = el.attr("ng-maxlength");
                        if (minlen == maxlen)
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El tamaño del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.maxlength[i].$name]) + "</span> deber ser de " + minlen + " caracteres</h3></div>";
                        else if (minlen == undefined)
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El tamaño del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.maxlength[i].$name]) + "</span> debe ser inferior o igual a " + maxlen + " caracteres</h3></div>";
                        else
                            mensaje += "<div layout='row'><h3 class='cv-no-margin'>El tamaño del campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.maxlength[i].$name]) + "</span> debe estar entre " + minlen + " y " + maxlen + " caracteres</h3></div>";
                    }
                }
            }
            if (typeof formulario.$error.format != 'undefined') {
                for (var i = 0; i < formulario.$error.format.length; i++)
                    if (this.comprobarElementoVisible(formulario.$error.format[i]))
                        mensaje += "<div layout='row'><h3 class='cv-no-margin'>El valor introducido en el campo <span>" + this.prepararNombreCampo(formulario.labelsCampos[formulario.$error.format[i].$name]) + "</span> no tiene el formato correcto</h3></div>";
            }
            //var el: JQuery = $('[name=' + formulario.$error.required[i].$name + ']')
            mensaje += "</div></div>";
            this.mensajePopup.mostrarError("Error de validación", mensaje);
        };
        CVBaseController.prototype.prepararNombreCampo = function (nombre) {
            if (nombre != null && typeof nombre != 'undefined') {
                nombre = nombre.trim();
                if (nombre.lastIndexOf(':') == nombre.length - 1)
                    nombre = nombre.substring(0, nombre.length - 1);
                return nombre;
            }
            return nombre;
        };
        CVBaseController.prototype.iniciarGrid = function () {
            this.rootScope.filter = this.filter;
        };
        CVBaseController.prototype.getGridOptionsBase = function () {
            this.iniciarGrid();
            var gridOptions = {
                //data: [{ numeroLineaCarga: '2', palesPedidos: '5', palesCargados: 8 }],
                //columnDefs:{ field: 'sscc', displayName: 'SSCC Palé' },
                titulo: '',
                tituloExcel: '',
                subtitulo: '',
                orientacion: '',
                nombreFichero: '',
                imagenFondo: '../app/images/logo-pdf.png',
                imagenCabecera: '../app/images/logo-pdf.png',
                data: [],
                enableFiltering: true,
                columnDefs: [],
                enableGridMenu: false,
                enableColumnMenus: false,
                enableSelectAll: true,
                showHeader: true,
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
                exporterPdfHeader: { text: "Mi cabecera", style: 'headerStyle' },
                exporterPdfFooter: function (currentPage, pageCount) {
                    return { text: currentPage.toString() + ' de ' + pageCount.toString(), style: 'footerStyle' };
                },
                exporterPdfCustomFormatter: function (docDefinition) {
                    docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                    docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                    return docDefinition;
                },
                exporterPdfOrientation: 'portrait',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 500,
                exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                dobleClick: null,
                mostrarFiltros: false,
                headerRowHeight: 0,
                tamaAdicionalPaginacion: 0
            };
            return gridOptions;
        };
        CVBaseController.prototype.getGridCellTemplateIconos = function (listaIconos, tipo) {
            var template;
            if (tipo == "retimbrado") {
                template = '<md-button ng-if="!row.entity.fechaBaja" id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irRetimbrado(row.entity)">\
                                <i ng-if="row.entity.edicion" class="icon-sello"/><i ng-if="!row.entity.edicion" class="icon-sello"/></ng-if>\
                            </md-button>';
            }
            else if (tipo == "ordenLlenado") {
                template = '<md-button id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irDetalle(row.entity)">\
                                <i ng-if="row.entity.estado===\'Abierto\' && row.entity.fechaBaja===null" class="icon-editar"/><i ng-if="row.entity.estado===\'Cerrado\' || row.entity.fechaBaja!=null || row.entity.estado===\'Completo\'" class="icon-ver"/></ng-if>\
                            </md-button>';
            }
            else if (tipo == "albaran") {
                template = '<md-button id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irDetalle(row.entity)">\
                                <i class="icon-pdf"/>\
                            </md-button>';
            }
            else {
                template = '<md-button id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irDetalle(row.entity)">\
                                <i ng-if="!row.entity.fechaBaja" class="icon-editar" /><i ng-if="row.entity.fechaBaja" class="icon-ver"/></ng-if>\
                            </md-button>';
            }
            return template;
            //// cambiarTabla
            /*var template: string = '<div class="estilos-tabla-botones-peticiones ngCellText" ng-class="col.colIndex()">';
            listaIconos.forEach((icono: any) => {
                if (cvUtil.Utilidades.comprobarObjetoVacio(icono.param))
                    icono.param = '{{row.entity}}';
                //icono.param = '{{row.entity}}';
                template += '<md-button class="md-icon-button" ng-click="this.grid.appScope.' + icono.funcion + '(row.entity)">';
                //template += '<md-button class="md-icon-button" ng-click="console.log(' + icono.param + ')">';
                if (icono.imagen.indexOf('.svg') != -1)
                    template += '<md-icon style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="' + icono.imagen + '"></md-icon>';
                else
                    template += '<img style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" src="' + icono.imagen + '"></img>';
                template += '</md-button>';
            });
            template += '</div>';
            return template;*/
        };
        /**Cell Template para columna popover de la columna 'Más' */
        CVBaseController.prototype.getGridCellTemplatePopover = function (configuracion) {
            var template = '<div class="estilos-tabla-botones-parteCarga ngCellText" ng-class="col.colIndex()">';
            if (cvUtil.Utilidades.comprobarObjetoVacio(configuracion.param))
                configuracion.param = '{{row.entity}}';
            template += '<md-button class="md-icon-button" ng-mouseover="this.grid.appScope.' + configuracion.funcion + '(row.entity, $event)" ng-mouseleave="this.grid.appScope.' + configuracion.funcion + '(null)">';
            if (configuracion.imagen.indexOf('.svg') != -1)
                template += '<md-icon style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="' + configuracion.imagen + '"></md-icon>';
            else {
                template += '<img style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" ';
                template += 'src="' + configuracion.imagen + '"></img>';
            }
            template += '</md-button>';
            template += '</div>';
            return template;
        };
        //cabecera de las tablas normal
        CVBaseController.prototype.getGridHeaderTemplateFiltro = function () {
            //console.lo
            //var nombreCampo:string="{{col.field}}";
            //var nombreCampoSinParentesis:string="{{this.grid.appScope.vm.nombreCampoGrid(col)}}";
            // Si se trata de una funcion que termina en parentesis se los quito usando una funcion de cvUtil            
            var template = '<div id="cvgrid-{{this.grid.id}}-tablaPeticion1" class="headerTablaPeticion1" ng-if="filterable" class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
                '<div style="height:26px;" layout="row" layout-align="center center" class="texto-cabecera">' +
                '<span id="' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '-ordenacion" ng-click="this.grid.appScope.vm.ordenacion(this.grid,\'' + "{{col.field}}" + '\')" class="ngHeaderText pointer">{{col.displayName}}</span> ' +
                '<md-button ng-click="this.grid.appScope.vm.gridToggleFilter(\'' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '\',this.grid.id)" class="md-icon-button boton-filtrar"><md-icon id="botonIconoFiltro ' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" md-fab md-mini class="icono-filtro ' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" md-svg-src="../imagenes/filtro.svg" class="name"></md-icon></md-button>' +
                '</div><div class="filtro">' +
                '<input ng-click="this.grid.appScope.vm.actualizarInputSeleccionado(\'' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '\')" ng-keyup="this.grid.appScope.vm.detectoTecladoFiltro()" id="' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" style="width: 70%;" type="text" class="estiloFiltrador ui-grid-filter-input" ng-model="colFilter.term" ng-attr-placeholder="{{col.displayName || \'\'}}" />';
            '</div></div>';
            return template;
        };
        CVBaseController.prototype.getGridCellTemplateEditView = function (funcion) {
            var template = '<div class="estilos-tabla-botones-peticiones ngCellText" ng-class="col.colIndex()">';
            template += '<md-button class="md-icon-button" ng-click="this.grid.appScope.' + funcion + '(row.entity)">';
            template += '<md-icon ng-if="!row.entity.activo()" style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="../imagenes/ver.svg"></md-icon>';
            template += '<md-icon ng-if="row.entity.activo()" style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="../imagenes/editar.svg"></md-icon>';
            template += '</md-button></div>';
            return template;
        };
        CVBaseController.prototype.ordenarListado = function (listado, campo, reverse) {
            if (reverse === void 0) { reverse = false; }
            if (cvUtil.Utilidades.comprobarObjetoVacio(listado))
                return null;
            return this.filter('orderBy')(listado, campo, reverse);
        };
        CVBaseController.prototype.ordenarListadoCampos = function (listado, campos, reverse) {
            if (reverse === void 0) { reverse = false; }
            if (cvUtil.Utilidades.comprobarObjetoVacio(listado))
                return null;
            return this.filter('orderBy')(listado, campos, reverse);
        };
        CVBaseController.prototype.transformarFecha = function (fecha, formato) {
            if (formato === void 0) { formato = "dd/MM/yyyy"; }
            if (cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                return "";
            return this.filter('date')(fecha, formato);
        };
        CVBaseController.prototype.transformarFechaHora = function (fecha) {
            return this.transformarFecha(fecha, 'dd/MM/yyyy HH:mm:ssss');
        };
        CVBaseController.prototype.formatearFecha = function (fechaStr, formato) {
            if (formato === void 0) { formato = 'DD/MM/YYYY'; }
            if (cvUtil.Utilidades.comprobarObjetoVacio(fechaStr))
                return null;
            return moment(fechaStr, 'DD/MM/YYYY').toDate();
        };
        CVBaseController.prototype.fechaActual = function () {
            this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
        };
        CVBaseController.prototype.transformarFechaFullDate = function (fecha) {
            if (cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                return "";
            return this.filter('date')(fecha, "hh:mm") + ' | ' + this.filter('date')(fecha, "fullDate", 'es');
        };
        CVBaseController.prototype.actualizaFecha = function () {
            this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
        };
        CVBaseController.prototype.transformarFechaMediumDate = function (fecha) {
            var sfecha = "";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                sfecha = this.filter('date')(fecha, "EEEE", 'es') + ', ' + this.filter('date')(fecha, "mediumDate", 'es');
            return sfecha;
        };
        CVBaseController.prototype.exportarPDF = function (gridApi, gridOptions) {
            var _this = this;
            this.mostrarVentanaEspera();
            // Numero de filas y columnas para el layout
            var orientacion;
            var numFilas = 0;
            var numColumnas = 0;
            var rows = gridApi.core.getVisibleRows(gridApi.grid);
            var columns = gridOptions.columnDefs;
            // Para comprobar el numero de columnas hay que comprobar las que van a ser exportadas 			
            numColumnas = this.getNumeroColumnasExportar(gridOptions);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(rows))
                numFilas = rows.length;
            // Titulo y subtitulo
            var titulo = "";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.titulo))
                titulo += gridOptions.titulo + "\n\n";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.subtitulo))
                titulo += gridOptions.subtitulo + "\n";
            // Filtros aplicados para añadir a la cabecera
            var filtros = this.filtrosAplicadosDinamico(gridApi);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(filtros))
                titulo += "\n" + filtros + "\n";
            //titulo += "\nFiltros Activos: " + filtros + "\n";
            // El segundo parametro (110) es el que permite que se vea mas cabecera
            // Se debería hacer dinámico dependiendo de las líneas de titulo.
            var orientacion = "";
            if (gridOptions.orientacion == "horizontal") {
                orientacion = "landscape";
            }
            var documento = {
                pageMargins: [30, 110, 30, 40],
                pageSize: 'LETTER',
                pageOrientation: orientacion,
                // El margen superior debería ser calculado para centralo en altura
                background: function () {
                    return {
                        image: 'fondo',
                        width: 130,
                        alignment: 'left',
                        margin: [35, 15, 0, 0]
                    };
                },
                header: function (currentPage, pageCount) {
                    return {
                        columns: [
                            {
                                //text: 'Pedido de Trazabilidad\nCentro de Trabajo: FÁBRICA ESTRELLA GALICIA. Serie: 00.\nNumped:38289\n\n\n\n', style: 'cabecera',
                                text: titulo, style: 'cabecera',
                                alignment: 'left',
                                margin: [30, 85, 30, 10]
                            }
                            /*,
                            {
                                image: 'cabecera',
                                width: 150,
                                alignment: 'right',
                                margin: [30, 30, 0, 0]
                            }*/
                        ]
                    };
                },
                footer: function (currentPage, pageCount) {
                    var variableFooter = {
                        margin: [30, 10, 30, 10],
                        columns: [
                            { text: moment().format('DD/MM/YYYY, h:mm:ss'), fontSize: 9, alignment: 'left' },
                            { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', fontSize: 9 }
                        ]
                    };
                    return variableFooter;
                },
                content: [
                    {
                        style: 'tabla',
                        table: {
                            widths: this.buildPDFTableColumnsWidth(gridOptions),
                            headerRows: 1,
                            body: this.buildPDFTableBody(gridApi, gridOptions),
                        }, layout: {
                            fillColor: function (i, node) { return (i % 2 === 0) ? '#e6e6e6' : null; },
                            // Sólo visibles las lineas de las tablas, no las de las celdas
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === 1 || i === numFilas + 1) ? 1 : 0;
                            },
                            vLineWidth: function (i, node) {
                                //return (i === 0 || i === numColumnas) ? 1 : 0;
                                return 1;
                            },
                            vLineColor: function (i, node) {
                                return 'black';
                            },
                            hLineColor: function (i, node) {
                                return 'black';
                            }
                        }
                    }
                ],
                styles: {
                    cabecera: {
                        fontSize: 10,
                        bold: true
                    },
                    tabla: {
                        fontSize: 9,
                    },
                    cabeceraTabla: {
                        bold: true,
                        alignment: 'center',
                        fillColor: '#003366',
                        color: '#fff'
                    },
                    bodyTabla: {
                        margin: [0, 1, 0, 1],
                    }
                },
                images: {
                    cabecera: '',
                    fondo: ''
                }
            };
            //var pdfMake: any;
            var nombreFichero = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero;
            //this.mostrarVentanaEspera();    
            // Antes de hacer la exportacion hay que cargar las imagenes y transformarlas a Base64
            cvUtil.Utilidades.imageToBase64(gridOptions.imagenCabecera, function (base64Img) {
                documento.images.cabecera = base64Img;
                cvUtil.Utilidades.imageToBase64(gridOptions.imagenFondo, function (base64Img) {
                    documento.images.fondo = base64Img;
                    /*console.log('Contador iniciado');
                    this.mostrarVentanaEspera();*/
                    //this.rootScope.$emit('busy.begin');
                    //var dg: any = this.mensajePopup.mostrarInfo("Generando PDF", "Generando PDF, espere mientras finaliza la operación. Al finalizar la ventana se cerrará automáticamente");
                    /*var dg: any = this.cvPopup.mostrar("templates/ventanaEspera.html");*/
                    //window.setTimeout(partB,1000);
                    _this.$timeout(function () {
                        //console.log('Download iniciado');
                        pdfMake.createPdf(documento).download(nombreFichero + '.pdf', function () {
                            //this.rootScope.$emit('busy.end');
                            //console.log('Download finalizado');
                            console.log('Download finalizado');
                            /*this.cvPopup.cerrar(dg);*/
                        });
                        _this.ocultarVentanaEspera();
                    }, 2000);
                });
            });
        };
        CVBaseController.prototype.getNumeroColumnasExportar = function (gridOptions) {
            var _this = this;
            var contador = 0;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.columnDefs)) {
                gridOptions.columnDefs.forEach(function (col) {
                    if (_this.esColumnaExportable(col)) {
                        contador++;
                    }
                });
            }
            return contador;
        };
        CVBaseController.prototype.filtrosAplicados = function (gridApi) {
            var salida = "";
            var columns = gridApi.grid.columns;
            columns.forEach(function (col) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(col.filters)) {
                    //var fOptions:Array<IFilterOptions
                    col.filters.forEach(function (filter) {
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(filter.term)) {
                            salida += col.displayName + " = " + "*" + filter.term + "* ";
                        }
                    });
                }
            });
            return salida;
        };
        CVBaseController.prototype.filtrosAplicadosDinamico = function (gridApi) {
            var salida = "";
            var columns = gridApi.grid.columns;
            columns.forEach(function (col) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(col.filters)) {
                    //var fOptions:Array<IFilterOptions
                    var numFilter = col.filters.length;
                    var i = 0;
                    col.filters.forEach(function (filter) {
                        i++;
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(filter.term)) {
                            if (numFilter == 2) {
                                var limite = "";
                                if (i == 1)
                                    limite = ' (desde)';
                                else
                                    limite = ' (hasta)';
                                salida += col.displayName + limite + ": " + filter.term + "\n";
                            }
                            else
                                salida += col.displayName + " : " + "*" + filter.term + "* " + "\n";
                            ;
                        }
                    });
                }
            });
            return salida;
        };
        /**
        * Dada una cadena de tamaño la devuelve transformada en number.
        * Comprueba si es un numero o un %.
        **/
        CVBaseController.prototype.getNumberWith = function (cadena) {
            if (cvUtil.Utilidades.comprobarObjetoVacio(cadena))
                return 0;
            // Primero comprobar si es numerico
            var n = parseInt(cadena);
            if (!isNaN(n))
                return n;
            else if (cadena.indexOf('%') == cadena.length - 1) {
                cadena = cadena.substring(0, cadena.length - 2);
                n = parseInt(cadena);
                if (!isNaN(n))
                    return n;
            }
            return 0;
        };
        /**
        * Calcula el tamaño de las columnas de la exportación a PDF basándose en el tamaño indicado en pantalla.
        * Si hay columnas que no se exportan su tamaño debe ser repartido entre el resto.
        */
        CVBaseController.prototype.buildPDFTableColumnsWidth = function (gridOptions) {
            var _this = this;
            var columns = gridOptions.columnDefs;
            if (cvUtil.Utilidades.comprobarObjetoVacio(columns))
                return [];
            var numColumnas = 0;
            var tamaColumnasNoExportar = 0;
            var tamaRepartir = 0;
            columns.forEach(function (col) {
                if (_this.esColumnaExportable(col)) {
                    numColumnas++;
                }
                else {
                    tamaColumnasNoExportar += _this.getNumberWith(col.width);
                }
            });
            if (tamaColumnasNoExportar > 0 && numColumnas > 0) {
                tamaRepartir = tamaColumnasNoExportar / numColumnas;
            }
            var salida = new Array();
            columns.forEach(function (col) {
                if (_this.esColumnaExportable(col)) {
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.width))
                        salida.push('*');
                    else {
                        var tama = _this.getNumberWith(col.width);
                        if (tamaRepartir > 0)
                            tama += tamaRepartir;
                        salida.push(tama + "%");
                    }
                }
            });
            return salida;
        };
        CVBaseController.prototype.buildPDFTableBody = function (gridApi, gridOptions) {
            var _this = this;
            var body = new Array();
            // La cabecera que se repetirá en cada página
            body.push(this.buildPDFTableColumnsHeader(gridOptions));
            // Los registros
            var rows = gridApi.core.getVisibleRows(gridApi.grid);
            var columns = gridOptions.columnDefs;
            if ((cvUtil.Utilidades.comprobarObjetoVacio(columns))
                || (cvUtil.Utilidades.comprobarObjetoVacio(rows)))
                return [];
            var valor;
            var fila;
            rows.forEach(function (row) {
                String(rows);
                fila = new Array();
                columns.forEach(function (col) {
                    if (_this.esColumnaExportable(col)) {
                        var c = gridApi.grid.getColumn(col.name);
                        //console.log(col);
                        var valor = gridApi.grid.getCellDisplayValue(row, c);
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(valor))
                            valor = valor.toString();
                        else
                            valor = "";
                        fila.push({ text: valor, style: 'bodyTabla' });
                    }
                });
                body.push(fila);
            });
            return body;
        };
        CVBaseController.prototype.buildPDFTableColumnsHeader = function (gridOptions) {
            var _this = this;
            var columns = gridOptions.columnDefs;
            if (cvUtil.Utilidades.comprobarObjetoVacio(columns))
                return [];
            var salida = new Array();
            columns.forEach(function (col) {
                if (_this.esColumnaExportable(col)) {
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.displayName))
                        salida.push({ text: col.field, style: 'cabeceraTabla' });
                    else
                        salida.push({ text: col.displayName, style: 'cabeceraTabla' });
                }
            });
            return salida;
        };
        CVBaseController.prototype.esColumnaExportable = function (col) {
            // Si no está definida la variable es que es exportable
            if (cvUtil.Utilidades.comprobarObjetoVacio(col.exportar))
                return true;
            return col.exportar;
        };
        CVBaseController.prototype.exportarExcel = function (gridApi, gridOptions) {
            var _this = this;
            var columnasExcel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
            var ep = new ExcelPlus();
            var tituloExcelFinal;
            //Lo utilizo porque algunos tiene un texto en excel diferente como titulo, y otros tienen el mismo que en el pdf
            if (gridOptions.tituloExcel == null)
                tituloExcelFinal = gridOptions.titulo;
            else
                tituloExcelFinal = gridOptions.tituloExcel;
            var titulo = "Hoja 1";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(tituloExcelFinal))
                titulo = tituloExcelFinal;
            var file = ep.createFile(titulo);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(tituloExcelFinal))
                file.write({ "cell": "A1", "content": tituloExcelFinal });
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.subtitulo))
                file.write({ "cell": "A2", "content": gridOptions.subtitulo });
            file.write({ "cell": "A3", "content": "Fecha: " + moment().format('DD/MM/YYYY, h:mm:ss') });
            file.write({ "sheet": titulo, "cell": "D1", "content": " " });
            // Columnas del Excel
            var colActual = 0;
            var columns = gridOptions.columnDefs;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(columns)) {
                columns.forEach(function (col) {
                    if (_this.esColumnaExportable(col)) {
                        if (cvUtil.Utilidades.comprobarObjetoVacio(col.displayName))
                            file.write({ "cell": columnasExcel[colActual] + "5", "content": col.field });
                        else
                            file.write({ "cell": columnasExcel[colActual] + "5", "content": col.displayName });
                    }
                    colActual++;
                });
            }
            // Registros    
            // Contador de la fila
            var filaActual = 6;
            var rows = gridApi.core.getVisibleRows(gridApi.grid);
            var columns = gridOptions.columnDefs;
            if ((!cvUtil.Utilidades.comprobarObjetoVacio(columns))
                && (!cvUtil.Utilidades.comprobarObjetoVacio(rows))) {
                var valor;
                var fila;
                rows.forEach(function (row) {
                    fila = new Array();
                    colActual = 0;
                    columns.forEach(function (col) {
                        var c = gridApi.grid.getColumn(col.name);
                        var valor = gridApi.grid.getCellDisplayValue(row, c);
                        if (cvUtil.Utilidades.comprobarObjetoVacio(valor))
                            file.write({ "cell": columnasExcel[colActual] + filaActual, "content": ' ' });
                        else
                            file.write({ "cell": columnasExcel[colActual] + filaActual, "content": valor.toString() });
                        colActual++;
                    });
                    filaActual++;
                });
            }
            var nombreFichero = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero;
            file.saveAs(nombreFichero + ".xlsx");
        };
        CVBaseController.prototype.exportarCSV = function (gridApi, gridOptions) {
            var _this = this;
            // Siempre en modo compatible porque asi funciona lo del UTF-8
            gridOptions.exporterOlderExcelCompatibility = true;
            //var exporterOlderExcelCompatibility:boolean gridOptions.exporterOlderExcelCompatibility;
            var nombreFichero = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero;
            var fileName = nombreFichero + ".csv";
            this.uiGridExporterService.loadAllDataIfNeeded(gridApi.grid, this.uiGridExporterConstants.ALL, this.uiGridExporterConstants.VISIBLE).then(function () {
                var exportColumnHeaders = _this.uiGridExporterService.getColumnHeaders(gridApi.grid, _this.uiGridExporterConstants.VISIBLE);
                var exportData = _this.uiGridExporterService.getData(gridApi.grid, _this.uiGridExporterConstants.VISIBLE, _this.uiGridExporterConstants.VISIBLE);
                var csvContent = _this.uiGridExporterService.formatAsCsv(exportColumnHeaders, exportData, gridOptions.exporterCsvColumnSeparator);
                _this.uiGridExporterService.downloadFile(fileName, csvContent, gridOptions.exporterOlderExcelCompatibility);
            });
        };
        CVBaseController.prototype.showDialog = function (obj) {
            this.$mdDialog.show(obj);
        };
        CVBaseController.prototype.hideDialog = function () {
            this.$mdDialog.hide();
        };
        return CVBaseController;
    }());
    CVBaseController.$inject = [
        '$rootScope',
        '$location',
        'mensajePopup',
        'cvPopup',
        '$filter',
        'uiGridExporterConstants',
        'uiGridExporterService',
        '$mdDialog',
        '$timeout',
        '$interval'
    ];
    cvController.CVBaseController = CVBaseController;
    /**
    * Clase para controlar la navegación entre paginas
    **/
    var ParamNavegarPagina = (function () {
        function ParamNavegarPagina(pathDestino, paramDestino, refrescarDestino, pathOrigen, paramOrigen) {
            if (pathOrigen === void 0) { pathOrigen = null; }
            if (paramOrigen === void 0) { paramOrigen = null; }
            // Path desde donde se navega
            this.pathOrigen = "";
            // Parametros que se quieren almacenar para volver posteriormente al origen. Un valor nulo elimina
            this.paramOrigen = null;
            // Path al que se navega
            this.pathDestino = "";
            // Parametros de la página de destino. 
            // Si el parametro de destino no es vacio no se tiene en cuenta la variable refrescarDestino
            this.paramDestino = null;
            // Indica si se quiere refrescar los parametros de destino. Esto elimina los parametros almacenados en la pagina de destino.
            // En caso de que paramDestino sea nulo se comprueba esta variable para eliminar los parametros almacenados        
            this.refrescarDestino = false;
            // Nuevos objetos que añadir al destino
            // Deberia usarse en conjunto con paramDestino=null, refrescarDestino=false
            this.anadirParamDestino = null;
            this.pathOrigen = pathOrigen;
            this.paramOrigen = paramOrigen;
            this.pathDestino = pathDestino;
            this.paramDestino = paramDestino;
            this.refrescarDestino = refrescarDestino;
        }
        return ParamNavegarPagina;
    }());
    cvController.ParamNavegarPagina = ParamNavegarPagina;
    /**
    * Clase Base para los controladores.
    * Todos los controlladores deben extender de ella
    **/
    var CVController = (function () {
        function CVController($scope, grid, baseController) {
            var _this = this;
            this.URL_CONTROLLER = "";
            this.tieneGrid = false;
            this.alturaGrid = 0;
            this.vacioGrid = false;
            this.estaGridApi = false;
            // Array con los nombres de las variables usadas para guardar el estado del controlador
            // En caso de no rellenarse o estar vacio se copia todo
            this.variablesEstado = [];
            /**
             * Función para filtrar las filas del grid.
             */
            this.subFilter = function (renderableRows) {
                if (typeof this.subFilter === "function")
                    return this.subFilter(renderableRows);
                else
                    return renderableRows;
            };
            this.exportCSV = function () {
                this.bController.exportarCSV(this.bScope.gridApi, this.gridOptions);
            };
            $scope.vm = this;
            this.tieneGrid = grid;
            this.bController = baseController;
            this.bScope = $scope;
            if (this.tieneGrid) {
                this.gridOptions = this.bController.getGridOptionsBase();
                this.gridOptions.onRegisterApi = function (gridApi) {
                    _this.bScope.gridApi = gridApi;
                    _this.apiRegistrada();
                    _this.bScope.gridApi.grid.refresh(true);
                    // Esto permite que al recuperar el estado del grid se refresquen los filtros y la paginacion aplicados
                    _this.bScope.gridApi.grid.registerDataChangeCallback(function () {
                        _this.bScope.gridApi.grid.refresh(true);
                        _this.estaGridApi = true;
                        //this.asignarDatosGrid();
                        _this.alturaGrid = cvGrid.CVGridUtil.calcularAlturaGrid(_this.bScope.gridApi, _this.gridOptions, null);
                        if (_this.gridOptions.data.length == 0) {
                            _this.vacioGrid = true;
                            _this.alturaGrid += 400;
                            $(".cv-app .ui-grid-pager-panel").hide();
                        }
                        else {
                            _this.vacioGrid = false;
                            $(".cv-app .ui-grid-pager-panel").show();
                        }
                    }, ['all']);
                    if (!cvUtil.Utilidades.comprobarObjetoVacio(_this.bScope.gridApi.pagination)) {
                        _this.bScope.gridApi.pagination.on.paginationChanged(_this.bScope, function (pageNumber, pageSize) {
                            _this.alturaGrid = cvGrid.CVGridUtil.calcularAlturaGrid(_this.bScope.gridApi, _this.gridOptions, null);
                            if (_this.gridOptions.data.length == 0) {
                                _this.vacioGrid = true;
                                _this.alturaGrid += 400;
                            }
                            else {
                                _this.vacioGrid = false;
                            }
                        });
                    }
                    _this.bScope.gridApi.grid.registerRowsProcessor(_this.subFilter, 200);
                };
            }
        }
        /**
         * Metodo para sobreescribir por el controller si necesita realizar alguna accion al registrarse la API
         */
        CVController.prototype.asignarDatosGrid = function () {
        };
        CVController.prototype.apiRegistrada = function () {
        };
        /*public iniciar(url: string) {
            this.URL_CONTROLLER = url;
            this.iniciarGrid();
            
            this.bController.iniciar(this.URL_CONTROLLER, (param) => {
                this.mostrar(param);
            });
        }*/
        /**/
        CVController.prototype.iniciar = function (url) {
            var _this = this;
            this.URL_CONTROLLER = url;
            this.bController.rootScope.controladorActual = this;
            this.iniciarGrid();
            this.bController.iniciar(this.URL_CONTROLLER, function (param) {
                // Tooltip -- En versiones posteriores se encuentra en cv-grid
                // AÃ±adir el celltemplate por defecto a cada columna (si no se ha definido antes)
                if (!cvUtil.Utilidades.comprobarObjetoVacio(_this.gridOptions)) {
                    _this.gridOptions.columnDefs.forEach(function (col) {
                        if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_ICONO)
                            col.cellClass += " cv-grid-celda-icono";
                        else if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_NUMERO) {
                            col.sortingAlgorithm = cvUtil.Utilidades.ordenarNumeroStringFn;
                        }
                        else if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_FECHA) {
                            col.sortingAlgorithm = cvUtil.Utilidades.ordenarFechaStringFn;
                        }
                    });
                }
                _this.mostrar(param);
            });
        };
        /**/
        /**
         * Inicializa el grid con la configuración por defecto de civica
         */
        CVController.prototype.iniciarGrid = function () {
            cvGrid.CVGridUtil.iniciarGrid(this.gridOptions, this.bController.servicioConfiguracion.configuracion, this.bController.servicioCache);
        };
        /** Metodos para los grid */
        CVController.prototype.llamarDobleClick = function (grid, row) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(grid.options.dobleClick))
                eval('grid.appScope.' + grid.options.dobleClick + '(row)');
        };
        CVController.prototype.getEstiloEspecial = function (grid, row) {
            //console.log('Get Estilo Especial en controller');
        };
        CVController.prototype.gridToggleFilter = function () {
            this.gridOptions.mostrarFiltros = !this.gridOptions.mostrarFiltros;
        };
        CVController.prototype.gridFiltrado = function (filtros) {
            var filtrado = false;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(filtros)) {
                filtros.forEach(function (filtro) {
                    if (!cvUtil.Utilidades.comprobarObjetoVacio(filtro.term))
                        filtrado = true;
                });
            }
            return filtrado;
        };
        CVController.prototype.detectoTecladoFiltro = function () {
            var textoActual = document.getElementById(this.columnaActual).value;
            if (cvUtil.Utilidades.comprobarObjetoVacio(textoActual) || textoActual.trim().length == 0) {
                //if (textoActual == "") {
                cvUtil.Utilidades.botonFiltroPorDefecto(this.columnaActual);
            }
            else {
                cvUtil.Utilidades.detectarFiltro(this.columnaActual);
            }
        };
        CVController.prototype.actualizarInputSeleccionado = function (param) {
            this.columnaActual = param;
        };
        CVController.prototype.nombreCampoGrid = function (col) {
            return cvUtil.Utilidades.nombreCampoGrid(col.grid.id, col.field);
        };
        /** Fin de los metodos para los grids */
        CVController.prototype.mostrar = function (param) {
        };
        CVController.prototype.exportarPdf = function () {
            this.bController.exportarPDF(this.bScope.gridApi, this.gridOptions);
        };
        CVController.prototype.exportarXLSX = function () {
            this.bController.exportarExcel(this.bScope.gridApi, this.gridOptions);
        };
        CVController.prototype.fijarVersion = function (v) {
            this.bController.fijarVersion(v);
            return v;
        };
        CVController.prototype.mostrarVentanaAyuda = function (templateURL) {
            var _this = this;
            this.bController.showDialog({
                templateUrl: 'templates/ventanaAyuda.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                //controller: 'BloqueoPalesController'
                controller: ['$scope', function ($scope) {
                        $scope.vm = _this;
                        $scope.templateURL = templateURL;
                        /*
                                                $scope.volver = (param) => {
                        
                                                    this.mdDialog.hide(param);
                        
                                                }
                        */
                    }],
            });
        };
        CVController.prototype.salirAyuda = function () {
            this.bController.hideDialog();
        };
        /**
        Para validaciones adicionales
        **/
        CVController.prototype.validarFormulario = function () {
            return true;
            /*            var mensaje: string = "";
                        var valido:boolea=true;
            
                        if (this.tipoEtiqueta.esTipoCerveza()) {
                            var subCadenaLote: string = this.lote.substring(0, 3);
                            var loteAux: number = parseInt(subCadenaLote);
                            if (typeof loteAux == 'undefined' || loteAux < 1 || loteAux > 365) {
                                valido = false;
                                mensaje = "El lote no es correcto";
                            }
                        }
            
                        if (!valido) {
                            // Mostrar mensaje
                            this.baseController.mensajePopup.mostrarError("Error de validación", mensaje);
                        }
                        return valido;
                        */
        };
        /**
        * Recupera el parametro identificador pasado al controlador.
        * Se comprueba si se trata de una llamada como popup para recuperarlo del parent scope
        * y en caso contrario del route
        **/
        CVController.prototype.getParametroIdentificador = function ($routeParams) {
            var id = null;
            // Comprobar si se trata de un popup
            if (!cvUtil.Utilidades.comprobarObjetoVacio(this.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent.esPopup)
                && this.bScope.$parent.esPopup) {
                return this.bScope.$parent.param;
            }
            else {
                id = $routeParams.identificador;
            }
            return id;
        };
        /**
        * Recupera el parametro objeto pasado al controlador.
        * Se comprueba si se trata de una llamada como popup para recuperarlo del parent scope
        * y en caso contrario del route
        **/
        CVController.prototype.getParametroObjeto = function ($routeParams) {
            var obj = null;
            // Comprobar si se trata de un popup
            if (!cvUtil.Utilidades.comprobarObjetoVacio(this.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent.esPopup)
                && this.bScope.$parent.esPopup)
                return this.bScope.$parent.param;
            return obj;
        };
        CVController.prototype.comprobarAccesoUsuarioFunEval = function (funcionalidades, operacion) {
            if (operacion === void 0) { operacion = "OR"; }
            return this.bController.comprobarAccesoUsuarioFunEval(funcionalidades, operacion);
        };
        CVController.prototype.registerRowsProcessor = function () {
        };
        CVController.prototype.volver = function (param) {
            if (param === void 0) { param = null; }
            console.log('Volver');
            console.log(this);
            //this.bController.volver();
        };
        return CVController;
    }());
    cvController.CVController = CVController;
})(cvController || (cvController = {}));
