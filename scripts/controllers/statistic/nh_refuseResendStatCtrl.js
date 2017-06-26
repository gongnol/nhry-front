(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('RefuseResendStatCtrl', RefuseResendStatCtrl)
      .controller('RRDetailModalCtrl', RRDetailModalCtrl);

	RefuseResendStatCtrl.$inject = ['$state', '$scope', '$alert', '$uibModal', 'restService'];

	function RefuseResendStatCtrl($state, $scope, $alert, $uibModal, rest) {

        var vm = this;
        vm.search = {};
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = getData;
        vm.showDetail = showDetail;
        vm.sub1day = sub1day;

        rest.getAllMilkmanByBranchNo('', 'milkMan').then(function(json){
            vm.milkmans = json.data;   
        });

        vm.getData(vm.curPageno);

        function getData(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            
            var params = {
                empNo: vm.search.empNo,
                dateStart: vm.search.fromDate,
                dateEnd: vm.search.untilDate,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };

            rest.refuse2receiveResend(params).then(function (json) {
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

        function showDetail(rrNo) {
            var modalInst = $uibModal.open({
                templateUrl: 'rrDetailModal.html',
                controller: 'RRDetailModalCtrl',
                controllerAs: 'rrdm',
                size: 'lg',
                resolve: {
                    rrdItem: function() {
                        return rest.refuse2receiveResendDetail(rrNo);
                    }
                }
            });
        }
        
        function sub1day(date) {
            if (date) {
                return moment(date).subtract(1, 'd').format('YYYY-MM-DD');
            } else {
                return undefined;
            }
        }
	}

    RRDetailModalCtrl.$inject = ['$uibModalInstance', 'rrdItem'];

    function RRDetailModalCtrl($uibModalInstance, rrdItem) {
        var vm = this;
        vm.items = rrdItem.data;
        vm.cancelModal = cancelModal;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }
})();