(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('updateEmpCtrl', updateEmpCtrl);

 	updateEmpCtrl.$inject = ['$alert','$compile', '$state','$scope','$http', '$resource', '$uibModal','restService','nhCommonUtil'];

	function updateEmpCtrl($alert,$compile,$state, $scope, $http,$resource, $uibModal,rest,nhCommonUtil) {

		 var vm = $scope;
         rest.empitem($state.params.empNo).then(function (json) {
                vm.edm = json.data.emp;
                //alert(nhCommonUtil.offsetDay(json.data.emp.joinDate, 0));
                 vm.edm.joinDate = nhCommonUtil.offsetDay(json.data.emp.joinDate, 0); 
                  vm.edm.leaveDate = nhCommonUtil.offsetDay(json.data.emp.leaveDate, 0); 
              //  vm.edm.joinDate = vm.dateFormat(json.data.emp.joinDate)
         });


		vm.handle = {
            statuses: [{
                code: '0',
                label: '离职'
            }, {
                code: '1',
                label: '在职'
            }]
        };
       	vm.returnBack = function (){
			$state.go('newhope.empinfo');
		}

		vm.update = function(){
			rest.saveEmpSalarymet(vm.edm).then(function(json){
				if(json.type=='success'){
						var alert = $alert({
							content: '更新用户信息成功',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})							
					}
			},function(reject){
					var alert = $alert({
							content: '更新用户信息失败'+reject.data.msg,
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})		
			})
		}


		  vm.dateFormat = function (dateStr) {
            // if ('ActiveXObject' in window) {
            //     return dateStr.slice(0, 10);
            // } else {
            //     var date = new Date(dateStr);
            //     var y = date.getFullYear();
            //     var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
            //     var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            //     return y + '-' + m + '-' + d;
            // }
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

	}

	

})();