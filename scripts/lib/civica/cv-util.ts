
/// <reference path="_cv-app.ts" />
	
module cvUtil {
    'use strict';


	/** 
	* ServicioBase: 
	*	Clase de la que deben heradar todos los servicio.
	* 	Entre otras cosas, captura los mensajes de error y los muestra al usuario.
	**/
    export class ServicioBase {

        //private URL_BASE: string = "http://172.17.24.11:8080/testWebApp/services";
        //private URL_BASE: string = "http://172.17.24.18:8080";
        //private URL_BASE: string = "http://172.17.24.153:8080/sgeeco";
        private URL_BASE: string = "";

        
        httpService: ng.IHttpService;
        urlServicio: string = "";
        mensajePU: cvUtil.MensajePopUp;
		private sCache:CVServicioCache;
	

        constructor($http: ng.IHttpService, public $location: ng.ILocationService, url: string, mensajePopup: cvUtil.MensajePopUp, servicioCache: CVServicioCache,private $rootScope:cvController.ICVBaseControllerRootScope) {
            this.httpService = $http;
            this.urlServicio = this.getURLBaseServicios($location) + url;
            //this.urlServicio = this.URL_BASE + url;

            this.mensajePU = mensajePopup;
            this.sCache=servicioCache;
        }

        ejecutarPost(url: string, data: any, successCallback: Function,bloquearEspera:boolean=false) {
            
            this.$rootScope.bloquearVentanaEspera=bloquearEspera;

            this.httpService.post(this.urlServicio + url, data)
                .success((data: any) => {
                    this.$rootScope.bloquearVentanaEspera=false;
                    if (this.comprobarIdentificado(data))
                        successCallback(data);
                })
                .error((data: any, status: number) => {
                    this.$rootScope.bloquearVentanaEspera=false;
                    this.manejaErrorServidor(data, status);
                });
        }
        
        ejecutarGet(url: string, data: any, successCallback: Function,bloquearEspera:boolean=false) {
            this.$rootScope.bloquearVentanaEspera=bloquearEspera;
            var url_final; 
            if(!cvUtil.Utilidades.comprobarObjetoNulo(data))
                url_final = this.urlServicio + url + "/" + data;
            else
                url_final = this.urlServicio + url;
            this.httpService.get(url_final)
                .success((data: any) => {
                    this.$rootScope.bloquearVentanaEspera=false;
                    if (this.comprobarIdentificado(data))
                        successCallback(data);
                })
                .error((data: any, status: number) => {
                    this.$rootScope.bloquearVentanaEspera=false;
                    this.manejaErrorServidor(data, status);
                });
        }

