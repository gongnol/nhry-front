(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('SalesOrgMainCtrl', SalesOrgMainCtrl);

	SalesOrgMainCtrl.$inject = ['$rootScope','$state', '$timeout', '$stateParams','$scope','$uibModal', '$alert','restService', 'nhCommonUtil'];  

	function SalesOrgMainCtrl($rootScope, $state, $timeout, $stateParams, $scope, $uibModal,  $alert , rest, nhCommonUtil) {

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
        vm.search.orderDateStart = nhCommonUtil.offsetMon(-2);
        vm.search.status = '10';
        // if (typeof($rootScope.curPage_Record) == 'number' && $rootScope.curPage_Record !== 0) {
        //     vm.curPageno = $rootScope.curPage_Record;
        //     $rootScope.curPage_Record = 0;
        // } else {
        //     vm.curPageno = 1;
        // }
        vm.branch = true;

        rest.getCurUser().then(function(json) {
            vm.curUser = json.data;
            if(json.data.branchNo!=undefined){
                vm.branch = false;
            }

        })
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {};
            if (vm.batchMps && vm.batchMps.length > 0) {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    mps: vm.batchMps
                }
                
                $timeout(function () {
                    rest.searchOrderByMp(params).then(function (json) {
                        vm.tbLoding = 0;
                        vm.content = json.data.list;
                        vm.total_count = json.data.total;
                    });
                }, 1000);

            } else {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    preorderStat:"10",/*10代表生效的订单*/
                    reason:"cancel",//查询包括了取消的订单
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
                    preorderStat20F70Z017: '10'//查询出年卡，机构待确认的订单
                }

                $timeout(function () {
                    rest.orders(params).then(function (json) {
                         rest.getCurUser().then(function(jsonUser) {
                           vm.content = json.data.list;
                           for(var i=0;i<vm.content.length;i++){
                                //机构订单、不是奶站
                              if(vm.content[i].preorderSource=='70' && jsonUser.data.branchNo==undefined){
                                  vm.content[i].orgOrder=true;
                              }else{
                                 vm.content[i].orgOrder=false;
                              }
                           }
                         })
                        vm.tbLoding = 0;
                        
                        vm.total_count = json.data.total;
                    });
                }, 1000);
            }
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
            if("90" === code)return '特殊';
            
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
            {'code':'Z017','text':'年卡'},
            {'code':'90','text':'特殊'}
        ];

	    /////////modal区//////////
		vm.stopOrderAfterModal = function(data){
			var modalInst = $uibModal.open({
                templateUrl: 'stopOrderAfterModel.html',
                controller: 'stopOrderAfterModel',
                size: 'xl',
                resolve: {
                    data: function() {
                        return data;
                    },
                    rest:rest,
                    pvm:vm
                }
            });
            modalInst.result.then(function(data) {
               if(data.type=="success"){
                    vm.getData(vm.curPageno);
               }
            })
		}
        
	}

})();