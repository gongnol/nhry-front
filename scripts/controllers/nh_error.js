/**
 * @ngdoc Controller
 * @name nh_login
 *
 * 错误处理控制器
 */
 (function() {
 	'use strict';
 	/**
 	*  Module
 	*
 	* Description
 	*/
 	angular
 	  .module('newhope')
 	  .controller('ErrorCtrl', ['$scope', '$stateParams', function($scope, $stateParams){
 	  	var vm = $scope;
 	  	var errType = $stateParams.errType;

        vm.showErrMsg = function () {
            var typeRes = 0;
            if (errType == 'NoSalesOrg') {
                typeRes =  1;
            }
            return typeRes;
        }
 	  }]);
 })();