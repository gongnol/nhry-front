(function() {
	'use strict';
	var orderCreateApp = angular
	  .module('newhope');
	// productApp.controller('productCtrl', ['$locale','$scope','$compile', function($locale,$scope,$compile){
 	//  }]);

	orderCreateApp.controller('orderCreateCtrl', ['$stateParams','$scope','$resource', 'restService' ,'$alert', function orderCreateCtrl($stateParams, $scope, $resource, rest, $alert) {

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

        // $scope.selectCust = $stateParams.selectCust ? true : false;
        // $scope.choosedVipCus = $stateParams.vipCustNo ? $stateParams.vipCustNo : "";
        // $scope.choosedVipCusName = $stateParams.vipCustName ? $stateParams.vipCustName : "";
        // $scope.choosedVipCusTel = $stateParams.vipCustTel ? $stateParams.vipCustTel : "";
        // $scope.branchNo = $stateParams.branchNo ? $stateParams.branchNo : "";
        // $scope.branchName = $stateParams.branchName ? $stateParams.branchName : "";
        // $scope.vipType = $stateParams.vipType ? $stateParams.vipType : "";
        // $scope.orgId = $stateParams.orgId ? $stateParams.orgId : null;
        // $scope.preorderSource = $stateParams.orgId ? '70' : null;

    //     if($stateParams.selectCust){
    //     	var cusNo = $stateParams.vipCustNo ? $stateParams.vipCustNo : "";
    //     	//获取上一张订单
    //     	rest.selectLatestOrder(cusNo).then(function (json) {
    //         	pvm.lastOrder = json.data;
    //         },function(json){
    //         	var saveAlert = $alert({
				// 	content: '获取上次的订单失败！'+json.data.msg,
				// 	container: '#body-alert'
				// })
				// saveAlert.$promise.then(function () {
	   //              saveAlert.show();
	   //          })
    //         });
    //     }

 	  	/*订户信息查询*/
		var pvm = $scope;
        pvm.search = {};
        pvm.choseStation = false;
        pvm.tbLoding = -1;
        pvm.content = []; //定义的需要数据的集合，
        pvm.pageno = 1; // 初始化页码为1
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
        
        pvm.dateFormat = function (dateStr) {
        	if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        pvm.getData = function(pageno){
        	pvm.tbLoding = 1;
            pvm.content = [];
            pvm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: pvm.itemsPerPage,
                content: pvm.search.telephone
            } 
            
            rest.getCsmListWithoutOrg(params).then(function (json) {
            	pvm.tbLoding = 0;
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
            });
        };

        pvm.getData(pvm.pageno); 

        pvm.getObjByCode = function (code, arr) {
            var label = '',
            	len = arr.length;
            for (var i = 0; i < len; i++) {
            	var item = arr[i];
            	if (item.code == code) {
                    label = item.label;
                    break;
                }
            }
            return label;
        }
        /*订户信息查询end*/

        pvm.reloadTable = function(){
        	pvm.curPageno = 1;
        	pvm.getData(pvm.pageno);
        }

        pvm.fuzzySearch = function(e){
        	if (!e || e.keyCode == 13) {
                pvm.reloadTable();
            }
        }

        pvm.chooseCustomer = function(cusNo,cusName,tel,branchNo,branchName,vipType,orgId){
        	pvm.lastOrder = {};
        	pvm.choosedVipCus = cusNo;
        	pvm.choosedVipCusName = cusName;
        	pvm.choosedVipCusTel = tel;
        	pvm.branchNo = branchNo;
        	pvm.branchName = branchName;
        	pvm.vipType = vipType;
        	
        	//获取上一张订单
        	rest.selectLatestOrder(cusNo).then(function (json) {
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

        // 子级传递用户编号  
		pvm.toTab = function(id){
			if(pvm.choosedVipCus==""){
				var saveAlert = $alert({
					content: '请先选择订户！',
					container: '#body-alert'
				})
				saveAlert.$promise.then(function () {
	                saveAlert.show();
	            })
				return;
			}
			sendCusNo(pvm.choosedVipCus+"%"+pvm.choosedVipCusName+"%"+pvm.choosedVipCusTel+"%"+pvm.branchNo+"%"+pvm.branchName+"%"+pvm.vipType);
	    	angular.element("#changetab"+id).click();
	    }

		function sendCusNo(type) {  
            $scope.transferType = type;  
            $scope.$emit('transfer.type', type);  
		}  

	}])
	
	orderCreateApp.controller('productSearchCtrl', ['$rootScope','$state','$scope','$resource','$uibModal', '$alert','restService', function productSearchCtrl($rootScope, $state, $scope, $resource, $uibModal, $alert, rest) {
		var vm = $scope;
		
		//默认值
		$scope.promData = {};
		$scope.defaultValue={};
        $scope.nextDay = function(){
            var date = new Date();
            date.setDate(date.getDate()-1);
            $scope.defaultValue.date = date;
        }()

		$scope.orderCreating = false;

		// 展开收起标识，默认展开
		$scope.toggle1 = true;
		$scope.toggle2 = true;
		$scope.toggle3 = true;
		$scope.toggle4 = true;

		// 父级接收用户编号
		$scope.choosedVipCus = "";
		$scope.choosedVipCusName = "";
		$scope.choosedVipCusTel = "";
		$scope.account={};
		$scope.addressList = {};

		// 获取年卡信息
		rest.selYearCardPromCreatOrder().then(function (json) {
			vm.promData.promTypes = json.data;
		}, function (reject) {
			var errAlert = $alert({
				title: '获取年卡信息失败！',
                content: '<br/>' + json.data.msg,
                container: '#body-alert'
            })
            errAlert.$promise.then(function () {
                errAlert.show();
            })
            vm.promData.promIdx = null;
		})

		$scope.$on('transfer.type', function(event, data) {
			if($scope.choosedVipCus != data.split("%")[0]){
				//换用户时，初始化订单
				$scope.initOrderCreate();
			}
	        $scope.choosedVipCus = data.split("%")[0];
	        $scope.choosedVipCusName = data.split("%")[1];
	        $scope.choosedVipCusTel = data.split("%")[2];
	        $scope.order.branchNo = data.split("%")[3]; 
	        $scope.order.milkmemberNo = $scope.choosedVipCus;
	        $scope.order.milkmemberName = $scope.choosedVipCusName;
	        $scope.order.branchName = data.split("%")[4]; 
	        $scope.order.deliveryType = data.split("%")[5];

			rest.getCustomerRemainAmt($scope.choosedVipCus).then(function (json) {
    			var result = json.type;
                if(result == 'success'){
                	$scope.account = json.data;
                }
        	}, function(json){
				var saveAlert = $alert({
                    content: '加载帐户信息失败！'+json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
        	});
       //  	rest.getAllEmpByBranchNo($scope.order.branchNo).then(function (json) {
    			// var result = json.type;
       //          if(result == 'success'){
       //      		$scope.emps.data = json.data;
       //          }
       //  	},function(json){
       //  		var saveAlert = $alert({
       //              content: '加载收款人失败！'+json.data.msg,
       //              container: '#body-alert'
       //          })
       //          saveAlert.$promise.then(function () {
       //              saveAlert.show();
       //          })
	      //   });
		});

		/*换订户时，初始化地址与账户参数,订单的参数*/
		$scope.initOrderCreate = function (){
			$scope.order = {"milkboxStat":"20","frontAmt":0.00,"paymentStat":'20'};
			/*付款信息*/
			$scope.account = {};
			/*地址信息*/
			$scope.address = {"addressMode":0};
			$scope.newAddr = {arrs: []};
	        /*添加商品行项目*/
	        $scope.addId = {rowNum:100};
		    $scope.entries = [];
		    $scope.confirmAddress={};
		}
		/*init-end*/

		/*获取商品价格*/
		$scope.getProductPrice = function(productId){
			rest.getProductPrice($scope.order.branchNo,productId,$scope.order.deliveryType).then(function (json) {
				return json.data;
			})
		}
		/*获取商品价格end*/

		/*获取小区列表*/
		$scope.getArea = function(addr){
			vm.residentArea = undefined;
			var params = {
				province: addr[0].itemCode,
  				city: addr[1].itemCode,
  				county: addr[2].itemCode
			}
			rest.searchAreaBySalesOrg(params).then(function (json) {
				if (vm.address.residentialArea) {
					vm.address.residentialArea = '';
				}
				vm.residts = json.data;
			})
		}
		/*获取小区列表end*/

		/*跳转tab*/
	    $scope.toTab= function(id){
	    	// if(id==1){
	    	// 	$scope.choosedVipCus = "";
	    	// }
	    	if(id==3){
	    		if (!vm.promData.promIdx) {
	    			var saveAlert = $alert({
                        content: '请选择折扣类型!',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
					return;
	    		}
	    		
	    		rest.getCustomerAddresses($scope.choosedVipCus).then(function (json) {
	    			var result = json.type;
                    if(result == 'success'){
                		$scope.addressList = json.data;
                		var len = json.data.length;
                		for (var i = 0; i < len; i++) {
                			var item = json.data[i];
                			if (item.isDafault=='Y') {
                				$scope.order.adressNo = item.addressId;
                				$scope.confirmAddress = item;
                				break;
                			}
                		}
                    }
            	},function(json){
	            	var saveAlert = $alert({
	                    content: '加载地址失败！' + json.data.msg,
	                    container: '#body-alert'
	                })
	                saveAlert.$promise.then(function () {
	                    saveAlert.show();
	                })
	            });
	            
	            if ($rootScope.$storage.user && $rootScope.$storage.user.branchNo) {
	            	var userBranchNo = $rootScope.$storage.user.branchNo;
	            	rest.getAreaByBranchNo(userBranchNo).then(function (json) {
	            		if (vm.address.residentialArea) {
							vm.address.residentialArea = '';
						}
						vm.residts = json.data;
					})
	            }
	    	}
	    	if(id==4){
	    		if($scope.address.addressMode == '1'){
					if($scope.newAddr.arrs.length < 3  
					   || $scope.address.residentialArea == undefined || $.trim($scope.address.residentialArea) == ""
					   || $scope.address.addressTxt == undefined || $.trim($scope.address.addressTxt) == ""
					   || $scope.address.mp == undefined || $.trim($scope.address.mp) == ""){
						var saveAlert = $alert({
	                            content: '必填写项必须填写完毕!',
	                            container: '#body-alert'
	                        })
	                        saveAlert.$promise.then(function () {
	                            saveAlert.show();
	                        })
						return;
					}
					var mpReg = /^\d{11}$/;
					var testReg = mpReg.test($scope.address.mp);
					if (!testReg) {
						var saveAlert = $alert({
	                            content: '电话号码不合法，请重新输入!',
	                            container: '#body-alert'
	                        })
	                        saveAlert.$promise.then(function () {
	                            saveAlert.show();
	                        })
						return;
					}
	    		}else if($scope.address.addressMode != '0' || ($scope.address.addressMode=='0'&&($scope.order.adressNo==undefined||$scope.order.adressNo==""))  ){
	    			var saveAlert = $alert({
	                            content: '请选择或填写地址信息!',
	                            container: '#body-alert'
	                        })
	                        saveAlert.$promise.then(function () {
	                            saveAlert.show();
	                        })
						return;
	    		}
				if($scope.order.branchNo == undefined || $scope.order.branchNo == ""){
					var saveAlert = $alert({
                            content: '没有奶站!',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
					return;
				}
				vm.curPageno = 1;
				vm.getData(vm.pageno);
	    	}
	    	if(id==5){
	    		if(vm.entries.length<=0){
	    			var saveAlert = $alert({
                            content: '请选择至少一件产品!',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
					return;
	    		}
	    		rest.getAllMilkmanByBranchNo($scope.order.branchNo,'milkMan').then(function (json) {
    			var result = json.type;
                if(result == 'success'){
            		$scope.emps.data = json.data;
                }
	        	},function(json){
	        		var saveAlert = $alert({
	                        content: '加载送奶员失败！'+json.data.msg,
	                        container: '#body-alert'
	                    })
	                    saveAlert.$promise.then(function () {
	                        saveAlert.show();
	                    })

	        	});
	    	}
	    	/*去下一页*/
	    	angular.element("#changetab"+id).click();
	    }

	    // $scope.branchList = {
	    // };

	    $scope.deliveryTime = {
            data:[
	   		{"code":"10","text":"上午配送"},
		    {"code":"20","text":"下午配送"}]
	    };

		$scope.milkBoxs = {
            data:[
	   		{"code":"10","text":"已安装"},
		    {"code":"20","text":"需要安装"},
		    {"code":"30","text":"不需要安装"}]
	    };

	    vm.getPromotions = function(matnr){
	    	vm.promotions = undefined;
            rest.getPromotionByMatnr(matnr).then(function(json){
              vm.promotions = json.data;   
            })
        }

	    $scope.emps = {};

	    /*确认订单显示地址信息*/
	    $scope.confirmAddress={};
	    $scope.setAddress = function(addressId){
	    	for(var idx = 0;idx < $scope.addressList.length;idx++){
	    		if($scope.addressList[idx].addressId == addressId){
	    			$scope.confirmAddress = $scope.addressList[idx];
	    			break;
	    		}
	    	}
	    }

		/*product-angular-table*/
		vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 5; //每页显示条数
        vm.matnrTxt = "";

        vm.getData = function(pageno){ 
        	vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                status:'Y',
                matnrTxt:vm.matnrTxt,
                branchNo:vm.order.branchNo
            }

            rest.getYearcardCanSellProducts(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };

        vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

		/*订单所有需要的数据*/
	    vm.initOrderCreate();
	    /*订单所有需要的数据end*/

		vm.areaSelected = function(item){
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

	    vm.addToOrder = function(id){
	    	// var product = [];
	    	// product.id = id;
	    	// $scope.entries.push(product);
	    }

	    vm.deleteEntry = function(rowNum){
	    	for (var idx = 0; idx < vm.entries.length; idx++) {
	    		if(vm.entries[idx].rowNum == rowNum){
	    			vm.order.frontAmt -= vm.entries[idx].entryTotal==undefined?0:vm.entries[idx].entryTotal;
	    			vm.entries.splice(idx,1);
	    			break;
	    		}
	    	};
	    }

	    //商品行选择配送方式，切换tab页时，清空另一页数据
	    vm.changeDeliveryType = function(rowNum,type){
	    	if(type==0){
	    		//按周期送
	    		for (var idx = 0; idx < vm.entries.length; idx++) {
		    		if(vm.entries[idx].rowNum == rowNum){
		    			vm.entries[idx].sendByWeeks = undefined;
		    			vm.entries[idx].ruleTxt = undefined;
		    			break;
		    		}
		    	}
	    	}else if(type==1){
	    		//按星期送
	    		for (var idx = 0; idx < vm.entries.length; idx++) {
		    		if(vm.entries[idx].rowNum == rowNum){
		    			vm.entries[idx].sendByWeeks = {
		    				mon:true,
			    			tue:true,
			    			wed:true,
			    			tur:true,
			    			fri:true,
			    			sat:true,
			    			sun:true
		    			};
		    			vm.entries[idx].gapDays = undefined;
		    			vm.entries[idx].sendByGaps = undefined;
		    			break;
		    		}
	    		}
	    	}
	    }

	    //订单行项目计算金额和截止日期
		vm.calentry = function(rowNum){
			// setTimeout('calentryd(rowNum)',2000);
	    	for (var idx = 0; idx < vm.entries.length; idx++) {
				var week = vm.entries[idx];
	    		if(week.rowNum == rowNum){
	    			if((week.gapDays==undefined&&week.sendByWeeks==undefined)||week.startDispDateStr==undefined)return;
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
		    			week.ruleType = ruleType;
		    			week.ruleTxt = ruleTxt;
		    		}
		    		else if(week.sendByGaps!=undefined||week.gapDays!=undefined){
		    			//间隔
		    			var ruleType = "10";
		    			week.ruleType = ruleType;
		    		}
		    		if(vm.order.paymentStat=='20'){
		    			rest.calculateAmtAndEndDate(week).then(function (json) {
							week.endDispDateStr = json.data.endDispDateStr;
							vm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
							week.entryTotal = json.data.entryTotal;
							vm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
						})
		    			break;
					}else{
						rest.calculateQtyAndAmt(week).then(function (json) {
							week.dispTotal = json.data.dispTotal;
							vm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
							week.entryTotal = json.data.entryTotal;
							vm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
						})
						break;
					}
	    		}
			}
	    }

	    vm.calentry2 = function(index){
	    	var idx = index.$scope.$index;
			var week = vm.entries[idx];
			if((week.gapDays==undefined&&week.sendByWeeks==undefined)||week.startDispDateStr==undefined)return;
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
    			week.ruleType = ruleType;
    			week.ruleTxt = ruleTxt;
    		}
    		else if(week.sendByGaps!=undefined||week.gapDays!=undefined){
    			//间隔
    			var ruleType = "10";
    			week.ruleType = ruleType;
    		}
	    	if(vm.order.paymentStat=='20'){
				if('payment20EndDispDate' == index.$id){
					rest.calculateQtyAndAmt(week).then(function (json) {
						week.dispTotal = json.data.dispTotal;
						vm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
						week.entryTotal = json.data.entryTotal;
						vm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
					})
				}
				else{
					rest.calculateAmtAndEndDate(week).then(function (json) {
						week.endDispDateStr = json.data.endDispDateStr;
						vm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
						week.entryTotal = json.data.entryTotal;
						vm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
					})
				}

	    	}else{
				rest.calculateQtyAndAmt(week).then(function (json) {
					week.dispTotal = json.data.dispTotal;
					vm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
					week.entryTotal = json.data.entryTotal;
					vm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
				})
	    	}
	    }

	    //重新加载商品datatable
	    vm.reloadProductTable = function(){
	    	vm.curPageno = 1;
	    	vm.getData(vm.pageno);
	    }

    	vm.fuzzySearch = function(e){
        	if (!e || e.keyCode == 13) {
                vm.reloadProductTable();
            }
        }

	    /*创建订单！*/
	    vm.toCreateOrder = function(){
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

	    	if (!vm.promData.promIdx) {
    			var saveAlert = $alert({
                    content: '没有选择折扣类型，不能创建年卡订单!',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
				return;
    		} else {
    			entity.order.discountAmt = vm.promData.promTypes[vm.promData.promIdx].discountAmt;
    			entity.order.promotion = vm.promData.promTypes[vm.promData.promIdx].promNo;
    			entity.order.promItemNo = vm.promData.promTypes[vm.promData.promIdx].itemNo;
    		}

	    	if(vm.order.paymentStat == '20'){
	    		if(vm.account!=undefined&&vm.account!=""){
	    			entity.account = vm.account;
	    		}
	    		entity.order.isPaid = 'Y';
	    		entity.order.payDateStr = moment().format('YYYY-MM-DD');
	    	}

	    	if(vm.address.addressMode == "1"){
	    		/*格式转换*/
	    		entity.address = vm.address;
	    		for (var i = 0;  i< vm.newAddr.arrs.length; i++) {
	    			if(i==0)entity.address.province = vm.newAddr.arrs[i].itemCode;
	    			if(i==1)entity.address.city = vm.newAddr.arrs[i].itemCode;
	    			if(i==2)entity.address.county = vm.newAddr.arrs[i].itemCode;
	    			// if(i==3)entity.address.street = vm.selectAddrObj[i].itemCode;
	    		};
	    		
	    	}
	    	/*配送规律，要修改成符合后台模式*/
	    	for(var idx = 0; idx < entity.entries.length; idx++){
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
	    	rest.toCreateOrder(entity).then(function (json) {
	    			var result = json.type;
                    if(result == 'success'){
                    	$scope.orderCreating = false;
                		var saveAlert = $alert({
                            content: '订单创建成功！订单号为:'+json.data,
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function () {
                            $state.go("newhope.currentYearOrder");
                        });
                        try{
                       		$('#createOrderBtn')
	                        .removeAttr('ng-click')
	                        .removeAttr('ng-class')
	                        .attr('disabled','disabled');
                       	}catch(e){
                       	}
                    }   
            },function(json){
            	$scope.orderCreating = false;
            	var saveAlert = $alert({
                    content: '订单创建失败！' + json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
	    }

	    /*预览日计划*/
	    vm.tosee = function(){
	    	var entity = {};
	    	entity.order = vm.order;
	    	entity.entries = vm.entries;
	    	/*配送规律，要修改成符合后台模式*/
	    	for(var idx = 0; idx < entity.entries.length; idx++){
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
	    	}
	    	/*editend*/
	    	rest.toViewOrderPlans(entity).then(function (json) {
	    			var result = json.type;
                    if(result == 'success'){
                    	var modalInst = $uibModal.open({
			                templateUrl: 'views/orders/nh_orderPlanPreview.html',
			                controller: 'OrderPreviewModalCtrl',
			                controllerAs: 'oppm',
			                size: 'lg',
			                resolve: {
			                    planlist: function () {
			                    	return json.data;
			                    }
			                }
			            });
                    }   
            },function(json){
            	var saveAlert = $alert({
                    content: '日计划预览失败！' + json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
	    }

	}])

	orderCreateApp.controller('OrderPreviewModalCtrl', ['$uibModalInstance', 'planlist', function ($uibModalInstance, planlist) {
		var vm = this;
		vm.planlist = planlist;

		vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

		vm.statusFormat = function(status){
            if(status=='10')return '早上配送';
            if(status=='20')return '下午配送';
        } 

        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
	}])

})();