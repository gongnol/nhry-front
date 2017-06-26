/**
 * @ngdoc Controller
 * @name nh_login
 *
 * 登录控制器
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
 	  .controller('LoginCtrl', ['$rootScope', '$scope', '$state','$sessionStorage', 'loginService', 'restService', function($rootScope, $scope, $state, $sessionStorage, loginService, rest){
 	  	var vm = $scope;
 	  	vm.login = function() {
 	  		var promise = loginService.login(vm.user.name, vm.user.passwd, vm.app.preUrl);
 	  		promise.then(function(data) {
 	  			if (data == null) {
                    alert("用户不存在");
                }
                if (data.type !== "success") {
                    alert("用户不存在" + data.status);
                } else {
                   // alert("success");
                	// $rootScope.user = vm.user;
                	$sessionStorage.user = data.data;
                	rest.getRoleRescpt().then(function (json) {
                        $rootScope.$storage.accLists = json.data;
                        $rootScope.access.setAccLists(json.data);
                        //console.log($rootScope.$storage);
                    })
                    // rest.getRoleRespage().then(function (json) {
                    //     var urls = json.data.map(function (ele) {
                    //         return ele.resUrl;
                    //     })
                    //     $rootScope.$storage.pageLists = urls.filter(function (ele) {
                    //         return ele ? true : false;
                    //     })
                    // })
                    $state.go('newhope.home');
                }
 	  		})
 	  	};

 	  	vm.idmLogin = function () {
 	  		rest.setDefHeader('dh-token', '-1');
 	  		$state.go('login', {}, {reload: true});
 	  	}
 	  }]);
 })();