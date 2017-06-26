(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('schoolMilkProductCtrl', schoolMilkProductCtrl);
	schoolMilkProductCtrl.$inject = ['$scope','$state', '$resource','$alert','$uibModal','restService'];
	function schoolMilkProductCtrl($scope, $state, $resource, $alert, $uibModal, rest) {
        $scope.isSearch = false;
        $scope.search = {};
        $scope.doSearch = function () {
            vm.curPageno = 1;
            vm.getData(1);
        }
        var vm = this;
        vm.tbLoding = 1; // 数据表加载状态，-1初始状态，1加载中，0加载完成
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 6; //每页显示条数
        vm.getData = function(pageno){ 
        	vm.content = [];
           	vm.tbLoding = 1;
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                keyWord:$scope.search.keyWord
            };
            rest.findMaraStudAllPage(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
       } 
       vm.getData(vm.pageno);
       $scope.saveAll = function(){
       	if(vm.content != null && vm.content != []){
       		$.each(vm.content, function(k, v) {
       			$scope.save(v);
       		});
       	}
       }
       $scope.save=function(item){
	    	 rest.saveMaraStud(item).then(function (json) {
	        	var myalert = $alert({
	        		content:'保存成功',
	        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
	        },function(json){
	        	var myalert = $alert({
	        		content:json.data.msg,
	        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
	        });
        }
	}

})();