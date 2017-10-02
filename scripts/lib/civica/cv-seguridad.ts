/// <reference path="cv-util.ts" />
module cvSeguridad {
    'use strict';


    export class CVSeguridadService {

        public static $inject = [
            '$rootScope',
            '$location',
            'mensajePopup',
            'cvPopup',
            '$filter',
            'uiGridExporterConstants',
            'uiGridExporterService',
            '$mdDialog',
            '$timeout'
        ];

        constructor() {

        }
    }

    export interface IUsuario {
        perfil: IPerfil;
    }



    export interface IPerfil {
        funcionalidades: Array<IFuncionalidad>;
    }

    export interface IFuncionalidad {
        nombre: string;        
    }

    export interface IServicioSeguridad {
    	
    	
        // Array<IUsuario>        
        extraerUsuarioIdentificado(successCallback: Function);
        
        //
        compruebaFuncionalidadPerfilUsuario(usuario: cvSeguridad.IUsuario, funcionalidad: string): boolean;
    }


    export class ServicioSeguridadBase extends cvUtil.ServicioBase implements IServicioSeguridad {        

        constructor($http: ng.IHttpService, $location: ng.ILocationService, url: string, mensajePopup: cvUtil.MensajePopUp, private servicioCache: ServicioSeguridadCache,$rootScope:cvController.ICVBaseControllerRootScope) {
            super($http, $location, url, mensajePopup,servicioCache,$rootScope);
        }
          		
        // Array<IUsuario>
        public extraerUsuarioIdentificado(successCallback: Function) {
            // Comprobar la cache
            if (this.servicioCache.existeUsuarioIdentificado()) {
                successCallback(this.servicioCache.getUsuarioIdentificado());
            } else {
                this.getUsuarioIdentificado((data: IUsuario) => {
                	this.servicioCache.setUsuarioIdentificado(data);
                    successCallback(data);
                });
            }
        }

        // IUsuario        
        public getUsuarioIdentificado(successCallback: Function) {
              successCallback(null);
            /*this.ejecutarGet("/getUsuarioIdentificado", (data: IUsuario) => {
                successCallback(data);
            });*/
        }

        public compruebaFuncionalidadPerfilUsuario(usuario: IUsuario, funcionalidad: string): boolean {
            //usuario.forEach((perfil: IPerfil) => {
            if(cvUtil.Utilidades.comprobarObjetoVacio(usuario))
                return false;

            if (this.compruebaFuncionalidadPerfil(usuario.perfil, funcionalidad))
                return true;

            return false;
        }


        public compruebaFuncionalidadPerfil(perfil: IPerfil, funcionalidad: string): boolean {
            var result: boolean = false;
            // obtiene las funcionalidades del perfil del usuario y determina si tiene 
            // la funcionalidad necesaria buscada            
            var funcionalidades: Array<IFuncionalidad> = perfil.funcionalidades;
            funcionalidades.forEach((funcionalidadUsuario: IFuncionalidad) => {
            	if(this.comprobarMapeoFunciones(this.getNombreFuncionalidad(funcionalidadUsuario),funcionalidad)){
                //if (funcionalidadUsuario.nombre == funcionalidad) {
                    result = true;
                }
            });
            return result;
        }
        
        public getMapeoFunciones(): { [key:string]: Array<string>; } {
        	 var mapeo:{ [key:string]: Array<string>; }={};
        	
        	return mapeo;
        }
        
        public getNombreFuncionalidad(f:IFuncionalidad):string{
        	return f.nombre;
        }
        
		/**
		 * Comprueba si una funcion de la interfaz está dentro de una funcionalidad
		 * definida en la base de datos.
		 */ 
		public comprobarMapeoFunciones(funcion:string,funcionalidad:string):boolean{
			
			var mapeo:{ [key:string]: Array<string>; }=this.getMapeoFunciones();
			var funciones:Array<string>=mapeo[funcion];
			if(cvUtil.Utilidades.comprobarObjetoVacio(funciones))
				return false;
			for(var i:number=0;i<funciones.length;i++)
				if(funciones[i]==funcionalidad)
					return true;
					
			return false;			
		}        
    }
    
    export class ServicioSeguridadCache extends cvUtil.CVServicioCache{
    	
    	public static CLAVE_USUARIO="cvSegUsuario";
    	
    	public setUsuarioIdentificado(usuario:IUsuario){
    		this.anadirObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO,usuario);
    	}
    	
    	public getUsuarioIdentificado():IUsuario{
    		return <IUsuario> this.recuperarObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO); 
    	}
    	
    	public existeUsuarioIdentificado():boolean{
    		return this.existeObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO); 
    	}    	
    	
    }

}