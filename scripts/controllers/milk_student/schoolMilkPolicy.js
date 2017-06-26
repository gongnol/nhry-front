/**
 * 学生奶/学校牛奶品种政策
 */
(function() {
    'use strict';
    var myApp =angular
        .module('newhope')
        .controller('schoolMilkPolicyCtrl', schoolMilkPolicyCtrl)
        .controller('tab2Ctrl', tab2Ctrl);
        
    tab2Ctrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService', '$uibModalInstance', 'pvm'];
    function tab2Ctrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, $uibModalInstance, pvm) {
    	var vm = $scope;
    	vm.order = {'schoolCode':''};
    	
    	//学校列表
	    rest.findAllSchoolWithOutSet().then(function (json) {
	        if(json.type=='success'){
				vm.schoolList=json.data;
	        }
	    },function(json){
	       var cancelAlert = $alert({
                content: '获取学校列表失败！' + json.data.msg,
                container: '#body-alert'
            });
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            });
	    });
	    
	    //保存
    	vm.save = function(){
    		if(null == vm.order.schoolCode || '' == vm.order.schoolCode){
    			var cancelAlert = $alert({
	                content: '请选择学校！',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
    		}
    		
    		$('#tab2Save').attr('disabled','disabled');
    		rest.saveschoolRule({'schoolCode':vm.order.schoolCode}).then(function(json){
    			var cancelAlert = $alert({
	                content: '保存成功！' ,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            $('#tab2Save').removeAttr('disabled');
	            $uibModalInstance.dismiss();
	            pvm.getData(1);
    		},function(json){
    			var cancelAlert = $alert({
	                content: '保存失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            $('#tab2Save').removeAttr('disabled');
    		});
    		
    	}
    	vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }
    
    schoolMilkPolicyCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService'];
    function schoolMilkPolicyCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest) {
        $scope.search = {};
        $scope.visibles = [
        	{code:'10', label:'可用'},
        	{code:'20', label:'禁用'}
        ];
        $scope.doSearch = function(){
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
                visiable:$scope.search.visiable,
                keyWord:$scope.search.keyWord
            };
            rest.findSchoolrulePage(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
       } 
       vm.getData(vm.pageno);
       $scope.chekOne=function(val,item){
        	if(val){
        		item.visiable=20;
	        	var msg="禁用成功"
        	}else{
        		item.visiable=10;
	        	var msg="解禁成功"
        	}
        	rest.saveschoolRule(item).then(function (json){
            	var myalert = $alert({
	        		content:msg,
	        		container: '#modal-alert'
        		});
        		myalert.$promise.then(function () {
               		 myalert.show();
           		 });
	 		 });
        }
        
       $scope.getMilkTypeList=function(){
	   	 rest.findMaraStudAllList().then(function (json){
			   $scope.milkTypeList=json.data
	 	 });
       }
        $scope.getMilkTypeList();
        $scope.saveAll=function(){
        	if(vm.content != null && vm.content != []){
	       		$.each(vm.content, function(k, v) {
	       			$scope.save(v);
	       		});
	       	}
        }
      	$scope.save=function(vale){
          	rest.saveschoolRule(vale).then(function (json){
            	var myalert = $alert({
	        		content:'保存成功',
	        		container: '#modal-alert'
        		});
        		myalert.$promise.then(function () {
               		 myalert.show();
           		 });
			  	//vm.getData(vm.curPageno);
	 		 });
      	}
     	$scope.editSchollInfo = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'newSchollInfo.html',
                controller: 'NewSchollInfoCtrl',
                size: 'xxl'
            });
            modalInst.result.then(function() {
            	
            });
        }
     	$scope.toTab2 = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'tab2.html',
                controller: 'tab2Ctrl',
                size: 'xxl',
                resolve: {
                    pvm:vm
                }
            });
            modalInst.result.then(function() {
            });
        }
     	
     	
    }
  
})();