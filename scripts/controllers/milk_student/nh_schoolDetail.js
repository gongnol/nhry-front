(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('SchoolDetailCtrl', SchoolDetailCtrl);

	SchoolDetailCtrl.$inject = ['$state', '$stateParams', '$scope', '$alert', '$uibModal', 'restService'];
	function SchoolDetailCtrl($state, $stateParams, $scope, $alert, $uibModal, rest) {

        var vm = $scope;
		vm.schoolCode = $stateParams.schoolCode;
	}

})();