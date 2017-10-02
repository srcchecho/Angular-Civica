/// <reference path="../_app.ts" />
var app;
(function (app) {
    var cities = [
        {
            place: 'Civica Software',
            desc: 'Civica Software',
            lat: 37.198153,
            long: -3.623433
        }
    ];
    'use strict';
    angular.module('app', ['ngRoute', 'ngMaterial', 'jkAngularCarousel'])
        .service('cvPruebasBaseController', app.CvPruebasBaseController)
        .controller('index', app.IndexController)
        .controller('main', app.MainController)
        .controller('navController', app.NavController)
        .controller('MyCtrl', app.homeCtrl)
        .controller('aboutCtrl', app.aboutCtrl)
        .controller('contactCtrl', app.contactCtrl)
        .service('servicioAlbums', app.ServicioAlbums)
        .config(function ($mdIconProvider) {
        $mdIconProvider
            .iconSet('call', 'img/icons/sets/communication-icons.svg', 24);
    })
        .config(['$routeProvider', function routes($routeProvider) {
            $routeProvider
                .when("/", {
                templateUrl: "./pages/home.htm",
                controller: "main"
            })
                .when("/about", {
                templateUrl: "./pages/about.htm"
            })
                .when("/portafolio", {
                templateUrl: "./pages/portafolio.htm"
            })
                .when("/servicios", {
                templateUrl: "./pages/servicios.htm"
            })
                .when("/contact", {
                templateUrl: "./pages/contact.htm"
            })
                .otherwise({
                templateUrl: "./pages/home.htm"
            });
        }])
        .controller('MapController', function ($scope) {
        var mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(37.198153, -3.623433),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        $scope.markers = [];
        var infoWindow = new google.maps.InfoWindow();
        var createMarker = function (info) {
            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.lat, info.long),
                title: info.place
            });
            marker.content = '<div class="infoWindowContent">' + info.desc + '<br />' + info.lat + ' E,' + info.long + ' N, </div>';
            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.setContent('<h2>' + marker.title + '</h2>' +
                    marker.content);
                infoWindow.open($scope.map, marker);
            });
            $scope.markers.push(marker);
        };
        for (var i = 0; i < cities.length; i++) {
            createMarker(cities[i]);
        }
        $scope.openInfoWindow = function (e, selectedMarker) {
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        };
    })
        .config(function ($mdIconProvider) {
        $mdIconProvider
            .iconSet("call", 'img/icons/sets/communication-icons.svg', 24)
            .iconSet("social", 'img/icons/sets/social-icons.svg', 24);
    })
        .controller('BasicDemoCtrl', function DemoCtrl($mdDialog) {
        var originatorEv;
        this.openMenu = function ($mdMenu, ev) {
            originatorEv = ev;
            $mdMenu.open(ev);
        };
        this.notificationsEnabled = true;
        this.toggleNotifications = function () {
            this.notificationsEnabled = !this.notificationsEnabled;
        };
        this.redial = function () {
            $mdDialog.show($mdDialog.alert()
                .targetEvent(originatorEv)
                .clickOutsideToClose(true)
                .parent('body')
                .title('Suddenly, a redial')
                .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
                .ok('That was easy'));
            originatorEv = null;
        };
        this.checkVoicemail = function () {
            // This never happens.
        };
    });
})(app || (app = {}));
