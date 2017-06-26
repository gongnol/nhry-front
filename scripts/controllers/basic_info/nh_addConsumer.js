/**
 * @ngdoc Controller
 * @name nh_addUser
 *
 * 订户信息录入控制器
 */
(function() {
	'use strict';
	
	angular
		.module('newhope')
		.controller('AddConsumerCtrl', AddConsumerCtrl);

	AddConsumerCtrl.$inject = ['$scope', '$timeout', '$state', '$stateParams', '$alert', 'restService'];

	function AddConsumerCtrl($scope, $timeout, $state, $stateParams, $alert, rest) {
		//var saveAlert = $alert({content: '保存成功！'});
			var vm = this;
			vm.toggle1 = true;
			vm.toggle2 = true;
			vm.isOrg = false;
			vm.checkPhone = checkPhone;
			vm.saveCreate = saveCreate;
			vm.saveInfo = saveInfo;
			vm.viewDetail = viewDetail;
			vm.user = {};
			vm.handle = {};

			if ($stateParams.mp) {
				vm.user.phoneNum = $stateParams.mp;
				vm.userExit = 2;
			    $state.go('newhope.addConsumer.record', {mp: vm.user.phoneNum});
			}

			function checkPhone(e) {
				
				if (e && e.keyCode != 13) {
					vm.checkEmpty = 0;
					vm.userExit = 0;
					return;
				};

				if (vm.user.phoneNum == 1) {
					
					vm.isOrg = true;
					getCsmList();
					

					//console.log(vm.itemsPerPage);
					
				} else {
					vm.isOrg = false;
					//console.log(vm.user.phoneNum);
					if (vm.user.phoneNum) {
						vm.checkEmpty = 0;
						rest.getCsmList({ phone: vm.user.phoneNum }).then(function (json) {
			                var users = json.data.list;
			                if (users.length != 0) {
			                	vm.userExit = 1;
			                	$state.go('newhope.addConsumer.exitInfo', {user: users[0]});
			                } else {
			                	vm.userExit = 2;
			                	$state.go('newhope.addConsumer.record', {mp: vm.user.phoneNum});
			                }
			            });
					} else {
						vm.checkEmpty = 1;
					}
					
					
				}
			}

			function saveInfo() {
				// $resource('http://' + vm.app.host + '/xiexiaojun/rest/vipcust/add')
				// 	.save({}, {
				// 		"vipName": vm.user.name,
				// 		"addressTxt": vm.user.orderORG,
				// 		"province": vm.user.orderStation,
				// 		"city": vm.user.deliver,
				// 		"county": "cn",
				// 		"mp": "001",
				// 		"tel": "14534627543"
				// 	}, function(resp) {
				// 		alart('保存成功' + resp.type);
				// 	}, function(error) {
				// 		alart('保存失败' + error);
				// 	});
				var genderStr = vm.user.gender == '1' ? '女' : '男';
				var contentStr = '保存成功\n用户名：' + vm.user.cName + '\n性别：' + genderStr + '\n征订日期：' + vm.user.orderDate + '\n订奶公司：' + vm.user.orderORG.label;
				var saveAlert = $alert({content: contentStr});
				// saveAlert.show();
				saveAlert.$promise.then(function () {
					saveAlert.show();
				})
			}

			function saveCreate() {
				$state.go('newhope.orderCreate');
			}

			function viewDetail() {
				// vm.toggle2 = false;
				$timeout(function () {
					angular.element('#csmBox').triggerHandler('click');
				}, 0);
				$state.go('newhope.addConsumer.record');
			}

			function getCsmList() {
				vm.content = [];
				vm.pageno = 1; // 初始化页码为1
		        vm.total_count = 0; //页码总数
		        vm.itemsPerPage = 5; //每页显示条数
				vm.getData = function(pageno){ 
					var params = {
		                pageNum: pageno,
		                pageSize: vm.itemsPerPage
		            } 
		            rest.getCsmList(params).then(function (json) {
		                vm.content = json.data.list;
		                vm.total_count = json.data.total;
		            });
		            //分页请求数据，参数 为页码，请求数据最终要放到service里
		        };
		        vm.getData(vm.pageno);
			}
	}
})();