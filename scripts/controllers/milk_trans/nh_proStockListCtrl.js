(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ProStockTransplanCtrl',ProStockTransplanCtrl)
        .controller('InnerSalesCtrl',InnerSalesCtrl)
        .controller('RefResInnerSalesCtrl',RefResInnerSalesCtrl)
        .controller('ProStockListCtrl', ProStockListCtrl);

    ProStockListCtrl.$inject = ['$alert','$scope', '$state', '$uibModal', 'restService'];

    function ProStockListCtrl($alert,$scope, $state, $uibModal, rest) {

        var vm = this;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
        var day = new Date();
        $scope.search.fromDate = day;
        
        vm.getData = function(pageno) {
            var params = {
                //salesOrg: $scope.search.salesOrg,
                //branchNo:$scope.search.branchN,
               // branchGroup:$scope.search.status,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.findStockList(params).then(function(json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };
        vm.getStockTotal = function () {
            rest.findStockTotal({}).then(function (resp) {
                vm.total_stock = resp.data;
            })
        };
        vm.getData(vm.pageno);
        vm.getStockTotal();
        $scope.delStock = function(){
            console.log(1);
            rest.updateStockToZero().then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '清除库存成功',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            vm.getData(vm.curPageno);
                            vm.getStockTotal();
                        })
                    }
            },function(json){
                    var saveAlert = $alert({
                            content: '清除库存失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
            });
        }
        $scope.showProStockTransplan = function(id) {
            var modalInst = $uibModal.open({
                templateUrl: 'views/milk_trans/nh_proStockTransplan.html',
                controller: 'ProStockTransplanCtrl',
                size: 'lg',
                resolve: {
                    AreaItem: function() {
                        return rest.getAreaById(id);
                    }
                }
            });
        };
        $scope.addInnerSales = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'views/milk_trans/nh_innerSales.html',
                controller: 'InnerSalesCtrl',
                controllerAs:'data',
                size: 'lg'
            }); 
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
                vm.getStockTotal();
            })           
        };
        $scope.refuseResendInnerSales = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'views/milk_trans/nh_refResInnerSales.html',
                controller: 'RefResInnerSalesCtrl',
                controllerAs:'data',
                size: 'lg'
            }); 
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
                vm.getStockTotal();
            })           
        };
    }

    ProStockTransplanCtrl.$inject = ['$scope', '$uibModalInstance', 'AreaItem', 'restService'];

    function ProStockTransplanCtrl($scope, $uibModalInstance, AreaItem,restService){
        var vm =$scope;
        vm.cancelModal = cancelModal;
        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }
    }
    /**
     * 生成内部销售订单
     * @auther gh
     */
    InnerSalesCtrl.$inject = ['$scope', '$alert', '$uibModalInstance', 'restService'];

    function InnerSalesCtrl($scope,$alert,$uibModalInstance,restService){
        var vm = this;
        vm.cancelModal = cancelModal;
        vm.search = {};

        vm.getData = function(pageno) {
            restService.findStockinsidesal({}).then(function(json) {
                vm.content = json.data;
            });
        };        
        vm.getData(vm.pageno);
        vm.innerFrom =function(){
            if (!vm.search.empNo) {
                var errorAlert = $alert({
                    content: '请选择一个员工！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            };

            vm.pro = {
                empNo:'',
                salesOrg:'',
                matnrs:[]
            };
            vm.pro.empNo = vm.search.empNo;
            vm.pro.salesOrg = vm.content[0].salesOrg
            for (var i = 0, item; item = vm.content[i++];) {
                if (item.innerDefQty) {
                    vm.pro.matnrs.push({
                        matnr:item.matnr,
                        qty:item.innerDefQty
                    });
                }
            }
            if (vm.pro.matnrs.length === 0) {
                var errorAlert = $alert({
                    content: '请至少选择一个产品并输入内部销售数量！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            };
            restService.createInsideSalOrderByStock(vm.pro).then(function(resp){
                if (resp.type === 'success') {
                    var saveAlert = $alert({
                      content: "保存成功！",
                      container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                      saveAlert.show();
                      closeModal();
                    })
                }
            }, function (reject) {
                  var errorAlert = $alert({
                      content: reject.data.msg,
                      container: '#modal-alert'
                  })
                  errorAlert.$promise.then(function () {
                      errorAlert.show();
                  })
            })
            //console.log(vm.pro);
            // $state.go('newhope.proStock.milkstationSales');
        }
        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }
        function closeModal() {
            $uibModalInstance.close();
        }
        restService.getAllMilkmanByBranchNoList({}).then(function(json){
            vm.empContent = json.data;
        })
    }

    RefResInnerSalesCtrl.$inject = ['$scope', '$alert', '$uibModalInstance', 'restService'];

    function RefResInnerSalesCtrl($scope, $alert, $uibModalInstance, rest) {
        var vm = this;
        vm.listLoding = false;
        vm.cancelModal = cancelModal;
        vm.search = {};
        
        rest.getAllMilkmanByBranchNoList({}).then(function(json){
            vm.empContent = json.data;
        })

        vm.getData = function(empNo) {
            vm.listLoding = true;
            rest.findRefuseForInside(empNo).then(function(json) {
                vm.listLoding = false;
                vm.content = json.data;
            }, function (argument) {
                vm.eptMsg = '远程请求错误，请稍后再试！';
                vm.listLoding = false;
            });
        };        
        
        vm.innerFrom =function(){
            // if (!vm.search.empNo) {
            //     var errorAlert = $alert({
            //         content: '请选择一个员工！',
            //         container: '#modal-alert'
            //     })
            //     errorAlert.$promise.then(function () {
            //         errorAlert.show();
            //     })
            //     return;
            // };

            vm.pro = {
                empNo:'',
                matnrs:[]
            };
            vm.pro.empNo = vm.search.empNo;
            for (var i = 0, item; item = vm.content[i++];) {
                if (item.innerDefQty) {
                    vm.pro.matnrs.push({
                        matnr: item.matnr,
                        resendOrderNo: item.resendOrderNo,
                        qty: item.innerDefQty
                    });
                }
            }
            if (vm.pro.matnrs.length === 0) {
                var errorAlert = $alert({
                    content: '请至少选择一个产品并输入内部销售数量！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            };
            rest.createInsideSalOrderByTmpStock(vm.pro).then(function(resp){
                if (resp.type === 'success') {
                    var saveAlert = $alert({
                      content: "保存成功！",
                      container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                      saveAlert.show();
                      closeModal();
                    })
                }
            }, function (reject) {
                  var errorAlert = $alert({
                      content: reject.data.msg,
                      container: '#modal-alert'
                  })
                  errorAlert.$promise.then(function () {
                      errorAlert.show();
                  })
            })
        }

        vm.empSelected = function () {
            if (!vm.search.empNo) return;
            vm.getData(vm.search.empNo);
        }

        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        
    }

})();