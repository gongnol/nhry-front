/**
 * 学生奶/报货设置
 */
(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('CommitMilkCtrl', CommitMilkCtrl)
        .controller('CommitStudentMilkCtrl', CommitStudentMilkCtrl)
        .controller('SetLossCtrl', SetLossCtrl)
        .controller('CommitTeacherMilkCtrl', CommitTeacherMilkCtrl)
        .controller('BatchBuildRquireMilkCtrl', BatchBuildRquireMilkCtrl);


    CommitMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil'];
    function CommitMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil) {

        var vm = $scope;
        vm.search = {};
        vm.visibles = [
        	{code:'10', label:'可用'},
        	{code:'20', label:'禁用'}
        ];
        vm.startDateStr = nhCommonUtil.offsetMon(0);
        vm.doSearch = function(){
        	vm.getData();
        }
        vm.fuzzySearch = function(e){
        	if(e && e.keyCode != '13'){
    			return;
        	}
        	vm.getData();
        }
        vm.getData = function(){
        	console.log('getData...');
        	vm.schoolList = schoolListTest;
        }
        var schoolListTest = [
	        {
	        	schoolCode:'880001',
	        	schoolName:'小星星幼儿园001',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880002',
	        	schoolName:'流结幼儿园002',
	        	visible:'0',
	        	statusStr:'禁用'
	        }
	        ,{
	        	schoolCode:'880003',
	        	schoolName:'南三环幼儿园003',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880004',
	        	schoolName:'手动星幼儿园004',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880005',
	        	schoolName:'高新区幼儿园005',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880006',
	        	schoolName:'红旗幼儿园006',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880007',
	        	schoolName:'深沉幼儿园007',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880008',
	        	schoolName:'声响幼儿园008',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880009',
	        	schoolName:'省道幼儿园009',
	        	visible:'1',
	        	statusStr:'可用'
	        }
	        ,{
	        	schoolCode:'880010',
	        	schoolName:'红旗幼儿园010',
	        	visible:'1',
	        	statusStr:'可用'
	        }
        ];
        vm.schoolList = schoolListTest;
        
        vm.schoolVisible = function(idx){
        	if(vm.schoolList[idx].visible == '1'){
        		vm.schoolList[idx].statusStr='禁用';
        		vm.schoolList[idx].visible='0';
        	}
        	else{
        		vm.schoolList[idx].statusStr='可用';
        		vm.schoolList[idx].visible='1';
        	}
        	var myalert = $alert({
        		content:'设置成功',
        		container: '#modal-alert'
        	});
        	myalert.$promise.then(function () {
                myalert.show();
            });
        }

        
        //方法:老师奶报货
        vm.commitTeacherMilk = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'commitTeacherMilk.html',
                controller: 'CommitTeacherMilkCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }
        
        //方法:损耗配置
        vm.setLoss = function(){
        	var modalInst = $uibModal.open({
                templateUrl: 'setLoss.html',
                controller: 'SetLossCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }

        //方法:学生奶报货
        vm.commitStudentMilk = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'commitStudentMilk.html',
                controller: 'CommitStudentMilkCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }
        
        //方法:批量生成要货单据
        vm.batchBuildRquireMilk = function(){
        	var modalInst = $uibModal.open({
                templateUrl: 'batchBuildRquireMilk.html',
                controller: 'BatchBuildRquireMilkCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }

    }
    
    BatchBuildRquireMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
    function BatchBuildRquireMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.startDateStr = nhCommonUtil.offsetMon(0);
        vm.buildDisable = false;
        vm.baogao = '';
        vm.milkTypeList = [
        	{code:'10', label:'套餐1'},
        	{code:'30', label:'套餐1'}
        ];
        vm.it = function(){}
        vm.i = 0;
        vm.build = function(_this){
        	if(vm.i > 0){
        		return;	
        	}
    		vm.buildDisable = true;
    		var i = vm.i;
    		var it = setInterval(function(){
    			i += 1;
    			var item = '\n正在引入'+(880000+i)+',xxx学校,饮奶特点:单一奶;\n结果: 成功';
    			
    			if(i % 5 == 0){
    				vm.baogao = item;
    			}
    			else{
    				vm.baogao += item;
    			}
    			
    			$('#baogao').val(vm.baogao);
    			
    			if(i >= 1000000){
    				console.log('pause..');
					clearInterval(it);
				}
    		},1000);
    		
        }
        vm.save = function(){
        	var myalert = $alert({
        		content:'提交成功',
        		container: '#modal-alert'
        	});
        	myalert.$promise.then(function () {
                myalert.show();
            });
        	$uibModalInstance.dismiss();
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }
    
    SetLossCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
	function SetLossCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.list = [
        	{milkCode:'', milkName:'160ml可可奶'},
        	{milkCode:'', milkName:'125ml鲜奶'},
        	{milkCode:'', milkName:'150ml学生鲜奶'},
        	{milkCode:'', milkName:'160mk乳酸钙奶'},
        	{milkCode:'', milkName:'160ml果缘'}
        ];
        vm.toAdd = function(){
            vm.list.push({milkCode:'', num:''});
        }
        vm.milkTypeList = [
        	{code:'10', label:'150ml可可奶'},
        	{code:'20', label:'180ml鲜奶'},
        	{code:'30', label:'200ml纯奶'}
        ];
        vm.save = function(){
        	var myalert = $alert({
        		content:'提交成功',
        		container: '#modal-alert'
        	});
        	myalert.$promise.then(function () {
                myalert.show();
            });
        	$uibModalInstance.dismiss();
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }
	CommitTeacherMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
	function CommitTeacherMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.list = [
        	{milkCode:'', num:''}
        ];
        vm.toAdd = function(){
            vm.list.push({milkCode:'', num:''});
        }
        vm.milkTypeList = [
        	{code:'10', label:'150ml可可奶'},
        	{code:'20', label:'180ml鲜奶'},
        	{code:'30', label:'200ml纯奶'}
        ];
        vm.createEntity = nhCommonUtil.offsetMon(0);
        vm.save = function(){
        	var myalert = $alert({
        		content:'提交成功',
        		container: '#modal-alert'
        	});
        	myalert.$promise.then(function () {
                myalert.show();
            });
        	$uibModalInstance.dismiss();
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }
	
	
    CommitStudentMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
    function CommitStudentMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.classes = [
        	{className:'小班(1)',classNum:21},
        	{className:'小班(2)',classNum:22},
        	{className:'小班(3)',classNum:20},
        	{className:'大班(1)',classNum:32},
        	{className:'大班(2)',classNum:30}
        ];
        vm.milkTypeList = [
        	{code:'10', label:'150ml可可奶'},
        	{code:'20', label:'180ml鲜奶'},
        	{code:'30', label:'200ml纯奶'}
        ];
        vm.createEntity = nhCommonUtil.offsetMon(0);
        
        vm.save = function(){
        	var myalert = $alert({
        		content:'提交成功',
        		container: '#modal-alert'
        	});
        	myalert.$promise.then(function () {
                myalert.show();
            });
            $uibModalInstance.dismiss();
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }


})();