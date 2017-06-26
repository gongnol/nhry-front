/**
 * @ngdoc overview
 * @name app
 *
 * 应用主模块定义
 */
(function () {
    'use strict';
    angular
        .module('newhope', [
            'ngAnimate',
            'ngResource',
            'ngSanitize',
            'ui.router',
            'ngStorage',
            'ngStore',
            'oc.lazyLoad',
            'mgcrea.ngStrap',
            'restangular',
            'ngMessages'
        ]);
})();