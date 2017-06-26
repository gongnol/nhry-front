/**
 * 学生奶/学校信息控制器
 */
(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('SchoolInfoCtrl', SchoolInfoCtrl)
        .controller('NewSchollInfoCtrl', NewSchollInfoCtrl)
        .controller('EditSchollInfoCtrl',EditSchollInfoCtrl)
        .controller('SetClassCtrl', SetClassCtrl)
        .controller('SetMilkSpecies', SetMilkSpecies)
        .controller('SetLossCtrl', SetLossCtrl);


    SchoolInfoCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil'];
    function SchoolInfoCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil) {

        var vm = $scope;
        vm.search = {};
        vm.visibles = [
        	{code:'10', label:'可用'},
        	{code:'20', label:'禁用'}
        ];
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

        //方法:新增学校
        vm.newSchollInfo = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'newSchollInfo.html',
                controller: 'NewSchollInfoCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }
        
        //方法:设置学校牛奶品种政策
        vm.setMilkSpecies = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'setMilkSpecies.html',
                controller: 'SetMilkSpecies',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }

        //方法:班级设置
        vm.setClass = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'setClass.html',
                controller: 'SetClassCtrl',
                size: 'lg'
            });
            modalInst.result.then(function() {
            });
        }

        //方法:编辑学校
        vm.editSchoolInfo = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'editSchollInfo.html',
                controller: 'EditSchollInfoCtrl',
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
    }
    
	SetMilkSpecies.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
	function SetMilkSpecies($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.milkTypeList = [
        	{code:'10', label:'150ml可可奶'},
        	{code:'20', label:'180ml鲜奶'}
        ];
        vm.zhous = [{name:'星期一'},{name:'星期二'},{name:'星期三'},{name:'星期四'},{name:'星期五'},{name:'星期六'},{name:'星期日'}]
        vm.save = function(){
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
	
    SetClassCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
    function SetClassCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.classes = [
        	{className:'小班(1)',classNum:21},
        	{className:'小班(2)',classNum:22},
        	{className:'小班(3)',classNum:20},
        	{className:'大班(1)',classNum:32},
        	{className:'大班(2)',classNum:30}
        ];
        vm.delClass = function(idx){
        	vm.classes.splice(idx ,1);
        }
        vm.toAdd = function(){
            vm.classes.push({className:'',classNum:''});
        }
        vm.save = function(){
        	var myalert = $alert({
        		content:'保存成功',
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

    NewSchollInfoCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
    function NewSchollInfoCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance) {
        var vm = $scope;
        vm.schoolInfo = {
            schoolCode:'',
            schoolName:'',
            tel:'',
            phone:'',
            contact:'',
            address:''
        }
        
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }

    EditSchollInfoCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil', '$uibModalInstance'];
    function EditSchollInfoCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, nhCommonUtil, $uibModalInstance){
        var vm = $scope;

        //初始化数据
        vm.schoolInfo = {
        	custCode:'ex_newhope',
            schoolCode:'880001',
            schoolName:'小星星学校001',
            tel:'028-9203020',
            phone:'18888888888',
            contact:'赵老师',
            address:'四川省成都市锦江区'
        }

        //保存修改的学校信息
        vm.save = function(){
            var cancelAlert = $alert({
                content: '保存成功',
                container: '#modal-alert'
            });
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            });
            $uibModalInstance.dismiss();
        }

        //取消弹出框
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    }
})();