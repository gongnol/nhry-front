(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('routeCtrl', routeCtrl)
	  .controller('routeDetailModal', routeDetailModal)
      .controller('printDetailModal', printDetailModal)
      .controller('changeDetailModal', changeDetailModal)
      .controller('CreateTmpRouteModalCtrl', CreateTmpRouteModalCtrl);

	routeCtrl.$inject = ['$window', '$timeout', '$state', '$scope', '$alert', '$uibModal', 'restService', '$filter'];

	function routeCtrl($window, $timeout, $state, $scope, $alert, $uibModal, rest, $filter) {

        var vm = $scope;
        vm.routeStatuses = [{
            code: '10',
            label: '未确认'
        }, {
            code: '20',
            label: '已确认'
        }];
        vm.dayrouteStatuses = [{
            code: '10',
            label: '上午配送'
        }, {
            code: '20',
            label: '下午配送'
        }];
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.search = {};
        vm.routeCreating = false;
        
        vm.showOrhide =true;
        
        vm.getData = function(pageno){ 
            // var date = '';
            // if(vm.search.deliverDate != undefined && $.trim(vm.search.deliverDate) != ''){
            //     var y = vm.search.deliverDate.getFullYear();
            //     var m = vm.search.deliverDate.getMonth() + 1;
            //     var d = vm.search.deliverDate.getDate();
            //     date = y + '-' + m + '-' + d;
            // }
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            $scope.allChFlag = false;
            $scope.checkboxArrs = [];
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                deliverDate:vm.search.deliverDate,
                emp:vm.search.empNo,
                status: vm.search.status
                // orderNo:vm.search.orderNo
            }
            
            $timeout(function () {
                rest.getRouteList(params).then(function (json) {
                    vm.tbLoding = 0;
                    vm.content = json.data.list;
                    
                    vm.total_count = json.data.total;
                }, function (reject) {
                    var errorAlert = $alert({
                        content: reject.data.msg,
                        container: '#modal-alert'
                    })
                    errorAlert.$promise.then(function () {
                        errorAlert.show();
                    })
                    vm.tbLoding = 0;
                });
            }, 1000);
        };
        vm.getData2 = function(pageno){ 
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                deliverDate:vm.search.deliverDate
            }

            rest.getRouteList(params).then(function (json) {
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
        };
        vm.getData(vm.pageno); // Call the function to fetch initial data on page load.
        vm.outRoute =function(orderNo){
           /* rest.reportDeliver(orderNo).then(function(json){
                $window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');             
            })*/
            rest.reportDeliver(orderNo).then(function(json){
                rest.reportDeliverFile(json.data);    
            })
        }
        vm.outDevliver = function(){
            if($scope.checkboxArrs==undefined || ''==$scope.checkboxArrs){
                    var cancelAlert = $alert({
                        content: '请勾选需要导出的路单!',
                        container: '#body-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
             }else{
                $scope.checkboxArrs.forEach(function (item) {
                    var entry = item.split(',');
                    rest.reportDeliver(entry[0]).then(function(json){
                        rest.reportDeliverFile(json.data);    
                    })
                })
             }
        }
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
        vm.statusFormat = function(status){
            if(status=='10')return '未确认';
            if(status=='20')return '已确认';
        } 
	    vm.reloadTable = function(){
            vm.curPageno = 1;
            vm.getData(1);
        }
	    vm.tomorrowRouteList = function(){
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate()+1;
            vm.search.deliverDate = y + '-' + m + '-' + d;
	    	vm.getData2(vm.pageno);
            vm.search.deliverDate = '';
	    };
	    vm.todayRouteList = function(){
            var date =  $filter('date')(new Date(),'yyyy-MM-dd');
            vm.search.deliverDate = date;
	    	vm.getData2(vm.pageno);
            vm.search.deliverDate = '';
	    };
	    vm.allConfirm = function(){
	    	
	    };
		
        rest.getAllEmpByBranchNo("").then(function (json) {
              vm.canSelectEmps = json.data;
        });

        vm.updateRouteStatus = function(data){
            var params = {orderNo:data,status:'20'};//确认
            rest.updateRouteStatus(params).then(function (json) {
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '确认成功！',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function () {
                            vm.curPageno = 1;
                            vm.getData(vm.pageno);
                        })
                    }   
            });
        }
	    /*showmodal方法*/
	    vm.showDetail  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'routeDetailModal.html',
                controller: 'routeDetailModal',
                size: 'xxl',
                resolve: {
                    routeNo: function() {
                        return data;
                    },
                    pScope: vm,
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }
	    /*showmodal方法end*/


	
        vm.showChange = function(data){
                var modalInst = $uibModal.open({
                templateUrl: 'changeDetailModal.html',
                controller: 'changeDetailModal',
                size: 'xxls',
                resolve: {
                    routeNo: function() {
                        return data;
                    },
                    pScope: vm,
                    rest:rest
                }
            });
            modalInst.result.then(function() {

            }, function() {
               
            })
        }
        
         
        //跳转登录页面
         vm.toProductEdit = function(){
            var url = $state.href('newhope.setpro');
            window.open(url,'_blank');
        };
        //获取当前登录人
        rest.getCurUser().then(function(json){
        	if(json.data.branchNo){
        		$scope.showOrhide=false;
        	}
        });
        
		
        vm.createEntity = undefined;
        vm.createRouteOrder = function () {
            if(vm.createEntity==undefined){
                alert("请选择生成路单的日期，在左侧选择");
                return;
            }
            vm.routeCreating = true;
            rest.createRouteOrder(vm.createEntity).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    alert("创建完毕!");
                    vm.getData(vm.pageno);
                }
                vm.routeCreating = false;
            },function(json){
                alert(json.data.msg);
                vm.routeCreating = false;
            });
        }

        vm.createTemptRoute = function () {
            if(!vm.createEntity ){
                alert("请选择生成路单的日期，在左侧选择");
                return;
            }
            var modalInst = $uibModal.open({
                templateUrl: 'createTmpRouteModal.html',
                controller: 'CreateTmpRouteModalCtrl',
                controllerAs: 'ctrm',
                size: 'lg',
                resolve: {
                    createDate: function() {
                        return vm.createEntity;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.curPageno = 1;
                vm.getData(vm.pageno);
            })
        }

        vm.deleteDispEntity = undefined;
        vm.deleteRouteOrder = function () {
            if(vm.deleteDispEntity==undefined){
                alert("请选择删除路单的日期，在左侧选择");
                return;
            }
            if (confirm('您确定要删除所选择日期的路单吗？')) {
                rest.deleteRouteOrders(vm.deleteDispEntity).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var alert = $alert({
                            content: '删除完毕!',
                            container: '#body-alert'
                        })
                        alert.$promise.then(function () {
                            alert.show();
                        })
                        vm.curPageno = 1;
                        vm.getData(vm.pageno);
                    }
                }, function(reject){
                    var cancelAlert = $alert({
                        content: reject.data.msg,
                        container: '#body-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                });
            }
            
        }

       vm.print = function(data){
                var modalInst = $uibModal.open({
                templateUrl: 'printDetailModal.html',
                controller: 'printDetailModal',
                size: 'xxls',
                resolve: {
                    routeNo: function() {
                        return data;
                    },
                    pScope: vm,
                    rest:rest
                }
            });
            modalInst.result.then(function() {

            }, function() {
               
            })
        }
        vm.reportTable = function(){
            var dayparams={
                theDate:$scope.search.daydeliverDate,
                reachTimeType:$scope.search.reachTimeType
            }
            if($scope.search.daydeliverDate!=undefined){
                 rest.exportOrderByModel(dayparams).then(function(json){
                    rest.reportDeliverFile(json.data);
                   // $window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');             
                })        
            }else{
                var alert = $alert({
                    content: '请选择分奶表导出日期',
                    container: '#modal-alert'
                })      
                alert.$promise.then(function() {
                    alert.show();
                })          
            } 
        }
	}

    changeDetailModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'routeNo', 'pScope', 'rest'];

    function changeDetailModal($scope,$alert, $uibModalInstance, routeNo,pScope,rest) {

        var vm = $scope;
        vm.route = {};
        vm.cancelModal = cancelModal;
        vm.changeOrder = {};

        rest.searchChangeOrder(routeNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.changeOrder = json.data;
            }
        });

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

        vm.reachTimeFormat = function (state) {
            if(state=='10')return '上午配送';
            if(state=='20')return '下午配送';
        } 

        vm.reasonFormat = function (state) {
            if(state=='10')return '产品变更';
            if(state=='20')return '数量变更';
            if(state=='30')return '新增订户';
            if(state=='40')return '减少订户';
            if(state=='50')return '更改配送时间';
        } 

        vm.reasons = {data:[
            {"code":'10',text:"换货"},
            {"code":'20',text:"缺货"},
            {"code":'30',text:"质量问题"},
            {"code":'40',text:"损毁"},
            {"code":'50',text:"拒收"}]
        };

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
        
    }

    routeDetailModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'routeNo', 'pScope', 'rest'];

	function routeDetailModal($scope,$alert, $uibModalInstance, routeNo,pScope,rest) {

        var vm = $scope;
        var oldRouteList = [];
        var routeItemIdxMap = {};
        vm.routeConfirming = false;
        vm.route = {};
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.confirmRoute = confirmRoute;
        vm.batchChange = batchChange;
        vm.batchLack = batchLack;
        vm.batchLackClear = batchLackClear;
        vm.batchClear = batchClear;
        vm.repeatFinished = repeatFinished;
        vm.dispOrder = {};
        vm.list = [];
        vm.checkboxArrs = [];

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

        /*送奶员列表*/
        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
            var result = json.type;
            if(result == 'success'){
                vm.emps = json.data;
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

        /*产品列表*/
        rest.getProductByCodeOrName("").then(function(json){
          vm.Rproducts = json.data;   
        })

        /*路单详细信息*/
        rest.getRouteDetails(routeNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.dispOrder = json.data;
            }
        });
        rest.getRouteDetailList(routeNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.list = json.data;
                for (var i = 0; i<vm.list.length; i++) {
                    // vm.list[i].confirmQty = vm.list[i].qty;
                    vm.list[i].productCode = vm.list[i].confirmMatnr;
                    routeItemIdxMap[vm.list[i].itemNo] = i;
                };
                oldRouteList = angular.copy(vm.list);
            }
        });

        vm.qtyFormat = function(qty){
            return qty;
        } 
      /*  vm.reasons = {data:[
            {"code":'10',text:"换货"},
            {"code":'20',text:"缺货"},
            {"code":'30',text:"质量问题"},
            {"code":'40',text:"损毁"},
            {"code":'50',text:"拒收"}]
        };*/

        vm.reasons = {data:[
	    	{"code":'10',text:"换货"},
            {"code":'20',text:"缺货"},
	    	{"code":'30',text:"质量问题"},
	    	{"code":'40',text:"损毁"},
	    	{"code":'50',text:"拒收"},
            {"code":'60',text:"拒收复送"}]
	    };

        vm.replaceReasons = {data:[
            {"code":'10',text:"公司原因"},
            {"code":'20',text:"质量问题"},
            {"code":'30',text:"运输损坏"}]
        };

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function newErrMsg(idx, msg) {
            return '第' + idx + '条路单有错误：' + msg;
        }

	    /*保存按钮*/
	    function save() {
            var entity = {list:[]},
                errMsg = [];

            entity.dispEmpNo = vm.dispOrder.order.dispEmpNo;
            entity.routeNo = routeNo;
            for (var i = 0; i<vm.list.length ; i++) {
                // if(vm.list[i].qty!=vm.list[i].confirmQty||(vm.list[i].productCode!=vm.list[i].matnr && vm.list[i].reason=='10')){
                //     if(vm.list[i].reason==undefined||vm.list[i].reason==''){
                //         var saveAlert = $alert({
                //         content: '未按要求送达的请选择原因！',
                //         container: '#modal-alert'
                //         })
                //         saveAlert.$promise.then(function () {
                //             saveAlert.show();
                //         })
                //         return;
                //     }
                //     if(vm.list[i].reason=='10' && (vm.list[i].confirmQty == 0 || vm.list[i].confirmQty == undefined) ){
                //         var saveAlert = $alert({
                //         content: '换货时数量不能为0！',
                //         container: '#modal-alert'
                //         })
                //         saveAlert.$promise.then(function () {
                //             saveAlert.show();
                //         })
                //         return;
                //     }

                //     entity.list.push(vm.list[i]);
                // }
                if (vm.list[i].confirmQty === oldRouteList[i].confirmQty && vm.list[i].productCode === oldRouteList[i].productCode && vm.list[i].reason === oldRouteList[i].reason && vm.list[i].replaceReason === oldRouteList[i].replaceReason) {
                    continue;
                } else {
                    if (vm.list[i].qty === vm.list[i].confirmQty && vm.list[i].productCode === vm.list[i].matnr) {
                        if (vm.list[i].replaceReason || vm.list[i].reason) {
                            errMsg.push(newErrMsg(i+1, '未变化的请不要选择原因！<br/>'));
                        }
                    } else if (vm.list[i].qty !== vm.list[i].confirmQty && !vm.list[i].reason) {
                        errMsg.push('第'+(i + 1)+'条路单有错误：未按要求送达的请选择原因！<br/>');
                    } else if (vm.list[i].reason === '10') {
                        if (!vm.list[i].productCode || vm.list[i].productCode === vm.list[i].matnr) {
                            errMsg.push('第'+(i + 1)+'条路单有错误：换货时请选择实送产品，且和应送产品不同！<br/>');
                        }
                        if (!vm.list[i].confirmQty) {
                            
                            errMsg.push('第'+(i + 1)+'条路单有错误：换货时实送数量应为大于0的数字！<br/>');
                        }
                    } else if (vm.list[i].confirmQty >= vm.list[i].qty && vm.list[i].reason) {
                        errMsg.push('第'+(i + 1)+'条路单有错误：实送数量应小于应送数量！<br/>');
                    }
                    entity.list.push(vm.list[i]);
                }
            };
            if (errMsg.length > 0) {
                var saveAlert = $alert({
                    content: errMsg.reduce(function (preVal, curVal) { return preVal + curVal; }),
                    container: '#modal-alert',
                    duration: false
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
            // alert(JSON.stringify(entity));
            rest.saveRouteList(entity).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    var saveAlert = $alert({
                        content: '保存成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    oldRouteList = angular.copy(vm.list);
                };
            }, function(json){
                var saveAlert = $alert({
                    content: '保存失败！'+ json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        }

        vm.editOne = function (entity,id){
             if(confirm("确定要修改吗？可能会对订单和日计划有影响!")){
                if(entity.reason != undefined && entity.reason !='' && entity.reason != '10' && entity.qty == entity.confirmQty){
                            var saveAlert = $alert({
                            content: '未变化的请不要选择原因！',
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                            return;
                }
                if(entity.qty!=entity.confirmQty||(entity.productCode!=entity.matnr && entity.reason=='10')){
                        if(entity.reason==undefined||entity.reason==''){
                            var saveAlert = $alert({
                            content: '未按要求送达的请选择原因！',
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                            return;
                        }
                        if(entity.reason=='10' && (entity.confirmQty == 0 || entity.confirmQty == undefined) ){
                            var saveAlert = $alert({
                            content: '换货时数量不能为0！',
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                            return;
                        }
                }
                angular.element('#editbutton'+id).attr('disabled',true);
                rest.reEditRouteDetail(entity).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var msg = '';
                        if(json.data == 0 )msg = '无任何修改!';
                        var saveAlert = $alert({
                            content: '操作成功！'+msg,
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            }).then(function(){
                                angular.element('#editbutton'+id).attr('disabled',false);
                            })
                    };
                },function(json){
                    var saveAlert = $alert({
                            content: '修改失败！'+ json.data.msg,
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            }).then(function(){
                                angular.element('#editbutton'+id).attr('disabled',false);
                            })
                });
            }
        }

        /*确认按钮*/
		function confirmRoute() {
            if(confirm('是否确认路单?一旦确认后此配送日的路单将都不能删除!')){}else{return;}
            if (moment(vm.dispOrder.order.dispDate).isAfter(moment())) {
                var errAlert = $alert({
                    content: '请不要确认今天之后的路单！',
                    container: '#modal-alert'
                })
                errAlert.$promise.then(function () {
                    errAlert.show();
                })
                return;
            }
            vm.routeConfirming = true;
            rest.updateDaliyPlansByRoute(routeNo).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    var saveAlert = $alert({
                        content: '确认成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                };
            }, function (reject) {
                vm.routeConfirming = false;
                var errAlert = $alert({
                    title: '路单确认失败！',
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errAlert.$promise.then(function () {
                    errAlert.show();
                })
            });
        }

        function batchChange() {
            if (!vm.dispOrder.batchChangeProd) {
                var saveAlert = $alert({
                    content: '请选择批量换货的实送产品！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }

            for (var i = 0; i < vm.checkboxArrs.length; i++) {
                var tmpItem = vm.list[routeItemIdxMap[vm.checkboxArrs[i]]];
                tmpItem.reason = '10';
                tmpItem.replaceReason = '10';
                tmpItem.productCode = vm.dispOrder.batchChangeProd;
            }
        }

        function batchClear() {
            for (var i = 0; i < vm.checkboxArrs.length; i++) {
                var tmpItem = vm.list[routeItemIdxMap[vm.checkboxArrs[i]]];
                tmpItem.reason = undefined;
                tmpItem.replaceReason = undefined;
                tmpItem.productCode = tmpItem.confirmMatnr;
            }
        }
        function batchLack(){
            if(vm.checkboxArrs.length>0){
              for (var i = 0; i < vm.checkboxArrs.length; i++) {
                var tmpItem = vm.list[routeItemIdxMap[vm.checkboxArrs[i]]];
                tmpItem.reason = '20';
                tmpItem.replaceReason = '20';
                tmpItem.confirmQty=0;
              }   
            }else{
                var saveAlert = $alert({
                    content: '请选择批量缺货的配送产品！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
                       
        }
        function batchLackClear(){
            if(vm.checkboxArrs.length>0){
              for (var i = 0; i < vm.checkboxArrs.length; i++) {
                var tmpItem = vm.list[routeItemIdxMap[vm.checkboxArrs[i]]];
                tmpItem.reason = undefined;
                tmpItem.replaceReason = undefined;
                tmpItem.confirmQty=tmpItem.qty;
              }   
            }else{
                var saveAlert = $alert({
                    content: '请选择清除批量缺货的配送产品！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
        }
        function repeatFinished() {
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.$broadcast('clearAllChecks');
        }
        
    }

    printDetailModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'routeNo', 'pScope', 'rest'];

    function printDetailModal($scope,$alert, $uibModalInstance, routeNo,pScope,rest) {

        var vm = $scope;
        vm.route = {};
        vm.cancelModal = cancelModal;
        vm.dispOrder = {};
        vm.list = {};


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

        /*产品列表*/
        rest.getProductByCodeOrName("").then(function(json){
          vm.Rproducts = json.data;   
        })

        /*路单详细信息*/
        rest.getRouteDetails(routeNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.dispOrder = json.data;
            }
        });
        rest.getRouteDetailList(routeNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.list = json.data;
                for (var i = 0; i<vm.list.length; i++) {
                    // vm.list[i].confirmQty = vm.list[i].qty;
                    vm.list[i].productCode = vm.list[i].confirmMatnr;
                };
            }
        });

        vm.qtyFormat = function(qty){
            return qty;
        } 

        vm.reasons = {data:[
            {"code":'10',text:"换货"},
            {"code":'20',text:"缺货"},
            {"code":'30',text:"质量问题"},
            {"code":'40',text:"损毁"},
            {"code":'50',text:"拒收"}]
        };

        vm.replaceReasons = {data:[
            {"code":'10',text:"公司原因"},
            {"code":'20',text:"质量问题"},
            {"code":'30',text:"运输损坏"}]
        };

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
        
    }

    CreateTmpRouteModalCtrl.$inject = ['$scope', '$alert', '$uibModalInstance', 'createDate', 'restService'];

    function CreateTmpRouteModalCtrl($scope, $alert, $uibModalInstance, createDate, rest) {
        var vm = this;
        vm.saving = false;
        vm.cancelModal = cancelModal;
        vm.save = save;

        $scope.$watch('ctrm.orderList', function (newVal) {
            vm.orderArr = parseOrder(newVal);
        })

        function parseOrder(str) {
            return str ? _.uniq(str.split('\n')) : [];
        }

        function save() {
            if (!vm.orderArr || vm.orderArr.length === 0) {
                var saveAlert = $alert({
                    content: "没有指定订单编号！",
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function() {
                    saveAlert.show();
                })
                return;
            }
            var params = {
                dateStr: createDate,
                orders: vm.orderArr
            }
            vm.saving = true;
            rest.createTemRouteOrders(params).then(function(resp) {
                if (resp.type === 'success') {
                    var saveAlert = $alert({
                        content: "成功生成临时路单！",
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function() {
                        saveAlert.show();
                        closeModal();
                    })
                    vm.saving = false;
                }
            }, function(reject) {
                var errorAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function() {
                    errorAlert.show();
                })
                vm.saving = false;
            })
        }


        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

    }
	
})();