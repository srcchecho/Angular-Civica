/// <reference path="_cv-app.ts" />
var cvUtil;
(function (cvUtil) {
    'use strict';
    /**
    * ServicioBase:
    *	Clase de la que deben heradar todos los servicio.
    * 	Entre otras cosas, captura los mensajes de error y los muestra al usuario.
    **/
    var ServicioBase = (function () {
        function ServicioBase($http, $location, url, mensajePopup, servicioCache, $rootScope) {
            this.$location = $location;
            this.$rootScope = $rootScope;
            //private URL_BASE: string = "http://172.17.24.11:8080/testWebApp/services";
            //private URL_BASE: string = "http://172.17.24.18:8080";
            //private URL_BASE: string = "http://172.17.24.153:8080/sgeeco";
            this.URL_BASE = "";
            this.urlServicio = "";
            this.httpService = $http;
            this.urlServicio = this.getURLBaseServicios($location) + url;
            //this.urlServicio = this.URL_BASE + url;
            this.mensajePU = mensajePopup;
            this.sCache = servicioCache;
        }
        ServicioBase.prototype.ejecutarPost = function (url, data, successCallback, bloquearEspera) {
            var _this = this;
            if (bloquearEspera === void 0) { bloquearEspera = false; }
            this.$rootScope.bloquearVentanaEspera = bloquearEspera;
            this.httpService.post(this.urlServicio + url, data)
                .success(function (data) {
                _this.$rootScope.bloquearVentanaEspera = false;
                if (_this.comprobarIdentificado(data))
                    successCallback(data);
            })
                .error(function (data, status) {
                _this.$rootScope.bloquearVentanaEspera = false;
                _this.manejaErrorServidor(data, status);
            });
        };
        ServicioBase.prototype.ejecutarGet = function (url, data, successCallback, bloquearEspera) {
            var _this = this;
            if (bloquearEspera === void 0) { bloquearEspera = false; }
            this.$rootScope.bloquearVentanaEspera = bloquearEspera;
            var url_final;
            if (!cvUtil.Utilidades.comprobarObjetoNulo(data))
                url_final = this.urlServicio + url + "/" + data;
            else
                url_final = this.urlServicio + url;
            this.httpService.get(url_final)
                .success(function (data) {
                _this.$rootScope.bloquearVentanaEspera = false;
                if (_this.comprobarIdentificado(data))
                    successCallback(data);
            })
                .error(function (data, status) {
                _this.$rootScope.bloquearVentanaEspera = false;
                _this.manejaErrorServidor(data, status);
            });
        };
        ServicioBase.prototype.comprobarIdentificado = function (data) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(data)
                && typeof data == 'string' && data.indexOf("ERR001: Usuario no Identificado") != -1) {
                this.mensajePU.mostrarError("Sesión expirada", "Su sesión actual ha expirado.\nPulse Aceptar para identificarse de nuevo", undefined, this.reiniciarSesion);
                return false;
            }
            return true;
        };
        ServicioBase.prototype.getURLBaseServicios = function ($location) {
            //var urlWS = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            var urlWS = "";
            var contextPath = $location.absUrl(); // will tell you the current path
            var partes = contextPath.split('/');
            if (partes.length >= 3) {
                // Si el context path es /
                if (partes[3] == 'views' || partes[3] == 'login.jsp')
                    return urlWS + "";
                else
                    return urlWS + "/" + partes[3];
            }
            return urlWS;
        };
        ServicioBase.prototype.manejaErrorServidor = function (data, status) {
            if (status == 401) {
                this.mensajePU.mostrarError("Sesión expirada", "Su sesión actual ha expirado.\nPulse Aceptar para identificarse de nuevo", undefined, this.reiniciarSesion);
                return;
            }
            else if (status == 404) {
                this.mensajePU.mostrarError("Servicio no encontrado", "No se pudo acceder al servicio solicitado: " + this.urlServicio);
                return;
            }
            else {
                this.mensajePU.mostrarError("Error en la ejecución", this.getMensajeError(data));
                return;
            }
        };
        ServicioBase.prototype.getMensajeError = function (data) {
            var salida = "";
            if (typeof data != 'undefined') {
                var posIni = data.indexOf('.SGEEcoException:');
                // Si no hay fault es que se trata de un error general
                if (posIni == -1) {
                    salida = "Se ha producido un error general durante el procesamiento de su solicitud.<br>Vuelva a intentar la operación y si el problema persiste contacte con el Administrador del Sistema.";
                }
                else {
                    salida = data.substring(posIni + 18, data.length);
                    posIni = salida.indexOf('<br/>');
                    salida = salida.substring(0, posIni);
                    var lines = salida.split('\n');
                    salida = lines[0];
                }
            }
            return salida;
        };
        ServicioBase.prototype.reiniciarSesion = function (data) {
            window.location.href = "/login.jsp";
            ///this.$location.path("/");
        };
        ServicioBase.prototype.ejecutarMetodo = function (p, successCallback, bloquearEspera) {
            var _this = this;
            if (bloquearEspera === void 0) { bloquearEspera = false; }
            // Si hay caché se devuelve directamente
            if (!cvUtil.Utilidades.comprobarObjetoVacio(p.claveCache) &&
                this.sCache.existeObjetoCache(p.claveCache) && !p.refrescarCache) {
                successCallback(this.sCache.recuperarObjetoCache(p.claveCache));
            }
            else {
                if (p.tipo == ParamMetodo.TIPO_POST) {
                    this.ejecutarPost(p.url, p.param, function (data) {
                        _this.procesarSalidaMetodo(p, data, successCallback);
                    }, bloquearEspera);
                }
                else {
                    this.ejecutarGet(p.url, p.param, function (data) {
                        _this.procesarSalidaMetodo(p, data, successCallback);
                    }, bloquearEspera);
                }
            }
        };
        ServicioBase.prototype.procesarSalidaMetodo = function (p, data, successCallback) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(data)) {
                var salida = null;
                if (p.tipoSalida == ParamMetodo.TIPO_SALIDA_RAW)
                    salida = data;
                else if (p.tipoSalida == ParamMetodo.TIPO_SALIDA_ARRAY)
                    salida = cvUtil.Utilidades.copiarArrayObjetos(data, p.tipoObjeto);
                else if (p.tipoSalida == ParamMetodo.TIPO_SALIDA_OBJECT)
                    salida = cvUtil.Utilidades.crearObjetoPropiedades(data, p.tipoObjeto);
                if (!cvUtil.Utilidades.comprobarObjetoVacio(p.claveCache))
                    this.sCache.anadirObjetoCache(p.claveCache, salida);
                successCallback(salida);
            }
            else
                successCallback(null);
        };
        return ServicioBase;
    }());
    cvUtil.ServicioBase = ServicioBase;
    var ParamMetodo = (function () {
        function ParamMetodo() {
            this.refrescarCache = false;
        }
        return ParamMetodo;
    }());
    ParamMetodo.TIPO_POST = "post";
    ParamMetodo.TIPO_GET = "get";
    ParamMetodo.TIPO_SALIDA_RAW = "raw";
    ParamMetodo.TIPO_SALIDA_ARRAY = "arr";
    ParamMetodo.TIPO_SALIDA_OBJECT = "obj";
    cvUtil.ParamMetodo = ParamMetodo;
    /**
    * CVPopUp: Muestra una pagina en Pop Up.
    * Servirá para abrir cualquier componente en Popup
    **/
    var CVPopUp = (function () {
        function CVPopUp($mdDialog, servicioCache) {
            this.servicioCache = servicioCache;
            this.mdDialog = $mdDialog;
        }
        // Si se quiere que no haya botones se pasa el parametros como vacio
        CVPopUp.prototype.mostrar = function (templateURL, param, callback) {
            var _this = this;
            if (param === void 0) { param = null; }
            if (callback === void 0) { callback = CVPopUp.prototype.cerrarVentanaDefault; }
            var dg = this.mdDialog.show({
                //controller: DialogController,
                controller: ['$scope', function ($scope) {
                        //$scope.titulo = titulo;
                        $scope.esPopup = true;
                        $scope.param = param;
                        $scope.volver = function (param) {
                            _this.mdDialog.hide(param);
                        };
                    }],
                templateUrl: cvUtil.Utilidades.getPlantilla(templateURL, this.servicioCache),
                parent: angular.element(document.body),
                //clickOutsideToClose: true,
                skipHide: true,
            }).then(function (answer) {
                callback(answer);
            }, function () {
                callback('');
            });
            return dg;
        };
        CVPopUp.prototype.cerrarVentanaDefault = function (param) {
        };
        CVPopUp.prototype.cerrar = function (dg) {
            this.mdDialog.hide(dg);
        };
        return CVPopUp;
    }());
    cvUtil.CVPopUp = CVPopUp;
    /**
    * MensajePopUp:
    *	- Clase con la ventana de mensaje Popup generica.
    **/
    var MensajePopUp = (function () {
        function MensajePopUp(ngDialog, $mdDialog, $sce, tURL) {
            if (tURL === void 0) { tURL = ""; }
            this.ngDialog = ngDialog;
            this.$mdDialog = $mdDialog;
            this.$sce = $sce;
            //dialog: angular.dialog.IDialogService;
            //mdDialog: any;
            this.templateURL = "";
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
            this.preMensaje = '<md-dialog class="cv-ventana-mensaje">' +
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
            this.botonesTemplate = "";
            this.postMensaje = '</p>' +
                '</div>' +
                '<div flex="10"></div>' +
                '</div>' +
                '<md-divider></md-divider>' +
                '</md-dialog-content>' +
                '<md-dialog-actions layout="row" layout-align="center center">';
            this.postBotones = '</md-dialog-actions>' +
                '</form>' +
                '</md-dialog>';
            //this.dialog = ngDialog;
            //this.mdDialog = $mdDialog;
            this.templateURL = tURL;
        }
        MensajePopUp.prototype.cerrar = function (dg) {
            this.$mdDialog.hide(dg);
        };
        // Si se quiere que no haya botones se pasa el parametros como vacio
        MensajePopUp.prototype.mostrar = function (tipo, titulo, mensaje, botones, callback) {
            var _this = this;
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.botonesTemplate = "";
            console.log(tipo);
            if (typeof botones == 'undefined') {
                if (tipo == MensajePopUp.TIPO_CONFIRM) {
                    botones = [['Cancelar', 'eliminar.svg', 'md-default cancelar', 'N'], ['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }
                else if (tipo == MensajePopUp.TIPO_BAJA) {
                    botones = [['Cancelar', 'eliminar.svg', 'md-default cancelar', 'N'], ['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }
                else if (tipo == MensajePopUp.TIPO_ERROR) {
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }
                else if (tipo == MensajePopUp.TIPO_MENSAJE) {
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal aceptar', 'S']];
                }
                else {
                    botones = [['Aceptar', 'aceptar.svg', 'md-principal cancelar', 'S']];
                }
            }
            botones.forEach(function (infoBoton) {
                _this.botonesTemplate += '<md-button ng-click="volver(\'' + infoBoton[3] + '\')" class="md-raised botones ' + infoBoton[2] + '">' +
                    '<md-icon md-svg-src="../imagenes/' + infoBoton[1] + '" class="name"></md-icon> ' + infoBoton[0] +
                    '</md-button>';
            });
            var dg = this.$mdDialog.show({
                //controller: DialogController,
                controller: ['$scope', function ($scope) {
                        $scope.titulo = titulo;
                        $scope.tipo = tipo;
                        $scope.botones = botones;
                        $scope.mensaje = _this.$sce.trustAsHtml(mensaje);
                        $scope.volver = function (param) {
                            //return $scope.closeThisDialog();
                            _this.$mdDialog.hide(param);
                            //$mdDialog.hide( alert, "finished" );
                        };
                    }],
                templateUrl: this.templateURL,
                template: this.preMensaje + mensaje + this.postMensaje + this.botonesTemplate + this.postBotones,
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                skipHide: true
            }).then(function (answer) {
                callback(answer);
                //  $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                callback('');
                //status = 'You cancelled the dialog.';
            });
            return dg;
        };
        MensajePopUp.prototype.cerrarVentanaDefault = function (param) {
        };
        MensajePopUp.prototype.mostrarInfo = function (titulo, mensaje, botones, callback) {
            if (botones === void 0) { botones = undefined; }
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.mostrar(MensajePopUp.TIPO_INFO, titulo, mensaje, botones, callback);
        };
        MensajePopUp.prototype.mostrarError = function (titulo, mensaje, botones, callback) {
            if (botones === void 0) { botones = undefined; }
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.mostrar(MensajePopUp.TIPO_ERROR, titulo, mensaje, botones, callback);
        };
        MensajePopUp.prototype.mostrarPregunta = function (titulo, mensaje, botones, callback) {
            if (botones === void 0) { botones = undefined; }
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.mostrar(MensajePopUp.TIPO_CONFIRM, titulo, mensaje, botones, callback);
        };
        MensajePopUp.prototype.darBaja = function (titulo, mensaje, botones, callback) {
            if (botones === void 0) { botones = undefined; }
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.mostrar(MensajePopUp.TIPO_BAJA, titulo, mensaje, botones, callback);
        };
        MensajePopUp.prototype.mostrarMensaje = function (titulo, mensaje, botones, callback) {
            if (botones === void 0) { botones = undefined; }
            if (callback === void 0) { callback = MensajePopUp.prototype.cerrarVentanaDefault; }
            this.mostrar(MensajePopUp.TIPO_MENSAJE, titulo, mensaje, botones, callback);
        };
        return MensajePopUp;
    }());
    MensajePopUp.TIPO_INFO = "info";
    MensajePopUp.TIPO_ERROR = "error";
    MensajePopUp.TIPO_CONFIRM = "confirm";
    MensajePopUp.TIPO_BAJA = "baja";
    MensajePopUp.TIPO_MENSAJE = "mensaje";
    cvUtil.MensajePopUp = MensajePopUp;
    /**
    * VENTANA ESPERA:
    * Ventana de espera durante la ejecución de una llamada
    * Se realiza a travez de un provider
    **/
    var VentanaEspera = (function () {
        //$rootScope: ng.IScope;
        //public static $inject = ['$rootScope', '$q'];
        function VentanaEspera(rs, $q, url) {
            var _this = this;
            this.rs = rs;
            this.$q = $q;
            this.SERVICE_URL = "/services";
            this._total = 0;
            this._completed = 0;
            this.request = function (config) {
                if (!config.notBusy &&
                    config.url.indexOf(_this.SERVICE_URL) != -1) {
                    _this.rs.$broadcast('busy.begin', { url: config.url, name: config.name });
                    _this._total++;
                }
                return config || _this.$q.when(config);
            };
            this.response = function (response) {
                // $rootScope.$emit("error.ws");
                _this.handleResponse(response);
                return response;
            };
            this.responseError = function (rejection) {
                _this.rs.$emit("error.ws");
                _this.handleResponse(rejection);
                return _this.$q.reject(rejection);
            };
            this.SERVICE_URL = url;
            //console.log(rs);
        }
        VentanaEspera.prototype.complete = function () {
            this._total = this._completed = 0;
        };
        VentanaEspera.prototype.handleResponse = function (r) {
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
        };
        VentanaEspera.prototype.outstanding = function () {
            return this._total - this._completed;
        };
        return VentanaEspera;
    }());
    cvUtil.VentanaEspera = VentanaEspera;
    /**
    * Metodos estaticos de utilidades varias
    * NOTA: No relacionado con angular (¿ponerlo como un servicio angular?)
    **/
    var Utilidades = (function () {
        function Utilidades() {
        }
        // Version especifica de la plantilla
        Utilidades.getPlantilla = function (plantilla, servicioCache) {
            return plantilla + "?v" + servicioCache.getVersionApp();
        };
        ;
        /**
        * Recupera el context path de la URL actual
        */
        Utilidades.getContextPath = function () {
            var urlWS = "";
            var contextPath = window.location.href;
            var partes = contextPath.split('/');
            if (partes.length >= 3)
                // Si el context path es /
                if (partes[3] == 'views')
                    return urlWS + "";
                else
                    return urlWS + "/" + partes[3];
            return urlWS;
        };
        Utilidades.comprobarEntero = function (data) {
            var n = parseInt(data);
            if (!isNaN(n))
                return true;
            return false;
        };
        Utilidades.comprobarObjetoVacio = function (data) {
            if (data == null || typeof data == 'undefined' || data.toString() == '')
                return true;
            return false;
        };
        Utilidades.comprobarObjetoNulo = function (data) {
            if (data == null || typeof data == 'undefined')
                return true;
            return false;
        };
        Utilidades.padCeros = function (numero, ancho) {
            var result = "";
            var numeroStr = "" + numero;
            for (var i = 0; i < ancho - numeroStr.length; i++) {
                result += "0";
            }
            result += numeroStr;
            return result;
        };
        // Transformacion de un listado de objetos
        Utilidades.copiarArrayObjetos = function (lista, tipo) {
            var salida = null;
            if (lista != null && typeof lista != 'undefined' && lista.length > 0) {
                salida = new Array();
                for (var i = 0; i < lista.length; i++) {
                    salida.push(Utilidades.crearObjetoPropiedades(lista[i], tipo));
                }
            }
            return salida;
        };
        Utilidades.copiarArrayObjetosNoNulo = function (lista, tipo) {
            var lista = Utilidades.copiarArrayObjetos(lista, tipo);
            if (lista == null)
                return new Array();
            else
                return lista;
        };
        /**
        * Copiar todas las propiedades de un objeto en otro
        **/
        Utilidades.copiarPropiedades = function (origen, destino) {
            var complejo = false;
            for (var k in origen) {
                complejo = false;
                //console.log("Del objeto "+origen+" va a copiar la propiedad "+k.toUpperCase()+' del tipo '+typeof origen[k]);
                if (typeof origen[k] == 'object' || Array.isArray(origen[k])) {
                    //console.log('La propiedad '+k.toUpperCase()+' es compleja.. habría que copiarla con crearObjetoPropiedades '+typeof origen[k]);
                    // Comprobar si tiene la funcion para recuperar el tipo de los objetos complejos
                    //var tipo=eval(destino+'.getTipoComplejo(\''+k+'\')');
                    if (typeof destino.getTipoComplejo == 'function') {
                        var tipo = destino.getTipoComplejo(k);
                        //console.log('La propiedad '+k.toUpperCase()+' => '+tipo);
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(tipo)) {
                            //console.log('La propiedad '+k.toUpperCase()+' tiene un tipo correcto '+tipo);
                            // Depende si es un array o un objeto
                            complejo = true;
                            if (Array.isArray(origen[k]))
                                destino[k] = Utilidades.copiarArrayObjetos(origen[k], tipo);
                            else
                                destino[k] = Utilidades.crearObjetoPropiedades(origen[k], tipo);
                        }
                    }
                }
                if (!complejo && origen.hasOwnProperty(k))
                    destino[k] = origen[k];
            }
        };
        /**
        * Copiar todas las propiedades de un listado
        **/
        Utilidades.copiarListaPropiedades = function (origen, destino, propiedades) {
            if (Utilidades.comprobarObjetoVacio(propiedades)) {
                Utilidades.copiarPropiedades(origen, destino);
            }
            else {
                propiedades.forEach(function (propiedad) {
                    if (origen.hasOwnProperty(propiedad))
                        destino[propiedad] = origen[propiedad];
                });
            }
        };
        /**
        * Copiar todas las propiedades de un objeto en otro
        **/
        Utilidades.crearObjetoPropiedades = function (origen, tipoDestino) {
            var s = eval('new ' + tipoDestino + '()');
            Utilidades.copiarPropiedades(origen, s);
            // if (typeof testObj.callableFunction == 'function') { Comprobar si tiene una funcion
            return s;
        };
        /**
         * Dado un objeto crea un xml a partir de todas sus propiedades
         */
        Utilidades.transformarObjetoXML = function (objeto, nodoRaiz) {
            var salida = "<" + nodoRaiz + ">";
            var complejo = false;
            for (var k in objeto) {
                if (!cvUtil.Utilidades.comprobarObjetoVacio(objeto[k])) {
                    if (typeof objeto[k] == 'object') {
                        salida += Utilidades.transformarObjetoXML(objeto[k], k);
                    }
                    else if (Array.isArray(objeto[k])) {
                        // Por el momento nada
                    }
                    else if (objeto.hasOwnProperty(k)) {
                        salida += "<" + k + ">" + objeto[k] + "</" + k + ">";
                    }
                }
            }
            salida += "</" + nodoRaiz + ">";
            return salida;
        };
        /**
        * Dado un objeto y un listado devuelve la posicion del objeto
        * comparando por el campo que se indica.
        * Devuelve -1 si no se encuentra
        **/
        Utilidades.getPosicion = function (elemento, lista, campo) {
            if (Utilidades.comprobarObjetoVacio(elemento) || Utilidades.comprobarObjetoVacio(lista))
                return -1;
            for (var i = 0; i < lista.length; i++) {
                if (campo.length == 1) {
                    if (elemento[campo[0]] == lista[i][campo[0]])
                        return i;
                }
                else {
                    if ((elemento[campo[0]] == lista[i][campo[0]]) && elemento[campo[1]] == lista[i][campo[1]])
                        return i;
                }
            }
            return -1;
        };
        /**
        * Dado un objeto y un listado devuelve el objeto dentro del listado
        * comparando por el campo que se indica.
        * Es decir, aquel elemento del listado que tiene el mismo valor en el campo indicado.
        * Devuelve -1 si no se encuentra
        **/
        Utilidades.getElementoListado = function (elemento, lista, campo) {
            /* if(campo.length == 1)*/
            var posicion = Utilidades.getPosicion(elemento, lista, campo);
            /*else
                var posicion: number = Utilidades.getPosicionArrayCampo(elemento, lista, campo);*/
            if (posicion == -1)
                return null;
            return lista[posicion];
        };
        /**
        * Elimina un elemento de un listado dado el campo de comparacion
        * En caso de no encontrarse no lo elimina
        **/
        Utilidades.eliminarElemento = function (elemento, lista, campo) {
            var posicion = Utilidades.getPosicion(elemento, lista, campo);
            if (posicion >= 0) {
                lista.splice(posicion, 1);
            }
        };
        /**
        * Utilidades para el grid
        **/
        //pone en blanco el filtro
        Utilidades.detectarFiltro = function (param) {
            if (param != null) {
                if (!$('.' + param).hasClass('icono-filtro-seleccionado')) {
                    $('.' + param).addClass('icono-filtro-seleccionado');
                    $('.' + param).removeClass('icono-filtro');
                }
            }
        };
        //esta funcion me actualiza el boton a negro cuando se queda vacio el input
        Utilidades.botonFiltroPorDefecto = function (param) {
            if ($('.' + param).hasClass('icono-filtro-seleccionado')) {
                $('.' + param).removeClass('icono-filtro-seleccionado');
                $('.' + param).addClass('icono-filtro');
            }
        };
        //esconder multiselect
        Utilidades.esconderMultiselect = function () {
            /*if ($('div').hasClass('ui-grid-cell-contents-Mostrar')) {
                $('.ui-grid-cell-contents-Mostrar').addClass('ui-grid-cell-contents');
                $('.ui-grid-cell-contents-Mostrar').removeClass('ui-grid-cell-contents-Mostrar');
            }*/
        };
        //mostrar multiselect
        Utilidades.mostrarMultiselect = function () {
            /*if ($('div').hasClass('ui-grid-cell-contents')) {
                $('.ui-grid-cell-contents').addClass('ui-grid-cell-contents-Mostrar');
                $('.ui-grid-cell-contents').removeClass('ui-grid-cell-contents');
            }*/
        };
        // Recalcular el alto de la tabla
        Utilidades.getAltoCabecera = function (prefijo) {
            if ($('#' + prefijo + 'tablaPeticion1'))
                return parseInt($('#' + prefijo + 'tablaPeticion1').css('height'));
            else
                return 0;
            /*if($('.ui-grid:first')){
                var heightCabecera:number=parseInt($('.ui-grid:first').css('height'));;
                var heightTabla:number=parseInt($('.ui-grid:first').css('height'));
                if ($('#tablaPeticion1').hasClass('headerTablaPeticion1')) {
                }else{
                }
            }*/
        };
        //despliega la tabla cuando aparece el filtro
        Utilidades.gridAnchoTabla = function () {
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
        };
        // El nombre del campo en el grid puede ser el nombre de una funcion. Esto le elimina la parte de los parentesis
        Utilidades.nombreCampoGrid = function (idgrid, nc) {
            var s = nc;
            if (!Utilidades.comprobarObjetoVacio(nc)) {
                var i = nc.indexOf('(');
                if (i != -1) {
                    s = nc.substring(0, i);
                }
                // Si tiene puntos (objeto complejo) se sustutuye por _
                s = s.replace(/\./g, '_');
            }
            // Añadir como prefijo el id del grid y un prefijo cv 
            s = 'cvgrid-' + idgrid + '-' + s;
            return s;
        };
        /**
         * Recupera el valor de un campo de un objeto.
         * Si es un objeto complejo navega hasta encontrar el campo.
         * Si el no se puede navegar hasta el valor se devuelve null.
         */
        Utilidades.getValorCampo = function (item, campo) {
            if (cvUtil.Utilidades.comprobarObjetoVacio(item) || cvUtil.Utilidades.comprobarObjetoVacio(item))
                return null;
            var cadenas = campo.split('.');
            var salida = item;
            cadenas.forEach(function (cadena) {
                salida = salida[cadena];
                if (cvUtil.Utilidades.comprobarObjetoVacio(salida)) {
                    salida = null;
                    return salida;
                }
            });
            return salida;
        };
        Utilidades.ordenarFechaStringFn = function (valor1, valor2) {
            //var f1:Date=cvUtil.Utilidades.;
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor1)
                && cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 0;
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor1))
                return -1;
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 1;
            var m1 = moment(valor1, 'DD/MM/YYYY');
            var m2 = moment(valor2, 'DD/MM/YYYY');
            if (cvUtil.Utilidades.comprobarObjetoVacio(m1)
                && cvUtil.Utilidades.comprobarObjetoVacio(m2))
                return 0;
            if (cvUtil.Utilidades.comprobarObjetoVacio(m1))
                return -1;
            if (cvUtil.Utilidades.comprobarObjetoVacio(m2))
                return 1;
            if (m1.isBefore(m2))
                return -1;
            else if (m2.isBefore(m1))
                return 1;
            return 0;
        };
        Utilidades.ordenarNumeroStringFn = function (valor1, valor2) {
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor1)
                && cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 0;
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor1))
                return -1;
            if (cvUtil.Utilidades.comprobarObjetoVacio(valor2))
                return 1;
            var n1 = parseInt(valor1);
            var n2 = parseInt(valor2);
            if (isNaN(n1)
                && isNaN(n2))
                return 0;
            if (isNaN(n1))
                return -1;
            if (isNaN(n2))
                return 1;
            if (n1 < n2)
                return -1;
            else if (n2 < n1)
                return 1;
            return 0;
        };
        Utilidades.prototype.ordenarNumeroString = function (lista, campo, reverse) {
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
            if (reverse)
                lista.reverse();
            return lista;
        };
        /** Para los selectores multiples **/
        // Recupera un array de los elementos seleccionados. 
        //En caso no existir nunguno devuelve un array vacio
        Utilidades.getElementosSeleccionados = function (lista) {
            var salida = new Array();
            if (!Utilidades.comprobarObjetoVacio(lista)) {
                lista.forEach(function (el) {
                    if (el.seleccionado)
                        salida.push(el);
                });
            }
            return salida;
        };
        // Elimina todas las marcas de elementos seleccionados
        Utilidades.limpiarElementosSeleccionados = function (lista) {
            if (!Utilidades.comprobarObjetoVacio(lista)) {
                lista.forEach(function (el) {
                    el.seleccionado = false;
                });
            }
        };
        // Convierte una imagen en su representación en Base64
        Utilidades.imageToBase64 = function (url, callback, outputFormat) {
            if (outputFormat === void 0) { outputFormat = "image/png"; }
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                var im = this;
                canvas.height = im.height;
                canvas.width = im.width;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        };
        // Dado un listado y un elemento devuelve si el elemento está contenido en el listado 
        Utilidades.contiene = function (lista, elemento) {
            var resultado = false;
            if (lista.length > 0) {
                for (var i = 0; i < lista.length; i++) {
                    if (angular.toJson(lista[i]) == angular.toJson(elemento))
                        return true;
                }
            }
            return resultado;
        };
        return Utilidades;
    }());
    cvUtil.Utilidades = Utilidades;
    var CVServicioCache = (function () {
        function CVServicioCache() {
            this._cache = {};
        }
        CVServicioCache.prototype.anadirObjetoCache = function (clave, valor) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(valor)) {
                this._cache[clave] = valor;
            }
        };
        CVServicioCache.prototype.recuperarObjetoCache = function (clave) {
            var v = this._cache[clave];
            if (cvUtil.Utilidades.comprobarObjetoVacio(v))
                v = null;
            return v;
        };
        // Devuelve si existo un objeto en la cache con la clave indicada
        CVServicioCache.prototype.existeObjetoCache = function (clave) {
            var v = this._cache[clave];
            if (cvUtil.Utilidades.comprobarObjetoVacio(v))
                return false;
            return true;
        };
        // Elimina un objeto de la cache dada su clave
        CVServicioCache.prototype.eliminarObjetoCache = function (clave) {
            if (!cvUtil.Utilidades.comprobarObjetoVacio(this._cache[clave]))
                this._cache[clave] = null;
        };
        // Limpia la cache. Elimina todos los objeto de la cache
        CVServicioCache.prototype.limpiarCache = function () {
            this._cache = {};
        };
        CVServicioCache.prototype.setVersionApp = function (version) {
            this.anadirObjetoCache(CVServicioCache.CLAVE_VERSION_APP, version);
        };
        CVServicioCache.prototype.getVersionApp = function () {
            return this.recuperarObjetoCache(CVServicioCache.CLAVE_VERSION_APP);
        };
        return CVServicioCache;
    }());
    CVServicioCache.CLAVE_VERSION_APP = "cvVersionAPP";
    cvUtil.CVServicioCache = CVServicioCache;
    var CVServicioConfiguracion = (function () {
        function CVServicioConfiguracion(conf) {
            this.configuracion = new CVConfiguracion();
            this.configuracion = conf;
        }
        return CVServicioConfiguracion;
    }());
    cvUtil.CVServicioConfiguracion = CVServicioConfiguracion;
    // Clase donde almacenar todas las posibles propiedades de configuracion de la aplicacion
    var CVConfiguracion = (function () {
        function CVConfiguracion() {
            this.gridHeaderCellTemplate = '/views/templates/lib/civica/cv-grid-header-cell.html';
            this.gridRowTemplate = '/views/templates/lib/civica/cv-grid-row.html';
            this.urlBaseWS = "/services";
            this.urlBase = "";
        }
        return CVConfiguracion;
    }());
    cvUtil.CVConfiguracion = CVConfiguracion;
})(cvUtil || (cvUtil = {}));
