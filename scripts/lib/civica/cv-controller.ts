
declare var pdfMake: any;

declare class ExcelPlus {
    /** The initial value of Object.prototype.constructor is the standard built-in Object constructor. */
    createFile(nombre: string): any;
}

/// <reference path="./_cv-app.ts" />
module cvController {
    'use strict';



    export interface ICVBaseControllerRootScope extends ng.IScope {
        breadcrumb: string;
        tituloPagina: string;
        tituloEditar: string;
        mostrarTituloEditar: boolean;
        tituloApartado: string;

        funcionCrear: Function;
        
       	// Perfiles del usuario identificado
       	usuarioIdentificado: cvSeguridad.IUsuario;

        // Parametros entre paginas
        paramPagina: Object;

        // Historial de navegacion
        historialNaveg: Array<string>;

        // Controlador actual
        controladorActual: CVController;

        // Fecha y version para la cabecera
        fechaActual: string;
        version: string;
        
        // Controla si se muestra la ventana de espera
        mostrarVentanaEspera: boolean;
        // Permite controlar operaciones en las que no se quiere la ventana espera
        bloquearVentanaEspera:boolean;

        //detectoTecladoFiltro: Function;
        //actualizarInputSeleccionado: Function;
        quitarParentesis: Function;
        //ordenacion: Function;
        quitarPuntos: Function;
        filter: ng.IFilterService;
        gridState: Array<uiGrid.saveState.IGridSavedState>;

        //Botón creación
        controller: CVController;
        mostarBotonCrear: boolean;
        mostrarBotonCerrar: boolean;
        mostarBotonMensaje: boolean;
        mostrarBotonVolver: boolean;
        clasePantalla:string;
        login:boolean;
        //Botón filtro != bt crear
        nombreBoton: string;
        buscador:boolean;

    }

    export class CVBaseController implements ICVBaseController {

        public static $inject = [
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


        public rootScope: ICVBaseControllerRootScope;
        public location: ng.ILocationService;
        public filter: ng.IFilterService;
        //public columnaActual: string;
        private venEspera: any;
        private venEsperaVisible: boolean = false;

        public nombreMeses: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        constructor($rootScope: ng.IScope,
            $location: ng.ILocationService,
            public mensajePopup: cvUtil.MensajePopUp,
            public cvPopup: cvUtil.CVPopUp,
            private $filter: ng.IFilterService,
            private uiGridExporterConstants: uiGrid.exporter.IUiGridExporterConstants,
            private uiGridExporterService: any,
            public $mdDialog: any,
            public $timeout: ng.ITimeoutService,
            public $interval: ng.IIntervalService,
            public servicioSeguridad: cvSeguridad.IServicioSeguridad,
            public servicioCache: cvUtil.ICVServicioCache
            ,public servicioConfiguracion: cvUtil.ICVServicioConfiguracion) {

            this.rootScope = <ICVBaseControllerRootScope>$rootScope;
            this.location = $location;
            this.filter = $filter;

            //
            this.rootScope.mostrarVentanaEspera = false;
            this.rootScope.bloquearVentanaEspera = false;
            this.rootScope.mostrarTituloEditar = false;

            // Ventana ocupado
            this.rootScope.$on('busy.begin', (evt, config) => {
                // console.log('A mostrar la ventana....');
                if(!this.rootScope.bloquearVentanaEspera)
                    this.mostrarVentanaEspera();

            });

            this.rootScope.$on('busy.end', (evt, config) => {
                this.ocultarVentanaEspera();
            });


            this.rootScope.paramPagina = new Object();

            //this.rootScope.version = TrazabilidadConstantes.VERSION;
            
            /*this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
            
            this.$interval(() => {
                this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
            }, 60000);*/
            this.rootScope.$on('$locationChangeSuccess', () => this.locationChanged(event));
            this.rootScope.gridState = new Array<uiGrid.saveState.IGridSavedState>();
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
        public buscador(columnas: Array<string>, texto: string, listado: Array<any>): any {
            var resultado: Array<any> = new Array<any>();
            if(!cvUtil.Utilidades.comprobarObjetoVacio(texto) 
              && !cvUtil.Utilidades.comprobarObjetoVacio(columnas)) {
                for (var i = 0; i < columnas.length; i++) {
                    var c: string = columnas[i];
                    var json = {};
                    json = JSON.parse(this.construirJson(columnas[i], texto));
                    //json[columnas[i]] = texto;
                    var filterJson = this.filter('filter')(listado, json);
                    if (!cvUtil.Utilidades.comprobarObjetoVacio(filterJson)) {
                        for (var j = 0; j < filterJson.length; j++) {
                            var elemento = filterJson[j];
                            if(!cvUtil.Utilidades.contiene(resultado, elemento))
                                resultado.push(elemento);
                        }
                    }
                }
                return resultado;
            } else
                return listado;
            
        }
    /**Busca coincidencias entre el texto y la propiedades de la entidad del listado 
         * columnas: campos o propiedades de la entidad.
         * texto: termino a buscar
         * listado: lista de entidades a filtrar
        */
        public buscador2(columnas: Array<string>, texto: string, listado: Array<any>): any {
            console.log("La hora de inicio era:"+new Date());
            var resultado: Array<any> = new Array<any>();
            if(!cvUtil.Utilidades.comprobarObjetoVacio(texto) 
              && !cvUtil.Utilidades.comprobarObjetoVacio(columnas)) {
                var texto2 = texto.toLowerCase();
                listado.forEach((elemento)=>{
                    var encontrado = false;
                    for(var i=0; (i<columnas.length && !encontrado); i++ ){
                        var ele = this.obtenerPropiedad(columnas[i],elemento);

                        if(!cvUtil.Utilidades.comprobarObjetoVacio(ele)){
                            var ele2 = ele.toString().toLowerCase();
                            if(ele2.includes(texto2))
                                encontrado=true;
                        }
                    }
                    if(encontrado)
                        resultado.push(elemento);
                })
                console.log("La hora de fin era:"+new Date());
                return resultado;
            } else
                return listado;
            
        }
        private obtenerPropiedad(columna:string, Elemento: any): any{
            var ele;
            var pos = columna.indexOf('.');
            if (pos == -1) {
                ele = Elemento[columna];
            } else { 
                var count = (columna.match(new RegExp("\\.", "g")) || []).length;
                var strings = columna.split(".");
                ele = columna[strings[0]];
                if(!cvUtil.Utilidades.comprobarObjetoVacio(ele)){
                    for (var i = 1; i <= count && ele!=null; i++) {
                        ele = !cvUtil.Utilidades.comprobarObjetoVacio(ele[strings[i]])?ele[strings[i]]:null;
                    }
                }
            }
            return ele;            
        }
        public construirJson(field: string, texto: string): any {
            var jsonStr;
            var pos = field.indexOf('.');
            if (pos == -1) {
                jsonStr = "{" + field + ": '" + texto + "'}";
            } else { 
                var count = (field.match(new RegExp("\\.", "g")) || []).length;
                jsonStr = "{" + field.replace(new RegExp("\\.", "g"), ":{") + ": '" + texto +"'";
                for (var i = 0; i <= count; i++) {
                    jsonStr += '}';
                }
            }
            return JSON.stringify(eval("(" + jsonStr + ")"));
        }
        


		/**
		* Path para llegar a la carpeta views
		**/
        public mostrarVentanaEsperaPlantilla(pathViews: string = "") {
            this.venEspera = this.cvPopup.mostrar(pathViews + "templates/ventanaEspera.html");
        }

        public ocultarVentanaEsperaPlantilla() {
            this.cvPopup.cerrar(this.venEspera);
        }


        public mostrarVentanaEspera() {

            this.rootScope.mostrarVentanaEspera = true;
            /*if (!this.venEsperaVisible) {
                this.venEspera = this.cvPopup.mostrar("templates/ventanaEspera.html");
                this.venEsperaVisible = true;
            }*/
        }

        public ocultarVentanaEspera() {

            /*if (this.venEsperaVisible) {
                this.cvPopup.cerrar(this.venEspera);
                this.venEsperaVisible = false;
             }*/
            this.rootScope.mostrarVentanaEspera = false;
        }

        public bloquearVentanaEspera(){
            this.rootScope.bloquearVentanaEspera=true;
        }

        public desBloquearVentanaEspera(){
            this.rootScope.bloquearVentanaEspera=false;
        }

        fijarVersion(v: string) {
            this.servicioCache.setVersionApp(v);
            //this.rootScope.version = v;
        }

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
        public guardarFiltrosGrid(controller: any, posicion: number) {
            //Se llama a null para ventanas distintas a los tab de crear parte de carga
            if (posicion == null) {
                this.rootScope.gridState = new Array<uiGrid.saveState.IGridSavedState>();
                posicion = 0;
            }
            cvGrid.CVGridUtil.guardarEstado(controller.gridApi, this.rootScope.gridState, posicion);
        }

        /**
         * Restaura los filtros del grid.
         * controller: Controlador desde que se llama a la función
         * posicion: null -> Ventanas distintas a crear parte de carga
         *           0    -> Ventana parte de carga tab pedidos.
         *           1    -> Ventana parte de carga tab devoluciones.
         */
        public restaurarFiltrosGrid(posicion: number, gridOptions: cvGrid.ICVGridOptions) {
            if (posicion == null) {
                posicion = 0;
            }
            cvGrid.CVGridUtil.recuperarEstadoFiltros(this.rootScope.gridState, posicion, gridOptions);
        }

        guardarEstadoController(controller: CVController): Object {
            var estado: Object = new Object();
            cvUtil.Utilidades.copiarListaPropiedades(controller, estado,controller.variablesEstado);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope.gridApi))
                estado['estadoGrid'] = controller.bScope.gridApi.saveState.save();
            return estado;
        }

