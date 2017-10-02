/// <reference path="cv-util.ts" />
var cvDirectives;
(function (cvDirectives) {
    'use strict';
    // Para la creacion de las directivas hemos seguido este ejemplo: 
    // http://blog.aaronholmes.net/writing-angularjs-directives-as-typescript-classes/
    /*export interface ICVFormDirectiveScope extends ng.IScope {
        $evalAsync: Function;
    }
*/
    var CVFormDirective = (function () {
        // @ngInject
        function CVFormDirective($location, $rootScope, $compile, $timeout, $window) {
            this.$location = $location;
            this.$rootScope = $rootScope;
            this.$compile = $compile;
            this.restrict = "A";
            this.priority = 2000;
            // It's important to add `link` to the prototype or you will end up with state issues.
            // See http://blog.aaronholmes.net/writing-angularjs-directives-as-typescript-classes/#comment-2111298002 for more information.
            CVFormDirective.prototype.link = function (scope, element, attrs, ctrl) {
                //console.log("CVFormDirective.prototype.link....Atributes: " + attrs.cv-form);
                angular.element(document).ready(function () {
                    var selects = element.find('md-select');
                    console.log("Element ready...." + selects.length);
                });
                angular.element(window).bind('load', function () {
                    console.log("Window load....");
                });
                scope.$evalAsync(function ($scope) {
                    console.log("$evalAsync");
                });
                $timeout(function () {
                    $timeout(function () {
                        var selects = element.find('md-select');
                        console.log('Selects en TO3=' + selects.length);
                    }, 0, false);
                }, 0, false);
                // Si se cambian atributos de angular es necesario recompilar
                var necesitaCompilar = false;
                var elFormulario = element[0];
                //alert('E=' + element);
                var objFormulario = scope.$eval(elFormulario.name);
                // Relaciona el nombre del input con el label de su campo
                var labelsCampos = new Object();
                // Recupera el tipo de cada uno de los campos
                var tiposCampos = new Object();
                // Para los inputs y los selects se busca su label para añadir el nombre al input
                // Además, se añade una clase a los label de los campos obligatorios
                var inputs = element.find("input");
                var labels = element.find('label');
                var selects = element.find('md-select');
                var radios = element.find('md-radio-group');
                var dates = element.find('md-datepicker');
                var datesPicker = element.find('mdp-date-picker');
                var textarea = element.find("textarea");
                var e = document.querySelectorAll('div[ng-if]');
                var ifs = angular.element(element[0].querySelector('[ng-if]'));
                var elementos = new Array();
                for (var i = 0; i < inputs.length; i++)
                    elementos.push(inputs[i]);
                for (var i = 0; i < selects.length; i++) {
                    elementos.push(selects[i]);
                    console.log(elementos);
                }
                for (var i = 0; i < radios.length; i++)
                    elementos.push(radios[i]);
                for (var i = 0; i < dates.length; i++)
                    elementos.push(dates[i]);
                for (var i = 0; i < datesPicker.length; i++)
                    elementos.push(datesPicker[i]);
                for (var i = 0; i < textarea.length; i++)
                    elementos.push(textarea[i]);
                //inputs.concat(selects);
                //inputs.
                for (var i = 0; i < elementos.length; i++) {
                    var input = elementos[i];
                    //console.debug("Input " + i);
                    if (typeof input.attributes['tipo'] != 'undefined') {
                        var tipo = input.attributes['tipo'].value;
                        tiposCampos[input.id] = tipo;
                        // Dependiendo del tipo se añade el patrón correspondiente
                        if (tipo == 'integer') {
                            // Esto no funciona si no compilas y al compilar se duplica el campo
                            //input.setAttribute('ng-pattern', '/^\d+$/');
                        }
                    }
                    var label = null;
                    for (var j = 0; j < labels.length; j++) {
                        var l = labels[j];
                        //console.log('Label:' + labels[j] + " = " + l.htmlFor + " => " + input.id);
                        if (l.htmlFor == input.id)
                            label = l;
                    }
                    if (label != null) {
                        input.setAttribute('cv-form-label', label.innerHTML);
                        labelsCampos[input.id] = label.innerHTML;
                        if ((typeof input.attributes['ng-required'] != 'undefined' && input.attributes['ng-required'].value == 'true') ||
                            (typeof input.attributes['required'] != 'undefined' && input.attributes['required'].value == 'true')) {
                            label.className += " cv-form-obligatorio";
                        }
                    }
                    // Buscar su label. Si tiene un tributo label usa ese
                    if (typeof input.attributes['label'] != 'undefined') {
                        labelsCampos[input.id] = input.attributes['label'].value;
                    }
                }
                objFormulario['labelsCampos'] = labelsCampos;
                objFormulario['tiposCampos'] = tiposCampos;
                if (necesitaCompilar) {
                    //alert('Compilar');
                    //this.$compile(element.contents())(scope);
                }
                // El evento submit para añadir css de error a cada uno de los campos
                element.on('submit', function () {
                    //alert('Submit');
                });
            };
        }
        CVFormDirective.Factory = function () {
            var directive = function ($location, $rootScope, $compile, $timeout, $window) {
                return new CVFormDirective($location, $rootScope, $compile, $timeout, $window);
            };
            directive['$inject'] = ['$location', '$rootScope', '$compile', '$timeout', '$window'];
            return directive;
        };
        return CVFormDirective;
    }());
    cvDirectives.CVFormDirective = CVFormDirective;
    /***
     * @name Directiva dropDown filtro de las tablas
     * @author civica
     * @version 1.0
     * @param cvIcono : Parámetro string con el nombre del icono que mostrará el filtro
     * @param cvMostrar : Parámetro de scope local que muestra en la directiva la selección realizada en el filtro
     * @param cvArray : Parámetro que contiene un array con los datos que se mostraran en el filtro
     * @param cvTituloComponente : Parametro que asigna el nombre a la directiva
     * @param cvId : Parámetro opcional que asigna el id que queremos seleccionar dentro del array
     * @param cvTipo : Parámetro utilizado para tipos especiales que cambian la lógica de los datos tales como la fecha o el estado
     * @param buscar : Parámetro string que contiene el texto de la búsqueda dentro de la directiva, se controla dentro de la directiva y se envia a través del parámetro modelValue al exterior
     * @param dropMuestra : Parámetro boolean que muestra u oculta la directiva
     * @param textoTodos : Parámetro boolean que controla si se muestra el texto de todos o no
     * @param foco : Parámetro que controla el foco del input
     * @param cvClic : Parámetro boolean que controla el clic dentro de la directiva para que no haya conflicto con la seleccion múltiple de varias directivas iguales
     * @param cvActivo : Parámetro para controlar que no aparezca información en el filtro cuando todavía no haya información
     * @param estadoFiltro : Controla si el filtro se muestra o no se muestra
     * @param cvTipoProductoTodo : Utilizado exclusivamente en gestión de envases, devuelve un valor boolean cuando pulsamos en el filtro Formato en la opción Todos
     * @param cvTodos : Oculta la opcion todos del dropdown
     * @param cvClass : Añade una clase personalizada, por ejemplo, cv-dropdown-pequeno
     * @param cvTipoDefault : Añade una cadena despues de tipo, por ejemplo, al crear usuario para que salga el primer rol.
     * @return modelValue : Parámetro que devuelve la información seleccionada en la directiva
     *
     * @return cvFiltrar : Prueba ng-click filtrar
     * */
    var CVDropDownDirective = (function () {
        function CVDropDownDirective(servicioCache, $mdpDatePicker, $mdMenu) {
            this.servicioCache = servicioCache;
            this.scope = {
                modelValue: '=ngModel',
                cvIcono: '=',
                cvMostrar: '=',
                cvArray: '=',
                cvTituloComponente: '=',
                cvId: '=',
                cvTipo: '=',
                buscar: '=',
                dropMuestra: '=?bind',
                textoTodos: '=?bind',
                foco: '=?bind',
                cvClic: '=',
                cvActivo: '=',
                estadoFiltro: '=',
                cvTipoProductoTodo: '=?bind',
                cvTodos: '=?bind',
                cvClass: '=',
                cvTipoDefault: '=',
                cvFiltrar: '='
            };
            this.template = '<div id="salirFormulario">\
                            <md-menu id="posicionBotonFiltroPrincipal{{::getQuitarEspaciosTipo()}}" md-position-mode="target target bottom" md-offset="{{::seleccionarTamanioRol}}">\
                                <md-button id="tamanioFiltro" class="cv-dropdown {{::cvClass}}" ng-click="mostrar($mdOpenMenu, $event,getQuitarEspaciosTipo())">\
                                    <div layout="row" class="cv-display-center">\
                                        <i class="cv-icon-filtro {{::icono}}"></i>\
                                        <div class="cv-container-text-button"><span class="cv-title-button-filtro">{{::cvTituloComponente}}</span> <br><span ng-show="!tipo" id="textoTipoPordefecto">{{cvTipoDefault}}</span>{{tipo}}</div>\
                                        <i ng-show="iconoFiltroFlecha" class="cv-icon-filtro icon-desplegar"></i>\
                                        <i ng-click="refrescarFecha();$event.stopPropagation();" ng-show="iconoFiltroRefrescar" class="cv-icon-filtro icon-flecha-reset"></i>\
                                    </div>\
                                </md-button>\
                                <md-menu-content ng-show="ocultarFecha" id="tamanioItemMenu" class="dropdown-opciones-contenedor" width="2">\
                                    <div id="{{::getQuitarEspaciosTipo()}}">\
                                        <md-menu-item id="{{ngClick}}" style="margin-bottom: 3px;">\
                                            <input ng-focus="inputSeleccionado();" ng-model="buscar" type="search" placeholder="Buscar" class="demo-header-searchbox md-text cv-buscador-directiva" autofocus>\
                                        </md-menu-item>\
                                        <div class="scroll-contenedor">\
                                            <md-menu-item ng-hide="true"><md-button>null</md-button>\</md-menu-item>\
                                            <md-menu-item ng-show="{{::cvTodos}}" ng-click="seleccionTodos()">\
                                                <md-button class="md-select-opcion filtroGlobal" id="{{::todos}}{{::getQuitarEspaciosTipo()}}" ng-focus="onFocus(getQuitarEspaciosTipo(),todos);">Todos</md-button>\
                                            </md-menu-item>\
                                            <md-menu-item ng-repeat="dato in cvArray | filter : buscar" ng-click="seleccion(getLabel(dato));">\
                                                <md-button ng-click="{{::cvFiltrar}}" class="md-select-opcion filtroGlobal" id="{{::getLabelEfectoSeleccionar(dato,$index)}}" ng-focus="onFocus(getLabelEfectoSeleccionar(dato,$index),getQuitarEspaciosTipo());">{{::getLabel(dato)}}</md-button>\
                                            </md-menu-item>\
                                        </div>\
                                </md-menu-content>\
                            </md-menu></div>';
            CVDropDownDirective.prototype.link = function (scope, element, attrs) { };
        }
        CVDropDownDirective.prototype.controller = function ($scope, $mdpDatePicker, $mdMenu) {
            $scope.todos = "todos";
            $scope.ocultarFecha = true;
            $scope.iconoFiltroRefrescar = false;
            var cargarInput = 1;
            $scope.cvTodos = true;
            /*if($scope.cvTipo=="anio"){
                  $scope.todos=" ";
                  $scope.cvTodos= false;
            }*/
            if ($scope.cvTipo == "fecha") {
                $scope.iconoFiltroFlecha = false;
            }
            else {
                $scope.iconoFiltroFlecha = true;
            }
            if ($scope.cvClass == "cv-filter-table-ppto") {
                $scope.seleccionarTamanioRol = "0 45";
            }
            else if ($scope.cvClass == "cv-filter-table") {
                $scope.seleccionarTamanioRol = "0 50";
            }
            else {
                $scope.seleccionarTamanioRol = "0 55";
            }
            $scope.$watch("cvActivo", function (newValue, oldValue) {
                $scope.cvActivo = newValue;
                var seleccionInput = false;
                $scope.inputSeleccionado = function () {
                    seleccionInput = true;
                    if (cargarInput > 0) {
                        $scope.dropMuestra = true;
                    }
                    else {
                        $scope.dropMuestra = false;
                        cargarInput++;
                    }
                };
                $scope.onFocus = function ($event, tipo) {
                    if (tipo == "todos") {
                        var tipoTodos = $event;
                        var $eventoTodos = "todos" + $event;
                        var valor = $("#" + tipoTodos).find('.filtro-seleccionado');
                        if (valor.length > 0) {
                            valor.removeClass('filtro-seleccionado');
                            $("#" + $eventoTodos).addClass('filtro-seleccionado');
                        }
                        else {
                            $("#" + $eventoTodos).addClass('filtro-seleccionado');
                        }
                    }
                    else {
                        var valor = $("#" + tipo).find('.filtro-seleccionado');
                        if (valor.length > 0) {
                            valor.removeClass('filtro-seleccionado');
                            $("#" + $event).addClass('filtro-seleccionado');
                        }
                        else {
                            if (tipo != "Rol") {
                                $("#" + $event).addClass('filtro-seleccionado');
                            }
                            else {
                                $(".filtro-seleccionado").removeClass('filtro-seleccionado');
                                $("#" + $event).addClass('filtro-seleccionado');
                                var seleccion = "#" + $event;
                                $("#filtroRolActual").html(seleccion);
                                //solo actuara si es la pantalla de usuario
                                var valorUsuario = $("#filtroRolActual").html();
                                $(valor).addClass("filtro-seleccionado");
                            }
                        }
                    }
                    $scope.dropMuestra = true;
                };
                $scope.cerrarDropdown = function () {
                    $scope.dropMuestra = false;
                };
                $scope.refrescarFecha = function () {
                    $scope.modelValue = null;
                    $scope.tipo = "Todos";
                    $scope.iconoFiltroFlecha = false;
                    $scope.iconoFiltroRefrescar = false;
                };
                $scope.mostrar = function ($mdOpenMenu, $event, idBotonFiltro) {
                    if ($scope.cvClass == "cv-filter-table-ppto")
                        $("md-menu-content.dropdown-opciones-contenedor").css({ "max-width": $("#tamanioFiltro").width() + 20, "min-width": $("#tamanioFiltro").width() + 20, "overflow": "hidden" });
                    else if ($scope.cvClass == "cv-filter-table")
                        $("md-menu-content.dropdown-opciones-contenedor").css({ "max-width": $("#tamanioFiltro").width() - 50, "min-width": $("#tamanioFiltro").width() - 50, "overflow": "hidden" });
                    else
                        $("md-menu-content.dropdown-opciones-contenedor").css({ "max-width": $("#tamanioFiltro").width() + 10, "min-width": $("#tamanioFiltro").width() + 10, "overflow": "hidden" });
                    var padre = $("#tamanioItemMenu").parent();
                    $(".contenedor-dropdown").css({
                        "width": "auto !important"
                    });
                    $("#" + padre[0].id).addClass("contenedor-dropdown");
                    /*var originatorEv = $event;*/
                    $scope.abrirPopup($mdOpenMenu, $event);
                    if ($scope.cvActivo != false) {
                        if ($scope.cvTipo == "fecha") {
                            //$scope.ocultarFecha=false;
                            $scope.iconoFiltro = true;
                            $scope.currentDate = new Date();
                            $mdpDatePicker($scope.currentDate, {
                                targetEvent: $event
                            }).then(function (selectedDate) {
                                $scope.modelValue = (moment(selectedDate).format("DD/MM/YYYY"));
                                $scope.tipo = (moment(selectedDate).format("DD/MM/YYYY"));
                                if (!cvUtil.Utilidades.comprobarObjetoNulo(selectedDate)) {
                                    $scope.iconoFiltroFlecha = false;
                                    $scope.iconoFiltroRefrescar = true;
                                }
                            });
                            $scope.dropMuestra = false;
                        }
                        else {
                            if (seleccionInput) {
                                $scope.dropMuestra = true;
                                seleccionInput = false;
                            }
                            else {
                                $scope.dropMuestra = !$scope.dropMuestra;
                                /*if($scope.dropMuestra){
                                    $scope.cvClic=true;
                                }*/
                            }
                        }
                    }
                };
                $scope.abrirPopup = function ($mdOpenMenu, $event) {
                    if ($scope.cvTipo != "fecha") {
                        $mdOpenMenu($event);
                    }
                };
                var arrayAuxiliar = new Array();
                $scope.icono = $scope.cvIcono;
                if ($scope.cvActivo != false) {
                    $scope.tipo = "Todos";
                    $("i.cv-icon-filtro.icon-desplegar").show();
                }
                else {
                    $("i.cv-icon-filtro.icon-desplegar").hide();
                }
                $scope.getLabel = function (dato) {
                    arrayAuxiliar = dato;
                    return eval('dato.' + $scope.cvMostrar);
                };
                // Iniciar la directiva con un valor 
                if (!cvUtil.Utilidades.comprobarObjetoVacio($scope.modelValue)) {
                    $scope.tipo = $scope.getLabel($scope.modelValue);
                }
                $scope.seleccion = function (nombre) {
                    $scope.foco = false;
                    $scope.tipo = nombre;
                    $scope.modelValue = arrayAuxiliar;
                    $scope.cvClic = true;
                    //this.grid.appScope.vm.filtrar(); /*desde aqui deberiamos llamar al metodo de cvFiltrar*/
                };
                $scope.getLabelEfectoSeleccionar = function (dato, index) {
                    var valor = eval('dato.' + $scope.cvMostrar);
                    var final = valor + index;
                    String(final);
                    if (!/^([0-9])*$/.test(final)) {
                        var sinEspacios;
                        sinEspacios = final.replace(/\s/g, '');
                        return sinEspacios;
                    }
                    else {
                        return final;
                    }
                };
                $scope.getQuitarEspaciosTipo = function () {
                    var tipo = $scope.cvTituloComponente.replace(/\s/g, '');
                    var quitoPuntoTipo = tipo.replace(/\./g, '');
                    return quitoPuntoTipo;
                };
                $scope.seleccionTodos = function (array) {
                    $scope.tipo = "Todos";
                    $scope.cvClic = true;
                    if ($scope.cvId != "idFormato") {
                        $scope.modelValue = null;
                        $scope.cvTipoProductoTodo = false;
                    }
                    else {
                        $scope.cvTipoProductoTodo = true;
                        $scope.modelValue = null;
                    }
                };
            });
        };
        CVDropDownDirective.Factory = function () {
            var directive = function (servicioCache, $mdpDatePicker, $mdMenu) {
                return new CVDropDownDirective(servicioCache, $mdpDatePicker, $mdMenu);
            };
            directive['$inject'] = ['servicioCache', '$mdpDatePicker'];
            return directive;
        };
        return CVDropDownDirective;
    }());
    cvDirectives.CVDropDownDirective = CVDropDownDirective;
    var CVNumberFormatDirective = (function () {
        function CVNumberFormatDirective($location, $rootScope, $compile, $filter) {
            this.$location = $location;
            this.$rootScope = $rootScope;
            this.$compile = $compile;
            this.$filter = $filter;
            this.restrict = "A";
            this.priority = 2000;
            this.require = "ngModel";
            console.log('CVNumberFormatDirective: Inicio');
            // It's important to add `link` to the prototype or you will end up with state issues.
            // See http://blog.aaronholmes.net/writing-angularjs-directives-as-typescript-classes/#comment-2111298002 for more information.
            CVNumberFormatDirective.prototype.link = function (scope, element, attrs, ngModel, filter) {
                console.log('CVNumberFormatDirective: Link');
                var NUMBER_FORMAT = '0,0.00';
                // switch between locales
                numeral.locale('es-es');
                // De un number (o un string que debe tener formato number) a un string
                ngModel.$formatters.push(function (value) {
                    console.log('CVNumberFormatDirective: Format');
                    // Comprobar que el formato es el correcto (si es un string)
                    ngModel.$setValidity("numero", true);
                    var myNumeral = numeral(value);
                    return myNumeral.format(NUMBER_FORMAT);
                });
                // De un String a un number (o un string en formato number)                
                ngModel.$parsers.push(function (value) {
                    console.log('CVNumberFormatDirective: Parse');
                    if (cvUtil.Utilidades.comprobarObjetoVacio(value)) {
                        ngModel.$setValidity("numero", true);
                        return null;
                    }
                    var obj2 = null;
                    var myNumeral = numeral(value);
                    // Primero con una expresion regular
                    numeral.nullFormat('N/A');
                    var test = myNumeral.format(NUMBER_FORMAT);
                    if (test == 'N/A') {
                        ngModel.$setValidity("numero", false);
                    }
                    else {
                        // Parse string which can be parsed by `Date.parse` 
                        ngModel.$setViewValue(test);
                        obj2 = numeral(test).value();
                        if (!cvUtil.Utilidades.comprobarObjetoVacio(obj2))
                            ngModel.$setValidity("numero", true);
                        else
                            ngModel.$setValidity("numero", false);
                    }
                    return obj2;
                });
            };
        }
        CVNumberFormatDirective.Factory = function () {
            var directive = function ($location, $rootScope, $compile, $filter) {
                return new CVNumberFormatDirective($location, $rootScope, $compile, $filter);
            };
            directive['$inject'] = ['$location', '$rootScope', '$compile', '$filter'];
            return directive;
        };
        return CVNumberFormatDirective;
    }());
    cvDirectives.CVNumberFormatDirective = CVNumberFormatDirective;
    var CVDateFormatDirective = (function () {
        function CVDateFormatDirective($location, $rootScope, $compile, $filter) {
            this.$location = $location;
            this.$rootScope = $rootScope;
            this.$compile = $compile;
            this.$filter = $filter;
            this.restrict = "A";
            this.priority = 2000;
            this.require = "ngModel";
            console.log('CVDateFormatDirective: Inicio');
            // It's important to add `link` to the prototype or you will end up with state issues.
            // See http://blog.aaronholmes.net/writing-angularjs-directives-as-typescript-classes/#comment-2111298002 for more information.
            CVDateFormatDirective.prototype.link = function (scope, element, attrs, ngModel, filter) {
                console.log('CVDateFormatDirective: Link');
                var dateFormat = 'dd/MM/yyyy';
                ngModel.$formatters.push(function (value) {
                    console.log('CVDateFormatDirective: Format');
                    ngModel.$setValidity("fecha", true);
                    return $filter('date')(value, dateFormat);
                });
                ngModel.$parsers.push(function (value) {
                    console.log('CVDateFormatDirective: Parse');
                    if (cvUtil.Utilidades.comprobarObjetoVacio(value)) {
                        ngModel.$setValidity("fecha", true);
                        return null;
                    }
                    var obj2 = null;
                    // Primero con una expresion regular
                    var regExpStr = "\\\d{2}/\\\d{2}/\\\d{4}";
                    var regex = new RegExp(regExpStr);
                    var valido = regex.test(value);
                    if (!valido) {
                        ngModel.$setValidity("fecha", false);
                    }
                    else {
                        // Parse string which can be parsed by `Date.parse`                    
                        obj2 = moment(value, 'DD/MM/YYYY').toDate();
                        if (moment(value, 'DD/MM/YYYY').isValid())
                            ngModel.$setValidity("fecha", true);
                        else
                            ngModel.$setValidity("fecha", false);
                    }
                    return obj2;
                });
            };
        }
        CVDateFormatDirective.Factory = function () {
            var directive = function ($location, $rootScope, $compile, $filter) {
                return new CVDateFormatDirective($location, $rootScope, $compile, $filter);
            };
            directive['$inject'] = ['$location', '$rootScope', '$compile', '$filter'];
            return directive;
        };
        return CVDateFormatDirective;
    }());
    cvDirectives.CVDateFormatDirective = CVDateFormatDirective;
    var CVPaginaUI = (function () {
        //public controller:string='crearProyectoController';
        // @ngInject
        function CVPaginaUI(servicioCache, t) {
            this.servicioCache = servicioCache;
            //public $scope:ng.IScope= {};
            this.templateUrl = '';
            this.templateUrl = cvUtil.Utilidades.getPlantilla(t, this.servicioCache);
        }
        CVPaginaUI.Factory = function (t) {
            var directive = function (servicioCache) {
                return new CVPaginaUI(servicioCache, t);
            };
            directive['$inject'] = ['servicioCache'];
            return directive;
        };
        return CVPaginaUI;
    }());
    cvDirectives.CVPaginaUI = CVPaginaUI;
})(cvDirectives || (cvDirectives = {}));
