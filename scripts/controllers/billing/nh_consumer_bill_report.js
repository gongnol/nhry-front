(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('billReportCtrl', billReportCtrl) ;
      

	billReportCtrl.$inject = ['$rootScope','$state', '$timeout', '$stateParams','$scope','$uibModal', '$alert','restService', 'nhCommonUtil'];  

	function billReportCtrl($rootScope, $state, $timeout, $stateParams, $scope, $uibModal,  $alert , rest, nhCommonUtil) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        //vm.pageno = 1; // 初始化页码为1
        // vm.curPageno = $rootScope.getCurPage_Record();
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.search={};
        vm.search.orderDispDateStart = nhCommonUtil.offsetMon(0);
        var cd1 = nhCommonUtil.offsetDay(new Date(), 0);
        if(cd1.endsWith('01')){
        	vm.search.orderDispDateEnd = cd1;
        }
        else{
        	vm.search.orderDispDateEnd = nhCommonUtil.offsetDay(new Date(), -1);
        }
        
        vm.search.status = '10';
        vm.branch = true;
        rest.getCurUser().then(function(json) {
            vm.curUser = json.data;
            if(json.data.branchNo!=undefined){
                vm.branch = false;
            }

        });

        if ($stateParams.csmPhone) {
            vm.search.milkmemberNo = $stateParams.csmPhone;
        }
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {};
	        params = {
	            pageNum: pageno,
	            pageSize: vm.itemsPerPage,
	            preorderStat:"10",/*10代表生效的订单*/
	            orderDateStart:vm.search.orderDateStart,
	            orderDateEnd:vm.search.orderDateEnd,
	            endDateStart:vm.search.endDateStart,
	            endDateEnd:vm.search.endDateEnd,
	            content:vm.search.content,
	            product:vm.search.product,
	            address:vm.search.address,
	            status:vm.search.status,
	            paymentStat:vm.search.paymentStat,
	            empNo:vm.search.empNo,
	            milkmemberNo:vm.search.milkmemberNo,
	            preorderSource: vm.search.preorderSource,
	            orderDispDateStart: vm.search.orderDispDateStart,
	            orderDispDateEnd: vm.search.orderDispDateEnd
	        }
	
            rest.searchOrderWithConsumer(params).then(function (json) {
                vm.content = json.data.list;
                vm.tbLoding = 0;
                vm.total_count = json.data.total;
            });
        };

        /*模糊搜索*/
        vm.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                vm.curPageno = 1;
                vm.getData(vm.curPageno);
            }
        }

        vm.getData(vm.curPageno); // Call the function to fetch initial data on page load.

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

        vm.signFormat = function (sign) {
           if("10"==sign)return '在订';
           if("20"==sign)return '停订';
           if("30"==sign)return '退订';
           if("40"==sign)return '完结';
        }

        vm.milkboxStatFormat = function (state) {
           if("10"==state)return '已安装';
           if("20"==state)return '未安装';
           if("30"==state)return '无需安装';
        }

        vm.orderSourceFmt = function (code,type) {
            if("10" === code )return '电商';
            if("20" === code)return '征订';
            if("Z017" === type)return '年卡';
            if("30" === code )return '奶站';
            if("40" === code)return '牛奶钱包';
            if("50" === code)return '送奶工App';
            if("60" === code)return '电话';
            if("70" === code)return '机构';
            
        }

        vm.reloadTable = function(){
            vm.curPageno = 1;
        	vm.getData(vm.curPageno);
        }
        /*table-end*/
        vm.statuses = [{'code':'10','text':'在订'},{'code':'20','text':'停订'},{'code':'30','text':'退订'},{'code':'40','text':'完结'}];
        vm.payStatuses = [{'code':'10','text':'后付款'},{'code':'20','text':'先付款'}];
        vm.preorderSources = [
            {'code':'10','text':'电商'}, 
            {'code':'20','text':'征订'}, 
            {'code':'30','text':'奶站'}, 
            {'code':'40','text':'牛奶钱包'}, 
            {'code':'50','text':'送奶工App'}, 
            {'code':'60','text':'电话'},
            {'code':'70','text':'机构'},
            {'code':'Z017','text':'年卡'}
        ];


        rest.getAllEmpByBranchNo("").then(function (json) {
              vm.canSelectEmps = json.data;
        });

        vm.clearBatchSearch = function () {
            vm.batchMps = null;
            vm.curPageno = 1;
            vm.getData(vm.curPageno);
        }
        
        vm.toExport = function(){
        	var params = {
	            pageNum: 1,
	            pageSize: vm.itemsPerPage,
	            preorderStat:"10",/*10代表生效的订单*/
	            orderDateStart:vm.search.orderDateStart,
	            orderDateEnd:vm.search.orderDateEnd,
	            endDateStart:vm.search.endDateStart,
	            endDateEnd:vm.search.endDateEnd,
	            content:vm.search.content,
	            product:vm.search.product,
	            address:vm.search.address,
	            status:vm.search.status,
	            paymentStat:vm.search.paymentStat,
	            empNo:vm.search.empNo,
	            milkmemberNo:vm.search.milkmemberNo,
	            preorderSource: vm.search.preorderSource,
	            orderDispDateStart: vm.search.orderDispDateStart,
	            orderDispDateEnd: vm.search.orderDispDateEnd
	        }
	
            rest.searchOrderWithConsumerExport(params).then(function (json) {
            	if (json.data) {
                    rest.reportDeliverFile(json.data);
                }
            }, function(reject){
            	var cancelAlert = $alert({
                    content: reject.data.msg,
                    container: '#body-alert'
               });
               cancelAlert.$promise.then(function () {
                    cancelAlert.show();
               });
            });
        }
	}



})();