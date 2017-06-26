/**
 * @ngdoc Service
 * @name nh_tableService
 *
 * 远程请求服务
 */
(function() {
	'use strict';

	angular
 	  .module('newhope')
 	  .provider('nhHttp', function() {
 	  	this.$get = function($resource, $q) {
 	  		var lgServ = {};
 	  		lgServ.get = function (preUrl, url, args, isArray) {
				var defered = $q.defer();
				var res = $resource(preUrl + url, args);
				if (isArray) {
					res.query(function (data) {
						defered.resolve(data);
					}, function (error) {
						defered.reject();
					})
				} else {
					res.get(function (data) {
						defered.resolve(data);
					}, function (error) {
						defered.reject();
					})
				}

				return defered.promise;
			};
 	  		return lgServ;
 	  	}
 	  });

})();