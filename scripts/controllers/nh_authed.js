(function() {
	'use strict';
	/**
	*  Module
	*
	* Description
	*/
	angular
	  .module('newhope')
	  .controller('AuthedCtrl', ['$location', '$state', function($location, $state){
	  	// history.replaceState({}, '', '#/newhope/home');
        $location.skipReload().url('/newhope').replace();
        $state.go('newhope.home');
	  }]);
})();