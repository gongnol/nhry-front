(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('InproStockEditCtrl', InproStockEditCtrl);

    InproStockEditCtrl.$inject = ['$alert','$scope', '$state', '$uibModal', 'restService'];

    function InproStockEditCtrl($alert,$scope, $state, $uibModal, rest) {
    	var vm = this;
    	vm.canclSave = true;
    	//console.log($state.params);
    	if($state.params.status==='30'){
    		vm.canclSave = false;
    	}
		 rest.findGiOrderItem($state.params.stockId).then(function(json) {
                vm.content = json.data;
                for(var idx = 0;idx<vm.content.length;idx++){
                	if(vm.content[idx].confirmQty==undefined){
                		vm.content[idx].confirmQty = vm.content[idx].qty;
                	}
                	
             	}
            });
		 $scope.inportStockAdding = false;
		 $scope.inportStockForm =function(){
		 	$scope.inportStockAdding = true;
		 	////console.log(vm.content);
		 	rest.updateGiOrderItems(vm.content).then(function(json){
	 			if(json.type == 'success'){
	                    var alert = $alert({
	                        content: '保存成功!',
	                        container: '#modal-alert'
	                    })
	                    alert.$promise.then(function () {
	                        alert.show();
	                    })
	                   
	                }
	            }, function (reject) {
	                //console.log(reject);
	                    var alert = $alert({
	                        content: reject.data.msg,
	                        container: '#modal-alert'
	                    })
	                    alert.$promise.then(function () {
	                        alert.show();
	                    })
            })
		 }

    }
})();