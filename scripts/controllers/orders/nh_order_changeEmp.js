(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('orderChangeEmpCtrl', orderChangeEmpCtrl)
      .controller('empChangeModal', empChangeModal);

	orderChangeEmpCtrl.$inject = ['$rootScope','$state','$stateParams','$scope','$uibModal', '$alert','restService', 'nhCommonUtil'];  

	function orderChangeEmpCtrl($rootScope, $state, $stateParams, $scope, $uibModal,  $alert , rest, nhCommonUtil) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.search={};
        vm.search.orderDateStart = nhCommonUtil.offsetMon(-2);

        vm.empChange = function(){
            if(vm.checkboxArrs==undefined || ''==vm.checkboxArrs){
                var cancelAlert = $alert({
                    content: '请勾选需要替换送奶员的订单!',
                    container: '#body-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }
            var modalInst = $uibModal.open({
                templateUrl: 'empChangeModal.html',
                controller: 'empChangeModal',
                size: 'md',
                resolve: {
                    orders: function() {
                        return vm.checkboxArrs;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        };

        if ($stateParams.csmPhone) {
            vm.search.milkmemberNo = $stateParams.csmPhone;
        }
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                preorderStat:"10",/*10代表生效的订单*/
                reason:"cancel",//查询包括了取消的订单
                orderDateStart:vm.search.orderDateStart,
                orderDateEnd:vm.search.orderDateEnd,
                content:vm.search.content,
                product:vm.search.product,
                address:vm.search.address,
                status:vm.search.status,
                paymentStat:vm.search.paymentStat,
                empNo:vm.search.empNo,
                milkmemberNo:vm.search.milkmemberNo
            }

            rest.orders(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
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

        vm.reloadTable = function(){
            vm.curPageno = 1;
        	vm.getData(vm.curPageno);
        }
        /*table-end*/
        vm.statuses = [{'code':'10','text':'在订'},{'code':'20','text':'停订'},{'code':'30','text':'退订'},{'code':'40','text':'完结'}];
        vm.payStatuses = [{'code':'10','text':'后付款'},{'code':'20','text':'先付款'}];

        /*产品列表*/
        vm.getProductTxt = function(product){
            rest.getProductByCodeOrName(product).then(function(json){
              vm.Rproducts = json.data;   
             
            })
        }

        rest.getAllEmpByBranchNo("").then(function (json) {
              vm.canSelectEmps = json.data;
        });
	}

    empChangeModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orders', 'rest'];

    function empChangeModal($scope, $uibModalInstance, $alert, orders, rest) {
        var vm = $scope;
        vm.change = {};
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.empChangeSaving = false;

        rest.getAllEmpByBranchNo('').then(function (json) {
            vm.emps = json.data;
        }, function (reject) {
            showAlert({
                title: reject.data.type,
                content: reject.data.msg,
                container: '#modal-alert'
            })
        })

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function save() {
            vm.empChangeSaving = true;
            if (!vm.change.empA) {
                vm.empChangeSaving = false;
                showAlert({
                    content: '请先选择送奶员！',
                    container: '#modal-alert'
                })
            }else{
                rest.updateOrderEmp({
                    orders:orders,
                    empNo: vm.change.empA
                }).then(function (json) {
                    // vm.empChangeSaving = false;
                    showAlert({
                        content: '替换成功！',
                        container: '#modal-alert'
                    }).then(function () {
                        closeModal();
                    })
                }, function function_name(reject) {
                    vm.empChangeSaving = false;
                    showAlert({
                        title: '替换失败',
                        content: reject.data.msg,
                        container: '#modal-alert'
                    })
                })
            }
        }

        function showAlert(opts) {
            var alert = $alert(opts)
            alert.$promise.then(function () {
                alert.show();
            })
            return alert.$promise;
        }
    }

})();