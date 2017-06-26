/**
 * @name config
 *
 * 配置文件
 */

(function() {
	'use strict';
	angular
	  .module('newhope')
	  .config(config);

	config.$inject = ['$alertProvider'];

	function config($alertProvider) {
		angular.extend($alertProvider.defaults, {
			animation: 'am-fade-and-slide-top',
			placement: 'top', 
			type: 'info', 
			show: false, 
			duration: 5, 
			container: '#body-alert'
		});
	}
})();