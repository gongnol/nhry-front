/**
 * @ngdoc Service
 * @name nh_restService
 *
 * 远程请求服务
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.factory('accessService', accessService);

	accessService.$inject = ['$sessionStorage', 'restService']

	function accessService($sessionStorage, rest) {

		var accLists = [];

		// if($sessionStorage.user!=undefined){
            
  //           rest.getRoleRescpt().then(function (json) {
                
  //               //console.log(json.data);
  //               for (var item of json.data) {
  //               	accLists.push(item.resUrl);
  //               }
  //               //console.log(accLists);
  //           })         
  //       }

		return {
			setAccLists: function (list) {
				// accLists = list;
				if (list) {
					// IE不兼容for..of语法
					// for (var item of list) {
					// 	accLists.push(item.resUrl);
					// }
					var len = list.length;
					accLists = [];
					for (var i = 0; i < len; i++) {
						accLists.push(list[i].resUrl);
					}
				}
			},
			getAccLists: function (list) {
				return accLists;
			},
			hasAccOfThis: function (key) {
				return accLists.indexOf(key) != -1 ? true : false;
			},
			hashedToken: function (code, token, ts) {
				// var tokenStr = code + token + ts.format('YYYYMMDDHHmmss') + '{01@da99b8b994b5794094f2eae',
				// 	sa1 = '';

				// sa1 += ts.format('YYYY').slice(-1);
				// sa1 += ts.format('MM').slice(-1);
				// sa1 += ts.format('DD').slice(-1);
				// sa1 += ts.format('HH').slice(-1);
				// sa1 += ts.format('mm').slice(-1);
				// sa1 += ts.format('ss').slice(-1);

				var tokenStr = code + token + ts + '{01@da99b8b994b5794094f2eae',
					sa1 = '';

				sa1 += ts.charAt(3);
				sa1 += ts.charAt(5);
				sa1 += ts.charAt(7);
				sa1 += ts.charAt(9);
				sa1 += ts.charAt(11);
				sa1 += ts.charAt(13);

				tokenStr += sa1 + '}';

				return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(tokenStr)));

			}
		}
	}

})();