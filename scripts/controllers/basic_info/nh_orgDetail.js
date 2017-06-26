(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('OrginfoDetailCtrl', OrginfoDetailCtrl);

	OrginfoDetailCtrl.$inject = ['$state', '$stateParams', '$scope', '$alert', '$uibModal', 'restService'];

	function OrginfoDetailCtrl($state, $stateParams, $scope, $alert, $uibModal, rest) {

        var vm = this,
            orgId = $stateParams.orgId;
        
        vm.toggle1 = true;
        vm.toggle2 = true;

        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = getData;
        vm.toCsmDetail = toCsmDetail;
        vm.unbindCsm = unbindCsm;
        vm.getObjByCode = getObjByCode;

        rest.getOrginfoDetail(orgId).then(function (json) {
            vm.orgInfo = json.data;
        }, function (argument) {
            var errorAlert = $alert({
                title: '机构详情查询错误',
                content: '<br/>' + reject.data.msg,
                container: '#modal-alert'
            })
            errorAlert.$promise.then(function () {
                errorAlert.show();
            });
            return;
        })

        vm.getData(vm.curPageno);

        function getData(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            
            var params = {
                orgId: orgId,
                content: vm.searchKey,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };

            rest.getOrgCsmList(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    title: '机构下订户信息查询错误',
                    content: '<br/>' + reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        }

        function toCsmDetail(param) {
            var url = $state.href('newhope.consumerDetail', param);
            window.open(url,'_blank');
        }

        function unbindCsm(csmId) {
            if (confirm('确定要将该订户从本机构里去掉么？')) {
                rest.deleteOrgCust({orgId: orgId, custId: csmId}).then(function (json) {
                    if (json.type === 'success') {
                        var alert = $alert({
                            content: '解绑成功！',
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function () {
                            alert.show();
                        })
                        vm.getData(vm.curPageno);
                    }
                }, function (reject) {
                    var errorAlert = $alert({
                        title: '解绑失败！',
                        content: '<br/>' + reject.data.msg,
                        container: '#modal-alert'
                    })
                    errorAlert.$promise.then(function () {
                        errorAlert.show();
                    })
                })
            }
        }

        function getObjByCode(code) {
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

	}

})();