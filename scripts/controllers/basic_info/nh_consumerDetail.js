/**
 * @ngdoc Controller
 * @name nh_addUser
 *
 * 订户详情控制器
 */
(function() {
	'use strict';
	
	angular
		.module('newhope')
		.controller('ConsumerDetailCtrl', ConsumerDetailCtrl);

	ConsumerDetailCtrl.$inject = ['$scope', '$state', '$stateParams', '$alert', 'restService'];

	function ConsumerDetailCtrl($scope, $state, $stateParams, $alert, rest) {

			// var actAlert = $alert({content: '保存成功！', placement: 'top', type: 'info', show: false, duration: 3, container: '#body-view'});
			var vm = $scope;
			// 展开收起标识，默认展开
			vm.toggle1 = true;
			vm.toggle2 = true;
			vm.toggle3 = true;
			// 编辑状态标识，true为编辑状态
			vm.editForm = $stateParams.edit
			vm.editLabel = vm.editForm ? '保存' : '编辑';
			// 保存下拉选择控件的可选数据
			vm.handle = {};
			// 订户信息信息
			vm.user = {};
			// 保存其他地址的信息
			vm.addrs = [];
			// 保存已选择地址数据
			vm.selectedAddrs = {};

			rest.codeMap('1006').then(function (json) {
				vm.handle.vipSrcs = json.data;
			})

			rest.codeMap('1007').then(function (json) {
				vm.handle.userTypes = json.data;
			})

			rest.getCustomerRemainAmt($stateParams.vipCustNo).then(function (resp) {
				vm.csmAcctAmt = resp.data.acctAmt || 0;
			})

			rest.getCsmDetail($stateParams.vipCustNo).then(function (resp) {
				var tmp = resp.data;
				vm.user = tmp;
				vm.user.birthday = tmp.birthday ? tmp.birthday.toString().substring(0, 10) : '';
			});

			getAddresses();

			// 编辑和保存切换
			vm.goEdit = function () {
				if (vm.editForm) {
					vm.user.vipSrcName = findItemName(vm.user.vipSrc, vm.handle.vipSrcs);
					vm.user.vipTypeName = findItemName(vm.user.vipType, vm.handle.userTypes);

					rest.uptCsmItem({
						vipCustNo: $stateParams.vipCustNo,
						vipName: vm.user.vipName,
						sex: vm.user.sex,
						mp: vm.user.mp,
						vipMp: vm.user.vipMp,
						email: vm.user.email,
						certId: vm.user.certId,
						birthday: vm.user.birthday,
						vipSrc: vm.user.vipSrc,
						vipType: vm.user.vipType,
						activityNo: vm.user.activityNo,
						memoTxt:vm.user.memoTxt,
						branchNo: vm.user.branchNo,
						addresses: getAddrlist()
					}).then(function (resp) {
						if(resp.type == 'success'){
		                    var alert = $alert({
		                        content: '保存成功!',
		                        container: '#body-alert'
		                    })
		                    alert.$promise.then(function () {
		                        alert.show();
		                    })
		                    vm.editForm = !vm.editForm;
							vm.editLabel = vm.editForm ? '保存' : '编辑';
							getAddresses();
		                }
					}, function (reject) {
						var alert = $alert({
							title: reject.data.type,
	                        content: reject.data.msg,
	                        container: '#body-alert'
	                    })
	                    alert.$promise.then(function () {
	                        alert.show();
	                    })
					});

				} else {
					vm.editForm = !vm.editForm;
					vm.editLabel = vm.editForm ? '保存' : '编辑';
				}
			}

			// 设置默认地址
			vm.setDefault = function (item, idx) {
				//console.log(idx, item);
				var tmpAddr = angular.copy(vm.defaultAddr);
				if (item.isNew) {
					var other = vm.selectedAddrs.others;
					if (!other || !other[idx] || other[idx].length < 3) {
						// 新建的其他地址没有选择时直接返回
						return false;
					}
					if (!item.areaID) {
						// 新建地址的小区没有选择时直接返回
						return false;
					}
					var curSelectAddr = other[idx];
					item.addrStr = curSelectAddr[0].itemName + curSelectAddr[1].itemName + curSelectAddr[2].itemName;
					item.addrObj = {};
				}

				// 选择地址信息交换
				var tmpSelectAddr = angular.copy(vm.selectedAddrs.others[idx]);
				vm.selectedAddrs.others[idx] = angular.copy(vm.selectedAddrs.default);
				vm.selectedAddrs.default = tmpSelectAddr;

				vm.defaultAddr = angular.copy(item);
				vm.defaultAddr.addrObj.isDafault = 'Y';

				tmpAddr.addrObj.isDafault = 'N';
				vm.addrs[idx] = tmpAddr;
			}

			vm.deleteAddr = function (item, idx) {
				if (item.isNew) {
					vm.addrs.splice(idx, 1);
				} else {
					vm.addrs[idx].addrObj.isDelete = 'Y';
				}
			}

			vm.addNewAddr = function () {
				vm.addrs.push({
					isNew: true,
					addrObj: {}
				})
			}

			// 性别描述文字转换
			vm.genderLabel = function (sex) {
				if (sex === '0') {
					return '女士';
				} else if (sex === '1') {
					return '先生';
				} else {
					return '';
				}
			}
			
			vm.getArea = function (addr, idx) {
				//console.log(addr, idx);
				var params = {
					province: addr[0].itemCode,
	  				city: addr[1].itemCode,
	  				county: addr[2].itemCode
				};
				var curAddr;
				rest.searchAreaBySalesOrg(params).then(function (json) {
					if (typeof(idx) != 'undefined') {
						curAddr = vm.addrs[idx];
					} else {
						curAddr = vm.defaultAddr;
					}

					if (curAddr.areaID) {
						curAddr.areaID = '';
					}
					curAddr.areaList = json.data;
					
				})
			}

			vm.clearArea = function (idx) {
				var curAddr;
				if (typeof(idx) != 'undefined') {
					curAddr = vm.addrs[idx];
				} else {
					curAddr = vm.defaultAddr;
				}
				if (curAddr.areaID) {
					curAddr.areaID = '';
				}
				curAddr.areaList = [];
			}

			function findItemName(code, obj) {
				var itemName = '',
					len = obj.length;
				for (var i = 0; i < len; i++) {
					if (obj[i].itemCode == code) {
						itemName =  obj[i].itemName;
						break;
					}
				}
				return itemName;
			};

			function getStr(str) {
				return str || '';
			};

			function getAddresses() {
				vm.addrs = [];
				vm.selectedAddrs.others = [];
				rest.getCustomerAddresses($stateParams.vipCustNo).then(function (json) {
					if (json.type == 'success') {
						if (json.data.length < 1) {
							vm.defaultAddr = {};
							vm.defaultAddr.isNew = true;
							vm.defaultAddr.addrObj = {
								isDafault: 'Y'
							};
						} else {
							json.data.forEach(function (ele) {
								var addrStr = getStr(ele.provinceName) + getStr(ele.cityName) + getStr(ele.countyName);
								if (ele.isDafault == 'Y') {
									vm.defaultAddr = {};
									vm.defaultAddr.addrStr = addrStr;
									vm.defaultAddr.areaStr = getStr(ele.residentialAreaName);
									vm.defaultAddr.areaID = ele.residentialArea;
									vm.defaultAddr.detail = getStr(ele.addressTxt);
									vm.defaultAddr.phone = ele.mp;
									vm.defaultAddr.addrObj = ele;
									rest.searchAreaBySalesOrg({
										province: ele.province,
										city: ele.city,
										county: ele.county
									}).then(function (json) {
										vm.defaultAddr.areaList = json.data;
									})

									// 将读取的地址信息赋值给地址选择控件
									vm.selectedAddrs.default = [];
									vm.selectedAddrs.default[0] = { itemName: ele.provinceName };
									vm.selectedAddrs.default[1] = { itemName: ele.cityName };
									vm.selectedAddrs.default[2] = { itemName: ele.countyName };

								} else {
									var addrItem = {
										addrStr: addrStr,
										areaStr: getStr(ele.residentialAreaName),
										areaID: ele.residentialArea,
										detail: getStr(ele.addressTxt),
										phone: ele.mp,
										addrObj: ele
									}
									rest.searchAreaBySalesOrg({
										province: ele.province,
										city: ele.city,
										county: ele.county
									}).then(function (json) {
										addrItem.areaList = json.data;
									})

									vm.addrs.push(addrItem)

									// 将读取的地址信息赋值给地址选择控件
									vm.selectedAddrs.others.push([{ itemName: ele.provinceName }, { itemName: ele.cityName }, { itemName: ele.countyName }]);
								}
							})
						}
					}
				})
			};

			function getAddrlist() {
				var addrlist = [];
				// 默认地址信息
				var defAddrItem = {
					vipCustNo: $stateParams.vipCustNo,
					isDafault: vm.defaultAddr.addrObj.isDafault,
					residentialArea: vm.defaultAddr.areaID,
					addressTxt: vm.defaultAddr.detail,
					mp: vm.defaultAddr.phone
				};

				if (!vm.defaultAddr.isNew) {
					defAddrItem.addressId = vm.defaultAddr.addrObj.addressId;
				} else {
					defAddrItem.recvName = vm.user.vipName;
				}

				defAddrItem.province = vm.selectedAddrs.default[0].itemCode || undefined;
				defAddrItem.city = vm.selectedAddrs.default[1].itemCode || undefined;
				defAddrItem.county = vm.selectedAddrs.default[2].itemCode || undefined;

				addrlist.push(defAddrItem);

				// 其他地址信息
				vm.addrs.forEach(function (addr, idx) {
					var otherAddrItem = {
						vipCustNo: $stateParams.vipCustNo,
						residentialArea: addr.areaID,
						addressTxt: addr.detail,
						mp: addr.phone
					}

					if (addr.addrObj && addr.addrObj.isDafault) {
						otherAddrItem.isDafault = addr.addrObj.isDafault
					}

					if (addr.addrObj && addr.addrObj.isDelete) {
						otherAddrItem.isDelete = addr.addrObj.isDelete
					} 

					if (vm.selectedAddrs.others && vm.selectedAddrs.others[idx]) {
						otherAddrItem.province = vm.selectedAddrs.others[idx][0].itemCode || undefined;
						otherAddrItem.city = vm.selectedAddrs.others[idx][1].itemCode || undefined;
						otherAddrItem.county = vm.selectedAddrs.others[idx][2].itemCode || undefined;
					}

					if (!addr.isNew) {
						otherAddrItem.addressId = addr.addrObj.addressId;
					} else {
						otherAddrItem.recvName = vm.user.vipName;
					}
					addrlist.push(otherAddrItem);
				})
				return addrlist;
			}
		}
})();