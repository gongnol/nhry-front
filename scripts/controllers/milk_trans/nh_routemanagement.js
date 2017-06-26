(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('routeManagementCtrl', routeManagementCtrl);

	routeManagementCtrl.$inject = ['$locale','$state', '$resource','$scope','$uibModal','tableService'];

	function routeManagementCtrl($locale, $state, $resource, $scope, $uibModal, tableService) {

        var vm = $scope;

        /*选中的table行*/
        vm.dt = {};
        vm.dt.checked = [];
        vm.removeAllSelectedRoute = function(){
            alert(vm.dt.checked);
        }

		/*angular-table*/ 
	    vm.search = {};
        /**/
	    vm.message = '';
		var tableUrl = '/price/search';
        vm.dtOptions = tableService.dtOps(vm, tableUrl);
        vm.dtColumns = [
            tableService.dtCol('id', '奶站名称'),
            tableService.dtCol('priceGroup', '路线名称').notSortable(),
            tableService.dtCol('id', '订单数').notSortable().renderWith(nullMap),
            tableService.dtCol('id', '送奶员').notSortable().renderWith(nullMap),
            tableService.dtCol('endDate', '创建日期').notSortable().renderWith(timeMap),
            tableService.dtCol(null, '操作').notSortable().renderWith(actionsHtml),
            tableService.dtCol(null, '<input type="checkbox">').notSortable().renderWith(actionCheckbox),
        ];
	    function actionsHtml(data, type, full, meta) {
	        return '<div class="button"> <button ng-click="editRoute(' + data.id + ')" class="btn btn-sm blueLt">' +
                   '编辑</button></div>';
	    }
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
        }

        vm.editRoute = function(data){
            $state.go("newhope.transpathEdit");
        };
        vm.addRoute = function(data){
            $state.go("newhope.transpathAdd");
        };
        
	}

	
})();