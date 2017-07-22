(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('MSListCtrl', MSListCtrl)
        .controller('OnlineEditModalCtrl', OnlineEditModalCtrl)
        .controller('BranchRemarkSetCtrl', BranchRemarkSetCtrl);


    BranchRemarkSetCtrl.$inject = ['$window','$scope','$uibModalInstance', '$state', '$alert', '$uibModal', 'restService' ];
    function BranchRemarkSetCtrl($window, $scope, $uibModalInstance, $state,$alert,$uibModal,restService) {
        var vm = $scope;
        restService.getCurrentBranch().then(function(json){
            if('success' == json.type && null != json.data){
                vm.branchRemark = json.data.remark;
            }
        })
        //doBranchRemarkSet
        vm.doBranchRemarkSet = function(){
            var branchRemark = vm.branchRemark;
            //console.log(branchRemark);
            restService.setBranchRemark(vm.branchRemark).then(function(json){

                var alert = $alert({
                    content: '奶站备注设置成功',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                $uibModalInstance.dismiss();
            }, function (reject) {
                var cancelAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
        }

        vm.cancelModal = function () {
            $uibModalInstance.dismiss();
        }
    }

    MSListCtrl.$inject = ['$scope', '$alert', '$rootScope', '$state', '$uibModal', 'restService', '$stateParams'];

    function MSListCtrl($scope, $alert, $rootScope, $state, $uibModal, rest, $stateParams) {

        var vm = this;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};

        $scope.BranchRemarkSet = function() {
            var modalInst = $uibModal.open({
                templateUrl: 'branchRemarkSet.html',
                controller: 'BranchRemarkSetCtrl',
                size: 'xxls',
                resolve: {
                }
            });
            modalInst.result.then(function() {

            }, function() {

            })
        }

        vm.getData = function(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                //salesOrg: $scope.search.salesOrg,
                branchN:$scope.search.branchN,
                branchGroup:$scope.search.status,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.branchs(params).then(function(json) {
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
        vm.branchGroup =[
                {"code": "01","label": "自营奶站"},
                {"code": "02","label": "经销商奶站"}
        ];
        vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 

        rest.saleORGs().then(function(json) {
            vm.marketOrgs = json.data;
        })


       
        $scope.addBranch = function() {
          $state.go("newhope.milkstationadd");
        }


        $scope.filter = function() {
            vm.curPageno = 1;
            vm.getData(1);
        }

        $scope.dispatchArea = function(branchNo) {
            $state.go('newhope.allocatRoute',{branchNo:branchNo});
        }

        $scope.refreshAddresses = function(address) {
            alert(address);
        }

        $scope.onlineEdit = function (branchNo) {
            var modalInst = $uibModal.open({
                templateUrl: 'onlineEdit.html',
                controller: 'OnlineEditModalCtrl',
                controllerAs: 'olm',
                size: 'lg',
                resolve: {
                    branchNo: function () {
                        return branchNo;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

    }

    OnlineEditModalCtrl.$inject = ['$alert', '$uibModalInstance', 'restService', 'branchNo'];

    function OnlineEditModalCtrl($alert, $uibModalInstance, rest, branchNo) {
        var vm = this;
        vm.today = moment();
        vm.cancelModal = cancelModal;
        vm.saveOnlineState = saveOnlineState;

        function saveOnlineState() {
            if (!vm.onlineDate) {
                var alert = $alert({
                    content: '请选择上线时间！',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }
            // if (!moment(vm.onlineDate).isAfter(vm.today)) {
            //     var alert = $alert({
            //         content: '请选择今天以后的时间！',
            //         container: '#modal-alert'
            //     })
            //     alert.$promise.then(function () {
            //         alert.show();
            //     })
            //     return;
            // }
            rest.uptValidBranch({
                'branchNo': branchNo,
                'isValid': '10',
                'onlineDate': vm.onlineDate
            }).then(function (resp) {
                if (resp.type == 'success') {
                    var alert = $alert({
                        content: '奶站成功上线!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    }).then(function () {
                        closeModal();
                    })
                }
            }, function (reject) {
                var alert = $alert({
                    title: reject.status.toString() + ' ' + reject.statusText,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
            })
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }

})();