
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('DealerInfoCtrl', DealerInfoCtrl);

	DealerInfoCtrl.$inject = ['$scope', '$stateParams', '$alert', '$uibModal', '$state', 'restService'];
	function DealerInfoCtrl($scope, $stateParams, $alert, $uibModal, $state, rest) {
		var pvm = this;
		 var vm = $scope;
		 vm.info = {};
		 vm.dealer = {};
		 pvm.content = []; //定义的需要数据的集合，
		 pvm.milkinfoPageno = 1; // 初始化页码为1
		 pvm.total_count = 0; //页码总数
         pvm.itemsPerPage = 5; //每页显示条数
     
		vm.returnBack = function (){
			$state.go('newhope.dealerlist');
		}
 		//获取经销商信息
        rest.getDealerInfo($stateParams.dealerNo).then(function(json){
        	vm.dealer = json.data;
        })

  		//查找该经销商下的奶站信息
        pvm.getData = function(pageno) {
            var params = {
            	dealerNo:$stateParams.dealerNo,
                pageNum: pageno,
                pageSize: pvm.itemsPerPage
            }
            rest.branchs(params).then(function(json) {
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
            });
        };
		
        pvm.getData(pvm.milkinfoPageno);  

    }
		
})();	