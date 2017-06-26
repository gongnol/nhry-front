(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('orderDetailCtrl', orderDetailCtrl);

	orderDetailCtrl.$inject = ['$scope','$state', '$stateParams', '$alert', 'restService'];

	function orderDetailCtrl($scope, $state, $stateParams,$alert, rest) {

		var vm = $scope;
		/*订单号*/
		vm.orderNo = $stateParams.orderNo;
		vm.orderDetail = {};

		rest.orderDetail(vm.orderNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.orderDetail = json.data;

            }else{
            	var saveAlert = $alert({
					content: '加载失败！' + result.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function () {
	                saveAlert.show();
	            })
            }
        });

		vm.dateFormat = function(start,end){
            // if ('ActiveXObject' in window) {
            //     return start.slice(0, 10) + ' 至 ' + end.slice(0, 10);
            // } else {
            //     var date1 = new Date(start);
	           //  var y1 = date1.getFullYear();
	           //  var m1 =date1.getMonth() + 1 <10 ? '0'+ (date1.getMonth() + 1) : date1.getMonth() + 1;
	           //  var d1 = date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate();
	           //  var date2 = new Date(end);
	           //  var y2 = date2.getFullYear();
	           //  var m2 = date2.getMonth() + 1 <10 ? '0'+ (date2.getMonth() + 1) : date2.getMonth() + 1;
	           //  var d2 = date2.getDate() < 10 ? '0' + date2.getDate() : date2.getDate();
	           //  return y1 + '-' + m1 + '-' + d1 + ' 至 ' + y2 + '-' + m2 + '-' + d2;
            // }
            if (start && end && typeof(start) === 'string' && typeof(end) === 'string') { 
                return moment(start).format('YYYY-MM-DD') + ' 至 ' + moment(end).format('YYYY-MM-DD');
            } else {
                return '';
            }
		}

		vm.dateFormat2 = function(start){
			// if (!start) {
			// 	return "";
			// }

			// if ('ActiveXObject' in window) {
   //              return start.slice(0, 10);
   //          } else {
   //              var date = new Date(start);
   //              var y = date.getFullYear();
   //              var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
   //              var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
   //              return y + '-' + m + '-' + d;
   //          }
            if (start && typeof(start) === 'string') { 
                return moment(start).format('YYYY-MM-DD');
            } else {
                return '';
            }
		}

        vm.closePage = function(){
            history.back();
        }

        vm.editOrder = function(){
        	$state.go("newhope.orderEdit",{orderNo:vm.orderNo});
        } 

	}

	
})();