        recuperarEstadoController(controller: CVController, estado: Object) {
            cvUtil.Utilidades.copiarPropiedades(estado, controller);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(controller.bScope.gridApi)
                && !cvUtil.Utilidades.comprobarObjetoVacio(estado)) {
                var estadoGrid: uiGrid.saveState.IGridSavedState = <uiGrid.saveState.IGridSavedState>estado['estadoGrid']
                controller.bScope.gridApi.saveState.restore(controller.bScope, estadoGrid);
                cvGrid.CVGridUtil.recuperarEstadoFiltrosGrid(estadoGrid, controller.gridOptions);
                cvGrid.CVGridUtil.recuperarEstadoOrdenacionGrid(estadoGrid, controller.gridOptions);
            }
        }

        // Navegacion de paginas
        navegarA(pagina: string, param: any = "") {

            // Si param es una cadena vacia mantiene los que había
            // Para eliminar los parametros usar null
            if (param != "")
                this.rootScope.paramPagina[pagina] = param;
            this.location.path(pagina);
        }

        navegarAPagina(param: ParamNavegarPagina) {
            this.rootScope.paramPagina[param.pathOrigen] = param.paramOrigen;
            if (param.paramDestino == null) {
                if (param.refrescarDestino)
                    this.rootScope.paramPagina[param.pathDestino] = null;
            } else
                this.rootScope.paramPagina[param.pathDestino] = param.paramDestino;
            if (param.anadirParamDestino != null) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(this.rootScope.paramPagina[param.pathDestino]))
                    cvUtil.Utilidades.copiarPropiedades(param.anadirParamDestino, this.rootScope.paramPagina[param.pathDestino]);
                else
                    this.rootScope.paramPagina[param.pathDestino] = param.anadirParamDestino;
            }
            this.location.path(param.pathDestino);
        }

        navegarAPaginaController(controller: CVController, param: ParamNavegarPagina) {
            var pathController: string = controller.URL_CONTROLLER;
            var scope: ICVControllerScope = controller.bScope;
            var estado: Object = this.guardarEstadoController(controller);
            param.pathOrigen = pathController;
            param.paramOrigen = estado;
            this.navegarAPagina(param);
        }

        locationChanged(event: any) {
            var path: string = this.location.path();
            /*switch (path) {
                case '/pedidoTrz':
                    break;
                case '/etiquetas':
                default:
     
                    break;
            }*/

            //alert('Evento2=' + this.location.path());       	
            //this.rootScope.$broadcast('cambiarPaginaEvent');
        }

        // Cliclo de Vida
        public iniciar(pagina: string, iniciarCallBack: Function, funcionalidad: string = "") {

            this.servicioSeguridad.extraerUsuarioIdentificado((data: cvSeguridad.IUsuario) => {

                this.setUsuarioIdentificado(data);

                // Podría comprobar si es una URL Valida
                if (this.location.path() == '/index.html' || this.location.path() == '/') {
                    this.irPaginaPrincipal();
                    return;
                }

                // Si se ha añadido la funcionalidad se comprueba
                if (!cvUtil.Utilidades.comprobarObjetoVacio(funcionalidad)) {
                    if (!this.comprobarAccesoUsuario(funcionalidad, "No tiene acceso a la función seleccionada", true)) {
                        this.mensajePopup.mostrarError("Acceso no autorizado", "", undefined, this.irPaginaPrincipal);
                        this.irPaginaPrincipal();
                        return;
                    }
                }


                // Recupera los parametros y los pasa al callBack
                // Elimina el parametro de sesion  
                var param: any = this.rootScope.paramPagina[pagina];

                // Comentando esto los parámetros no se pierden y funciona correctamenta al volver atras
                //this.rootScope.paramPagina[pagina] = null;

                iniciarCallBack(param);
            });
        }


        public comprobarAccesoFuncionalidad(funcionalidad: string): boolean {
            return this.comprobarAccesoUsuario(funcionalidad, "", false);
        }

        public comprobarAccesoUsuario(funcionalidad: string, mensajeError: string, mostrarError: boolean = true): boolean {

            var u: cvSeguridad.IUsuario = this.getUsuarioIdentificado();
            var permitido: boolean = this.servicioSeguridad.compruebaFuncionalidadPerfilUsuario(u, funcionalidad);

            if (!permitido && mostrarError) {
                this.mensajePopup.mostrarError("Acceso no autorizado", mensajeError);
            }

            return permitido;
        }


        /**
         * La operacion indica si se las funcionalidades se comprueban con AND o OR (usando esas cadenas).
         * En el array de funcionalidades se pasan variables para evaluar que contienen el verdadero valor 
         * de la funcionalidad. Con esto se facilita el uso de constantes.
         * Devuelve true si se tiene acceso o false en caso de no tenerlo.
         */
        public comprobarAccesoUsuarioFunEval(funcionalidades: Array<string>, operacion: string = "OR"): boolean {

            if (cvUtil.Utilidades.comprobarObjetoVacio(funcionalidades))
                return true;

            var hayPermitidos: boolean = false;
            var hayNoPermitidos: boolean = false;

            var u: cvSeguridad.IUsuario = this.getUsuarioIdentificado();
            funcionalidades.forEach((fun: string) => {
                var valor: string = eval(fun);
                var permitido: boolean = this.servicioSeguridad.compruebaFuncionalidadPerfilUsuario(u, valor);
                if (!permitido)
                    hayNoPermitidos = true;
                else
                    hayPermitidos = true;
            });

            var salida: boolean = false;
            if (operacion == "AND") {
                if (!hayNoPermitidos)
                    salida = true;
            } else if (operacion == "OR") {
                if (hayPermitidos)
                    salida = true;
            }

            return salida;
        }

        public irPaginaPrincipal() {
            this.location.path("/");
        }

        public mostrar(parametros: any) {

        }

        public refrescar(parametros: any) {

        }

        public setController(controller: CVController){
            this.rootScope.controller = controller;
        }

        public mostrarBtCrear(mostrar:boolean){
            this.rootScope.mostarBotonCrear = mostrar;
        }
        public mostrarBtnCerrar(mostrar:boolean){
            this.rootScope.mostrarBotonCerrar = mostrar;
        }

        public mostrarBtMensaje(mostrar:boolean){
            this.rootScope.mostarBotonMensaje = mostrar;
        }

        public mostrarBtVolver(mostrar:boolean){
            this.rootScope.mostrarBotonVolver = mostrar;
        }

        public clasePantalla(clase:string){
            this.rootScope.clasePantalla=clase;
        }
        public login(login:boolean){
            this.rootScope.login=login;
        }

        public irCrear() {
            var ctrl: CVController = this.rootScope.controller;
/*            if (ctrl instanceof app.ListaEscenariosController)
                (<app.ListaEscenariosController>ctrl).abrirCrear();
            else if (ctrl instanceof app.ListaPresupuestosController)
                (<app.ListaPresupuestosController>ctrl).abrirCrear();*/
        }

        public abrirMensaje() {
            var ctrl: CVController = this.rootScope.controller;
/*            if (ctrl instanceof app.TrazabilidadBotellaController)
                (<app.TrazabilidadBotellaController>ctrl).abrirMensaje();
            if (ctrl instanceof app.TrazabilidadLoteController)
                (<app.TrazabilidadLoteController>ctrl).abrirMensaje();*/
        }

        public volver() {            
            /*this.rootScope.controladorActual.volver();*/
            console.log('salirDetalle');
            var ctrl: CVController = this.rootScope.controller;


             /*if (ctrl instanceof app.DetallePresupuestoController)
                (<app.DetallePresupuestoController>ctrl).volverListado('R');*/
                
        }

        public setNombreBoton(nombreBoton: string) {
            this.rootScope.nombreBoton = nombreBoton;
        }

        public setBreadcrumb(breadcrumb: string) {
            this.rootScope.breadcrumb = breadcrumb;
        }

        public setTituloPagina(tituloPagina: string) {
            this.rootScope.tituloPagina = tituloPagina;
        }

        public setMostrarTituloEditar(mostrarTituloEditar: boolean) {
            this.rootScope.mostrarTituloEditar = mostrarTituloEditar;
        }
        public setTituloEditar(tituloEditar: string) {
            this.rootScope.tituloEditar = tituloEditar;
        }

        public setTituloApartado(titulo: string) {
            this.rootScope.tituloApartado = titulo;
        }

        public setUsuarioIdentificado(u: cvSeguridad.IUsuario) {
            this.rootScope.usuarioIdentificado = u;
        }

        public getUsuarioIdentificado(): cvSeguridad.IUsuario {
            return this.rootScope.usuarioIdentificado;
        }

        public comprobarFormularioValido(formulario: any): boolean {
            if (formulario.$valid)
                return true;

            var valido: boolean = true;

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
        }

		/**
		* Indica si alguno de los elementos del array es visible
		**/
        private comprobarElementosVisibles(lista: Array<any>): boolean {
            if (typeof lista != 'undefined') {
                for (var i = 0; i < lista.length; i++) {
                    if (this.comprobarElementoVisible(lista[i]))
                        return true;
                }
            }
            return false;
        }

        private comprobarElementoVisible(el: any): boolean {
            //var salida: boolean = expect(el.hasClass('ng-hide')).toBe(false);
            if (cvUtil.Utilidades.comprobarObjetoVacio(el.$name))
                return true;
            var eljq: JQuery = $('[name=' + el.$name + ']');
            var salida: boolean = eljq.is(":visible");
            return salida;
        }

        public mostrarMensajeErrorFormulario(formulario: any) {
            //$document.            
            var mensaje: string = "<div layout='column' layout-align='start center'><div layout='row' flex='100'>";
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
                    var tipoValor: string = formulario.tiposCampos[formulario.$error.pattern[i].$name];
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
                        var el: JQuery = $('[name=' + formulario.$error.minlength[i].$name + ']');
                        var minlen: string = el.attr("ng-minlength");
                        var maxlen: string = el.attr("ng-maxlength");
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
                        var el: JQuery = $('[name=' + formulario.$error.maxlength[i].$name + ']');
                        var minlen: string = el.attr("ng-minlength");
                        var maxlen: string = el.attr("ng-maxlength");
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
        }

        private prepararNombreCampo(nombre: string): string {
            if (nombre != null && typeof nombre != 'undefined') {
                nombre = nombre.trim();
                if (nombre.lastIndexOf(':') == nombre.length - 1)
                    nombre = nombre.substring(0, nombre.length - 1);
                return nombre;
            }
            return nombre;

        }

        public iniciarGrid() {
            this.rootScope.filter = this.filter;
        }

        public getGridOptionsBase(): cvGrid.ICVGridOptions {
            this.iniciarGrid();
            var gridOptions: cvGrid.ICVGridOptions = {
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
                tamaAdicionalPaginacion:0
            }
            return gridOptions;

        }

        public getGridCellTemplateIconos(listaIconos: Array<any>,tipo:string): string {
            var template: string;
            if(tipo=="retimbrado"){
                 template = '<md-button ng-if="!row.entity.fechaBaja" id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irRetimbrado(row.entity)">\
                                <i ng-if="row.entity.edicion" class="icon-sello"/><i ng-if="!row.entity.edicion" class="icon-sello"/></ng-if>\
                            </md-button>';
                 
            }else if(tipo=="ordenLlenado"){
                template = '<md-button id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irDetalle(row.entity)">\
                                <i ng-if="row.entity.estado===\'Abierto\' && row.entity.fechaBaja===null" class="icon-editar"/><i ng-if="row.entity.estado===\'Cerrado\' || row.entity.fechaBaja!=null || row.entity.estado===\'Completo\'" class="icon-ver"/></ng-if>\
                            </md-button>';
            }else if(tipo=="albaran"){
                template = '<md-button id="editBtn" class="button-grid cv-opcion-menu" type="button" ng-click="grid.appScope.vm.irDetalle(row.entity)">\
                                <i class="icon-pdf"/>\
                            </md-button>';                            
            }else{
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
        }


        /**Cell Template para columna popover de la columna 'Más' */
        public getGridCellTemplatePopover(configuracion: any): string {
            var template: string = '<div class="estilos-tabla-botones-parteCarga ngCellText" ng-class="col.colIndex()">';

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
        }

        

        //cabecera de las tablas normal
        public getGridHeaderTemplateFiltro(): string {
            //console.lo
            //var nombreCampo:string="{{col.field}}";
            //var nombreCampoSinParentesis:string="{{this.grid.appScope.vm.nombreCampoGrid(col)}}";

            // Si se trata de una funcion que termina en parentesis se los quito usando una funcion de cvUtil            
            var template: string = '<div id="cvgrid-{{this.grid.id}}-tablaPeticion1" class="headerTablaPeticion1" ng-if="filterable" class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
                '<div style="height:26px;" layout="row" layout-align="center center" class="texto-cabecera">' +
                '<span id="' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '-ordenacion" ng-click="this.grid.appScope.vm.ordenacion(this.grid,\'' + "{{col.field}}" + '\')" class="ngHeaderText pointer">{{col.displayName}}</span> ' +
                '<md-button ng-click="this.grid.appScope.vm.gridToggleFilter(\'' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '\',this.grid.id)" class="md-icon-button boton-filtrar"><md-icon id="botonIconoFiltro ' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" md-fab md-mini class="icono-filtro ' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" md-svg-src="../imagenes/filtro.svg" class="name"></md-icon></md-button>' +
                '</div><div class="filtro">' +
                '<input ng-click="this.grid.appScope.vm.actualizarInputSeleccionado(\'' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '\')" ng-keyup="this.grid.appScope.vm.detectoTecladoFiltro()" id="' + "{{this.grid.appScope.vm.nombreCampoGrid(col)}}" + '" style="width: 70%;" type="text" class="estiloFiltrador ui-grid-filter-input" ng-model="colFilter.term" ng-attr-placeholder="{{col.displayName || \'\'}}" />'
            '</div></div>';

            return template;
        }
       
        public getGridCellTemplateEditView(funcion: string): string {
            var template: string = '<div class="estilos-tabla-botones-peticiones ngCellText" ng-class="col.colIndex()">';
            template += '<md-button class="md-icon-button" ng-click="this.grid.appScope.' + funcion + '(row.entity)">';
            template += '<md-icon ng-if="!row.entity.activo()" style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="../imagenes/ver.svg"></md-icon>';
            template += '<md-icon ng-if="row.entity.activo()" style="height: 20px;" md-fab md-mini class="boton-footer-tamanio" md-svg-src="../imagenes/editar.svg"></md-icon>';
            template += '</md-button></div>';
            
            return template;
        }

        public ordenarListado(listado: any[], campo: string, reverse: boolean = false): any[] {
            if (cvUtil.Utilidades.comprobarObjetoVacio(listado))
                return null;
            return this.filter('orderBy')(listado, campo, reverse);
        }

        public ordenarListadoCampos(listado: any[], campos: string[], reverse: boolean = false): any[] {
            if (cvUtil.Utilidades.comprobarObjetoVacio(listado))
                return null;
            return this.filter('orderBy')(listado, campos, reverse);
        }        

        public transformarFecha(fecha: Date, formato: string = "dd/MM/yyyy"): string {
            if (cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                return "";
            return this.filter('date')(fecha, formato);
        }

        public transformarFechaHora(fecha: Date): string {
            return this.transformarFecha(fecha, 'dd/MM/yyyy HH:mm:ssss')
        }

        public formatearFecha(fechaStr: string, formato: string = 'DD/MM/YYYY'): Date {
            if (cvUtil.Utilidades.comprobarObjetoVacio(fechaStr))
                return null;
            return moment(fechaStr, 'DD/MM/YYYY').toDate(); 
        }

        public fechaActual() {
            this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
        }

        public transformarFechaFullDate(fecha: Date): string {
            if (cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                return "";
            return this.filter('date')(fecha, "hh:mm") + ' | ' + this.filter('date')(fecha, "fullDate", 'es');
        }

        public actualizaFecha() {
            this.rootScope.fechaActual = this.transformarFechaFullDate(new Date());
        }

        public transformarFechaMediumDate(fecha: Date): string {
            var sfecha: string = "";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(fecha))
                sfecha = this.filter('date')(fecha, "EEEE", 'es') + ', ' + this.filter('date')(fecha, "mediumDate", 'es');
            return sfecha;
        }

        public exportarPDF(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions) {
            this.mostrarVentanaEspera();
            // Numero de filas y columnas para el layout
            var orientacion: string;
            var numFilas: number = 0;
            var numColumnas: number = 0;
            var rows: Array<uiGrid.IGridRow> = gridApi.core.getVisibleRows(gridApi.grid);
            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;


            // Para comprobar el numero de columnas hay que comprobar las que van a ser exportadas 			
            numColumnas = this.getNumeroColumnasExportar(gridOptions);


            if (!cvUtil.Utilidades.comprobarObjetoVacio(rows))
                numFilas = rows.length;

            // Titulo y subtitulo
            var titulo: string = "";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.titulo))
                titulo += gridOptions.titulo + "\n\n";

            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.subtitulo))
                titulo += gridOptions.subtitulo + "\n";

            // Filtros aplicados para añadir a la cabecera
            var filtros: string = this.filtrosAplicadosDinamico(gridApi);
            if (!cvUtil.Utilidades.comprobarObjetoVacio(filtros))
                titulo += "\n" + filtros + "\n";
            //titulo += "\nFiltros Activos: " + filtros + "\n";

            // El segundo parametro (110) es el que permite que se vea mas cabecera
            // Se debería hacer dinámico dependiendo de las líneas de titulo.
            var orientacion = "";
            if (gridOptions.orientacion == "horizontal") {
                orientacion = "landscape";
            }
            var documento: any = {
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
                    }
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
                    }
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
                    bodyTabla:{
                        margin: [0, 1, 0, 1],
                        
                    }
                },
                images: {
                    cabecera: '',
                    fondo: ''
                    
                }
            }
            //var pdfMake: any;
            var nombreFichero: string = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero

            //this.mostrarVentanaEspera();    
            // Antes de hacer la exportacion hay que cargar las imagenes y transformarlas a Base64
            cvUtil.Utilidades.imageToBase64(gridOptions.imagenCabecera, (base64Img: any) => {
                documento.images.cabecera = base64Img;
                cvUtil.Utilidades.imageToBase64(gridOptions.imagenFondo, (base64Img: any) => {
                    documento.images.fondo = base64Img;
                    /*console.log('Contador iniciado');
                    this.mostrarVentanaEspera();*/
                    //this.rootScope.$emit('busy.begin');
                    //var dg: any = this.mensajePopup.mostrarInfo("Generando PDF", "Generando PDF, espere mientras finaliza la operación. Al finalizar la ventana se cerrará automáticamente");
                    /*var dg: any = this.cvPopup.mostrar("templates/ventanaEspera.html");*/
                    //window.setTimeout(partB,1000);
                    this.$timeout(() => {
                        //console.log('Download iniciado');
                        pdfMake.createPdf(documento).download(nombreFichero + '.pdf', () => {
                            //this.rootScope.$emit('busy.end');
                            //console.log('Download finalizado');
                            console.log('Download finalizado');
                            /*this.cvPopup.cerrar(dg);*/
                        });
                            this.ocultarVentanaEspera();
                    }, 2000);
                });
            });
        }

        private getNumeroColumnasExportar(gridOptions: cvGrid.ICVGridOptions): number {
            var contador: number = 0;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.columnDefs)) {
                gridOptions.columnDefs.forEach((col: cvGrid.ICVColumnDef) => {
                    if (this.esColumnaExportable(col)) {
                        contador++;
                    }

                });
            }
            return contador;
        }

        private filtrosAplicados(gridApi: uiGrid.IGridApi): string {
            var salida: string = "";
            var columns: Array<uiGrid.IGridColumn> = gridApi.grid.columns;
            columns.forEach((col: uiGrid.IGridColumn) => {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(col.filters)) {
                    //var fOptions:Array<IFilterOptions
                    col.filters.forEach((filter: uiGrid.IFilterOptions) => {
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(filter.term)) {
                            salida += col.displayName + " = " + "*" + filter.term + "* ";
                        }

                    });
                }
            });
            return salida;
        }

        private filtrosAplicadosDinamico(gridApi: uiGrid.IGridApi): string {
            var salida: string = "";
            var columns: Array<uiGrid.IGridColumn> = gridApi.grid.columns;
            columns.forEach((col: uiGrid.IGridColumn) => {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(col.filters)) {
                    //var fOptions:Array<IFilterOptions
                    var numFilter = col.filters.length;
                    var i: number = 0;
                    col.filters.forEach((filter: uiGrid.IFilterOptions) => {
                        i++;
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(filter.term)) {
                            if (numFilter == 2) {
                                var limite: string = "";
                                if (i == 1)
                                    limite = ' (desde)';
                                else
                                    limite = ' (hasta)';
                                salida += col.displayName + limite + ": " + filter.term + "\n";
                            } else
                                salida += col.displayName + " : " + "*" + filter.term + "* " + "\n";;
                        }

                    });
                }
            });
            return salida;
        }

        /**
        * Dada una cadena de tamaño la devuelve transformada en number.
        * Comprueba si es un numero o un %.
        **/
        private getNumberWith(cadena: string): number {

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
        }

		/**
		* Calcula el tamaño de las columnas de la exportación a PDF basándose en el tamaño indicado en pantalla.
		* Si hay columnas que no se exportan su tamaño debe ser repartido entre el resto.
		*/
        private buildPDFTableColumnsWidth(gridOptions: cvGrid.ICVGridOptions): Array<any> {
            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;
            if (cvUtil.Utilidades.comprobarObjetoVacio(columns))
                return [];

            var numColumnas: number = 0;
            var tamaColumnasNoExportar: number = 0;
            var tamaRepartir: number = 0;
            columns.forEach((col: cvGrid.ICVColumnDef) => {
                if (this.esColumnaExportable(col)) {
                    numColumnas++;
                } else {
                    tamaColumnasNoExportar += this.getNumberWith(<string>col.width);
                }
            });

            if (tamaColumnasNoExportar > 0 && numColumnas > 0) {
                tamaRepartir = tamaColumnasNoExportar / numColumnas;
            }

            var salida: Array<any> = new Array<string>();
            columns.forEach((col: cvGrid.ICVColumnDef) => {
                if (this.esColumnaExportable(col)) {
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.width))
                        salida.push('*');
                    else {
                        var tama: number = this.getNumberWith(<string>col.width);
                        if (tamaRepartir > 0)
                            tama += tamaRepartir;
                        salida.push(tama + "%");
                    }
                }
            });
            return salida;

        }

        private buildPDFTableBody(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions): Array<any> {
            var body: Array<any> = new Array();
            // La cabecera que se repetirá en cada página
            body.push(this.buildPDFTableColumnsHeader(gridOptions));

            // Los registros
            var rows: Array<uiGrid.IGridRow> = gridApi.core.getVisibleRows(gridApi.grid);

            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;
            if ((cvUtil.Utilidades.comprobarObjetoVacio(columns))
                || (cvUtil.Utilidades.comprobarObjetoVacio(rows)))
                return [];
            var valor: any;
            var fila: Array<any>;
            rows.forEach((row: uiGrid.IGridRow) => {

                String(rows);
                fila = new Array<any>();
                columns.forEach((col: cvGrid.ICVColumnDef) => {
                    if (this.esColumnaExportable(col)) {
                        var c: uiGrid.IGridColumn = gridApi.grid.getColumn(col.name);

                        //console.log(col);
                        var valor: string = gridApi.grid.getCellDisplayValue(row, c);
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(valor))
                            valor = valor.toString();
                        else
                            valor = "";
                        fila.push({text: valor, style: 'bodyTabla'});
                    }

                });
                body.push(fila);
            });
            return body;
        }

        private buildPDFTableColumnsHeader(gridOptions: cvGrid.ICVGridOptions): Array<any> {
            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;
            if (cvUtil.Utilidades.comprobarObjetoVacio(columns))
                return [];
            var salida: Array<any> = new Array<string>();

            columns.forEach((col: cvGrid.ICVColumnDef) => {
                if (this.esColumnaExportable(col)) {
                    if (cvUtil.Utilidades.comprobarObjetoVacio(col.displayName))
                        salida.push({ text: col.field, style: 'cabeceraTabla' });
                    else
                        salida.push({ text: col.displayName, style: 'cabeceraTabla' });

                }
            });
            return salida;
        }

        public esColumnaExportable(col: cvGrid.ICVColumnDef): boolean {
            // Si no está definida la variable es que es exportable
            if (cvUtil.Utilidades.comprobarObjetoVacio(col.exportar))
                return true;
            return col.exportar;
        }

        public exportarExcel(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions) {
            var columnasExcel: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

            var ep = new ExcelPlus();
            var tituloExcelFinal;
            //Lo utilizo porque algunos tiene un texto en excel diferente como titulo, y otros tienen el mismo que en el pdf
            if (gridOptions.tituloExcel == null)
                tituloExcelFinal = gridOptions.titulo;
            else
                tituloExcelFinal = gridOptions.tituloExcel;

            var titulo: string = "Hoja 1";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(tituloExcelFinal))
                titulo = tituloExcelFinal

            var file: any = ep.createFile(titulo);

            if (!cvUtil.Utilidades.comprobarObjetoVacio(tituloExcelFinal))
                file.write({ "cell": "A1", "content": tituloExcelFinal });

            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.subtitulo))
                file.write({ "cell": "A2", "content": gridOptions.subtitulo });
            file.write({ "cell": "A3", "content": "Fecha: " + moment().format('DD/MM/YYYY, h:mm:ss') });
            file.write({ "sheet": titulo, "cell": "D1", "content": " " });


            // Columnas del Excel
            var colActual: number = 0;
            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;

            if (!cvUtil.Utilidades.comprobarObjetoVacio(columns)) {
                columns.forEach((col: uiGrid.IColumnDef) => {
                    if (this.esColumnaExportable(col)) {
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
            var rows: Array<uiGrid.IGridRow> = gridApi.core.getVisibleRows(gridApi.grid);
            var columns: Array<uiGrid.IColumnDef> = gridOptions.columnDefs;
            if ((!cvUtil.Utilidades.comprobarObjetoVacio(columns))
                && (!cvUtil.Utilidades.comprobarObjetoVacio(rows))) {
                var valor: any;
                var fila: Array<any>;
                rows.forEach((row: uiGrid.IGridRow) => {
                    fila = new Array<any>();
                    colActual = 0;
                    columns.forEach((col: uiGrid.IColumnDef) => {
                        var c: uiGrid.IGridColumn = gridApi.grid.getColumn(col.name);

                        var valor: string = gridApi.grid.getCellDisplayValue(row, c);
                        if (cvUtil.Utilidades.comprobarObjetoVacio(valor))
                            file.write({ "cell": columnasExcel[colActual] + filaActual, "content": ' ' });
                        else
                            file.write({ "cell": columnasExcel[colActual] + filaActual, "content": valor.toString() });
                        colActual++;
                    });
                    filaActual++;
                });

            }

            var nombreFichero: string = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero
            file.saveAs(nombreFichero + ".xlsx");
        }

        public exportarCSV(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions) {

            // Siempre en modo compatible porque asi funciona lo del UTF-8
            gridOptions.exporterOlderExcelCompatibility = true;
            //var exporterOlderExcelCompatibility:boolean gridOptions.exporterOlderExcelCompatibility;
            var nombreFichero: string = "listado";
            if (!cvUtil.Utilidades.comprobarObjetoVacio(gridOptions.nombreFichero))
                nombreFichero = gridOptions.nombreFichero
            var fileName = nombreFichero + ".csv";

            this.uiGridExporterService.loadAllDataIfNeeded(gridApi.grid, this.uiGridExporterConstants.ALL, this.uiGridExporterConstants.VISIBLE).then(() => {
                var exportColumnHeaders = this.uiGridExporterService.getColumnHeaders(gridApi.grid, this.uiGridExporterConstants.VISIBLE);
                var exportData = this.uiGridExporterService.getData(gridApi.grid, this.uiGridExporterConstants.VISIBLE, this.uiGridExporterConstants.VISIBLE);
                var csvContent = this.uiGridExporterService.formatAsCsv(exportColumnHeaders, exportData, gridOptions.exporterCsvColumnSeparator);
                this.uiGridExporterService.downloadFile(fileName, csvContent, gridOptions.exporterOlderExcelCompatibility);
            });

        }

        public showDialog(obj: any) {
            this.$mdDialog.show(obj);
        }

        public hideDialog() {
            this.$mdDialog.hide();
        }

    }



    /**
    * Clase para controlar la navegación entre paginas
    **/
    export class ParamNavegarPagina {
        // Path desde donde se navega
        public pathOrigen: string = "";
        // Parametros que se quieren almacenar para volver posteriormente al origen. Un valor nulo elimina
        public paramOrigen: Object = null;
        // Path al que se navega
        public pathDestino: string = "";
        // Parametros de la página de destino. 
        // Si el parametro de destino no es vacio no se tiene en cuenta la variable refrescarDestino
        public paramDestino: Object = null;
        // Indica si se quiere refrescar los parametros de destino. Esto elimina los parametros almacenados en la pagina de destino.
        // En caso de que paramDestino sea nulo se comprueba esta variable para eliminar los parametros almacenados        
        public refrescarDestino: boolean = false
        // Nuevos objetos que añadir al destino
        // Deberia usarse en conjunto con paramDestino=null, refrescarDestino=false
        public anadirParamDestino: Object = null;

        constructor(pathDestino: string, paramDestino: Object, refrescarDestino: boolean, pathOrigen: string = null, paramOrigen: Object = null) {
            this.pathOrigen = pathOrigen;
            this.paramOrigen = paramOrigen;
            this.pathDestino = pathDestino;
            this.paramDestino = paramDestino;
            this.refrescarDestino = refrescarDestino;
        }
    }

    /**
    * Clase Base para los controladores.
    * Todos los controlladores deben extender de ella 
    **/
    export class CVController {
        public URL_CONTROLLER: string = "";
        public tieneGrid: boolean = false;
        public gridOptions: cvGrid.ICVGridOptions;
        public bController: CVBaseController;
        public bScope: ICVControllerScope;
        public columnaActual: string;
        public alturaGrid:number=0;
        public vacioGrid:boolean=false;
        public estaGridApi:boolean=false;

        // Array con los nombres de las variables usadas para guardar el estado del controlador
        // En caso de no rellenarse o estar vacio se copia todo
        public variablesEstado: Array<string>=[];        
        
        constructor($scope: ICVControllerScope, grid: boolean, baseController: ICVBaseController) {
            $scope.vm = this;

            this.tieneGrid = grid;
            this.bController = <CVBaseController>baseController;
            this.bScope = $scope;
            
            if (this.tieneGrid) {

                this.gridOptions = this.bController.getGridOptionsBase();

                this.gridOptions.onRegisterApi = (gridApi) => {
                    this.bScope.gridApi = gridApi;
                   
                    this.apiRegistrada();

                    this.bScope.gridApi.grid.refresh(true);                        
                    

                    // Esto permite que al recuperar el estado del grid se refresquen los filtros y la paginacion aplicados
                    this.bScope.gridApi.grid.registerDataChangeCallback(()=>{
                        this.bScope.gridApi.grid.refresh(true);
                        this.estaGridApi=true;
                        //this.asignarDatosGrid();

                        this.alturaGrid=cvGrid.CVGridUtil.calcularAlturaGrid(this.bScope.gridApi,this.gridOptions, null);
                        if(this.gridOptions.data.length==0){
                            this.vacioGrid=true;
                            this.alturaGrid+=400;
                            $(".cv-app .ui-grid-pager-panel").hide();
                        }else{
                            this.vacioGrid=false;
                            $(".cv-app .ui-grid-pager-panel").show();
                        }
                    },['all']);

                    if(!cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.gridApi.pagination)){
                        this.bScope.gridApi.pagination.on.paginationChanged(this.bScope,(pageNumber: number, pageSize: number)=>{
                            this.alturaGrid=cvGrid.CVGridUtil.calcularAlturaGrid(this.bScope.gridApi,this.gridOptions, null);
                            if(this.gridOptions.data.length==0){
                                this.vacioGrid=true;
                                this.alturaGrid+=400;
                            }else{
                                this.vacioGrid=false;
                            }
                        });

                    }

					this.bScope.gridApi.grid.registerRowsProcessor(this.subFilter, 200);					

                };

            }
        }
    
        /**
         * Metodo para sobreescribir por el controller si necesita realizar alguna accion al registrarse la API
         */
        public asignarDatosGrid():void{
            
        }

         
        public apiRegistrada():void{
            
        }

        /**
         * Función para filtrar las filas del grid.
         */
        public subFilter = function (renderableRows) {
            if (typeof this.subFilter === "function")
                return this.subFilter(renderableRows);
            else
                return renderableRows;
        }

        /*public iniciar(url: string) {
            this.URL_CONTROLLER = url;
            this.iniciarGrid();
            
            this.bController.iniciar(this.URL_CONTROLLER, (param) => {
                this.mostrar(param);
            });
        }*/
        /**/
          public iniciar(url: string) {
            this.URL_CONTROLLER = url;
            this.bController.rootScope.controladorActual=this;
            this.iniciarGrid();        
            this.bController.iniciar(this.URL_CONTROLLER, (param) => {
                
                
                // Tooltip -- En versiones posteriores se encuentra en cv-grid
                // AÃ±adir el celltemplate por defecto a cada columna (si no se ha definido antes)
                if(!cvUtil.Utilidades.comprobarObjetoVacio(this.gridOptions)){
                    this.gridOptions.columnDefs.forEach((col: cvGrid.ICVColumnDef) => {

                        if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_ICONO)
                            col.cellClass += " cv-grid-celda-icono";
                        else if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_NUMERO) {
                            col.sortingAlgorithm = cvUtil.Utilidades.ordenarNumeroStringFn;
                        } else if (col.tipoColumna == cvGrid.CVGridConstantes.TIPO_COLUMNA_FECHA) {
                            col.sortingAlgorithm = cvUtil.Utilidades.ordenarFechaStringFn;
                        }

                    });                      
                }

                this.mostrar(param);
            });
        }
        /**/

        /**
         * Inicializa el grid con la configuración por defecto de civica
         */
        public iniciarGrid(): void {
            cvGrid.CVGridUtil.iniciarGrid(this.gridOptions, this.bController.servicioConfiguracion.configuracion, this.bController.servicioCache);
        }

        /** Metodos para los grid */
        public llamarDobleClick(grid: cvGrid.ICVGridInstance, row: any) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(grid.options.dobleClick))
                eval('grid.appScope.' + grid.options.dobleClick + '(row)');
        }

        public getEstiloEspecial(grid: cvGrid.ICVGridInstance, row: any) {
            //console.log('Get Estilo Especial en controller');
        }

        public gridToggleFilter() {
            this.gridOptions.mostrarFiltros = !this.gridOptions.mostrarFiltros;
        }

        public gridFiltrado(filtros: uiGrid.IFilterOptions[]): boolean {

            var filtrado: boolean = false;
            if (!cvUtil.Utilidades.comprobarObjetoVacio(filtros)) {
                filtros.forEach(function (filtro) {
                    if (!cvUtil.Utilidades.comprobarObjetoVacio(filtro.term))
                        filtrado = true;
                });
            }
            return filtrado;
        }

        public detectoTecladoFiltro() {
            var textoActual = (<HTMLInputElement>document.getElementById(this.columnaActual)).value;
            if (cvUtil.Utilidades.comprobarObjetoVacio(textoActual) || textoActual.trim().length == 0) {
                //if (textoActual == "") {
                cvUtil.Utilidades.botonFiltroPorDefecto(this.columnaActual);
            } else {
                cvUtil.Utilidades.detectarFiltro(this.columnaActual);
            }
        }

        public actualizarInputSeleccionado(param: string) {
            this.columnaActual = param;
        }

        public nombreCampoGrid(col: any): string {
            return cvUtil.Utilidades.nombreCampoGrid(col.grid.id, col.field);
        }

        /** Fin de los metodos para los grids */

        public mostrar(param: any) {

        }
       
        public exportarPdf() {
            this.bController.exportarPDF(this.bScope.gridApi, this.gridOptions);
        }

        public exportarXLSX() {
            this.bController.exportarExcel(this.bScope.gridApi, this.gridOptions);
        }

        public exportCSV = function () {
            this.bController.exportarCSV(this.bScope.gridApi, this.gridOptions);
        }


        public fijarVersion(v: string): string {
            this.bController.fijarVersion(v);
            return v;
        }


        public mostrarVentanaAyuda(templateURL: string) {

            this.bController.showDialog(
                {
                    templateUrl: 'templates/ventanaAyuda.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    //controller: 'BloqueoPalesController'
                    controller: ['$scope', ($scope) => {
                        $scope.vm = this;
                        $scope.templateURL = templateURL;
                        /*
                                                $scope.volver = (param) => {
                        
                                                    this.mdDialog.hide(param);
                        
                                                }
                        */
                    }],
                });

        }

        public salirAyuda() {
            this.bController.hideDialog();
        }

		/**
		Para validaciones adicionales
		**/
        public validarFormulario(): boolean {
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
        }

        /**
        * Recupera el parametro identificador pasado al controlador.
        * Se comprueba si se trata de una llamada como popup para recuperarlo del parent scope
        * y en caso contrario del route
        **/
        public getParametroIdentificador($routeParams: cvUtil.IDetalleRouteParams): string {
            var id: string = null;
            // Comprobar si se trata de un popup
            if (!cvUtil.Utilidades.comprobarObjetoVacio(this.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent.esPopup)
                && this.bScope.$parent.esPopup) {
                return this.bScope.$parent.param;
            } else {
                id = $routeParams.identificador;
            }
            return id;
        }

        /**
        * Recupera el parametro objeto pasado al controlador.
        * Se comprueba si se trata de una llamada como popup para recuperarlo del parent scope
        * y en caso contrario del route
        **/
        public getParametroObjeto($routeParams: cvUtil.IDetalleRouteParams): Object {
            var obj: Object = null;
            // Comprobar si se trata de un popup
            if (!cvUtil.Utilidades.comprobarObjetoVacio(this.bScope)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent)
                && !cvUtil.Utilidades.comprobarObjetoVacio(this.bScope.$parent.esPopup)
                && this.bScope.$parent.esPopup) 
                return this.bScope.$parent.param;

            return obj;
        }

        public comprobarAccesoUsuarioFunEval(funcionalidades: Array<string>, operacion: string = "OR"): boolean {
            return this.bController.comprobarAccesoUsuarioFunEval(funcionalidades, operacion);
        }

        public registerRowsProcessor(){

        }

        public volver(param:any=null){
            console.log('Volver');
            console.log(this);
            //this.bController.volver();
        }

    }

    /**
    * Interfaz del scope del controlador.
    * Todos los Scopes de controllador deben extender de ella 
    **/
    export interface ICVControllerScope extends ng.IScope {
        vm: CVController;
        gridApi: uiGrid.IGridApi;
        $parent: any;
    }

    export interface ICVBaseController {
        getGridOptionsBase(): cvGrid.ICVGridOptions;
        iniciar(pagina: string, iniciarCallBack: Function);
        exportarCSV(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions);
        exportarPDF(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions);
        exportarExcel(gridApi: uiGrid.IGridApi, gridOptions: cvGrid.ICVGridOptions);
        fijarVersion(v: string);
        showDialog(obj: any);
        hideDialog();
        irPaginaPrincipal();
    }

    
}