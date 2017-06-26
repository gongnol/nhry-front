(function() {
	'use strict';
	
	angular
		.module('newhope')
		.controller('OrgAddConsumerCtrl', OrgAddConsumerCtrl);

	OrgAddConsumerCtrl.$inject = ['$scope', '$state', '$stateParams', '$timeout', '$alert', 'restService'];

	function OrgAddConsumerCtrl($scope, $state, $stateParams, $timeout, $alert, rest) {
			var vm = this;
			vm.user = {};
			vm.handle = {};
			vm.toggle1 = true;
			vm.toggle2 = true;
			vm.orgId = $stateParams.orgId || null;
			if (vm.orgId) {
				$state.current.data.title = '机构新增订户';
			} else {
				$state.current.data.title = '新增订户';
			}
			// 分页数据
			vm.content = []; //定义的需要数据的集合
        	vm.curPageno = 1;
        	vm.total_count = 0; //页码总数
        	vm.itemsPerPage = 5; //每页显示条数

        	vm.getData = getData;
			vm.checkPhone = checkPhone;
			vm.viewDetail = viewDetail;
			vm.getObjByCode = getObjByCode;
			vm.toCsmDetail = toCsmDetail;
			vm.chooseCsm = chooseCsm;

			function checkPhone(e) {
				
				if (e && e.keyCode != 13) {
					vm.checkEmpty = 0;
					vm.userExit = 0;
					return;
				};

				if (vm.user.phoneNum) {
					vm.checkEmpty = 0;
					getDataPromise(1).then(function (json) {
						if (json.data.list.length > 0) {
							vm.userExit = 1;
							vm.content = json.data.list;
	                		vm.total_count = json.data.total;
						} else {
							vm.userExit = 2;
							$state.go('newhope.addCsmByOrg.record', {mp: vm.user.phoneNum, orgId: vm.orgId});
						}
		            });
				} else {
					vm.checkEmpty = 1;
				}
			}

			function viewDetail() {
				$timeout(function () {
					angular.element('#csmBox').triggerHandler('click');
				}, 0);
				$state.go('newhope.addCsmByOrg.record', {mp: vm.user.phoneNum, orgId: vm.orgId});
			}

			function getDataPromise(pageno) {
				vm.content = [];
		        vm.total_count = 0;

		        var params = {
					phone: vm.user.phoneNum,
	                pageNum: pageno,
	                pageSize: vm.itemsPerPage
	            } 

	            return rest.getCsmList(params);
			}

			function getData(pageno) {
	            getDataPromise(pageno).then(function (json) {
            		vm.content = json.data.list;
                	vm.total_count = json.data.total;
	            });
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

			function toCsmDetail(param) {
				var url = $state.href('newhope.consumerDetail', param);
            	window.open(url,'_blank');
			}

			function chooseCsm(custId, custItem) {
				rest.addOrgCust({orgId: vm.orgId, custId: custId}).then(function (json) {
					if(json.type == 'success'){
	                    var alert = $alert({
	                        content: '绑定成功!',
	                        container: '#modal-alert'
	                    });
	                    alert.$promise.then(function () {
	                        alert.show();
	                    });
	                    getData(1);
	                }
				}, function (reject) {
					var alert = $alert({
						title: '绑定失败！',
	                    content: '<br/>' + reject.data.msg,
	                    container: '#modal-alert'
	                })
	                alert.$promise.then(function () {
	                    alert.show();
	                })
				})
			}
	}
})();