(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('orderEditCtrl', orderEditCtrl)
      .controller('addProductModal', addProductModal)
      .controller('addProductOrgModal',addProductOrgModal)
      .controller('addProductYearcardModal',addProductYearcardModal)
      .controller('editProductModal', editProductModal)
      .controller('editOrgProductModal',editOrgProductModal)
      .controller('editQtyModal', editQtyModal)
      .controller('editDeliveryModal', editDeliveryModal)
      .controller('editDelivDateModel', editDelivDateModel)
      .controller('stopOrderModal', stopOrderModal)
      .controller('removeProductModal', removeProductModal)
      .controller('showPlansModal', showPlansModal);

	orderEditCtrl.$inject = ['$scope','$state','$uibModal', '$stateParams', '$alert', 'restService'];

	function orderEditCtrl($scope, $state, $uibModal, $stateParams,$alert, rest) {

        //默认值
        $scope.defaultValue={newItemNo:100};
        $scope.nextDay = function(){
            var date = new Date();
            date.setDate(date.getDate());
            $scope.defaultValue.date = date;
        }()

		$scope.milkBoxs = {
            data:[
        {"code":"10","text":"已安装"},
        {"code":"20","text":"不安装"},
        {"code":"30","text":"需要安装"}]
        };

        $scope.deliveryTime = {
            data:[
            {"code":"10","text":"上午配送"},
            {"code":"20","text":"下午配送"}]
        };

		var vm = $scope;

        vm.orderNo = $stateParams.orderNo;
        vm.isYearcard = $stateParams.isYearcard;
        vm.orderDetail = {};
        vm.savedEntries = [];
        vm.chargebillDeling = false;
        vm.hideStopFlag = false;

        rest.getRecBillByOrderNo(vm.orderNo).then(function (json) {
            if(json.data && json.data.status === '10'){
                vm.receiptNo = json.data.receiptNo;
                vm.haveReceiptOrder = true;
            }else{
                vm.haveReceiptOrder = false;
            }
        })

        rest.orderDetail(vm.orderNo).then(function(json){
            var result = json.type;
            console.log(vm);
            if(result == 'success'){
                vm.orderDetail = json.data;
                // console.log(JSON.stringify(vm.orderDetail));
                if(vm.orderDetail.order.paymentmethod == '10'){
                    vm.orderDetail.order.validDate = 'Y';

                }
                for (var i = 0; i < vm.orderDetail.entries.length; i++) {
                     vm.orderDetail.entries[i].startDispDate = vm.dateFormat2(vm.orderDetail.entries[i].startDispDate);
                     vm.orderDetail.entries[i].endDispDate = vm.dateFormat2(vm.orderDetail.entries[i].endDispDate);

                     if(vm.orderDetail.entries[i].stopStartDate && vm.orderDetail.entries[i].stopEndDate){
                         vm.orderDetail.entries[i].stopStartDate = vm.dateFormat2(vm.orderDetail.entries[i].stopStartDate);
                         vm.orderDetail.entries[i].stopEndDate = vm.dateFormat2(vm.orderDetail.entries[i].stopEndDate);
                     }
                    if(vm.orderDetail.entries[i].ruleType=="20"){
                        vm.orderDetail.entries[i].sendByWeeks={};
                        var days = vm.orderDetail.entries[i].ruleTxt.split(',');
                        for(var idx = 0;idx<days.length;idx++){
                            if('1'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.mon=true;continue;}
                            if('2'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.tue=true;continue;}
                            if('3'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.wed=true;continue;}
                            if('4'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.tur=true;continue;}
                            if('5'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.fri=true;continue;}
                            if('6'==days[idx]){vm.orderDetail.entries[i].sendByWeeks.sat=true;continue;}
                            if('7'==days[idx])vm.orderDetail.entries[i].sendByWeeks.sun=true;
                        }
                       
                        // console.log(vm.orderDetail.entries[i].startDispDate +" *********   "+vm.orderDetail.entries[i].endDispDate );
                    }
                }
                vm.savedEntries = angular.copy(vm.orderDetail.entries);
                vm.hasPlans = vm.orderDetail.hasPlans;
                vm.hasRoute = vm.orderDetail.hasRoute;
                vm.hideStopFlag = vm.orderDetail.order.paymentmethod === '20' && vm.orderDetail.order.paymentStat === '20';
                if('Y' != vm.hasPlans){
                    var saveAlert = $alert({
                    content: '订单还没有生成日计划，所有操作将只对行项目操作，不会作为有效期修改!',
                    container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                }
            }
        },function(json){
            var saveAlert = $alert({
                    content: '加载失败！' + json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
        });

        // 删除收款单
        vm.delChargebill = function () {
            vm.chargebillDeling = true;
            rest.delReceipt(vm.receiptNo).then(function (json) {
                vm.chargebillDeling = false;
                vm.haveReceiptOrder = false;
                var saveAlert = $alert({
                    content: '删除成功！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            },function(json){
                vm.chargebillDeling = false;
                var saveAlert = $alert({
                    content: '删除失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            })
        }

        vm.dateFormat = function(start){
            if (start  && typeof(start) === 'string') { 
                return moment(start).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        vm.dateFormat2 = function(start){
            if (start && typeof(start) === 'string') { 
                return moment(start).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }
        /*初始化end*/
        
        vm.closePage = function(){
            history.back();
        }

        /*切换时重新加载行项目*/
        vm.changeEditType = function(){
            vm.orderDetail.entries = [];
            vm.orderDetail.entries = angular.copy(vm.savedEntries);
        }

        /*删除行商品按钮*/
        vm.removeProduct = function(itemNo){
            if(confirm('确定要执行此操作吗?')) {
                for (var i = 0; i < vm.orderDetail.entries.length; i++) {
                    if(vm.orderDetail.entries[i].itemNo == itemNo)
                        vm.orderDetail.entries.splice(i,1);
                };
            }
        }

        vm.getPromotions = function(matnr){
            vm.promotions = undefined;
            rest.getPromotionByMatnr(matnr).then(function(json){
              vm.promotions = json.data;   
            })
        }

        /*看日计划*/
        vm.previewDayPlan = function(){
            /*配送规律，要修改成符合后台模式*/
            for(var idx = 0; idx < vm.orderDetail.entries.length; idx++){
                var week = vm.orderDetail.entries[idx];
                if(week.newFlag!="Y"&&week.isDeleted == true){
                    week.isDeletedFlag = 'Y';
                }else{
                    week.isDeletedFlag = undefined;
                }
                if(week.newFlag!="Y"&&week.deletePlans == true){
                    week.deletePlansFlag = 'Y';
                }else{
                    week.deletePlansFlag = undefined;
                }
                if(week.sendByWeeks!=undefined){
                    //周期
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
                    week.ruleTxt = ruleTxt;
                }else if(week.rultTxt = "10" && (week.gapDays==undefined || $.trim(week.gapDays)=='' )) {
                    var saveAlert = $alert({
                        content: '请填写间隔天数！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
                }
                
            }
            /*editend*/
            vm.showPlans();
           
        }
        /*end*/

        /*showmodal addproduct方法*/
        vm.showPlans  = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'showPlansModal.html',
                controller: 'showPlansModal',
                size: 'lg',
                resolve: {
                    rest:rest,
                    pScope: vm
                }
            });
            modalInst.result.then(function() {

            }, function() {
                /*恢复初始查询条件*/
            })
        }
        /*showmodal方法end*/

        /*showmodal addproduct方法*/
        vm.addProduct  = function(){
            if (vm.isYearcard == "true") {
                var modalInst = $uibModal.open({
                    templateUrl: 'addProductYearcardModal.html',
                    controller: 'addProductYearcardModal',
                    size: 'lg',
                    resolve: {
                        rest:rest,
                        pScope: vm
                    }
                });
                modalInst.result.then(function() {

                }, function() {
                   
                })
            }else{
                var modalInst = $uibModal.open({
                    templateUrl: 'addProductModal.html',
                    controller: 'addProductModal',
                    size: 'lg',
                    resolve: {
                        rest:rest,
                        pScope: vm
                    }
                });
                modalInst.result.then(function() {

                }, function() {
                    /*恢复初始查询条件*/
                })
            }
            
        }
        /*showmodal方法end*/

        /*showmodal editproduct方法*/
        vm.editProduct  = function(itemNo, itemIdx){
            var newData = angular.copy(vm.orderDetail.entries[itemIdx]);
            if(vm.orderDetail.order.preorderSource=='70'){
                var modalInst = $uibModal.open({
                templateUrl: 'editOrgProductModal.html',
                controller: 'editOrgProductModal',
                size: 'lg',
                resolve: {
                    pScope: vm,
                    rest:rest,
                    itemNo:function(){
                        return itemNo;
                    },
                    itemData: function () {
                        return newData;
                    }
                }
                });
                modalInst.result.then(function() {

                }, function() {

                }) 
            }else{
                var modalInst = $uibModal.open({
                templateUrl: 'editProductModal.html',
                controller: 'editProductModal',
                size: 'lg',
                resolve: {
                    pScope: vm,
                    rest:rest,
                    itemNo:function(){
                        return itemNo;
                    },
                    itemData: function () {
                        return newData;
                    }
                }
                });
                modalInst.result.then(function() {

                }, function() {

                }) 
            }
           
        }
        /*showmodal方法end*/

        //商品行选择配送方式，切换tab页时，清空另一页数据
        vm.changeDeliveryType = function(itemNo,type){
            if(type==0){
                //按周期送
                for (var idx = 0; idx < vm.orderDetail.entries.length; idx++) {
                    if(vm.orderDetail.entries[idx].itemNo == itemNo){
                        vm.orderDetail.entries[idx].sendByWeeks = undefined;
                        vm.orderDetail.entries[idx].ruleType = '10';
                        vm.orderDetail.entries[idx].ruleTxt = undefined;
                        break;
                    }
                }
            }else if(type==1){
                //按星期送
                for (var idx = 0; idx < vm.orderDetail.entries.length; idx++) {
                    if(vm.orderDetail.entries[idx].itemNo == itemNo){
                        vm.orderDetail.entries[idx].gapDays = undefined;
                        vm.orderDetail.entries[idx].sendByGaps = undefined;
                        vm.orderDetail.entries[idx].ruleType = '20';
                        break;
                    }
                }
            }
        }

        vm.save = function(){
            if (vm.hideStopFlag && vm.orderDetail.entries.length === 1 && vm.orderDetail.entries[0].isStop === 'Y') {
                var saveAlert = $alert({
                    content: '该订单只有一个行项目，为预付款并已付款，不能在行项目上做停订操作，若想停订，请返回订单列表在订单上进行停订！',
                    container: '#body-alert',
                    duration: 10
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
            /*配送规律，要修改成符合后台模式*/
            for(var idx = 0; idx < vm.orderDetail.entries.length; idx++){
                var week = vm.orderDetail.entries[idx];
                if(week.newFlag!="Y"&&week.isDeleted == true){
                    week.isDeletedFlag = 'Y';
                }else{
                    week.isDeletedFlag = undefined;
                }
                if(week.newFlag!="Y"&&week.deletePlans == true){
                    week.deletePlansFlag = 'Y';
                }else{
                    week.deletePlansFlag = undefined;
                }
                if(week.sendByWeeks!=undefined){
                    //周期
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
                    week.ruleTxt = ruleTxt;
                }else if(week.rultTxt = "10" && (week.gapDays==undefined || $.trim(week.gapDays)=='' )) {
                    var saveAlert = $alert({
                        content: '请填写间隔天数！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
                }
                
            }
            /*editend*/
            angular.element('#saveButton').attr('disabled',true);
            console.log(vm.orderDetail)
            rest.toEditOrderLong(vm.orderDetail).then(function (json) {
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '订单修改成功！',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function () {
                            $state.go("newhope.currentOrder");
                        })
                    }   
            },function(json){
                var saveAlert = $alert({
                    content: '订单修改失败！' + json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                    angular.element('#saveButton').attr('disabled',false);
                })
            });
        }

        // 变更数量模态框
        vm.editQty  = function(itemNo, itemIdx){
            var newData = angular.copy(vm.orderDetail.entries[itemIdx]);
            var modalInst = $uibModal.open({
                templateUrl: 'editQtyModal.html',
                controller: 'editQtyModal',
                size: 'lg',
                resolve: {
                    pScope: vm,
                    qtyItem : function(){
                        return newData;
                    }
                }
            });
            modalInst.result.then(function(data) {
                // var saveAlert = $alert({
                //     content: '数量修改成功！',
                //     container: '#body-alert'
                // })
                // saveAlert.$promise.then(function () {
                //     saveAlert.show();
                // })
                vm.orderDetail.entries[itemIdx] = data;
            })
        }

         // 变更配送日期模态框
        vm.editDelivDate  = function(){
            var earliestDate = vm.dateFormat2(vm.orderDetail.entries[0].startDispDate);
            vm.orderDetail.entries.forEach(function (item) {
                if(earliestDate > vm.dateFormat2(item.startDispDate)){
                    earliestDate = vm.dateFormat2(item.startDispDate);
                }
            })
            var modalInst = $uibModal.open({
                templateUrl: 'editDelivDateModel.html',
                controller: 'editDelivDateModel',
                size: 'lg',
                resolve: {
                    dateItem : function(){
                        return earliestDate;
                    }
                }
            });
            modalInst.result.then(function(data) {
                vm.orderDetail.entries.forEach(function (item) {
                    item.startDispDate = moment(item.startDispDate).subtract(data,'days').format('YYYY-MM-DD');
                    item.endDispDate = moment(item.endDispDate).subtract(data,'days').format('YYYY-MM-DD');
                })
                // vm.savedEntries.forEach(function (item) {
                //    /* if(earliestDate > vm.dateFormat2(item.startDispDate)){
                //         earliestDate = vm.dateFormat2(item.startDispDate);
                //     }*/
                //     item.s
                // })
                // vm.savedEntries.forEach(function (item) {
                //     item.startDispDate = moment(vm.dateFormat2(item.startDispDate)).subtract(data,'days').format('YYYY-MM-DD');
                // })

                // vm.orderDetail.entries.forEach(function (item) {
                //     item.startDispDate = moment(vm.dateFormat2(item.startDispDate)).subtract(data,'days').format('YYYY-MM-DD');
                // })
                // var saveAlert = $alert({
                //     content: '修改成功！',
                //     container: '#body-alert'
                // })
                // saveAlert.$promise.then(function () {
                //     saveAlert.show();
                // })

                //保存提早日期单独操作，用备用的初始行项目，防止其他修改
                vm.orderDetail.editDate = '' + data;
                // vm.orderDetail.entries = vm.savedEntries;
                vm.save();
            })
        }


        // 变更配送规律模态框
        vm.editDelivery  = function(itemNo, itemIdx){
            var newData = angular.copy(vm.orderDetail.entries[itemIdx]);
            var modalInst = $uibModal.open({
                templateUrl: 'editDeliveryModal.html',
                controller: 'editDeliveryModal',
                size: 'lg',
                resolve: {
                     pScope: vm,
                     infoItem: function() {
                        return newData;
                    } 
                }
            });
            modalInst.result.then(function(data) {
                // var saveAlert = $alert({
                //     content: '修改成功！',
                //     container: '#body-alert'
                // })
                // saveAlert.$promise.then(function () {
                //     saveAlert.show();
                // })
                vm.orderDetail.entries[itemIdx] = data;
            }, function() {

            })
        }

        // 停订模态框
        vm.stopOrder  = function(itemNo, itemIdx){
            var newData = angular.copy(vm.orderDetail.entries[itemIdx]);
            var modalInst = $uibModal.open({
                templateUrl: 'stopOrderModal.html',
                controller: 'stopOrderModal',
                size: 'lg',
                resolve: {
                   pScope: vm,
                   stopItem : function(){
                     return newData;
                   }
                }
            });
            modalInst.result.then(function(data) {
                // var saveAlert = $alert({
                //     content: '修改成功！',
                //     container: '#body-alert'
                // })
                // saveAlert.$promise.then(function () {
                //     saveAlert.show();
                // })
                vm.orderDetail.entries[itemIdx] = data;
            })
        }

        // 删除模态框
        vm.removeProduct  = function(itemNo, itemIdx){
            var modalInst = $uibModal.open({
                templateUrl: 'removeProductModal.html',
                controller: 'removeProductModal',
                size: 'lg',
                resolve: {
                    pScope: vm,
                    itemNo:function(){
                        return itemNo;
                    },
                    itemIdx: function() {
                        return itemIdx;
                    }
                }
            });
            modalInst.result.then(function() {
                // var saveAlert = $alert({
                //     content: '删除成功！',
                //     container: '#body-alert'
                // })
                // saveAlert.$promise.then(function () {
                //     saveAlert.show();
                // })

            })
        }

	}

    addProductModal.$inject = ['$scope','$state','$uibModalInstance', 'pScope','rest'];

    function addProductModal($scope,$state, $uibModalInstance,pScope,rest) {

        var vm = $scope;
        vm.today = moment().subtract(1, 'days');
        vm.orderDetail = pScope.orderDetail;

        /*product-angular-table*/
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 8; //每页显示条数
        vm.matnrTxt = "";
        vm.getData = function(pageno){ 
            if(pScope.orderDetail.order.preorderSource=='70'){
                var orgParams = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderDate:pScope.orderDetail.order.orderDate,
                    orgId:pScope.orderDetail.order.onlineSourceType
                }
                rest.selectOrgPriceListOldPrice(orgParams).then(function (json) {
                    vm.content = json.data.list;
                    
                    vm.total_count = json.data.total;
                });
            }else{
              var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                matnrTxt:vm.matnrTxt,
                branchNo:pScope.orderDetail.order.branchNo
                }
                rest.getCanSellProducts(params).then(function (json) {
                    vm.content = json.data.list;
                    
                    vm.total_count = json.data.total;
                });
            }
           
        };

        vm.reloadTable = function(){
           vm.getData(vm.pageno);
        }
        vm.getData(vm.pageno);
        /*table-end*/

        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.chooseProduct = chooseProduct;
        vm.search ={};
        vm.flag = false;

        function chooseProduct(matnr,matnrTxt,shortTxt,bottype) {
            var newProduct = {};
            rest.getProductPrice(pScope.orderDetail.order.branchNo,matnr,pScope.orderDetail.order.deliveryType).then(function (json) {
                if(json.type!="success"){
                    alert("获取商品价格失败!");
                    return;
                }
                if(json.data <= 0 ){
                    alert("商品价格存在问题，请维护!");
                    return;
                }else{
                    newProduct.salesPrice = json.data;
                }
            }).then(function(){
                vm.flag = true;
                newProduct.newFlag = "Y";
                newProduct.unit = bottype.slice(-1);
                newProduct.gapDays = 0;
                newProduct.reachTimeType = '10';
                newProduct.matnr = matnr;
                newProduct.matnrTxt = matnrTxt;
                newProduct.shortTxt = shortTxt;
                newProduct.qty = 1;
                newProduct.ruleType ='10';
                vm.newEntry = newProduct;
            })
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*确认按钮*/
        function save() {
            if(!vm.flag)return;
            if (!vm.startDate || !vm.endDate) {
                alert("请选择有效日期！");
                return;
            }
            vm.newEntry.itemNo = pScope.defaultValue.newItemNo;
            vm.newEntry.startDispDate = vm.startDate;
            vm.newEntry.endDispDate = vm.endDate;
            pScope.orderDetail.entries.push(vm.newEntry);
            pScope.defaultValue.newItemNo++;
            cancelModal();
        }
        
    }
    addProductOrgModal.$inject = ['$scope','$state','$uibModalInstance', 'pScope','rest'];

    function addProductOrgModal($scope,$state, $uibModalInstance,pScope,rest) {

        var vm = $scope;
        vm.today = moment().subtract(1, 'days');
        vm.orderDetail = pScope.orderDetail;

        /*product-angular-table*/
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 8; //每页显示条数
        vm.matnrTxt = "";
        vm.getData = function(pageno){ 
                var orgParams = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderDate:moment(pScope.orderDetail.order.orderDate).format('YYYY-MM-DD'),
                    status:'Y',
                    isShow:'Y',
                    orgId:pScope.orderDetail.order.onlineSourceType,
                    search:vm.matnrTxt
                }
                rest.selectOrgPriceListOldPrice(orgParams).then(function (json) {
                    vm.content = json.data.list;
                    
                    vm.total_count = json.data.total;
                });
           
        };

        vm.reloadTable = function(){
           vm.getData(vm.pageno);
        }
        vm.getData(vm.pageno);
        /*table-end*/

        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.chooseProduct = chooseProduct;
        vm.search ={};
        vm.flag = false;
        vm.isold='N';
        function chooseProduct(matnr,matnrTxt,price,olaPrice,user) {
            if(price==undefined){
                alert('商品价格存在问题，请维护')
            }
            var newProduct = {};
                if(vm.isold=='N'){
                    newProduct.salesPrice = price;
                }else{
                    if(olaPrice==undefined){
                        alert('商品价格存在问题，请维护')
                    }else{
                        newProduct.salesPrice = olaPrice;
                    } 
                }
                vm.flag = true;
                newProduct.newFlag = "Y";
                newProduct.unit = ''
                newProduct.gapDays = 0;
                newProduct.reachTimeType = '10';
                newProduct.matnr = matnr;
                newProduct.matnrTxt = matnrTxt;
                newProduct.shortTxt = matnrTxt;
                newProduct.qty = 1;
                newProduct.ruleType ='10';
                newProduct.priceHome = user.priceHome;
                newProduct.priceNetValue = user.priceNetValue;
                newProduct.priceDeliver = user.priceDeliver;
                vm.newEntry = newProduct;
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*确认按钮*/
        function save() {
            if(!vm.flag)return;
            if (!vm.startDate || !vm.endDate) {
                alert("请选择有效日期！");
                return;
            }
            vm.newEntry.itemNo = pScope.defaultValue.newItemNo;
            vm.newEntry.startDispDate = vm.startDate;
            vm.newEntry.endDispDate = vm.endDate;
            pScope.orderDetail.entries.push(vm.newEntry);
            pScope.defaultValue.newItemNo++;
            cancelModal();
        }
        
    }

    addProductYearcardModal.$inject = ['$scope','$state','$uibModalInstance', 'pScope','rest'];

    function addProductYearcardModal($scope,$state, $uibModalInstance,pScope,rest) {

        var vm = $scope;
        vm.today = moment().subtract(1, 'days');
        vm.orderDetail = pScope.orderDetail;

        /*product-angular-table*/
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 8; //每页显示条数
        vm.matnrTxt = "";
        vm.getData = function(pageno){ 
                var orgParams = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderDate:moment(pScope.orderDetail.order.orderDate).format('YYYY-MM-DD'),
                    status:'Y',
                    isShow:'Y',
                    search:vm.matnrTxt
                }
                rest.selectYearcardPriceAndOldPrice(orgParams).then(function (json) {
                    vm.content = json.data.list;
                    vm.total_count = json.data.total;
                });
           
        };

        vm.reloadTable = function(){
           vm.getData(vm.pageno);
        }
        vm.getData(vm.pageno);
        /*table-end*/

        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.chooseProduct = chooseProduct;
        vm.search ={};
        vm.flag = false;
        vm.isold='N';
        function chooseProduct(matnr,matnrTxt,price,olaPrice,user) {
            if(price==undefined){
                alert('商品价格存在问题，请维护')
            }
            var newProduct = {};
                if(vm.isold=='N'){
                    newProduct.salesPrice = price;
                }else{
                    if(olaPrice==undefined){
                        alert('商品价格存在问题，请维护')
                    }else{
                        newProduct.salesPrice = olaPrice;
                    } 
                }
                vm.flag = true;
                newProduct.newFlag = "Y";
                newProduct.unit = ''
                newProduct.gapDays = 0;
                newProduct.reachTimeType = '10';
                newProduct.matnr = matnr;
                newProduct.matnrTxt = matnrTxt;
                newProduct.shortTxt = matnrTxt;
                newProduct.qty = 1;
                newProduct.ruleType ='10';
                newProduct.priceHome = user.priceHome;
                newProduct.priceNetValue = user.priceNetValue;
                newProduct.priceDeliver = user.priceDeliver;
                vm.newEntry = newProduct;
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*确认按钮*/
        function save() {
            if(!vm.flag)return;
            if (!vm.startDate || !vm.endDate) {
                alert("请选择有效日期！");
                return;
            }
            vm.newEntry.itemNo = pScope.defaultValue.newItemNo;
            vm.newEntry.startDispDate = vm.startDate;
            vm.newEntry.endDispDate = vm.endDate;
            pScope.orderDetail.entries.push(vm.newEntry);
            pScope.defaultValue.newItemNo++;
            cancelModal();
        }
        
    }

    editProductModal.$inject = ['$scope','$state','$uibModalInstance', 'pScope', 'rest', 'itemNo', 'itemData'];

    function editProductModal($scope,$state, $uibModalInstance,pScope,rest,itemNo, itemData) {

        var vm = $scope;
        vm.orderDetail = pScope.orderDetail;

        /*product-angular-table*/
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 8; //每页显示条数
        vm.matnrTxt = "";
        vm.order = {"branchNo":pScope.orderDetail.order.branchNo,
                    "deliveryType":pScope.orderDetail.order.deliveryType,
                    };
        vm.replaceProduct = {};
        vm.prodInfo = itemData;
        //vm.startDate= moment(vm.prodInfo.startDispDate).subtract(1, 'days').format('YYYY-MM-DD');
        vm.startDate= moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
        vm.endDate = vm.prodInfo.endDispDate;

        vm.getData = function(pageno){ 

            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                matnrTxt:vm.matnrTxt,
                branchNo:pScope.orderDetail.order.branchNo
            }

            rest.getCanSellProducts(params).then(function (json) {
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
        };
        vm.getData(vm.pageno);
        //重新加载商品datatable
        vm.reloadProductTable = function(){
            vm.curPageno = 1;
            vm.getData(vm.pageno);
        }
        /*table-end*/

        vm.cancelModal = cancelModal;
        vm.save = save;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*确认按钮*/
        function save() {

            if (vm.replaceProduct.product && vm.replaceProduct.product.matnrTxt) {
                for (var idx = 0; idx < pScope.orderDetail.entries.length; idx++) {
                    if(pScope.orderDetail.entries[idx].itemNo == itemNo){
                        pScope.orderDetail.entries[idx].matnrTxt = vm.replaceProduct.product.matnrTxt;
                        pScope.orderDetail.entries[idx].shortTxt = vm.replaceProduct.product.shortTxt;
                        pScope.orderDetail.entries[idx].salesPrice = vm.replaceProduct.product.salesPrice;
                        pScope.orderDetail.entries[idx].matnr = vm.replaceProduct.product.matnr;
                        pScope.orderDetail.entries[idx].qty = parseInt(vm.replaceProduct.product.qty);
                        pScope.orderDetail.entries[idx].unit = vm.replaceProduct.product.unit;
                        pScope.orderDetail.entries[idx].startDispDate = vm.prodInfo.startDispDate;
                        pScope.orderDetail.entries[idx].endDispDate = vm.prodInfo.endDispDate;
                        break;
                    }
                };
                vm.cancelModal();
            } else {
                alert("请先确认替换商品!");
            }
        }
        
    }

    editOrgProductModal.$inject = ['$scope','$state','$uibModalInstance', 'pScope', 'rest', 'itemNo', 'itemData'];

    function editOrgProductModal($scope,$state, $uibModalInstance,pScope,rest,itemNo, itemData) {

        var vm = $scope;
        vm.orderDetail = pScope.orderDetail;

        /*product-angular-table*/
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 8; //每页显示条数
        vm.matnrTxt = "";
        vm.isold='N';
        vm.order = {"branchNo":pScope.orderDetail.order.branchNo,
                    "deliveryType":pScope.orderDetail.order.deliveryType,
                    };
        vm.replaceProduct = {};
        vm.prodInfo = itemData;
        //vm.startDate= moment(vm.prodInfo.startDispDate).subtract(1, 'days').format('YYYY-MM-DD');
        vm.startDate= moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
        vm.endDate = vm.prodInfo.endDispDate;

        vm.getData = function(pageno){ 
                var orgParams = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderDate:moment(pScope.orderDetail.order.orderDate).format('YYYY-MM-DD'),
                    status:'Y',
                    isShow:'Y',
                    orgId:pScope.orderDetail.order.onlineSourceType,
                    search:vm.matnrTxt
                }
                rest.selectOrgPriceListOldPrice(orgParams).then(function (json) {
                    vm.content = json.data.list;
                    
                    vm.total_count = json.data.total;
                });
           
        };
        vm.getData(vm.pageno);
        //重新加载商品datatable
        vm.reloadProductTable = function(){
            vm.curPageno = 1;
            vm.getData(vm.pageno);
        }
        /*table-end*/

        vm.cancelModal = cancelModal;
        vm.save = save;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        /*确认按钮*/
        function save() {
            if (vm.replaceProduct.product && vm.replaceProduct.product.matnrTxt) {
                for (var idx = 0; idx < pScope.orderDetail.entries.length; idx++) {
                    if(pScope.orderDetail.entries[idx].itemNo == itemNo){
                        pScope.orderDetail.entries[idx].matnrTxt = vm.replaceProduct.product.matnrTxt;
                        pScope.orderDetail.entries[idx].shortTxt = vm.replaceProduct.product.shortTxt;
                        pScope.orderDetail.entries[idx].salesPrice = vm.replaceProduct.product.salesPrice;
                        pScope.orderDetail.entries[idx].priceDeliver = vm.replaceProduct.product.priceDeliver;
                        pScope.orderDetail.entries[idx].priceHome = vm.replaceProduct.product.priceHome;
                        pScope.orderDetail.entries[idx].priceNetValue = vm.replaceProduct.product.priceNetValue;
                        pScope.orderDetail.entries[idx].matnr = vm.replaceProduct.product.matnr;
                        pScope.orderDetail.entries[idx].qty = parseInt(vm.replaceProduct.product.qty);
                        pScope.orderDetail.entries[idx].unit = vm.replaceProduct.product.unit;
                        pScope.orderDetail.entries[idx].startDispDate = vm.prodInfo.startDispDate;
                        pScope.orderDetail.entries[idx].endDispDate = vm.prodInfo.endDispDate;
                        break;
                    }
                };
                vm.cancelModal();
            } else {
                alert("请先确认替换商品!");
            }
        }
        
    }
    editQtyModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'qtyItem','pScope'];

    function editQtyModal($scope, $alert, $uibModalInstance, qtyItem,pScope) {

        var vm = $scope;
        vm.qtyInfo = qtyItem;
        vm.startDate= moment(vm.qtyInfo.startDispDate).subtract(1, 'days').format('YYYY-MM-DD');
        vm.endDate = vm.qtyInfo.endDispDate;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.orderDetail = pScope.orderDetail;

        function save() {
            var saveAlert;
            if (!vm.newQty || vm.qtyInfo.qty == vm.newQty) {
                var content = '';
                if (!vm.newQty) {
                    content = '新数量请输入大于0的数字！';
                } else {
                    content = '新数量和原数量相同，请重新输入！';
                }
                saveAlert = $alert({
                    content: content,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }

            if (!vm.qtyInfo.startDispDate || !vm.qtyInfo.endDispDate) {
                saveAlert = $alert({
                    content: '请选择有效日期进行保存！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }

            vm.qtyInfo.qty = vm.newQty;
            closeModal(vm.qtyInfo);
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
        
    }


    editDeliveryModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'infoItem','pScope'];
    function editDeliveryModal($scope, $alert, $uibModalInstance,infoItem,pScope) {

        var vm = $scope;
        vm.orderDetail = pScope.orderDetail;

        // console.log(infoItem);
        vm.qtyInfo = infoItem;
        vm.deliveryTime = {
            data:[
            {"code":"10","text":"上午配送"},
            {"code":"20","text":"下午配送"}]
        };

        vm.startDate= moment(vm.qtyInfo.startDispDate).subtract(1, 'days').format('YYYY-MM-DD');
        vm.endDate = vm.qtyInfo.endDispDate;

        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.changeDeliveryType = changeDeliveryType;
        vm.dateFormat2 = dateFormat2;
        function changeDeliveryType (itemNo,idx){
            if(idx == 0){
                vm.qtyInfo.ruleType = "10";
                vm.qtyInfo.gapDays = 0;
                vm.qtyInfo.sendByWeeks = undefined;
                vm.qtyInfo.ruleTxt = undefined;
            }else{
                 vm.qtyInfo.ruleType = "20";
                 vm.qtyInfo.sendByWeeks={};
                 vm.qtyInfo.gapDays = undefined;
            }
        }

        function dateFormat2(start){
            if (start) { 
                return moment(start).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        function save() {
            if(vm.qtyInfo.ruleType == "20"){
                vm.qtyInfo.ruleTxt = "";
                if(vm.qtyInfo.sendByWeeks.mon==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"1,";
                if(vm.qtyInfo.sendByWeeks.tue==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"2,";
                if(vm.qtyInfo.sendByWeeks.wed==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"3,";
                if(vm.qtyInfo.sendByWeeks.tur==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"4,";
                if(vm.qtyInfo.sendByWeeks.fri==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"5,";
                if(vm.qtyInfo.sendByWeeks.sat==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"6,";
                if(vm.qtyInfo.sendByWeeks.sun==true)vm.qtyInfo.ruleTxt=vm.qtyInfo.ruleTxt+"7,";
                 // console.log(vm.qtyInfo.ruleTxt);
                if(vm.qtyInfo.ruleTxt!=null && vm.qtyInfo.ruleTxt!=""){
                    vm.qtyInfo.ruleTxt = vm.qtyInfo.ruleTxt.substring(0,vm.qtyInfo.ruleTxt.length-1);
                }else{
                    var saveAlert = $alert({
                        content: '按星期配送，至少选择一天！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
                }
                
            }else{
                if(vm.qtyInfo.gapDays < 0 || vm.qtyInfo.gapDays == undefined){
                     var saveAlert = $alert({
                        content: '按周期配送，间隔天数必须大于等于零！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
                }
            }
            if(vm.qtyInfo.startDispDate !=null && vm.qtyInfo.endDispDate!=null){
                vm.qtyInfo.startDispDate = dateFormat2(vm.qtyInfo.startDispDate);
                vm.qtyInfo.endDispDate = dateFormat2(vm.qtyInfo.endDispDate);
                // console.log(JSON.stringify(vm.qtyInfo));
            }else{
                   if(vm.qtyInfo.startDispDate == null){
                         var saveAlert = $alert({
                            content: '有效日期的开始日期不能为空！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        return ;
                   }
                   if(vm.qtyInfo.endDispDate == null){
                         var saveAlert = $alert({
                            content: '有效日期的结束日期不能为空！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        return ;
                   }
            }
            closeModal(vm.qtyInfo);
           
        }
     
        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
        
    }

    stopOrderModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'stopItem','pScope', 'nhCommonUtil'];

    function stopOrderModal($scope, $alert, $uibModalInstance,stopItem,pScope, nhCommonUtil) {

        var vm = $scope;
        vm.orderDetail = pScope.orderDetail;
        vm.qtyInfo = stopItem;
        // vm.isStop = vm.qtyInfo.isStop == 'Y' ? false : true;
        vm.minStartDate = moment().isAfter(vm.qtyInfo.startDispDate) ? nhCommonUtil.offsetDay(moment(), -1) : nhCommonUtil.offsetDay(vm.qtyInfo.startDispDate, -1);
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.dateFormat2 = dateFormat2;

        function dateFormat2(start){
            if (start) { 
                return moment(start).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        function save() {
            if(vm.orderDetail.order.paymentmethod == '20' && vm.qtyInfo.stopStartDate != null){
                vm.qtyInfo.stopEndDate = stopItem.endDispDate;
            }
            // if( (vm.qtyInfo.stopStartDate == null&&vm.qtyInfo.stopEndDate != null) || (vm.qtyInfo.stopStartDate != null&&vm.qtyInfo.stopEndDate == null)){
            //      var saveAlert = $alert({
            //                 content: '停订日期的开始日期和停订日期的结束日期必须一起填写！',
            //                 container: '#modal-alert'
            //             })
            //             saveAlert.$promise.then(function () {
            //                 saveAlert.show();
            //             })
            //             return ;
            // }
            if(!vm.qtyInfo.stopStartDate){
                var saveAlert = $alert({
                    content: '请选择停订日期的开始日期！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return ;
            }
            vm.qtyInfo.isStop = "Y";        
            vm.qtyInfo.stopStartDate = dateFormat2(stopItem.stopStartDate);
            // vm.qtyInfo.stopEndDate = dateFormat2(stopItem.stopEndDate);
            closeModal(vm.qtyInfo);
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
        
    }

    removeProductModal.$inject = ['$scope', '$alert', '$uibModalInstance', 'pScope', 'itemNo', 'itemIdx'];

    function removeProductModal($scope, $alert, $uibModalInstance, pScope, itemNo, itemIdx) {

        var vm = $scope;
        vm.qtyInfo = pScope.orderDetail.entries[itemIdx];

        vm.cancelModal = cancelModal;
        vm.save = save;

        function save() {
            pScope.orderDetail.entries.splice(itemIdx,1);
            closeModal();
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close();
        }
        
    }

    editDelivDateModel.$inject = ['$scope', '$alert', '$uibModalInstance', 'dateItem'];

    function editDelivDateModel($scope, $alert, $uibModalInstance,dateItem) {

        var vm = $scope;
        vm.earliestDate = dateItem;
        vm.cancelModal = cancelModal;
        vm.advanceDays = 1;
        vm.save = save;

        function save() {
            if (vm.advanceDays) {
                var today = moment().format('YYYY-MM-DD');
                if (moment(vm.earliestDate).subtract(vm.advanceDays, 'days').isBefore(today)) {
                    var saveAlert = $alert({
                        content: '修改的配送日期不能小于今天！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
                }
                closeModal(vm.advanceDays);
            } else {
                var saveAlert = $alert({
                    content: '请输入提前数量进行保存！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            }
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
        
    }

    showPlansModal.$inject = ['$scope', '$alert', '$uibModalInstance','rest','pScope'];

    function showPlansModal($scope, $alert, $uibModalInstance, rest , pScope) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        
       /* rest.uptOrderlongForViewPlans(pScope.orderDetail).then(function (json) {
               vm.planList = json.data;
        },function(json){
                        var saveAlert = $alert({
                        content: ''+json.data.msg,
                        container: '#modal-alert',
                        duration: false
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
            
        });*/

        rest.uptOrderlongForViewPlans(pScope.orderDetail).then(function (json) {
            //vm.planList = json.data;
        },function(json){
            console.log(JSON.stringify(json));
            if(json.data.type=="serverError"){
                var saveAlert = $alert({
                        content: ''+json.data.msg,
                        container: '#modal-alert',
                        duration: false
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    return;
            }
            if(json.data.type=="logicError"){
                vm.planList = json.data.msg;
            }
            
        });

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

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
        
    }

})();