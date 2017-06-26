(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('OrginfoCtrl', OrginfoCtrl)
      .controller('orgEditModalCtrl', orgEditModalCtrl)
      .controller('newOrgModalCtrl', newOrgModalCtrl);

	OrginfoCtrl.$inject = ['$state', '$scope', '$alert', '$uibModal', 'restService'];

	function OrginfoCtrl($state, $scope, $alert, $uibModal, rest) {

        var vm = this;
        vm.search = {};
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = getData;
        vm.editOrgDetail = editOrgDetail;
        vm.newOrgInfo = newOrgInfo;

        vm.getData(vm.curPageno);

        function getData(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            
            var params = {
                queryTxt: vm.search.fuzzyParam,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };

            rest.getOrginfoList(params).then(function (json) {
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

        vm.addorgPrice = function(params){
            rest.orgPrice(params).then(function(json){
                $state.go('newhope.orginfoPrice', {orgId: params});
            })
        }
        // function getOrgDetail(orgID) {
        //     var modalInst = $uibModal.open({
        //         templateUrl: 'orgDetailModal.html',
        //         controller: 'orgDetailModalCtrl',
        //         controllerAs: 'odm',
        //         size: 'lg',
        //         resolve: {
        //             orgDetail: function() {
        //                 return rest.getOrginfoDetail(orgID);
        //             },
        //             orgCsm: function () {
        //                 return rest.getOrgCsmList({orgId: orgID, pageSize: 5});
        //             }
        //         }
        //     });

        //     modalInst.opened.then(function () {}, function (reject) {
        //         var cancelAlert = $alert({
        //             title: '机构详情查询错误',
        //             content: '<br/>' + reject.data.msg,
        //             container: '#modal-alert'
        //         })
        //         cancelAlert.$promise.then(function () {
        //             cancelAlert.show();
        //         })
        //     })
        // }

        function editOrgDetail(orgID) {
            var modalInst = $uibModal.open({
                templateUrl: 'orgEditModal.html',
                controller: 'orgEditModalCtrl',
                controllerAs: 'oem',
                size: 'lg',
                resolve: {
                    orgDetail: function() {
                        return rest.getOrginfoDetail(orgID);
                    }
                }
            });

            modalInst.opened.then(function () {}, function (reject) {
                var cancelAlert = $alert({
                    title: '机构详情查询错误',
                    content: '<br/>' + reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })

            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        function newOrgInfo() {
            var modalInst = $uibModal.open({
                templateUrl: 'newOrgModal.html',
                controller: 'newOrgModalCtrl',
                controllerAs: 'nom',
                size: 'lg'
            });

            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

	}

    orgEditModalCtrl.$inject = ['$alert', '$uibModalInstance', 'orgDetail', 'restService'];

    function orgEditModalCtrl($alert, $uibModalInstance, orgDetail, rest) {
        var vm = this;
        vm.orgDetail = orgDetail.data;
        vm.telError = false;
        vm.mpError = false;
        vm.codeError = false;

        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.focus = focus;
        vm.blur = blur;

        function save() {
            if (!vm.orgDetail.tel && !vm.orgDetail.mp) {
                var errorAlert = $alert({
                    content: '联系电话和手机请至少填一个！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            }

            var params = {
                id: vm.orgDetail.id,
                orgName: vm.orgDetail.orgName,
                orgCode: vm.orgDetail.orgCode,
                tel: vm.orgDetail.tel,
                mp: vm.orgDetail.mp,
                contact: vm.orgDetail.contact,
                address: vm.orgDetail.address
            }

            rest.uptOrderOrg(params).then(function (json) {
                if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '机构信息修改成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    }).then(function(){
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

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function focus(argStr) {
            vm[argStr] = false;
        }

        function blur(argStr) {
            vm[argStr] = true;
        }
    }

    newOrgModalCtrl.$inject = ['$alert', '$uibModalInstance', 'restService']

    function newOrgModalCtrl($alert, $uibModalInstance, rest) {
        var vm = this;
        vm.orgDetail = {};
        vm.telError = false;
        vm.mpError = false;
        vm.codeError = false;

        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.focus = focus;
        vm.blur = blur;

        function save() {
            if (!vm.orgDetail.tel && !vm.orgDetail.mp) {
                var errorAlert = $alert({
                    content: '联系电话和手机请至少填一个！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            }

            rest.addOrderOrg(vm.orgDetail).then(function (json) {
                if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '成功新增一个机构！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    }).then(function(){
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

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function focus(argStr) {
            vm[argStr] = false;
        }

        function blur(argStr) {
            vm[argStr] = true;
        }
    }

})();