/**
 * 学生奶/学校牛奶品种政策
 */
(function() {
    'use strict';
    var myApp =angular
        .module('newhope')
        .controller('classForMilkCtrl', classForMilkCtrl)
        .controller('BatchBuildRquireMilkCtrl', BatchBuildRquireMilkCtrl)
        .controller('StudMilkOrderCtrl', StudMilkOrderCtrl)
        .controller('StudMilkOrderCtrl2', StudMilkOrderCtrl2)
        .controller('StudMilkOrderCtrl3', StudMilkOrderCtrl3)
        .controller('removeProductModal', removeProductModal)
        .controller('exportSumExcelCtrl', exportSumExcelCtrl);
        
    classForMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService'];
    function classForMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest) {
        var vm = $scope;
        vm.tbLoding = 1; // 数据表加载状态，-1初始状态，1加载中，0加载完成
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.search = {};
        vm.doSearch = function(){
        	vm.getData(1);
        }
        vm.filterCount = function(c){
	    	if(null == c || '' == c){
	    		return '0';
	    	}
	    	return c;
	    }
        vm.fuzzySearch = function(e){
        	if(e && e.keyCode != '13'){
    			return;
        	}
        	vm.getData(1);
        }
        vm.getData = function(pageno){ 
        	vm.content = [];
           	vm.tbLoding = 1;
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                keyWord:vm.search.keyWord,
                orderDateStr:vm.search.orderDateStr
            };
            rest.studOrderFindOrderPage(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
       } 
       vm.getData(vm.pageno);
       
        
       vm.newInfo = function (order) {
            var modalInst = $uibModal.open({
                templateUrl: 'classMilk.html',
                controller: 'StudMilkOrderCtrl',
                size: 'xxls',
                resolve: {
                    pvm:vm,
                    order:order
                }
            });
              
            modalInst.opened.then(function(){//模态窗口打开之后执行的函数   
               setTimeout(function(){
               	 $("#changetab1").click();
               },1000);
               
         	});
            modalInst.result.then(function(data) {
            	vm.getData(vm.pageno);
            });
        }
       
       vm.exportSumExcel = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'exportSumExcel.html',
                controller: 'exportSumExcelCtrl',
                size: 'lg',
                resolve: {
                }
            });
              
            modalInst.opened.then(function(){//模态窗口打开之后执行的函数   
         	});
            modalInst.result.then(function(data) {
            });
        }
     	
     	
     	
     	vm.newInfo2=function (order) {
            var modalInst = $uibModal.open({
                templateUrl: 'classMilk2.html',
                controller: 'StudMilkOrderCtrl2',
                size: 'xxls',
                resolve: {
                      pvm:vm,
                      order:order 
                }
            });
              
            modalInst.opened.then(function(){//模态窗口打开之后执行的函数   
               setTimeout(function(){
               	 $("#changetab2").click();
               },1000);
         	});
            modalInst.result.then(function(data) {
            	vm.getData(vm.pageno);
            });
        }
     	
     	vm.newInfo3=function (order) {
            var modalInst = $uibModal.open({
                templateUrl: 'classMilk3.html',
                controller: 'StudMilkOrderCtrl3',
                size: 'xxls',
                resolve: {
                      pvm:vm,
                      order:order 
                }
            });
              
            modalInst.opened.then(function(){//模态窗口打开之后执行的函数   
               setTimeout(function(){
               	 $("#changetab2").click();
               },1000);
         	});
            modalInst.result.then(function(data) {
            	vm.getData(vm.pageno);
            });
        }
     	
     	
     	
     	//方法:批量生成要货单据
        vm.batchBuildRquireMilk = function(){
        	var modalInst = $uibModal.open({
                templateUrl: 'batchBuildRquireMilk.html',
                controller: 'BatchBuildRquireMilkCtrl',
                size: 'xxls',
                resolve: {
                    pvm:vm
                }
            });
            modalInst.opened.then(function(){//模态窗口打开之后执行的函数   
               
         	});
            modalInst.result.then(function() {
            	vm.getData(vm.pageno);
            });
        }

        $scope.data2 = {'sending':false};
        //方法:发送erp
        $scope.RquireMilkGoods = function(){
        	$scope.data2.sending = true;
			
        	rest.generateSalesOrder18().then(function (json) {
				$scope.data2.sending = false;
            	var cancelAlert = $alert({
	                content: json.data,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            $scope.doSearch();
            }, function(json){
				$scope.data2.sending = false;
            	var cancelAlert = $alert({
	                content: '处理失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
            });
        }
        

    }
    
    
    StudMilkOrderCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','$uibModalInstance', 'pvm', 'nhCommonUtil', 'order'];
    function StudMilkOrderCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, $uibModalInstance, pvm, nhCommonUtil, order) {
    	var nowDate = nhCommonUtil.offsetDay(new Date(), 0);
        var vm = $scope;
        vm.toNewInfo2 = function(){
        	$uibModalInstance.dismiss();
        	pvm.newInfo2(order);
        }
	    vm.order = {list10:[]};
	    //学生奶总数
	    vm.totalMilkNum = function(){
	    	if(vm.order.list10.length == 0){
	    		return 0;
	    	}
	    	else{
	    		var total = 0;
		    	$.each(vm.order.list10, function(k,v) {
		    		total += v.qty;
		    	});
		    	return total;
	    	}
	    }
	    
	    //学校列表
	    rest.studOrderFindAllSchool().then(function (json) {
	        if(json.type=='success'){
				vm.schoolList=json.data.list;
	        }
	    },function(json){
	       var cancelAlert = $alert({
                content: '获取学校列表失败！' + json.data.msg,
                container: '#body-alert'
            })
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            })
	    });
	    
	    //清空
	    vm.clean = function(){
	    	vm.order.matnr='';
	    	var list = vm.order.list10;
	    	if(null != list && [] != list){
	    		$.each(list, function(k ,v){
	    			v.qty=0;
	    		});
	    	}
	    	list = vm.order.list20;
	    	if(null != list && [] != list){
	    		$.each(list, function(k ,v){
	    			v.qty=0;
	    		});
	    	}
	    	list = vm.order.list30;
	    	if(null != list && [] != list){
	    		$.each(list, function(k ,v){
	    			v.qty=0;
	    		});
	    	}
	    }
	    
	    //计算损耗
	    vm.calcLoss = function(){
	    	
	    	//学生奶奶品数>0,必须选择奶品品种
	    	if(null != vm.totalMilkNum() && vm.totalMilkNum()>0){
	    		if(null == vm.order.matnr || '' == vm.order.matnr){
	    			var cancelAlert = $alert({
		                content: '学生奶请选择品种!',
		                container: '#body-alert'
		            });
		            cancelAlert.$promise.then(function () {
		                cancelAlert.show();
		            });
		            return;
	    		}
	    	}
	    	
	    	$('#calcing').attr('disabled', 'disabled');
	    	
	    	//计算前初始化
	    	if(null != vm.order.list30 && vm.order.list30 != []){
				$.each(vm.order.list30, function(k, v){
	        		v.qty = 0;
					v.qty2 = 0;
		        });	    		
	    	}
	    	
	    	/**
	    	 * 计算损耗
	    	 */
	    	if(null != vm.order.list30 && vm.order.list30 != []){
	    		//后台计算之前，前端数据处理
	    		$.each(vm.order.list30, function(k, v){
	    			var im = v.matnr;
	    			if(null != vm.totalMilkNum() && vm.totalMilkNum()>0){
	    				if(im == vm.order.matnr){
	    					v.qty2 = v.qty2+vm.totalMilkNum();
	    				}
	    			}
	    			//老师奶的数量不累加，老师奶不计算损耗
//	    			$.each(vm.order.list20, function(k2, v2){
//	    				if(im == v2.matnr){
//	    					if(v2.qty != null && v2.qty > 0){
//	    						v.qty2 = v.qty2+v2.qty;
//	    					}
//	    					return;
//	    				}
//	    			});
	    		});
	    		
	    		//后台计算
	    		$.each(vm.order.list30, function(k, v){
	    			if(null != v.matnr){
	    				var params = {
				    		schoolCode:vm.order.schoolCode,
				    		matnr:v.matnr,
				    		matnrCount:v.qty2
				    	}
				    	rest.studOrderCalcLoss(params).then(function(json){
				    		if(null != json.data && json.data > 0){
								v.qty = v.qty+json.data;				    			
				    		}
				    	},function(json){
				    		var cancelAlert = $alert({
				                content: '损耗计算失败！'+json.data.msg,
				                container: '#body-alert'
				            });
				            cancelAlert.$promise.then(function () {
				                cancelAlert.show();
				            });
				    	});
	    			}
	    		});
	    		$('#calcing').removeAttr('disabled');
	    	}
	    }
	    
	    
	    //奶品列表
        rest.studOrderFindMaraStudAllList().then(function (json) {
	        if(json.type=='success'){
				vm.milkTypeList=json.data;
	        }
	    },function(json){
	       var cancelAlert = $alert({
                content: '获取奶品列表失败！' + json.data.msg,
                container: '#body-alert'
            })
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            })
	    });
	    vm.order.orderDateStr = nowDate;
	    vm.order.takeOrderDateStr = nowDate;
	    
	    //取数
	    vm.findOrderInfo = function(state){
	    	if(null == vm.order.orderDateStr || null == vm.order.takeOrderDateStr){
	    		var cancelAlert = $alert({
	                content: '目标日期和取数日期必填',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
	    	}
	    	vm.order.orderId='';
	    	vm.order.matnr='';
	    	vm.order.list10=[];
	    	vm.order.list20=[];
	    	vm.order.list30=[];
	    	var param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.takeOrderDateStr};
	    	rest.studOrderFindOrderInfoBySchoolCodeAndDate(param).then(function(json){
	    		vm.order.list10 = json.data.list10;
	    		vm.order.list20 = json.data.list20;
	    		vm.order.list30 = json.data.list30;
	    		if(null != json.data.orderStud){
					//vm.order.orderId = json.data.orderStud.orderId;
					vm.order.matnr = json.data.orderStud.matnr;
					if("1" == state){
		    			//不用提示
	    			}
					else{
						var cancelAlert = $alert({
			                content: '取数成功！',
			                container: '#body-alert'
			            });
			            cancelAlert.$promise.then(function () {
			                cancelAlert.show();
			            });
					}
				}
	    		else{
					var cancelAlert = $alert({
		                content: '你选择的取数日期系统不存在订单数据, 已为你初始化页面所需数据',
		                container: '#body-alert'
		            });
		            cancelAlert.$promise.then(function () {
		                cancelAlert.show();
		            });
		            rest.studOrderFindDefaultMaraForSchool({'schoolCode':vm.order.schoolCode}).then(function(json){
	    				if(json.type == 'success' && null != json.data && '' != json.data){
	    					vm.order.matnr = json.data;
	    				}
	    			},function(json){
	    				
	    			});
	    		}
	    	},function(json){
		    	var cancelAlert = $alert({
	                content: '取数失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    	if(null != vm.order.orderDateStr){
	    		param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.orderDateStr};
	    		rest.studOrderFindOrderInfoBySchoolCodeAndDate(param).then(function(json){
		    		if(null != json.data.orderStud){
						vm.order.orderId = json.data.orderStud.orderId;
						vm.order.isBatch = json.data.orderStud.isBatch;
					}
		    	});
	    	}
	    }
	    
	    //onchange
	    vm.change1 = function(){
	    	vm.findOrderInfo();
	    }
	    
	    //changeToLoadDate
	    vm.changeToLoadDate = function(){
	    	if(null == vm.order.orderDateStr && null != vm.order.matnr && null != vm.order.schoolCode){
	    		var param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.orderDateStr};
	    		rest.studOrderFindOrderInfoBySchoolCodeAndDate(param).then(function(json){
		    		if(null != json.data.orderStud){
						vm.order.orderId = json.data.orderStud.orderId;
						vm.order.isBatch = json.data.orderStud.isBatch;
					}
		    	});
	    	}
	    }
	    
	    //创建订单
	    vm.createOrder = function(){
	    	//前端校验
	    	if(null != vm.order.orderId && '' != vm.order.orderId && !window.confirm('点击确定将会覆盖之前目标日期的订单数据，是否确定？')){
	    		return ;
	    	}
	    	$('#createOrder').attr('disabled','disabled');
	    	rest.studOrderCreateOrder(vm.order).then(function(json){
	    		$('#createOrder').removeAttr('disabled');
	    		$uibModalInstance.dismiss();
	    		var cancelAlert = $alert({
	                content: '保存成功!',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            pvm.getData(pvm.pageno);
	    	},function(json){
	    		$('#createOrder').removeAttr('disabled');
	    		var cancelAlert = $alert({
	                content: '保存失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    }
	    
	    vm.setClass = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'setClass.html',
                controller: 'SetClassCtrl',
                resolve:{
                	order:function(){
                		return vm.order;
                	}
                }
            });
            modalInst.result.then(function(){
            	
            });
        }
	    
	    
        vm.cancelModal = function() {
        	pvm.getData(pvm.pageno);
            $uibModalInstance.dismiss();
        }
        
        //数据回显
        var orderId = (null != order?order.orderId:null);
        if(null != orderId && '' != orderId){
        	rest.studOrderFindByOrderId(orderId).then(function(json){
        		if(json.type == 'success' && null != json.data && json.data != undefined && json.data != ''){
        			var orderDate = json.data.orderDateStr;
        			var schoolCode = json.data.schoolCode;
        			vm.order.orderDateStr = orderDate;
	    			vm.order.takeOrderDateStr = orderDate;
	    			vm.order.schoolCode = schoolCode;
	    			if(null != schoolCode && null != orderDate){
	    				vm.findOrderInfo("1");
	    			}
        		}
        	});
        }
    }
    
    
    
    StudMilkOrderCtrl2.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','$uibModalInstance', 'nhCommonUtil', 'pvm', 'order'];
    function StudMilkOrderCtrl2($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, $uibModalInstance, nhCommonUtil, pvm, order) {
    	var nowDate = nhCommonUtil.offsetDay(new Date(), 0);
        var vm = $scope;
        vm.toNewInfo = function(){
        	$uibModalInstance.dismiss();
        	pvm.newInfo(order);
        }
	    vm.order = {list20:[]};
	    //学校列表
	    rest.studOrderFindAllSchool().then(function (json) {
	        if(json.type=='success'){
				vm.schoolList=json.data.list;
	        }
	    },function(json){
	       var cancelAlert = $alert({
                content: '获取学校列表失败！' + json.data.msg,
                container: '#body-alert'
            })
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            })
	    });
	    
	    //清空
	    vm.clean = function(){
	    	var list = vm.order.list20;
	    	if(null != list && [] != list){
	    		$.each(list, function(k ,v){
	    			v.qty=0;
	    		});
	    	}
	    	list = vm.order.list30;
	    	if(null != list && [] != list){
	    		$.each(list, function(k ,v){
	    			v.qty=0;
	    		});
	    	}
	    }
	    
	    //计算损耗
	    vm.calcLoss = function(){
	    	if(null != vm.order.list30 && vm.order.list30 != []){
				$.each(vm.order.list30, function(k, v){
	        		v.qty = 0;
	        		v.qty2 = 0;
		        });	    		
	    	}
	    	
	    	$('#calcing2').attr('disabled', 'disabled');
	    	
	    	/**
	    	 * 计算损耗
	    	 */
	    	if(null != vm.order.list30 && vm.order.list30 != []){
	    		
	    		//后台计算之前，前端数据处理
	    		$.each(vm.order.list30, function(k, v){
	    			var im = v.matnr;
	    			$.each(vm.order.list20, function(k2, v2){
	    				if(im == v2.matnr){
	    					if(v2.qty != null && v2.qty > 0){
	    						v.qty2 = v.qty2+v2.qty;
	    					}
	    					return;
	    				}
	    			});
	    		});
	    		
	    		
	    		//调用接口
	    		$.each(vm.order.list30, function(k, v){
	    			if(null != v.matnr){
	    				var params = {
				    		schoolCode:vm.order.schoolCode,
				    		matnr:v.matnr,
				    		matnrCount:v.qty2
				    	}
				    	rest.studOrderCalcLoss(params).then(function(json){
				    		if(null != json.data && json.data > 0){
				    			v.qty = v.qty+json.data;
				    		}
				    	},function(json){
				    		var cancelAlert = $alert({
				                content: '损耗计算失败！'+json.data.msg,
				                container: '#body-alert'
				            });
				            cancelAlert.$promise.then(function () {
				                cancelAlert.show();
				            });
				    	});
	    			}
	    		});
	    		$('#calcing2').removeAttr('disabled');
	    	}
	    }
	    
	    vm.order.orderDateStr = nowDate;
	    vm.order.takeOrderDateStr = nowDate;
	    
	    //取数
	    vm.findOrderInfo = function(state){
	    	if(null == vm.order.orderDateStr || null == vm.order.takeOrderDateStr){
	    		var cancelAlert = $alert({
	                content: '目标日期和取数日期必填',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
	    	}
	    	vm.order.orderId='';
	    	vm.order.matnr='';
	    	vm.order.list20=[];
	    	vm.order.list30=[];
	    	var param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.takeOrderDateStr};
	    	rest.studOrderFindOrderInfoBySchoolCodeAndDateUnpack(param).then(function(json){
	    		vm.order.list20 = json.data.list20;
	    		vm.order.list30 = json.data.list30;
	    		if(null != json.data.orderStud){
					//vm.order.orderId = json.data.orderStud.orderId;
					vm.order.matnr = json.data.orderStud.matnr;
					if("1" == state){
		    			//不用提示
	    			}
					else{
						var cancelAlert = $alert({
			                content: '取数成功！',
			                container: '#body-alert'
			            });
			            cancelAlert.$promise.then(function () {
			                cancelAlert.show();
			            });
					}
				}
	    		else{
					var cancelAlert = $alert({
		                content: '你选择的取数日期系统不存在订单数据, 已为你初始化页面所需数据',
		                container: '#body-alert'
		            });
		            cancelAlert.$promise.then(function () {
		                cancelAlert.show();
		            });
	    		}
	    	},function(json){
		    	var cancelAlert = $alert({
	                content: '取数失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    	if(null != vm.order.orderDateStr){
	    		param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.orderDateStr};
	    		rest.studOrderFindOrderInfoBySchoolCodeAndDate(param).then(function(json){
		    		if(null != json.data.orderStud){
						vm.order.orderId = json.data.orderStud.orderId;
					}
		    	});
	    	}
	    }
	    
	    //onchange
	    vm.change1 = function(){
	    	vm.findOrderInfo();
	    }
	    
	    //创建订单
	    vm.createOrder = function(){
	    	//前端校验
	    	if(null != vm.order.orderId && '' != vm.order.orderId && !window.confirm('点击确定将会覆盖之前目标日期的订单数据，是否确定？')){
	    		return ;
	    	}
	    	$('#createOrder2').attr('disabled','disabled');
	    	rest.studOrderCreateOrderUnpack(vm.order).then(function(json){
	    		$('#createOrder2').removeAttr('disabled');
	    		$uibModalInstance.dismiss();
	    		var cancelAlert = $alert({
	                content: '保存成功!',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            pvm.getData(pvm.pageno);
	    	},function(json){
	    		$('#createOrder2').removeAttr('disabled');
	    		var cancelAlert = $alert({
	                content: '保存失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    }
	    
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
        
        //数据回显
        var orderId = (null != order?order.orderId:null);
        if(null != orderId && '' != orderId){
        	rest.studOrderFindByOrderId(orderId).then(function(json){
        		if(json.type == 'success' && null != json.data && json.data != undefined && json.data != ''){
        			var orderDate = json.data.orderDateStr;
        			var schoolCode = json.data.schoolCode;
        			vm.order.orderDateStr = orderDate;
	    			vm.order.takeOrderDateStr = orderDate;
	    			vm.order.schoolCode = schoolCode;
	    			if(null != schoolCode && null != orderDate){
	    				vm.findOrderInfo("1");
	    			}
        		}
        	});
        }
    }
    
    StudMilkOrderCtrl3.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','$uibModalInstance', 'nhCommonUtil', 'pvm', 'order'];
    function StudMilkOrderCtrl3($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, $uibModalInstance, nhCommonUtil, pvm, order) {
    	var nowDate = nhCommonUtil.offsetDay(new Date(), 0);
        var vm = $scope;
	    vm.order = {list20:[]};
	    //学校列表
	    rest.studOrderFindAllSchool().then(function (json) {
	        if(json.type=='success'){
				vm.schoolList=json.data.list;
	        }
	    },function(json){
	       var cancelAlert = $alert({
                content: '获取学校列表失败！' + json.data.msg,
                container: '#body-alert'
            })
            cancelAlert.$promise.then(function () {
                cancelAlert.show();
            })
	    });
	    
	    vm.order.orderDateStr = nowDate;
	    
	    //取数
	    vm.findOrderInfo = function(){
	    	if(null == vm.order.orderDateStr){
	    		var cancelAlert = $alert({
	                content: '目标日期必填',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
	    	}
	    	vm.order.orderId='';
	    	vm.order.matnr='';
	    	vm.order.list20=[];
	    	vm.order.list30=[];
	    	var param = {schoolCode:vm.order.schoolCode,orderDateStr:vm.order.orderDateStr};
	    	rest.studOrderFindOrderInfoBySchoolCodeAndDateFill(param).then(function(json){
	    		vm.order.list20 = json.data.list20;
	    		vm.order.list30 = json.data.list30;
	    		if(null != json.data.orderStud){
					vm.order.orderId = json.data.orderStud.orderId;
					vm.order.matnr = json.data.orderStud.matnr;
				}
	    	},function(json){
		    	var cancelAlert = $alert({
	                content: '失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    }
	    
	    //onchange
	    vm.change1 = function(){
	    	if(null != vm.order.orderDateStr && null != vm.order.schoolCode){
	    		vm.findOrderInfo();
	    	}
	    }
	    
	    //创建订单
	    vm.createOrder = function(){
	    	//前端校验
	    	$('#createOrder3').attr('disabled','disabled');
	    	rest.studOrderCreateOrderFill(vm.order).then(function(json){
	    		$('#createOrder3').removeAttr('disabled');
	    		$uibModalInstance.dismiss();
	    		var cancelAlert = $alert({
	                content: '保存成功!',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            pvm.getData(pvm.pageno);
	    	},function(json){
	    		$('#createOrder3').removeAttr('disabled');
	    		var cancelAlert = $alert({
	                content: '保存失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	    	});
	    }
	    
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
        
    }
    
    
    
    
    BatchBuildRquireMilkCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService', '$uibModalInstance', 'pvm'];
    function BatchBuildRquireMilkCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest, $uibModalInstance, pvm) {
        var vm = $scope;
        vm.item={};
        vm.buildDisable = false;
        vm.weekList = [
        	{code:'2', label:'星期一'},
        	{code:'3', label:'星期二'},
        	{code:'4', label:'星期三'},
        	{code:'5', label:'星期四'},
        	{code:'6', label:'星期五'}
        ];
        
        vm.eprint = function(){
        	if(null == vm.endDateStr || '' == vm.endDateStr){
        		var cancelAlert = $alert({
	                content: '请选择目标日期',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
        	}
        	$('#eprint').attr('disabled', 'disabled');
        	var params = {
        		orderDateStr:vm.endDateStr
        	};
        	rest.studOrderExportStudOrderMilk(params).then(function(json){
        		$('#eprint').removeAttr('disabled');
        		rest.reportDeliverFile(json.data);
        	},function(json){
        		$('#eprint').removeAttr('disabled');
        		var cancelAlert = $alert({
	                content: '导出失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
        	});
        }
        
        vm.delete = function(){
        	if(null == vm.endDateStr || '' == vm.endDateStr){
        		var cancelAlert = $alert({
	                content: '请选择目标日期',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            return;
        	}
    		var params = {
    			orderDateStr:vm.endDateStr
    		};
    		
    		var modalInst = $uibModal.open({
                templateUrl: 'removeProductModal.html',
                controller: 'removeProductModal',
                size: 'lg',
                resolve: {
                    params: params,
                }
            });
            modalInst.result.then(function() {
            });
        }
        vm.dd = function(schoolList, length, i){
        	var v = schoolList[i];
        	var params2 = {
				schoolCode:v.schoolCode,
				orderGetDateStr:vm.startDateStr,
				orderDateStr:vm.endDateStr,
				week:vm.item.week
        	};
        	i += 1;
        	$('#baogao').val($('#baogao').val()+'\n正在引入('+v.erpCode+'),'+v.schoolName+',饮奶特点:单一奶;');
        	rest.studOrderCreateOrderWithBatch(params2).then(function(json){
        		$('#baogao').val($('#baogao').val()+'\n结果: 成功;');
        		if(i == length){
        			$('#baogao').val($('#baogao').val()+'\n执行完毕！');
        			return;
        		}
        		else{
        			vm.dd(schoolList, length, i);
        		}
        	},function(json){
        		$('#baogao').val($('#baogao').val()+'\n结果: 失败;'+json.data.msg);
        		if(i == length){
        			$('#baogao').val($('#baogao').val()+'\n执行完毕！');
        			return;
        		}
        		else{
        			vm.dd(schoolList, length, i);
        		}
        	});
        }
        vm.build = function(){
        	
        	var params = {
        		week:vm.item.week,
        		orderGetDateStr:vm.startDateStr,
        		orderDateStr:vm.endDateStr,
        		uncloudSchoolCodeTxts:vm.uncloudSchoolCodeTxts
        	};
        	rest.studOrderBuildBatchInfo(params).then(function(json){
        		$('#baogao').val('');
        		var cancelAlert = $alert({
	                content: '正在生成中，生成过程中，请勿操作界面.',
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            var schoolList = json.data.schoolList;
	            vm.dd(schoolList, schoolList.length, 0);
        	},function(json){
        		var cancelAlert = $alert({
	                content: '失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
        	});
        	
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
            pvm.getData(pvm.pageno);
        }
    }
    
    removeProductModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'params', 'restService'];
    function removeProductModal($scope, $alert, $uibModalInstance, params, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.rand = rand;
        vm.userRandomCode = "";
        vm.errorMsg = "";
		
		function rand() {
			rest.randomCode().then(function(json){
				$('#randomImgSrc').attr('src',json.data);
			});
		}
		rand();			
        function save() {
        	params.userRandomCode = vm.userRandomCode;
        	rest.studOrderDeleteOrderWithBatch(params).then(function(json){
        		var cancelAlert = $alert({
	                content: '删除成功',
	                container: '#modal-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
	            closeModal();
        	},function(json){
        		rand();	
        		vm.errorMsg = '删除失败！' + json.data.msg;
        	});
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close();
        }
        
    }
    
    exportSumExcelCtrl.$inject = ['$scope', '$alert', '$uibModalInstance', 'restService'];
    function exportSumExcelCtrl($scope, $alert, $uibModalInstance, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        
        vm.export = function(){
        	$('#exportSumExcelBtn').attr('disabled', 'disabled');
        	var params = {
        		exportSumStartOrderDateStr:vm.exportSumStartOrderDateStr,
        		exportSumEndOrderDateStr:vm.exportSumEndOrderDateStr
        	};
        	rest.studOrderExportStudOrderMilkSum(params).then(function(json){
        		$('#exportSumExcelBtn').removeAttr('disabled');
        		rest.reportDeliverFile(json.data);
        	},function(json){
        		$('#exportSumExcelBtn').removeAttr('disabled');
        		var cancelAlert = $alert({
	                content: '导出失败！' + json.data.msg,
	                container: '#body-alert'
	            });
	            cancelAlert.$promise.then(function () {
	                cancelAlert.show();
	            });
        	});
        }
		
        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close();
        }
        
    }
    
    myApp.controller('SetClassCtrl', function($scope, order,$uibModalInstance,restService) {
		var vm = $scope;
        vm.classes =[];
        vm.checkAll=false;
        vm.selectClass=[];
        vm.getClassData=function(){
        	var params={salesOrg:""};
			restService.findClassListBySalesOrg(params).then(function (json){
			  	var data=json.data;
			  	var  leg=json.data.length;
				for (var j=0; j<leg;j++ ){
					var item=json.data[j];
					if(item){
						for (var i=0; i<order.list10.length;i++ ){
							if(order.list10[i].classCode==item.classCode){
								data[j]=undefined;
							}
						}
					}
				};
//				console.debug(data);
				$.each(data,function(index,item){
					if(item !=undefined){
						vm.classes.push(item)
					}
          		});
            });
        }
        vm.getClassData();
        vm.chekOne=function(check,val){
        	if(check){
        		vm.selectClass.push(val);
        	}
        }
        
        vm.chekAll=function(check){
        	if(check){
        		$.each(vm.classes,function(index,item){
	          		vm.classes[index].checkbox=true;
          		});
        		vm.selectClass=vm.classes;
        	}else{
        		$.each(vm.classes,function(index,item){
	          		vm.classes[index].checkbox=false;
          		});
        		vm.selectClass=[];
        	}
        }
        
        vm.save = function(){
        	$.each(vm.selectClass,function(index,item){
          		 if(item){
          		 	item.qty=0;
          		 	 order.list10.push(item);
          		 }
          	});
           vm.cancelModal();
           vm.selectClass=[];
        }
        
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
        
	});
    
    
})();