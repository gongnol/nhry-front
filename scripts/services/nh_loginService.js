/**
 * @ngdoc Service
 * @name loginService
 *
 * 登录服务
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
 	  .provider('loginService', function() {
 	   	  	this.$get = ['$resource', '$q', function($resource, $q) {
 	   	  		var lgServ = {};
 	   	  		lgServ.login = function(name, passwd, preUrl) {
 	   	  			var deffered = $q.defer();
 	   	  			var res = $resource(preUrl + '/user/doLogin', {}, {
 	   	  				login: {
 	   	  					method: 'POST'
 	   	  				}
 	   	  			});
 	   	  			//console.log(res);
 	   	  			res.login({}, {
 	   	  				loginName: name,
 	   	  			  	password: passwd
 	   	  			}, function(data) {
 	   	  			  	deffered.resolve(data);
 	  	  			}, function(error) {
 	  	  				alert(error.data.msg);
 	  	  			  	deffered.reject();
 	  	  		    });
 	  
 	   	  			return deffered.promise;
 	   	  		};
 	   	  		return lgServ;
 	   	  	}];
 	   	  });
 })();