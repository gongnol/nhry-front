(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ConsumerListCtrl', ConsumerListCtrl)
        .controller('ConsumerRefundCtrl', ConsumerRefundCtrl);

    ConsumerListCtrl.$inject = ['$scope', '$alert', '$rootScope', '$state', '$uibModal', 'restService', '$stateParams'];

    function ConsumerListCtrl($scope, $alert, $rootScope, $state, $uibModal, rest, $stateParams) {
        var vm = this;
		
        vm.search = {};
        vm.search.status=$stateParams.type;
        vm.handle = {
            stationTypes: [{
                code: '01',
                label: '自营'
            }, {
                code: '02',
                label: '外包'
            }],
            cStatuses: [{
                code: '10',
                label: '在订订户'
            }, {
                code: '20',
                label: '暂停订户'
            }, {
                code: '30',
                label: '停订订户'
            }, {
                code: '40',
                label: '退订订户'
            }, {
                code: '50',
                label: '新增订户'
            }]
        };



        vm.choseStation = false;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        // vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.tbParams = {
            pageSize: vm.itemsPerPage,
            status:vm.search.status
        };
        
        vm.getData = function(pageno){
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            vm.tbParams.pageNum = pageno;
            
            rest.getCsmList(vm.tbParams).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        };

        vm.getData(vm.curPageno); // Call the function to fetch initial data on page load.  

        vm.typeSelected = function (item) {
            vm.search.station = '';
            if (item && item.code != '00') {
                vm.choseStation = true;
                vm.handle.stations = [];
                rest.getBranchByType(item.code).then(function (json) {
                    //console.log(json);
                    // 自营
                    if (item.code == '01') {
                        json.data.branchList.forEach(function (ele) {
                            vm.handle.stations.push({
                                label: ele.branchName,
                                code: ele.branchNo
                            });
                        })
                    } 
                    // 外包
                    else if (item.code == '02') {
                        json.data.dealerList.forEach(function (ele) {
                            vm.handle.stations.push({
                                label: ele.dealerName,
                                code: ele.dealerNo
                            });
                        })
                    }
                })
            } else {
                vm.choseStation = false;
            }
        }

        vm.goCsmDetail = function (custNo) {
            $rootScope.curPage_Record = vm.curPageno;
            $state.go("newhope.consumerDetail", {edit: false, vipCustNo: custNo});
        }

        vm.goCsmEdit = function (custNo) {
            $rootScope.curPage_Record = vm.curPageno;
            $state.go("newhope.consumerDetail", {edit: true, vipCustNo: custNo});
        }
        vm.refund = function (custNo,vipName,acctAmt) {
            rest.findVipAcctByCustNo(custNo).then(function (json) {
                    if(json.data == "" || json.data == null){
                             var saveAlert = $alert({
                                content: '该用户还没有可退余额信息',
                                container: '#body-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                    }else{
                        var acctAmt = json.data.acctAmt;
                        if(acctAmt<=0){
                                 var saveAlert = $alert({
                                    content: '该用户还没有余额可退',
                                    container: '#body-alert'
                                })
                                saveAlert.$promise.then(function () {
                                    saveAlert.show();
                                })
                                return ;
                        }
                        rest.selectUnfinishOrderNum(custNo).then(function (json) {
                               if(json.data > 0 ){
                                    if(confirm("该订户还有  "+json.data+"  个订单没有完结，您确定要退款？")){
                                            var modalInst = $uibModal.open({
                                            templateUrl: 'refund.html',
                                            controller: 'ConsumerRefundCtrl',
                                            size: 'lg',
                                            resolve: {
                                                custItem: function() {
                                                    return {
                                                        "vipCustNo":custNo,
                                                        "vipName":vipName,
                                                        "acctAmt":acctAmt
                                                    }
                                                }
                                            }
                                        });
                                         modalInst.result.then(function() {
                                            var saveAlert = $alert({
                                                content: '退款成功',
                                                container: '#body-alert',
                                                duration: false
                                            })
                                            saveAlert.$promise.then(function () {
                                                saveAlert.show();
                                            })
                                            vm.getData(vm.curPageno);
                                        })
                                    }
                               }else{
                                    var modalInst = $uibModal.open({
                                        templateUrl: 'refund.html',
                                        controller: 'ConsumerRefundCtrl',
                                        size: 'lg',
                                        resolve: {
                                            custItem: function() {
                                                return {
                                                    "vipCustNo":custNo,
                                                    "vipName":vipName,
                                                    "acctAmt":acctAmt
                                                }
                                            }
                                        }
                                        });
                                         modalInst.result.then(function() {
                                            var saveAlert = $alert({
                                                content: '退款成功',
                                                container: '#body-alert',
                                                duration: false
                                            })
                                            saveAlert.$promise.then(function () {
                                                saveAlert.show();
                                            }).then(function () {

                                            })
                                            vm.getData(vm.curPageno);
                                        })
                               }
                            });
                    }
            });
            
        }

        $scope.isSearch = false;
        // $scope.toggleSearch = function () {
        //     $scope.isSearch = !$scope.isSearch;
        // }

        $scope.getObjByCode = function (code, arr) {
            var label = '';
            switch (code) {
                case '10': 
                    label = '在订订户';
                    break;
                case '20': 
                    label = '暂停订户';
                    break;
                case '30': 
                    label = '停订订户';
                    break;
                case '40': 
                    label = '退订订户';
                    break;
            }
            return label;
        }

        $scope.doFilter = function () {
            //console.log(vm.search);

            for (var item in vm.search) {
                if (vm.search.hasOwnProperty(item)) {
                    vm.tbParams[item] = vm.search[item];
                }
            }
            vm.curPageno = 1;
            vm.getData(1);
        }

        $scope.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                //var mpReg = /^\d{11}$/;
                //if (mpReg.test(vm.search.content)) {
                    vm.tbLoding = 1;
                    vm.content = [];
                    vm.total_count = 0;

                    rest.getCsmList({ content: vm.search.content,status:vm.search.status }).then(function (json) {
                        if (json.data.list.length > 0) {
                            vm.tbLoding = 0;
                            vm.content = json.data.list;
                            vm.total_count = json.data.total;
                        } else {
                            var mpReg = /^\d{11}$/;
                            if (mpReg.test(vm.search.content)) {
                                $state.go('newhope.addConsumer', {mp: vm.search.content});
                            }
                            else{
                                $state.go('newhope.addConsumer');
                            }

                        }
                    }, function (reject) {
                        var errorAlert = $alert({
                            title: reject.data.type,
                            content: reject.data.msg,
                            container: '#modal-alert'
                        })
                        errorAlert.$promise.then(function () {
                            errorAlert.show();
                        })
                        vm.tbLoding = 0;
                    }); 
                //} else {
                //    $scope.doFilter();
                //}
            }
        }

        $scope.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }
    }
      ConsumerRefundCtrl.$inject = ['$scope', '$alert', '$rootScope', '$state','$uibModalInstance', 'custItem','restService'];

    function ConsumerRefundCtrl($scope, $alert, $rootScope, $state, $uibModalInstance,custItem, restService) {
        var vm = $scope;
        vm.charging = false;
        vm.cust = custItem;
        vm.closeModal = closeModal;
        vm.cancelModal = cancelModal;
        vm.search = {};
        vm.refund = function(){
             var params = {
                "vipCustNo":vm.cust.vipCustNo,
                "vipName":vm.cust.vipName,
                "remark":vm.search.remark
             }
             restService.custRefund(params).then(function (json) {
                    if(json.type='success'){
                        closeModal();
                }
             },function(json){
                vm.charging = false;
                var saveAlert = $alert({
                    content: '退款失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        }
        function cancelModal() {
            $uibModalInstance.dismiss();
        }
        function closeModal() {
            $uibModalInstance.close();
        }
    }

})();