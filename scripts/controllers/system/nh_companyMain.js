(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('CompanyMainCtrl', CompanyMainCtrl)
      .controller('CompanyAddModal', CompanyAddModal)
      .controller('CompanyShowModal', CompanyShowModal)
      .controller('CompanyEditModal', CompanyEditModal);
      

	CompanyMainCtrl.$inject = ['$rootScope','$state', '$timeout', '$stateParams','$scope','$uibModal', '$alert','restService', 'nhCommonUtil'];  

	function CompanyMainCtrl($rootScope, $state, $timeout, $stateParams, $scope, $uibModal,  $alert , rest, nhCommonUtil) {

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

        // rest.getCurUser().then(function(json) {
        //     vm.curUser = json.data;
        //     if(json.data.branchNo!=undefined){
        //         vm.branch = false;
        //     }

        // })
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {};
            // if (vm.batchMps && vm.batchMps.length > 0) {
            //     params = {
            //         pageNum: pageno,
            //         pageSize: vm.itemsPerPage,
            //         mps: vm.batchMps
            //     }
            //     $timeout(function () {
            //         rest.byTypeCodePage(params).then(function (json) {
            //             vm.tbLoding = 0;
            //             vm.content = json.data.list;
            //             vm.total_count = json.data.total;
            //         });
            //     }, 1000);
            // } else {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderNo:'1003',
                    branchNo: vm.search.salesOrgInput
                }
                $timeout(function () {
                    rest.byTypeCodePage(params).then(function (json) {
                        vm.tbLoding = 0;
                        vm.content = json.data.list;
                        vm.total_count = json.data.total;
                    });
                }, 1000);
            // }
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

        vm.reloadTable = function(){
            vm.curPageno = 1;
        	vm.getData(vm.curPageno);
        }
        /*table-end*/
        
	    /*showmodal方法*/
        vm.newSalesOrg  = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'CompanyAddModal.html',
                controller: 'CompanyAddModal',
                size: 'lg',
                resolve: {
                    pScope: $scope
                }
            });
            modalInst.result.then(function (argument) {
                // body...
            }, function (res) {
                //console.log(res);
                vm.getData(vm.curPageno);
            })
        }
        /*showmodal方法end*/

        /*showmodal方法*/
        vm.showSalesOrg  = function(itemCode){
            var modalInst = $uibModal.open({
                templateUrl: 'CompanyShowModal.html',
                controller: 'CompanyShowModal',
                size: 'lg',
                resolve: {
                    itemCode: function() {
                        return itemCode;
                    },
                    pScope: $scope
                }
            });
            modalInst.result.then(function (argument) {
                // body...
            }, function (res) {
                //console.log(res);
                vm.getData(vm.curPageno);
            })
        }
        /*showmodal方法end*/

        /*showmodal方法*/
        vm.editSalesOrg  = function(itemCode){
            var modalInst = $uibModal.open({
                templateUrl: 'CompanyEditModal.html',
                controller: 'CompanyEditModal',
                size: 'lg',
                resolve: {
                    itemCode: function() {
                        return itemCode;
                    },
                    pScope: $scope
                }
            });
            modalInst.result.then(function (argument) {
                // body...
            }, function (res) {
                //console.log(res);
                vm.getData(vm.curPageno);
            })
        }
        /*showmodal方法end*/
        
	}

    CompanyAddModal.$inject = ['$scope','$uibModalInstance', '$alert','restService'];

    function CompanyAddModal($scope, $uibModalInstance, $alert, rest) {
        var vm = $scope;
        vm.item = {
            parent:-1
        }; 
        vm.handle = {
            // 公司
            // parents: [{
            //     itemCode: '-1',
            //     itemName: '空'
            // }]
        };
        vm.cancelModal = cancelModal;
        vm.save = save;   

        // rest.codeMap('1003').then(function (json) {
        //     vm.handle.parents =  json.data;
        //     vm.item.parent = vm.handle.parents[0].itemCode;
        // });

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*保存按钮*/
        function save() {
            var params = vm.item;
            rest.addDicItem(params).then(function (json) {
                if(json.type == 'success') {
                    var alert = $alert({
                        content:   '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                        cancelModal();
                    })
                }
            }, function (reject) {
                var cancelAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
        }

    }

    CompanyShowModal.$inject = ['$scope','$uibModalInstance', '$alert','restService','itemCode'];

    function CompanyShowModal($scope, $uibModalInstance, $alert, rest, itemCode) {
        var vm = $scope;
        vm.item = {
            parent:-1
        }; 
        vm.handle = {
            // 公司
            // parents: [{
            //     itemCode: '-1',
            //     itemName: '空'
            // }]
        };
        vm.cancelModal = cancelModal;
        // vm.save = save;   

        // rest.codeMap('1003').then(function (json) {
        //     vm.handle.parents =  json.data;
        // });

        rest.dicItem('1003',itemCode).then(function (json) {
            vm.item =  json.data;
        });
         
        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }

    CompanyEditModal.$inject = ['$scope','$uibModalInstance', '$alert','restService','itemCode'];

    function CompanyEditModal($scope, $uibModalInstance, $alert, rest, itemCode) {
        var vm = $scope;
        vm.item = {
            parent:-1
        }; 
        vm.handle = {
            // 公司
            // parents: [{
            //     itemCode: '-1',
            //     itemName: '空'
            // }]
        };
        vm.cancelModal = cancelModal;
        vm.save = save;   

        // rest.codeMap('1003').then(function (json) {
        //     vm.handle.parents =  json.data;
        // });

        rest.dicItem('1003',itemCode).then(function (json) {
            vm.item =  json.data;
        });

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*保存按钮*/
        function save() {
            var params = vm.item;
            rest.editDicItem(params).then(function (json) {
                if(json.type == 'success') {
                    var alert = $alert({
                        content:   '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                        cancelModal();
                    })
                }
            }, function (reject) {
                var cancelAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
        }

    }

})();