        public comprobarIdentificado(data: any) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(data)
                && typeof data == 'string' && data.indexOf("ERR001: Usuario no Identificado") != -1) {
                this.mensajePU.mostrarError("Sesión expirada", "Su sesión actual ha expirado.\nPulse Aceptar para identificarse de nuevo", undefined, this.reiniciarSesion);
                return false;
            }
            return true;

        }

        public getURLBaseServicios($location: ng.ILocationService) {
            //var urlWS = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            var urlWS = "";
            var contextPath: string = $location.absUrl(); // will tell you the current path
            var partes: Array<String> = contextPath.split('/');
            if (partes.length >= 3) {
                // Si el context path es /
                if (partes[3] == 'views' || partes[3] == 'login.jsp')
                    return urlWS + "";
                else
                    return urlWS + "/" + partes[3];
            }
            return urlWS;
        }

        public manejaErrorServidor(data: any, status: number) {
            if (status == 401) {
                this.mensajePU.mostrarError("Sesión expirada", "Su sesión actual ha expirado.\nPulse Aceptar para identificarse de nuevo", undefined, this.reiniciarSesion);
                return;
            } else if (status == 404) {
                this.mensajePU.mostrarError("Servicio no encontrado", "No se pudo acceder al servicio solicitado: " + this.urlServicio);
                return;
            } else {
                this.mensajePU.mostrarError("Error en la ejecución", this.getMensajeError(data));
                return;
            }
        }

        private getMensajeError(data: string): string {
            var salida: string = "";
            if (typeof data != 'undefined') {
                var posIni = data.indexOf('.SGEEcoException:');
				
                // Si no hay fault es que se trata de un error general
                if (posIni == -1) {
                    salida = "Se ha producido un error general durante el procesamiento de su solicitud.<br>Vuelva a intentar la operación y si el problema persiste contacte con el Administrador del Sistema.";
                } else {
                    salida = data.substring(posIni + 18, data.length);
                    posIni = salida.indexOf('<br/>');
                    salida = salida.substring(0, posIni);
                    var lines = salida.split('\n');
                    salida = lines[0];
                }

            }
            return salida;
        }

        reiniciarSesion(data: any) {
            window.location.href = "/login.jsp";
            ///this.$location.path("/");
        }
        
        public ejecutarMetodo(p:ParamMetodo, successCallback: Function,bloquearEspera:boolean=false){
        	// Si hay caché se devuelve directamente
        	if(!cvUtil.Utilidades.comprobarObjetoVacio(p.claveCache) &&
			    this.sCache.existeObjetoCache(p.claveCache) && !p.refrescarCache) {
                    successCallback(this.sCache.recuperarObjetoCache(p.claveCache));        	
        	}else{
        		if(p.tipo==ParamMetodo.TIPO_POST){
        			this.ejecutarPost(p.url, p.param, (data) => {
        				this.procesarSalidaMetodo(p,data,successCallback);
        			},bloquearEspera);        			
        		}else{
        			this.ejecutarGet(p.url, p.param, (data) => {
        				this.procesarSalidaMetodo(p,data,successCallback);
        			},bloquearEspera);        			
        		}        		
        	}        	
        }
        
        public procesarSalidaMetodo(p:ParamMetodo,data:any,successCallback: Function){
            if (!cvUtil.Utilidades.comprobarObjetoVacio(data)){
            	var salida:any=null;
            	if(p.tipoSalida==ParamMetodo.TIPO_SALIDA_RAW)
            		salida=data
            	else if(p.tipoSalida==ParamMetodo.TIPO_SALIDA_ARRAY)
            		salida=cvUtil.Utilidades.copiarArrayObjetos(data, p.tipoObjeto);
            	else if(p.tipoSalida==ParamMetodo.TIPO_SALIDA_OBJECT)
            		salida=cvUtil.Utilidades.crearObjetoPropiedades(data,p.tipoObjeto);
            	
            	if(!cvUtil.Utilidades.comprobarObjetoVacio(p.claveCache))
            		this.sCache.anadirObjetoCache(p.claveCache, salida);
                successCallback(salida);
            }else
                successCallback(null);        	
        }        

    }
    
    export class ParamMetodo{
    	static TIPO_POST:string="post"; 
    	static TIPO_GET:string="get";
    	
    	public static TIPO_SALIDA_RAW:string="raw";
    	public static TIPO_SALIDA_ARRAY:string="arr";
    	public static TIPO_SALIDA_OBJECT:string="obj";
    	
    	public tipo:string;
    	public url:string;
    	public claveCache:string;
    	public refrescarCache:boolean=false;
    	public param:any;
    	public tipoObjeto:string;
    	public tipoSalida:string;
    }    
    
    /**
    * CVPopUp: Muestra una pagina en Pop Up.
    * Servirá para abrir cualquier componente en Popup
    **/
    export class CVPopUp {
        mdDialog: any;

        constructor($mdDialog: any,private servicioCache:ICVServicioCache) {
            this.mdDialog = $mdDialog;
        }
        
        // Si se quiere que no haya botones se pasa el parametros como vacio
        public mostrar(templateURL: string, param: any = null, callback: Function = CVPopUp.prototype.cerrarVentanaDefault): any {

            var dg: any = this.mdDialog.show({
                //controller: DialogController,
               
                controller: ['$scope', ($scope) => {
                    //$scope.titulo = titulo;
                    $scope.esPopup = true;
                    $scope.param = param;
                    $scope.volver = (param) => {
                        this.mdDialog.hide(param);
                    }
                }],
                templateUrl: cvUtil.Utilidades.getPlantilla(templateURL,this.servicioCache),
                parent: angular.element(document.body),
                //clickOutsideToClose: true,
                skipHide: true,
            }).then(function(answer) {
                callback(answer);
            }, function() {
                callback('');
            });
            return dg;

        }

        public cerrarVentanaDefault(param: string) {
        }

        public cerrar(dg: any) {
            this.mdDialog.hide(dg);
        }

    }
    
	/** 
	* MensajePopUp: 
	*	- Clase con la ventana de mensaje Popup generica.	
	**/
    export class MensajePopUp {

        public static TIPO_INFO: string = "info";
        public static TIPO_ERROR: string = "error";
        public static TIPO_CONFIRM: string = "confirm";
        public static TIPO_BAJA: string="baja";
        public static TIPO_MENSAJE:string="mensaje"

        //dialog: angular.dialog.IDialogService;
        //mdDialog: any;
        templateURL:string="";

        /*public template: string = '<div class="cv-ventana-mensaje">' +
        '<div class="cv-vm-cabecera row-fluid" > ' +
        '<div class="cv-vm-texto-cabecera col-xs-11">{{titulo}}</div>' +
        '<a ng-click="closeThisDialog()"><div class="cv-vm-cabecera-cerrar col-xs-1">&nbsp;</div></a>' +
        '</div>' +
        '<div class="cv-vm-cuerpo row-fluid">' +
        '<div class="col-xs-2 cv-vm-icono">&nbsp;</div>' +
        '<div class="col-xs-10 cv-vm-texto">{{mensaje}}</div>' +
        '</div>' +
        '<div class="cv-vm-botonera row-fluid">' +
        '<a class="cv-vm-boton aceptar"  ng-click="closeThisDialog()">Aceptar</a>' +
        '</div>' +
        '</div>';
*/
        public preMensaje: string = '<md-dialog class="cv-ventana-mensaje">' +
        '<form>' +
        '<md-toolbar>' +
        '<div class="md-toolbar-tools">' +
        '<h2>{{titulo}}</h2>' +
        '<span flex></span>' +
        '<md-button class="md-icon-button" ng-click="volver(\'\')">' +
        '<md-icon md-svg-src="../imagenes/cerrar.svg" aria-label="Close dialog"></md-icon>' +
        '</md-button>' +
        '</div>' +
        '</md-toolbar>' +
        '<md-dialog-content style="max-width:800px;max-height:810px;">' +
        '<div layout="row">' +
        '<div flex="10"></div>' +
        '<div flex="80" class="contenedor-alerta texto-contenido">' +
        '<p>';

        public botonesTemplate: string = "";


        public postMensaje: string = '</p>' +
        '</div>' +
        '<div flex="10"></div>' +
        '</div>' +
        '<md-divider></md-divider>' +
        '</md-dialog-content>' +
        '<md-dialog-actions layout="row" layout-align="center center">';


        public postBotones = '</md-dialog-actions>' +
        '</form>' +
        '</md-dialog>';


        constructor(public ngDialog: angular.dialog.IDialogService, public $mdDialog: any,public $sce:any, tURL:string="") {
            //this.dialog = ngDialog;
            //this.mdDialog = $mdDialog;
            this.templateURL=tURL;
        }

        public cerrar(dg: any) {
            this.$mdDialog.hide(dg);
        }

        // Si se quiere que no haya botones se pasa el parametros como vacio
        public mostrar(tipo: string, titulo: string, mensaje: string, botones: Array<any>, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault): any {

            this.botonesTemplate = "";
            console.log(tipo);
            if (typeof botones == 'undefined') {
                if (tipo == MensajePopUp.TIPO_CONFIRM){
                    botones = [['Cancelar', 'eliminar.svg', 'md-default cancelar', 'N'], ['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }else if(tipo == MensajePopUp.TIPO_BAJA){
                    botones = [['Cancelar', 'eliminar.svg', 'md-default cancelar', 'N'], ['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }else if(tipo == MensajePopUp.TIPO_ERROR){
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }else if(tipo==MensajePopUp.TIPO_MENSAJE){
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }else{
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal cancelar', 'S']];
                }
            }

            botones.forEach((infoBoton: Array<string>) => {
                this.botonesTemplate += '<md-button ng-click="volver(\'' + infoBoton[3] + '\')" class="md-raised botones ' + infoBoton[2] + '">' +
                '<md-icon md-svg-src="../imagenes/' + infoBoton[1] + '" class="name"></md-icon> ' + infoBoton[0] +
                '</md-button>';
            });



            var dg: any = this.$mdDialog.show({
                //controller: DialogController,
                controller: ['$scope', ($scope) => {
                    $scope.titulo = titulo;
                    $scope.tipo = tipo;
                    $scope.botones = botones;
                    $scope.mensaje = this.$sce.trustAsHtml(mensaje);
                    $scope.volver = (param) => {
                        //return $scope.closeThisDialog();
                        this.$mdDialog.hide(param);
                        //$mdDialog.hide( alert, "finished" );
                    }

                }],
                templateUrl: this.templateURL,
                template: this.preMensaje + mensaje + this.postMensaje + this.botonesTemplate + this.postBotones,
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                skipHide: true
            }).then(function(answer) {
                callback(answer);
                //  $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                callback('');
                //status = 'You cancelled the dialog.';
            });
            return dg;

        }

        public cerrarVentanaDefault(param: string) {
        }

        public mostrarInfo(titulo: string, mensaje: string, botones: Array<any> = undefined, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault) {
            this.mostrar(MensajePopUp.TIPO_INFO, titulo, mensaje, botones, callback);
        }

        public mostrarError(titulo: string, mensaje: string, botones: Array<any> = undefined, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault) {
            this.mostrar(MensajePopUp.TIPO_ERROR, titulo, mensaje, botones, callback);
        }

        public mostrarPregunta(titulo: string, mensaje: string, botones: Array<any> = undefined, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault) {
            this.mostrar(MensajePopUp.TIPO_CONFIRM, titulo, mensaje, botones, callback);
        }
        public darBaja(titulo: string, mensaje: string, botones: Array<any> = undefined, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault) {
            this.mostrar(MensajePopUp.TIPO_BAJA, titulo, mensaje, botones, callback);
        }
        public mostrarMensaje(titulo: string, mensaje: string, botones: Array<any> = undefined, callback: Function = MensajePopUp.prototype.cerrarVentanaDefault){
            this.mostrar(MensajePopUp.TIPO_MENSAJE, titulo, mensaje, botones, callback);
        }
    }
    
    /**
    * VENTANA ESPERA:
    * Ventana de espera durante la ejecución de una llamada 
    * Se realiza a travez de un provider
    **/
    export class VentanaEspera {

        SERVICE_URL = "/services";
        _total: number = 0;
        _completed: number = 0;
        //$rootScope: ng.IScope;

        //public static $inject = ['$rootScope', '$q'];


        constructor(public rs: ng.IScope, public $q: ng.IQService, url: string) {            
            this.SERVICE_URL = url;
            //console.log(rs);
        }


        public complete() {
            this._total = this._completed = 0;
        }

        public handleResponse(r) {
            if (Utilidades.comprobarObjetoVacio(r) || Utilidades.comprobarObjetoVacio(r.config))
                return;
            if (r.config.notBusy)
                return;

            if (r.config.url.indexOf(this.SERVICE_URL) == -1)
                return;

            this._completed++;
            if (this._completed >= this._total) {
                this.complete();
                this.rs.$broadcast('busy.end', { url: r.config.url, name: r.config.name, remaining: this._total - this._completed });
            }
        }

        public request = (config) => {
            if (!config.notBusy &&
                config.url.indexOf(this.SERVICE_URL) != -1) {
                this.rs.$broadcast('busy.begin', { url: config.url, name: config.name });
                this._total++;
            }
            return config || this.$q.when(config);
        }

        public response = (response) => {
            // $rootScope.$emit("error.ws");
            this.handleResponse(response);
            return response;
        }

        public responseError = (rejection) => {
            this.rs.$emit("error.ws");
            this.handleResponse(rejection);
            return this.$q.reject(rejection);
        }

        public outstanding(): number {
            return this._total - this._completed;
        }
      
        /*    return {
        outstanding: function() {
            return _total - _completed;
        },*/

        /*
            }).config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('busyInterceptor');
        }]);
        */

    }
    
    /**
    * Metodos estaticos de utilidades varias
    * NOTA: No relacionado con angular (¿ponerlo como un servicio angular?) 
    **/
    export class Utilidades {
    	
        // Version especifica de la plantilla
        public static getPlantilla(plantilla:string, servicioCache:cvUtil.ICVServicioCache) {
            return plantilla+"?v"+servicioCache.getVersionApp();
        };          
    	
    	/**
    	* Recupera el context path de la URL actual
    	*/
        public static getContextPath(): string {
            var urlWS = "";
            var contextPath: string = window.location.href;
            var partes: Array<String> = contextPath.split('/');
            if (partes.length >= 3)
                // Si el context path es /
                if (partes[3] == 'views')
                    return urlWS + "";
                else
                    return urlWS + "/" + partes[3];
            return urlWS;
        }

        public static comprobarEntero(data: string): boolean {
            var n:number=parseInt(data);
            if(!isNaN(n))
                return true;
            return false;
        }

        public static comprobarObjetoVacio(data: any): boolean {
            if (data == null || typeof data == 'undefined' || data.toString() == '')
                return true;
            return false;
        }


        public static comprobarObjetoNulo(data: any): boolean {
            if (data == null || typeof data == 'undefined')
                return true;
            return false;
        }



        public static padCeros(numero: number, ancho: number): string {
            var result: string = "";
            var numeroStr: string = "" + numero;

            for (var i: number = 0; i < ancho - numeroStr.length; i++) {
                result += "0";
            }

            result += numeroStr;
            return result;
        }
        
        
        // Transformacion de un listado de objetos
        public static copiarArrayObjetos(lista: Array<Object>, tipo: string): Array<Object> {
            var salida: Array<Object> = null;
            if (lista != null && typeof lista != 'undefined' && lista.length > 0) {
                salida = new Array<Object>();
                for (var i: number = 0; i < lista.length; i++) {
                    salida.push(Utilidades.crearObjetoPropiedades(lista[i], tipo));
                }
            }
            return salida;
        }        
       public static copiarArrayObjetosNoNulo(lista: Array<Object>, tipo: string): Array<Object> {
            var lista:Array<Object>=Utilidades.copiarArrayObjetos(lista,tipo);
            if(lista==null)
                return new Array<Object>();
            else
                return lista;
        } 
        /**
        * Copiar todas las propiedades de un objeto en otro
        **/
        public static copiarPropiedades(origen: any, destino: any) {
            var complejo:boolean=false;
            for (var k in origen) {
                complejo=false;
                //console.log("Del objeto "+origen+" va a copiar la propiedad "+k.toUpperCase()+' del tipo '+typeof origen[k]);
                if(typeof origen[k] == 'object' || Array.isArray(origen[k])){
                    //console.log('La propiedad '+k.toUpperCase()+' es compleja.. habría que copiarla con crearObjetoPropiedades '+typeof origen[k]);
                    // Comprobar si tiene la funcion para recuperar el tipo de los objetos complejos
                    //var tipo=eval(destino+'.getTipoComplejo(\''+k+'\')');
                    if(typeof destino.getTipoComplejo == 'function'){
                        var tipo:string=<any>destino.getTipoComplejo(k);
                        //console.log('La propiedad '+k.toUpperCase()+' => '+tipo);
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(tipo)) {
                            //console.log('La propiedad '+k.toUpperCase()+' tiene un tipo correcto '+tipo);
                            // Depende si es un array o un objeto
                            complejo=true;
                            if(Array.isArray(origen[k]))
                                destino[k]=Utilidades.copiarArrayObjetos(origen[k], tipo);
                            else
                                destino[k]=Utilidades.crearObjetoPropiedades(origen[k], tipo);
                        }
                    }
                }
                    
                if (!complejo && origen.hasOwnProperty(k))
                    destino[k] = origen[k];
            }
        }
        

        /**
        * Copiar todas las propiedades de un listado
        **/
        public static copiarListaPropiedades(origen: Object, destino: Object,propiedades:Array<string>) {
            if(Utilidades.comprobarObjetoVacio(propiedades)){
                Utilidades.copiarPropiedades(origen,destino);
            }else{
                propiedades.forEach((propiedad:string)=>{
                     if (origen.hasOwnProperty(propiedad))
                        destino[propiedad] = origen[propiedad];
                });
            }

        }  
                
        /**
		* Copiar todas las propiedades de un objeto en otro
		**/
        public static crearObjetoPropiedades(origen: Object, tipoDestino: string): Object {
            var s: Object = eval('new ' + tipoDestino + '()');
            Utilidades.copiarPropiedades(origen, s);
            // if (typeof testObj.callableFunction == 'function') { Comprobar si tiene una funcion
            return s;
        }
        
        /**
         * Dado un objeto crea un xml a partir de todas sus propiedades
         */
        public static transformarObjetoXML(objeto: any, nodoRaiz:string):string{
            var salida="<"+nodoRaiz+">";
            var complejo:boolean=false;
            for (var k in objeto) {
                
                if (!cvUtil.Utilidades.comprobarObjetoVacio(objeto[k])){
                    if(typeof objeto[k] == 'object'){
                       salida+=Utilidades.transformarObjetoXML(objeto[k], k);
                    }else if(Array.isArray(objeto[k])){
                        // Por el momento nada
                    }else if (objeto.hasOwnProperty(k)){
                        salida+="<"+k+">"+objeto[k]+"</"+k+">";
                    }

                }
            }
            salida+="</"+nodoRaiz+">";
            return salida;
        }

        /**
        * Dado un objeto y un listado devuelve la posicion del objeto
        * comparando por el campo que se indica.
        * Devuelve -1 si no se encuentra
        **/
        public static getPosicion(elemento: any, lista: Array<any>, campo: Array<string>): number {
            if (Utilidades.comprobarObjetoVacio(elemento) || Utilidades.comprobarObjetoVacio(lista))
                return -1;

            for (var i: number = 0; i < lista.length; i++) {
                if(campo.length == 1){
                    if (elemento[campo[0]] == lista[i][campo[0]])
                        return i;
                }else{
                    if ((elemento[campo[0]] == lista[i][campo[0]]) && elemento[campo[1]] == lista[i][campo[1]])
                        return i;

                }
            }
            return -1;
        } 
                
        /**
        * Dado un objeto y un listado devuelve el objeto dentro del listado
        * comparando por el campo que se indica.
        * Es decir, aquel elemento del listado que tiene el mismo valor en el campo indicado.
        * Devuelve -1 si no se encuentra
        **/
        public static getElementoListado(elemento: any, lista: Array<any>, campo: Array<string>): any {
           /* if(campo.length == 1)*/
                var posicion: number = Utilidades.getPosicion(elemento, lista, campo);
            /*else
                var posicion: number = Utilidades.getPosicionArrayCampo(elemento, lista, campo);*/
            if (posicion == -1)
                return null;
            return lista[posicion];
        }
        
        /**
        * Elimina un elemento de un listado dado el campo de comparacion
        * En caso de no encontrarse no lo elimina         
        **/
        public static eliminarElemento(elemento: any, lista: Array<any>, campo: Array<string>): void {
            var posicion: number = Utilidades.getPosicion(elemento, lista, campo);
            if (posicion >= 0) {
                lista.splice(posicion, 1);
            }
        }

        
        /**
        * Utilidades para el grid
        **/
        //pone en blanco el filtro
        public static detectarFiltro(param: string) {
            if (param != null) {
                if (!$('.' + param).hasClass('icono-filtro-seleccionado')) {
                    $('.' + param).addClass('icono-filtro-seleccionado');
                    $('.' + param).removeClass('icono-filtro');
                }
            }
        }
        //esta funcion me actualiza el boton a negro cuando se queda vacio el input
        public static botonFiltroPorDefecto(param: string) {
            if ($('.' + param).hasClass('icono-filtro-seleccionado')) {
                $('.' + param).removeClass('icono-filtro-seleccionado');
                $('.' + param).addClass('icono-filtro');
            }
        }
        //esconder multiselect
        public static esconderMultiselect() {
            /*if ($('div').hasClass('ui-grid-cell-contents-Mostrar')) {
                $('.ui-grid-cell-contents-Mostrar').addClass('ui-grid-cell-contents');
                $('.ui-grid-cell-contents-Mostrar').removeClass('ui-grid-cell-contents-Mostrar');
            }*/
        }
        //mostrar multiselect
        public static mostrarMultiselect() {
            /*if ($('div').hasClass('ui-grid-cell-contents')) {
                $('.ui-grid-cell-contents').addClass('ui-grid-cell-contents-Mostrar');
                $('.ui-grid-cell-contents').removeClass('ui-grid-cell-contents');
            }*/
        }
        
        // Recalcular el alto de la tabla
        public static getAltoCabecera(prefijo:string):number{
            if ($('#'+prefijo+'tablaPeticion1'))
                return parseInt($('#'+prefijo+'tablaPeticion1').css('height'));
            else return 0;
            /*if($('.ui-grid:first')){
                var heightCabecera:number=parseInt($('.ui-grid:first').css('height'));;
                var heightTabla:number=parseInt($('.ui-grid:first').css('height'));
                if ($('#tablaPeticion1').hasClass('headerTablaPeticion1')) {
                }else{
                }            
            }*/
        }
        

        //despliega la tabla cuando aparece el filtro
        public static gridAnchoTabla() {
            /*
            Por el momento comentado porque no se muy bien que hace. 
            Se usaba en trazabilidad poniendo en la definición del grid lo siguiente:
            <div id="tablaPeticionGlobal" ui-grid-selection ui-grid-pagination ui-grid-exporter ui-grid="vm.gridOptions" class="grid tablaNuevaEtiquetaDefecto"></div>
            ------
            if ($('div').hasClass('tablaNuevaEtiquetaDefecto')) {
                document.getElementById("tablaPeticionGlobal").classList.add('tablaNuevaEtiquetaGrande');
                document.getElementById("tablaPeticionGlobal").classList.remove('tablaNuevaEtiquetaDefecto');
            } else {
                document.getElementById("tablaPeticionGlobal").classList.add('tablaNuevaEtiquetaDefecto');
                document.getElementById("tablaPeticionGlobal").classList.remove('tablaNuevaEtiquetaGrande');
            }*/
        }

        // El nombre del campo en el grid puede ser el nombre de una funcion. Esto le elimina la parte de los parentesis
        public static nombreCampoGrid(idgrid:string,nc:string):string{
            var s:string=nc;
            if(!Utilidades.comprobarObjetoVacio(nc)){
                var i:number=nc.indexOf('(');
                if(i!=-1){
                    s=nc.substring(0,i);
                }

                // Si tiene puntos (objeto complejo) se sustutuye por _
                s=s.replace(/\./g,'_');
            }

            // Añadir como prefijo el id del grid y un prefijo cv 
            s='cvgrid-'+idgrid+'-'+s;
            return s;
        }     

        /**
         * Recupera el valor de un campo de un objeto.
         * Si es un objeto complejo navega hasta encontrar el campo.
         * Si el no se puede navegar hasta el valor se devuelve null.
         */
        public static getValorCampo(item:Object, campo: string):Object{
            if(cvUtil.Utilidades.comprobarObjetoVacio(item) || cvUtil.Utilidades.comprobarObjetoVacio(item))
                return null;
            var cadenas:Array<string>=campo.split('.');
            var salida:Object=item;            
            cadenas.forEach((cadena:string)=>{
                salida=salida[cadena];
                if(cvUtil.Utilidades.comprobarObjetoVacio(salida)){
                    salida=null;
                    return salida;
                }
            });
            return salida;
        }  

        public static ordenarFechaStringFn(valor1:string, valor2:string):number{


            //var f1:Date=cvUtil.Utilidades.;
         if(cvUtil.Utilidades.comprobarObjetoVacio(valor1) 
            && cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 0;
            if(cvUtil.Utilidades.comprobarObjetoVacio(valor1))
                return -1;
            if(cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 1;

            var m1: moment.Moment = moment(valor1, 'DD/MM/YYYY');   
            var m2: moment.Moment = moment(valor2, 'DD/MM/YYYY');
            if(cvUtil.Utilidades.comprobarObjetoVacio(m1) 
            && cvUtil.Utilidades.comprobarObjetoVacio(m2))
                return 0;
            if(cvUtil.Utilidades.comprobarObjetoVacio(m1))
                return -1;
            if(cvUtil.Utilidades.comprobarObjetoVacio(m2))
                return 1;
            
            if(m1.isBefore(m2))
                return -1;
            else if(m2.isBefore(m1))
                return 1;

            return 0;            
        }

        public static ordenarNumeroStringFn(valor1:string, valor2:string):number{
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor1) 
                && cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                    return 0;
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor1))
                    return -1;
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                    return 1;

                var n1:number=parseInt(valor1);
                var n2:number=parseInt(valor2);

                if(isNaN(n1) 
                && isNaN(n2))
                    return 0;
                if(isNaN(n1))
                    return -1;
                if(isNaN(n2))
                    return 1;
                
                if(n1<n2)
                    return -1;
                else if(n2<n1)
                    return 1;

                return 0;            
        }

        public ordenarNumeroString(lista:Array<any>, campo: string,reverse:boolean):Array<any>{
            // NO está probado de esta forma. 
            lista.sort(cvUtil.Utilidades.ordenarNumeroStringFn);
            /*lista.sort((item1:any,item2:any)=>{
                //var f1:Date=cvUtil.Utilidades.;
                var valor1:Object=cvUtil.Utilidades.getValorCampo(item1,campo);
                var valor2:Object=cvUtil.Utilidades.getValorCampo(item2,campo);
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor1) 
                && cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                    return 0;
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor1))
                    return -1;
                if(cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                    return 1;

                var n1:number=Number(valor1);
                var n2:number=Number(valor2);

                if(isNaN(n1) 
                && isNaN(n2))
                    return 0;
                if(isNaN(n1))
                    return -1;
                if(isNaN(n2))
                    return 1;
                
                if(n1<n2)
                    return -1;
                else if(n2<n1)
                    return 1;

                return 0;
            });*/
            if(reverse)
                lista.reverse();
            return lista;
        }        
        
        /** Para los selectores multiples **/
        // Recupera un array de los elementos seleccionados. 
        //En caso no existir nunguno devuelve un array vacio
        public static getElementosSeleccionados(lista: Array<ICVSeleccionable>): Array<ICVSeleccionable> {
            var salida: Array<ICVSeleccionable> = new Array<ICVSeleccionable>();
            if (!Utilidades.comprobarObjetoVacio(lista)) {
                lista.forEach((el: ICVSeleccionable) => {
                    if (el.seleccionado)
                        salida.push(el);
                });
            }
            return salida;
        }
        
        // Elimina todas las marcas de elementos seleccionados
        public static limpiarElementosSeleccionados(lista: Array<ICVSeleccionable>) {
            if (!Utilidades.comprobarObjetoVacio(lista)) {
                lista.forEach((el: ICVSeleccionable) => {
                    el.seleccionado = false;
                });
            }
        }
        	

        
        // Convierte una imagen en su representación en Base64
        public static imageToBase64(url, callback, outputFormat = "image/png") {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                var canvas: any = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                var im:HTMLImageElement=<HTMLImageElement>this;
                canvas.height = im.height;
                canvas.width = im.width;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        }

        // Dado un listado y un elemento devuelve si el elemento está contenido en el listado 
        public static contiene(lista: Array<any>, elemento: any): boolean {
            var resultado = false;
            if (lista.length > 0) {
                for (var i = 0; i < lista.length; i++) {
                    
                    if (angular.toJson(lista[i]) == angular.toJson(elemento))
                        return true;
                }
            }
            return resultado;
        }

    }

    export interface ICVSeleccionable {
        seleccionado: boolean;
    }


    export interface IDetalleRouteParams extends ng.route.IRouteParamsService {
        identificador: string;
        objeto: Object;
        
    }
    //export interface
    
    
	/** 
	* ServicioCache: 
	*	Clase para la gestión de la caché de la aplicación.
	**/
	export interface ICVServicioCache{
		
		_cache:{ [key:string]: any; };
		
		// Almacena un objeto en la cache
		anadirObjetoCache(clave: string, valor: any);
		
		// Recupera un objeto de la cache
		// En caso de no existir el objeto devuelve null
		recuperarObjetoCache(clave:string):any;
		
		// Devuelve si existo un objeto en la cache con la clave indicada
		existeObjetoCache(clave:string):boolean;
		
		// Elimina un objeto de la cache dada su clave
		eliminarObjetoCache(clave:string);
		
		// Limpia la cache. Elimina todos los objeto de la cache
		limpiarCache();

        // Fijar el numero de version
    	setVersionApp(version:string);

        // Recuperar el numero de version    	
    	getVersionApp():string;
        
	}  
	
    export class CVServicioCache implements ICVServicioCache{
 
        public static CLAVE_VERSION_APP="cvVersionAPP";

 		_cache:{ [key:string]: any; };
 
 		constructor() {
 			this._cache={};
        }
 	
		
		public anadirObjetoCache(clave: string, valor: any){
			if(!cvUtil.Utilidades.comprobarObjetoVacio(valor)){
				this._cache[clave]=valor;
			}
		}
		

		public recuperarObjetoCache(clave:string):any{
			var v:any=this._cache[clave];
			if(cvUtil.Utilidades.comprobarObjetoVacio(v))
				v=null;
			return v;
		}
		
		// Devuelve si existo un objeto en la cache con la clave indicada
		public existeObjetoCache(clave:string):boolean{
			var v:any=this._cache[clave];
			if(cvUtil.Utilidades.comprobarObjetoVacio(v))
				return false;
			return true;
		}
		
		// Elimina un objeto de la cache dada su clave
		public eliminarObjetoCache(clave:string){
			if(!cvUtil.Utilidades.comprobarObjetoVacio(this._cache[clave]))
                this._cache[clave]=null;
		}
		
		// Limpia la cache. Elimina todos los objeto de la cache
		public limpiarCache(){
			this._cache={};
		}

    	public setVersionApp(version:string){
    		this.anadirObjetoCache(CVServicioCache.CLAVE_VERSION_APP,version);
    	}
    	
    	public getVersionApp():string{
    		return <string> this.recuperarObjetoCache(CVServicioCache.CLAVE_VERSION_APP); 
    	}         
    	
    }

    
	/** 
	* ServicioConfiguracion: 
	*	Clase la configuración de la aplicacion.
	**/    
	export interface ICVServicioConfiguracion{
		
		configuracion:CVConfiguracion;        
	}   

	export class CVServicioConfiguracion implements ICVServicioConfiguracion{
		
	    configuracion:CVConfiguracion=new CVConfiguracion();

        constructor(conf: CVConfiguracion) {
            this.configuracion=conf;            
        }        

	}   

    // Clase donde almacenar todas las posibles propiedades de configuracion de la aplicacion
    export class CVConfiguracion{
        gridHeaderCellTemplate:string='/views/templates/lib/civica/cv-grid-header-cell.html';
        gridRowTemplate:string='/views/templates/lib/civica/cv-grid-row.html';
        urlBaseWS: string = "/services";
        urlBase: string = "";
    }  

} 