/**
 * @ngdoc Controller
 * @name home
 *
 * 首页控制器
 */
 (function() {
 	'use strict';
 	/**
 	*  Module
 	*
 	* Description
 	*/
 	angular
        .module('newhope')
        .controller('HomeCtrl', HomeCtrl);


 	 HomeCtrl.$inject = ['$scope', '$state','$http', '$resource', '$uibModal','restService'];

    function HomeCtrl($scope,$state,$http,$resource, $uibModal,rest) {
 	  	var vm = $scope;
        rest.vipcustStat().then(function(json){
            for(var i=0;i<json.data.length;i++){
                if(json.data[i].status=="0"){//总订户数
                    vm.CsmList_count = json.data[i].amount;
                }else if(json.data[i].status=="10"){//在订
                    vm.statusparams_count = vm.CsmList_count = json.data[i].amount;
                }else if(json.data[i].status=="30"){//停订
                    vm.stopparams_count = json.data[i].amount;
                }else if(json.data[i].status=="40"){//退订
                    vm.unsubscribeparams_count = json.data[i].amount;
                }
            }
        })  
        //获取当前登录人
        vm.branch = false;
        rest.getCurUser().then(function(json) {
            vm.curUser = json.data;
            if(json.data.branchNo!=undefined){
                vm.branch = true;
            }

        })
        var day = new Date();
        var params={
                theDate: moment(day).format('YYYY-MM-DD')
            }
        rest.branchDayQty(params).then(function(json) {
            if(json.data.qty!=undefined){
                vm.dayQty = json.data.qty;
            }else{
                vm.dayQty = 0;
            }
            
        })
        //待确认订单
        rest.selectRequiredOrderNum().then(function (json) {
            if(json.data!=undefined){
               vm.ordersparams_count = json.data;
            }else{
                vm.ordersparams_count = 0;
            }
                
            }); 
        //5天到期还没续订订单 
        rest.selectStopOrderNum().then(function(json){
            if(json.data!=undefined){
                vm.stopNum = json.data;
            }else{
                vm.stopNum = 0;
            }
        })
        //预付款未收总数
        rest.selectOrdersNoBillCount().then(function(json){
            if(json.data!=undefined){
               vm.OrdersNoBill_count = json.data;
            }else{
                vm.OrdersNoBill_count = 0;
            }
        })
        //首页，未装箱总数
        rest.selectMilkboxsCount().then(function(json){
            if(json.data!=undefined){
               vm.Milkboxs_count = json.data;
            }else{
                vm.Milkboxs_count = 0;
            }            
        })
        rest.searchReturnOrdersNum().then(function(json){
            if(json.data!=undefined){
                vm.returnNum = json.data;
            }else{
                vm.returnNum = 0;
            }            
        })
        
        vm.goCustomerInfo = function(data){
        	$state.go("newhope.consumerlist",{type:data});
        }
 	  }

 })();