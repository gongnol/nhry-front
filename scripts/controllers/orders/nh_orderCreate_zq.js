(function() {
	'use strict';
	var orderCreateApp = angular
		.module('newhope');
	
	
	//工厂
	orderCreateApp.factory('orderFactory', function() {
        var order = {
        	user:{}
        }
        return order;//返回这个Object对象
    });
		
	
	orderCreateApp.controller('orderCreateCtrl', ['$stateParams', '$scope', '$resource', 'restService', '$alert', "$uibModal","orderFactory", function orderCreateCtrl($stateParams, $scope, $resource, rest, $alert, $uibModal,orderFactory) {
		// 展开收起标识，默认展开
		$scope.toggle1 = true;
		
		$scope.handle = {
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
			}]
		};
		
		//选择的用户
		$scope.selectUser=[];
		/*订户信息查询*/
		var pvm = $scope;
		pvm.search = {};
		pvm.choseStation = false;
		pvm.tbLoding = -1;
		pvm.content = []; //定义的需要数据的集合，
		pvm.pageno = 1; // 初始化页码为1
		pvm.total_count = 0; //页码总数
		pvm.itemsPerPage = 10; //每页显示条数

		pvm.dateFormat = function(dateStr) {
			if(dateStr && typeof(dateStr) === 'string') {
				return moment(dateStr).format('YYYY-MM-DD');
			} else {
				return '';
			}
		}

		pvm.getData = function(pageno) {
			pvm.tbLoding = 1;
			pvm.content = [];
			pvm.total_count = 0;
			var params = {
				pageNum: pageno,
				pageSize: pvm.itemsPerPage,
				content: pvm.search.telephone
			}

			rest.getCsmListByOrg(params).then(function(json) {
				pvm.tbLoding = 0;
				pvm.content = json.data.list;
				/*$.each(pvm.content,function(index,item){
	          		$.each($scope.selectUser,function(ind,ite){
		          		 if(ite){
		          		 	if(ite.vipCustNo==item.vipCustNo){
		           	      		pvm.content[index].checkbox=true;
		        	     	}
		          		 }
          			});
          		});*/
				pvm.total_count = json.data.total;
			});
		};

		pvm.getData(pvm.pageno);

		pvm.getObjByCode = function(code, arr) {
			var label = '',
				len = arr.length;
			for(var i = 0; i < len; i++) {
				var item = arr[i];
				if(item.code == code) {
					label = item.label;
					break;
				}
			}
			return label;
		}
		/*订户信息查询end*/

		pvm.reloadTable = function() {
			pvm.curPageno = 1;
			pvm.getData(pvm.pageno);
		}

		pvm.fuzzySearch = function(e) {
			if(!e || e.keyCode == 13) {
				pvm.reloadTable();
			}
		}

		pvm.chooseCustomer = function(user){
			orderFactory.user=user;
        	pvm.lastOrder = {};
        	pvm.choosedVipCus = user.vipCustNo;
        	pvm.choosedVipCusName =user.cusName;
        	pvm.choosedVipCusTel = user.tel;
        	pvm.branchNo =user.branchNo;
        	pvm.branchName = user.branchName;
        	pvm.vipType = user.vipType;
        	//获取上一张订单
        	rest.selectLatestOrder(user.vipCustNo).then(function (json) {
            	pvm.lastOrder = json.data;
            },function(json){
            	var saveAlert = $alert({
					content: '获取上次的订单失败！'+json.data.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function () {
	                saveAlert.show();
	            })
            });
        }

		pvm.createOrder = function(user) {
			orderFactory.user=user;
			angular.element("#changetab2").click();
		}

		// 子级传递用户编号  
		pvm.toTab = function(id){
			if(orderFactory.user){
				//sendCusNo(pvm.choosedVipCus+"%"+pvm.choosedVipCusName+"%"+pvm.choosedVipCusTel+"%"+pvm.branchNo+"%"+pvm.branchName+"%"+pvm.vipType);
	    		angular.element("#changetab"+id).click();
			}else{
				var saveAlert = $alert({
					content: '请先选择订户！',
					container: '#body-alert'
				})
				saveAlert.$promise.then(function () {
	                saveAlert.show();
	            })
				return;
			}
		
	    }

		function sendCusNo(type) {  
            $scope.transferType = type;  
            $scope.$emit('transfer.type', type);  
		}  
	/*
		 pvm.chekOne=function(check,val){
        	if(check){
        		$scope.selectUser.push(val);
        	}else{
        		$.each($scope.selectUser,function(index,item){
	          		 if(item){
	          		 	if(item.vipCustNo==val.vipCustNo){
	           	      		$scope.selectUser.splice(index,1);
	        	     	}
	          		 }
          		});
        	}
        	orderFactory.user=$scope.selectUser;
        	console.debug(JSON.stringify(orderFactory.user));
        }*/
	
	
	}])

	orderCreateApp.controller('createOrderCtrl', function($rootScope, $state, $scope, $resource, $uibModal, $alert, restService,orderFactory) {
		//用户账号信息
		$scope.account = {};
		//年卡账号信息
		$scope.promData = {};
		$scope.order={paymentStat:''};
		$scope.order.paymentStat=20;

		//获取账号信息
		$scope.getAccount = function() {
			alert(JSON.stringify(orderFactory));
			restService.getCustomerRemainAmt(orderFactory.user.vipCustNo).then(function(json) {
				var result = json.type;
				if(result == 'success') {
					$scope.account = json.data;
				}
			}, function(json) {
				var saveAlert = $alert({
					content: '加载帐户信息失败！' + json.data.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function() {
					saveAlert.show();
				})
			});
		}
	/*	$scope.getAccount();*/

		//获取年卡信息

		$scope.getAromData = function() {
			restService.selYearCardPromCreatOrder().then(function(json) {
				$scope.promData.promTypes = json.data;
			}, function(reject) {
				var errAlert = $alert({
					title: '获取年卡信息失败！',
					content: '<br/>' + json.data.msg,
					container: '#body-alert'
				})
				errAlert.$promise.then(function() {
					errAlert.show();
				})
				$scope.promData.promIdx = null;
			})
		}
		$scope.getAromData();
		//2.订单计划
		//产品参数
		$scope.entries = [{
			"dispTotal": 365,
			"matnr": "000000000050003204",
			"matnrTxt": "巴氏鲜牛奶",
			"reachTimeType": "10",
			"unit": "袋",
			"gapDays": 0,
			"qty": "2",
			"salesPrice": 2.8,
			"rowNum": 100,
		}]
		//产品弹窗
		$scope.addProduct = function() {
			var modalInst = $uibModal.open({
				templateUrl: 'productSearchCtrl.html',
				controller: 'productSearchCtrl',
				resolve: {
					user: function() {
						return orderFactory.user;
					},
					entries: function() {
						return $scope.entries;
					}
				},
				size: 'xxl'
			});
			modalInst.result.then(function() {
				pvm.getData(pvm.pageno);
			});
		}
		
		$scope.cancelModal = function() {
			$uibModalInstance.dismiss();
		}

		//预览日计划
		
		$scope.tosee = function() {
			var entity = {
				"order": {
					"milkboxStat": "20",
					"frontAmt": 1314,
					"paymentStat": "20",
					"branchNo": "0300015903",
					"milkmemberNo": "01590333339999124",
					"milkmemberName": "测试订户25",
					"branchName": "索山中转",
					"deliveryType": "20",
					"adressNo": "00BBB0A5C8A74554A0F6457582FF117B"
				},
				"entries": [{
					"dispTotal": 365,
					"matnr": "000000000050003210",
					"matnrTxt": "200屋鲜",
					"reachTimeType": "10",
					"unit": "盒",
					"gapDays": 0,
					"qty": "1",
					"salesPrice": 3.6,
					"rowNum": 100,
					"$$hashKey": "object:528",
					"startDispDateStr": "2017-05-31",
					"ruleType": "10",
					"endDispDateStr": "2018-05-30",
					"entryTotal": 1314
				}]
			}

			/*配送规律，要修改成符合后台模式*/
			/*for(var idx = 0; idx < entity.entries.length; idx++){
	    		var week = entity.entries[idx];
	    		if(week.sendByWeeks!=undefined){
	    			//周期
	    			var ruleType = "20";
	    			var ruleTxt = "";
	    			if(week.sendByWeeks.mon==true)ruleTxt=ruleTxt+"1,";
	    			if(week.sendByWeeks.tue==true)ruleTxt=ruleTxt+"2,";
	    			if(week.sendByWeeks.wed==true)ruleTxt=ruleTxt+"3,";
	    			if(week.sendByWeeks.tur==true)ruleTxt=ruleTxt+"4,";
	    			if(week.sendByWeeks.fri==true)ruleTxt=ruleTxt+"5,";
	    			if(week.sendByWeeks.sat==true)ruleTxt=ruleTxt+"6,";
	    			if(week.sendByWeeks.sun==true)ruleTxt=ruleTxt+"7";
	    			if(ruleTxt==''){
                            var saveAlert = $alert({
                            content: '请选择配送日期！',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        return;
                    }
	    			week.ruleType = ruleType;
	    			week.ruleTxt = ruleTxt;
	    		}
	    		else if(week.sendByGaps!=undefined||week.gapDays!=undefined){
	    			//间隔
	    			var ruleType = "10";
	    			week.ruleType = ruleType;
	    		}
	    	}*/

			/*editend*/
			restService.toViewOrderPlans(entity).then(function(json) {
				var result = json.type;
				if(result == 'success') {
					var modalInst = $uibModal.open({
						templateUrl: 'views/orders/nh_orderPlanPreview.html',
						controller: 'OrderPreviewModalCtrl',
						controllerAs: 'oppm',
						size: 'lg',
						resolve: {
							planlist: function() {
								return json.data;
							}
						}
					});
				}
			}, function(json) {
				var saveAlert = $alert({
					content: '日计划预览失败！' + json.data.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function() {
					saveAlert.show();
				})
			});
		}
		
		
		//上一页
		$scope.toTab = function(id){
			angular.element("#changetab"+id).click();
	    }
		//4.创建订单
		
		//删除产品
		$scope.deleteEntry = function(entry) {
			console.debug(JSON.stringify(entry))
			$.each($scope.entries,function(index, item){
				if(entry.matnr == item.matnr ){
					$scope.entries.splice(index,1);
				}
			});
		}
	});

	orderCreateApp.controller('productSearchCtrl', function($rootScope, $state, $scope, $resource, $uibModal, $uibModalInstance, $alert, restService, user, entries) {
		var vm = $scope;
		vm.tbLoding = -1;
		vm.content = []; //定义的需要数据的集合，
		vm.pageno = 1; // 初始化页码为1
		vm.total_count = 0; //页码总数
		vm.itemsPerPage = 5; //每页显示条数
		vm.matnrTxt = "";
		vm.getData = function(pageno) {
			vm.tbLoding = 1;
			vm.content = [];
			vm.total_count = 0;
			var params = {
				pageNum: pageno,
				pageSize: vm.itemsPerPage,
				matnrTxt: vm.matnrTxt,
				branchNo: user.branchNo
			}
			restService.getCanSellProducts(params).then(function(json) {
				vm.tbLoding = 0;
				vm.content = json.data.list;
				vm.total_count = json.data.total;
			});
		};
		//重新加载商品datatable
		vm.reloadProductTable = function() {
			vm.curPageno = 1;
			vm.getData(vm.pageno);
		}
		vm.reloadProductTable();
		vm.dateFormat = function(dateStr) {
			if(dateStr && typeof(dateStr) === 'string') {
				return moment(dateStr).format('YYYY-MM-DD');
			} else {
				return '';
			}
		}
		
		
		vm.addProduct = function(item, index) {
			if(item.qty) {
				entries.push({
					"dispTotal": 365,
					"matnr": item.matnr,
					"matnrTxt": item.matnrTxt,
					"reachTimeType": "10",
					"unit": item.zbotCodeName,
					"gapDays": 0,
					"qty": item.qty,
					"salesPrice": 3.9,
					"rowNum": index,
				});
			  var saveAlert = $alert({
                    content: '添加成功！',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
			}else{
		 	 	 var saveAlert = $alert({
                    content: '请输入数量！',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
			}
		}
		
		
		vm.cancelModal = function() {
			$uibModalInstance.dismiss();
		}

		/*订单所有需要的数据end*/
		vm.areaSelected = function(item) {
			vm.residentArea = item;
			$scope.newAddr.arrs = [];
			$scope.newAddr.arrs[0] = {
				itemCode: item.province,
				itemName: item.provinceName
			};
			$scope.newAddr.arrs[1] = {
				itemCode: item.city,
				itemName: item.cityName
			};
			$scope.newAddr.arrs[2] = {
				itemCode: item.county,
				itemName: item.countyName
			};
		}


		//商品行选择配送方式，切换tab页时，清空另一页数据
		vm.changeDeliveryType = function(rowNum, type) {
			if(type == 0) {
				//按周期送
				for(var idx = 0; idx < vm.entries.length; idx++) {
					if(vm.entries[idx].rowNum == rowNum) {
						vm.entries[idx].sendByWeeks = undefined;
						vm.entries[idx].ruleTxt = undefined;
						break;
					}
				}
			} else if(type == 1) {
				//按星期送
				for(var idx = 0; idx < vm.entries.length; idx++) {
					if(vm.entries[idx].rowNum == rowNum) {
						vm.entries[idx].sendByWeeks = {
							mon: true,
							tue: true,
							wed: true,
							tur: true,
							fri: true,
							sat: true,
							sun: true
						};
						vm.entries[idx].gapDays = undefined;
						vm.entries[idx].sendByGaps = undefined;
						break;
					}
				}
			}
		}

		//订单行项目计算金额和截止日期
		vm.calentry = function(rowNum) {
			// setTimeout('calentryd(rowNum)',2000);
			for(var idx = 0; idx < vm.entries.length; idx++) {
				var week = vm.entries[idx];
				if(week.rowNum == rowNum) {
					if((week.gapDays == undefined && week.sendByWeeks == undefined) || week.startDispDateStr == undefined) return;
					if(week.sendByWeeks != undefined) {
						//周期
						var ruleType = "20";
						var ruleTxt = "";
						if(week.sendByWeeks.mon == true) ruleTxt = ruleTxt + "1,";
						if(week.sendByWeeks.tue == true) ruleTxt = ruleTxt + "2,";
						if(week.sendByWeeks.wed == true) ruleTxt = ruleTxt + "3,";
						if(week.sendByWeeks.tur == true) ruleTxt = ruleTxt + "4,";
						if(week.sendByWeeks.fri == true) ruleTxt = ruleTxt + "5,";
						if(week.sendByWeeks.sat == true) ruleTxt = ruleTxt + "6,";
						if(week.sendByWeeks.sun == true) ruleTxt = ruleTxt + "7";
						week.ruleType = ruleType;
						week.ruleTxt = ruleTxt;
					} else if(week.sendByGaps != undefined || week.gapDays != undefined) {
						//间隔
						var ruleType = "10";
						week.ruleType = ruleType;
					}
					if(vm.order.paymentStat == '20') {
						rest.calculateAmtAndEndDate(week).then(function(json) {
							week.endDispDateStr = json.data.endDispDateStr;
							vm.order.frontAmt -= week.entryTotal == undefined ? 0 : week.entryTotal;
							week.entryTotal = json.data.entryTotal;
							vm.order.frontAmt += week.entryTotal == undefined ? 0 : week.entryTotal;
						})
						break;
					} else {
						rest.calculateQtyAndAmt(week).then(function(json) {
							week.dispTotal = json.data.dispTotal;
							vm.order.frontAmt -= week.entryTotal == undefined ? 0 : week.entryTotal;
							week.entryTotal = json.data.entryTotal;
							vm.order.frontAmt += week.entryTotal == undefined ? 0 : week.entryTotal;
						})
						break;
					}
				}
			}
		}

		vm.calentry2 = function(index) {
			var idx = index.$scope.$index;
			var week = vm.entries[idx];
			if((week.gapDays == undefined && week.sendByWeeks == undefined) || week.startDispDateStr == undefined) return;
			if(week.sendByWeeks != undefined) {
				//周期
				var ruleType = "20";
				var ruleTxt = "";
				if(week.sendByWeeks.mon == true) ruleTxt = ruleTxt + "1,";
				if(week.sendByWeeks.tue == true) ruleTxt = ruleTxt + "2,";
				if(week.sendByWeeks.wed == true) ruleTxt = ruleTxt + "3,";
				if(week.sendByWeeks.tur == true) ruleTxt = ruleTxt + "4,";
				if(week.sendByWeeks.fri == true) ruleTxt = ruleTxt + "5,";
				if(week.sendByWeeks.sat == true) ruleTxt = ruleTxt + "6,";
				if(week.sendByWeeks.sun == true) ruleTxt = ruleTxt + "7";
				week.ruleType = ruleType;
				week.ruleTxt = ruleTxt;
			} else if(week.sendByGaps != undefined || week.gapDays != undefined) {
				//间隔
				var ruleType = "10";
				week.ruleType = ruleType;
			}
			if(vm.order.paymentStat == '20') {
				if('payment20EndDispDate' == index.$id) {
					rest.calculateQtyAndAmt(week).then(function(json) {
						week.dispTotal = json.data.dispTotal;
						vm.order.frontAmt -= week.entryTotal == undefined ? 0 : week.entryTotal;
						week.entryTotal = json.data.entryTotal;
						vm.order.frontAmt += week.entryTotal == undefined ? 0 : week.entryTotal;
					})
				} else {
					rest.calculateAmtAndEndDate(week).then(function(json) {
						week.endDispDateStr = json.data.endDispDateStr;
						vm.order.frontAmt -= week.entryTotal == undefined ? 0 : week.entryTotal;
						week.entryTotal = json.data.entryTotal;
						vm.order.frontAmt += week.entryTotal == undefined ? 0 : week.entryTotal;
					})
				}

			} else {
				rest.calculateQtyAndAmt(week).then(function(json) {
					week.dispTotal = json.data.dispTotal;
					vm.order.frontAmt -= week.entryTotal == undefined ? 0 : week.entryTotal;
					week.entryTotal = json.data.entryTotal;
					vm.order.frontAmt += week.entryTotal == undefined ? 0 : week.entryTotal;
				})
			}
		}

		vm.fuzzySearch = function(e) {
			if(!e || e.keyCode == 13) {
				vm.reloadProductTable();
			}
		}

		/*创建订单！*/
		vm.toCreateOrder = function() {
			var entity = {};
			entity.order = vm.order;
			entity.entries = vm.entries;
			entity.order.preorderStat = "20";
			//if (!entity.order.empNo) {
			//	var saveAlert = $alert({
			//       content: '请选择送奶员！',
			//       container: '#body-alert'
			//   })
			//   saveAlert.$promise.then(function () {
			//       saveAlert.show();
			//   })
			//   return;
			//}

			if(!vm.promData.promIdx) {
				var saveAlert = $alert({
					content: '没有选择折扣类型，不能创建年卡订单!',
					container: '#body-alert'
				})
				saveAlert.$promise.then(function() {
					saveAlert.show();
				})
				return;
			} else {
				entity.order.discountAmt = vm.promData.promTypes[vm.promData.promIdx].discountAmt;
				entity.order.promotion = vm.promData.promTypes[vm.promData.promIdx].promNo;
				entity.order.promItemNo = vm.promData.promTypes[vm.promData.promIdx].itemNo;
			}

			if(vm.order.paymentStat == '20') {
				if(vm.account != undefined && vm.account != "") {
					entity.account = vm.account;
				}
				entity.order.isPaid = 'Y';
				entity.order.payDateStr = moment().format('YYYY-MM-DD');
			}

			if(vm.address.addressMode == "1") {
				/*格式转换*/
				entity.address = vm.address;
				for(var i = 0; i < vm.newAddr.arrs.length; i++) {
					if(i == 0) entity.address.province = vm.newAddr.arrs[i].itemCode;
					if(i == 1) entity.address.city = vm.newAddr.arrs[i].itemCode;
					if(i == 2) entity.address.county = vm.newAddr.arrs[i].itemCode;
					// if(i==3)entity.address.street = vm.selectAddrObj[i].itemCode;
				};

			}
			/*配送规律，要修改成符合后台模式*/
			for(var idx = 0; idx < entity.entries.length; idx++) {
				var week = entity.entries[idx];
				if(week.sendByWeeks != undefined) {
					//周期
					var ruleType = "20";
					var ruleTxt = "";
					if(week.sendByWeeks.mon == true) ruleTxt = ruleTxt + "1,";
					if(week.sendByWeeks.tue == true) ruleTxt = ruleTxt + "2,";
					if(week.sendByWeeks.wed == true) ruleTxt = ruleTxt + "3,";
					if(week.sendByWeeks.tur == true) ruleTxt = ruleTxt + "4,";
					if(week.sendByWeeks.fri == true) ruleTxt = ruleTxt + "5,";
					if(week.sendByWeeks.sat == true) ruleTxt = ruleTxt + "6,";
					if(week.sendByWeeks.sun == true) ruleTxt = ruleTxt + "7";
					if(ruleTxt == '') {
						var saveAlert = $alert({
							content: '请选择配送日期！',
							container: '#body-alert'
						})
						saveAlert.$promise.then(function() {
							saveAlert.show();
						})
						return;
					}
					week.ruleType = ruleType;
					week.ruleTxt = ruleTxt;
				} else if(week.sendByGaps != undefined || week.gapDays != undefined) {
					//间隔
					var ruleType = "10";
					// var ruleTxt = "";
					// if(week.sendByGaps.sat==true)ruleTxt=ruleTxt+"6,";
					// if(week.sendByGaps.sun==true)ruleTxt=ruleTxt+"7";
					week.ruleType = ruleType;
					// week.ruleTxt = ruleTxt;
				}
			}
			/*editend*/
			$scope.orderCreating = true;
			newOrderByEntity(entity);

		}

		function newOrderByEntity(entity) {
			rest.toCreateOrder(entity).then(function(json) {
				var result = json.type;
				if(result == 'success') {
					$scope.orderCreating = false;
					var saveAlert = $alert({
						content: '订单创建成功！订单号为:' + json.data,
						container: '#body-alert'
					})
					saveAlert.$promise.then(function() {
						saveAlert.show();
					}).then(function() {
						$state.go("newhope.currentYearOrder");
					});
					try {
						$('#createOrderBtn')
							.removeAttr('ng-click')
							.removeAttr('ng-class')
							.attr('disabled', 'disabled');
					} catch(e) {}
				}
			}, function(json) {
				$scope.orderCreating = false;
				var saveAlert = $alert({
					content: '订单创建失败！' + json.data.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function() {
					saveAlert.show();
				})
			});
		}

		/*预览日计划*/
		vm.tosee = function() {
			var entity = {};
			entity.order = vm.order;
			entity.entries = vm.entries;
			/*配送规律，要修改成符合后台模式*/
			for(var idx = 0; idx < entity.entries.length; idx++) {
				var week = entity.entries[idx];
				if(week.sendByWeeks != undefined) {
					//周期
					var ruleType = "20";
					var ruleTxt = "";
					if(week.sendByWeeks.mon == true) ruleTxt = ruleTxt + "1,";
					if(week.sendByWeeks.tue == true) ruleTxt = ruleTxt + "2,";
					if(week.sendByWeeks.wed == true) ruleTxt = ruleTxt + "3,";
					if(week.sendByWeeks.tur == true) ruleTxt = ruleTxt + "4,";
					if(week.sendByWeeks.fri == true) ruleTxt = ruleTxt + "5,";
					if(week.sendByWeeks.sat == true) ruleTxt = ruleTxt + "6,";
					if(week.sendByWeeks.sun == true) ruleTxt = ruleTxt + "7";
					if(ruleTxt == '') {
						var saveAlert = $alert({
							content: '请选择配送日期！',
							container: '#body-alert'
						})
						saveAlert.$promise.then(function() {
							saveAlert.show();
						})
						return;
					}
					week.ruleType = ruleType;
					week.ruleTxt = ruleTxt;
				} else if(week.sendByGaps != undefined || week.gapDays != undefined) {
					//间隔
					var ruleType = "10";
					week.ruleType = ruleType;
				}
			}
			/*editend*/
			rest.toViewOrderPlans(entity).then(function(json) {
				var result = json.type;
				if(result == 'success') {
					var modalInst = $uibModal.open({
						templateUrl: 'views/orders/nh_orderPlanPreview.html',
						controller: 'OrderPreviewModalCtrl',
						controllerAs: 'oppm',
						size: 'lg',
						resolve: {
							planlist: function() {
								return json.data;
							}
						}
					});
				}
			}, function(json) {
				var saveAlert = $alert({
					content: '日计划预览失败！' + json.data.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function() {
					saveAlert.show();
				})
			});
		}

	})

	orderCreateApp.controller('OrderPreviewModalCtrl', ['$uibModalInstance', 'planlist', function($uibModalInstance, planlist) {
		var vm = this;
		vm.planlist = planlist;

		vm.dateFormat = function(dateStr) {
			if(dateStr && typeof(dateStr) === 'string') {
				return moment(dateStr).format('YYYY-MM-DD');
			} else {
				return '';
			}
		}

		vm.statusFormat = function(status) {
			if(status == '10') return '早上配送';
			if(status == '20') return '下午配送';
		}

		vm.cancelModal = function() {
			$uibModalInstance.dismiss();
		}
	}])

})();