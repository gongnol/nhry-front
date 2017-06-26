(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('routeEditCtrl', routeEditCtrl)
      .controller('routeEditSubCtrl', routeEditSubCtrl);

	routeEditCtrl.$inject = ['$locale','$state', '$resource','$scope','$uibModal','tableService'];

	function routeEditCtrl($locale, $state, $resource, $scope, $uibModal, tableService) {

        var vm = $scope;

        /*选中的table行*/
        vm.dt = {};
        vm.dt.checked = [];

        vm.$on('transfer.data', function(event, data) {  
            alert("下方传入:"+data);
            vm.dtInstance.reloadData();
        });
        vm.refreshDownTable = function() {  
          $scope.transferData = vm.dt.checked;  
          $scope.$broadcast('transfer.data2', $scope.transferData);  
        };   

		/*angular-table*/ 
	    vm.params = {};
        /**/
	    vm.message = '';
		var tableUrl = '/price/search';
        vm.dtOptions = tableService.dtOps(vm, tableUrl);
        vm.dtColumns = [
            tableService.dtCol('id', '订单编号'),
            tableService.dtCol('priceGroup', '订户姓名').notSortable().renderWith(nullMap),
            tableService.dtCol('id', '联系电话').notSortable().renderWith(nullMap),
            tableService.dtCol('id', '小区名称').notSortable().renderWith(nullMap),
            tableService.dtCol('endDate', '创建日期').notSortable().renderWith(timeMap),
            tableService.dtCol('status', '订单状态').notSortable().renderWith(nullMap),
            tableService.dtCol(null, '<input type="checkbox">').notSortable().renderWith(actionCheckbox),
        ];
        function actionCheckbox(data, type, full, meta) {
            return '<div><input type="checkbox" data-row="' + data.id + '"></div>';
        }
	    function nullMap(data) {
            if(!data) {
                return '未知';
            }else {
                return data;
            }
        }
        function timeMap(data) {
            if(!data) {
                return '未知';
            }else {
                return data.substring(0,10);
            }
        }
        vm.dtInstanceCallback = function(dtInstance) {
            vm.dtInstance = dtInstance;
        };

        
	}

    function routeEditSubCtrl($locale, $state, $resource, $scope, tableService) {

        var vm = $scope;
        vm.statuses = {
            data:[
            {"code":"1","text":"状态1"}, 
            {"code":"2","text":"状态2"},
            {"code":"3","text":"状态3"}]
        };

        /*选中的table行*/
        vm.dt = {};
        vm.dt.checked = [];
        
        vm.refreshUpTable = function() {  
          $scope.transferData = vm.dt.checked;  
          $scope.$emit('transfer.data', $scope.transferData);  
        };
        vm.$on('transfer.data2', function(event, data) {  
            alert("上方传入:"+data);
            vm.dtInstance.reloadData();
        });  

        /*angular-table*/ 
        vm.search = {};
        /**/
        vm.message = '';
        var tableUrl = '/price/search';
        vm.dtOptions = tableService.dtOps(vm, tableUrl);
        vm.dtColumns = [
            tableService.dtCol('id', '订单编号'),
            tableService.dtCol('priceGroup', '订户姓名').notSortable().renderWith(nullMap),
            tableService.dtCol('id', '联系电话').notSortable().renderWith(nullMap),
            tableService.dtCol('id', '小区名称').notSortable().renderWith(nullMap),
            tableService.dtCol('endDate', '创建日期').notSortable().renderWith(timeMap),
            tableService.dtCol('status', '订单状态').notSortable().renderWith(nullMap),
            tableService.dtCol(null, '<input type="checkbox">').notSortable().renderWith(actionCheckbox),
        ];
        function actionCheckbox(data, type, full, meta) {
            return '<div><input type="checkbox" data-row="' + data.id + '"></div>';
        }
        function nullMap(data) {
            if(!data) {
                return '未知';
            }else {
                return data;
            }
        }
        function timeMap(data) {
            if(!data) {
                return '未知';
            }else {
                return data.substring(0,10);
            }
        }
        vm.dtInstanceCallback = function(dtInstance) {
            vm.dtInstance = dtInstance;
        };
        vm.reloadTable = function(){alert("查询结果,条件:" + JSON.stringify(vm.search));
            vm.dtInstance.reloadData();
        };

        
    }

	
})();