(function() {
    'use strict';
    angular
        .module('newhope')
         .controller('ConfirmCtrl', ConfirmCtrl)
        .controller('DealerListCtrl', DealerListCtrl);

    DealerListCtrl.$inject =  ['$scope', '$alert', '$rootScope', '$state', '$uibModal', 'restService', '$stateParams'];
    function DealerListCtrl($scope, $alert, $rootScope, $state, $uibModal, rest, $stateParams) {

        var vm = this;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};

        $scope.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                $scope.doSearch();
            }
        }

        $scope.doSearch = function () {
            //console.log($scope.search);
            vm.curPageno = 1;
            vm.getData(1);
        }

        rest.getDealerBySalesOrg().then(function(json) {
            if('success' == json.type && null != json.data){ 
                 vm.dealers = json.data;
             }           
        });

        vm.getData = function(pageno){
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                //salesOrg: $scope.search.salesOrg,
                search:$scope.search.search,
                dealerNo:$scope.search.dealerNo,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
              rest.dealerList(params).then(function(json) {
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
          
        }
        vm.getData(vm.pageno); 

        $scope.filter = function() {
            vm.curPageno = 1;
            vm.getData(1);
        }

        $scope.changeStatus = function(dealerNo,status){
             var confirmTxt = "目前该经销商状态为"+(status=='Y'?'无效':'有效')+",确定要更改为"+(status=='Y'?'有效':'无效')+"吗?";
              var modalInst = $uibModal.open({
                templateUrl: 'confirm.html',
                controller: 'ConfirmCtrl',
                size: 'lg',
                resolve: {
                    confirmTxt : function(){
                        return confirmTxt;
                    }
                }
            });
            modalInst.result.then(function(data) {
                  if(data === "Y"){
                    var params = {
                         dealerNo: dealerNo
                    }
                  rest.changeDealerStatus(params).then(function(json) {
                    if('success' == json.type){ 
                        var alert = $alert({
                            content: '更改成功!',
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function() {
                            alert.show();
                        })
                         vm.getData(vm.pageno); 
                     }           
                 },function(reject){
                        var alert = $alert({
                            content: '更改失败!'+reject.data.msg,
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function() {
                            alert.show();
                        })
                 });

               }
            })

        }

    }

    ConfirmCtrl.$inject = ['$window','$scope','$alert','confirmTxt', '$uibModal', '$uibModalInstance',  'restService']; 
    function ConfirmCtrl($window,$scope,$alert,confirmTxt,uibModal, $uibModalInstance,rest) {
        var vm = $scope;
         vm.cancelModal = cancelModal;
          vm.closeModal = closeModel;
        vm.confirmTxt = confirmTxt;

       
        vm.confirm = function(){
            $uibModalInstance.close("Y");
        }

        function cancelModal(){
            $uibModalInstance.dismiss('cancel');
        }

        function  closeModel() {
            $uibModalInstance.close();
        }

    }


})();