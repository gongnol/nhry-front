(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('BookOrderCreateCtrl', BookOrderCreateCtrl);

    BookOrderCreateCtrl.$inject = ['$scope', '$state', '$resource','$alert',  '$uibModal', 'restService'];

    function BookOrderCreateCtrl($scope, $state, $resource,  $alert,$uibModal, rest) {
    	var pvm = $scope;
        pvm.choseStation = false;
        pvm.toggle3 = true;
        pvm.orderCreating = false;
        pvm.defaultValue = {};
        pvm.defaultValue.date = new Date();
        pvm.content = []; //定义的需要数据的集合，
        pvm.curPageno = 1;
        pvm.pageno = 1; // 初始化页码为1
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
        pvm.order = {};
        pvm.selectedDealer = false;
        pvm.cust = {};
		pvm.addId = {rowNum:10};
        pvm.entries = [];
        pvm.price={};
        pvm.address={"addressMode":"1"};
        pvm.area = {};
        pvm.select={};
        pvm.order.sdealer='';
        pvm.orderNo = "";
        pvm.haveCreated = false;
        rest.priceDealers().then(function(json){
              pvm.dealers = json.data;   
        });

        rest.getCurUser().then(function(json){
             pvm.order.solicitorNo= json.data.loginName;   
        });

		pvm.dealerSelected = function(dealerNo,dealerName){
            pvm.select.dealerName = dealerName;
			if(dealerNo && dealerNo !=''){
				pvm.selectedDealer = true;
				//console.log(JSON.stringify(dealerNo));
				 rest.getBranchByDealer(dealerNo).then(function(json){
             	 pvm.branchs = json.data;   
       		 });
			}
 		}

        //选择奶站时触发获取奶站下的所有小区  和  送奶员
        pvm.branchSelected = function(branchNo,branchName){
            if(branchNo && branchNo !=''){
               pvm.select.branchName = branchName;
                rest.getAreaByBranchNo(branchNo).then(function (json) {
                        pvm.subdist = json.data;
                })
                 pvm.getData(pvm.pageno);
                rest.getAllMilkmanByBranchNo(pvm.order.branchNo,'milkMan').then(function (json) {
                        var result = json.type;
                        if(result == 'success'){
                            pvm.emps = json.data;
                        }
                 },function(json){
                     var saveAlert = $alert({
                        content: '加载收款人失败！'+json.data.msg,
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })

            });


            }
        }
        //获取销售组织下的小区信息
        pvm.getArea = function (addr) {
            //console.log(addr);
            var params = {
                province: addr[0].itemCode,
                city: addr[1].itemCode,
                county: addr[2].itemCode
            }
            if (pvm.cust.subdist) {
                pvm.cust.subdist = "";
            }
            rest.searchSalesOrgArea(params).then(function (json) {
                pvm.subdist = json.data;
            })
        }
        //保存选择的小区信息
        pvm.selectArea = function(item){
            pvm.area = item;
            //console.log(pvm.area);
            pvm.cust.custAddress = [];
            pvm.cust.custAddress[0] = {
                itemCode: item.province,
                itemName: item.provinceName
            };
            pvm.cust.custAddress[1] = {
                itemCode: item.city,
                itemName: item.cityName
            };
            pvm.cust.custAddress[2] = {
                itemCode: item.county,
                itemName: item.countyName
            };
        }
       


        pvm.priceTypes = {
            data:[
            {"code":"10","text":"自取"},
            {"code":"20","text":"送奶到户"}]
        };

        //商品行选择配送方式，切换tab页时，清空另一页数据
        pvm.changeDeliveryType = function(rowNum,type){
            if(type==0){
                //按周期送
                for (var idx = 0; idx < pvm.entries.length; idx++) {
                    if(pvm.entries[idx].rowNum == rowNum){
                        pvm.entries[idx].sendByWeeks = undefined;
                        pvm.entries[idx].ruleTxt = undefined;
                         pvm.entries[idx].gapDays = 0;
                        break;
                    }
                }
            }else if(type==1){
                //按星期送
                for (var idx = 0; idx < pvm.entries.length; idx++) {
                    if(pvm.entries[idx].rowNum == rowNum){
                        pvm.entries[idx].sendByWeeks = {
                            mon:true,
                            tue:true,
                            wed:true,
                            tur:true,
                            fri:true,
                            sat:true,
                            sun:true
                        };
                        pvm.entries[idx].gapDays = undefined;
                        pvm.entries[idx].sendByGaps = undefined;
                        break;
                    }
                }
            }
        }

 		pvm.toTab = function(id){
            if(id == 2){
                /* 
                    
                */
                if(pvm.cust.custName==null || pvm.cust.custTel==null || pvm.cust.custAddress==null || 
                    pvm.order.deliveryType == null || pvm.order.paymentStat == null ||  pvm.cust.room==null ){
                        var saveAlert = $alert({
                            content: '收货人信息不完整！',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        return;
                }else{
                   if(pvm.order.branchNo == null){
                            alert("调用电商接口获取,获取奶站---请等待");
                           /*  var saveAlert = $alert({
                                content: '调用电商接口获取,获取奶站---请等待！',
                                container: '#body-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })*/
                            var param = {
                                "province": pvm.cust.custAddress[0].itemCode,
                                "city":pvm.cust.custAddress[1].itemCode,
                                "district":pvm.cust.custAddress[2].itemCode,
                                "townId":pvm.area.id,
                                "townName":pvm.area.residentialAreaTxt,
                                "address":pvm.cust.room
                            }
                            //console.log(param);
                            /*
                             var param = {
                                "province":"370000000000",
                                "city":"370200000000",
                                "district":"370212000000",
                                "townId":"6441ab29d71046dfa844a26db18b1604",
                                "townName":"3-2-801",
                                "address":"3-2-801"
                            }*/
                            rest.getBranchByBussiness(param).then(function (json) {
                               if(json.data == null || json.data==''){
                                   var saveAlert = $alert({
                                            content: '没有奶站数据，请选择奶站！！！',
                                            container: '#body-alert'
                                        })
                                        saveAlert.$promise.then(function () {
                                            saveAlert.show();
                                        })
                                        pvm.toTab(0);
                                        return;
                               }else{
                                        var branch = json.data.branch;
                                        var dealer = json.data.dealer;
                                        pvm.order.branchNo = branch.branchNo;
                                        pvm.order.dealer = dealer.dealerNo;
                                        pvm.select.branchName = branch.branchName;
                                        pvm.select.dealerName = dealer.dealerName;
                                        pvm.dealerSelected(dealer.dealerNo,dealer.dealerName);
                                        pvm.branchSelected(branch.branchNo,branch.branchName);
                               }
                            },function(json){
                                 var saveAlert = $alert({
                                    content: '获取奶站失败，请务必选择奶站！！！',
                                    container: '#body-alert'
                                })
                                saveAlert.$promise.then(function () {
                                    saveAlert.show();
                                })
                                pvm.toTab(0);
                                return;
                            })
                     }
                }
            }

            if(id == 3){
                if( pvm.order.solicitorNo==null || pvm.order.solicitBy==null || pvm.order.solicitNo==null){
                        var saveAlert = $alert({
                            content: '征订人信息不完整！',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        return;
                }
                
            }

            if(id == 4){
               if(pvm.entries.length<=0){
                    var saveAlert = $alert({
                            content: '请选择至少一件产品!',
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                    return;
                }
            }
	    	angular.element("#changetab"+id).click();
	    }

        pvm.getData = function(pageno){ 
            var params = {
                pageNum: pageno,
                pageSize: pvm.itemsPerPage,
                matnrTxt:pvm.matnrTxt,
                branchNo:pvm.order.branchNo
            }
            //console.log(JSON.stringify(params));
            if(pvm.order.branchNo!=null ){
                rest.getCanSellProducts(params).then(function (json) {
                    pvm.content = json.data.list;
                    pvm.total_count = json.data.total;
                });
            }else{
                 rest.listsBySalesOrg(params).then(function (json) {
                    pvm.content = json.data.list;
                    pvm.total_count = json.data.total;
                });
            }
         
        };
        //重新加载产品信息
        pvm.reloadProductTable = function(){
	    	  pvm.curPageno = 1;
              pvm.getData(pvm.curPageno); 
	    }

        pvm.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
              pvm.curPageno = 1;
              pvm.getData(pvm.curPageno); 
            }
        }
        //获取产品价格(如果选择奶站)
	    $scope.getProductPrice = function(matnr,matnrTxt,qty){
            if(qty == null){
                   var saveAlert = $alert({
                            content: '请选择产品数量！！！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })  
                    return;    
             }
            var product ={};
            //console.log(JSON.stringify(pvm.addId.rowNum));
	    	//console.log(JSON.stringify(pvm.entries));
            if(pvm.order.branchNo!=null){
                 /*获取商品价格*/
                rest.getProductPrice(pvm.order.branchNo,matnr,pvm.order.deliveryType).then(function (json) {
                        if(json.type!="success"){
                            alert("获取商品价格失败!");
                        }
                        // alert(JSON.stringify(json));
                        product.salesPrice = json.data;
                })
                   /*.then(function(){
                        product.matnr = matnr;
                        product.matnrTxt = matnrTxt;
                        product.qty = qty;
                        product.rowNum = pvm.addId.rowNum;
                        pvm.addId.rowNum = pvm.addId.rowNum + 2;
                        //console.log(JSON.stringify(product));
                        pvm.entries.push(product);
                        //pvm.$apply();//刷新
                    });*/
            }else{

            }
            product.gapDays = 0;
            product.matnr = matnr;
            product.matnrTxt = matnrTxt;
            product.qty = qty;
            product.rowNum = pvm.addId.rowNum;
            pvm.addId.rowNum = pvm.addId.rowNum + 2;
            //console.log(JSON.stringify(product));
            pvm.entries.push(product);
			     
				
		}





         //订单行项目计算金额和截止日期
        pvm.calentry = function(rowNum){
            // setTimeout('calentryd(rowNum)',2000);
            for (var idx = 0; idx < pvm.entries.length; idx++) {
                var week = pvm.entries[idx];
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
                    if(pvm.order.paymentStat=='20'){
                        rest.calculateAmtAndEndDate(week).then(function (json) {
                            week.endDispDateStr = json.data.endDispDateStr;
                            pvm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
                            week.entryTotal = json.data.entryTotal;
                            pvm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
                        })
                        break;
                    }else{
                        rest.calculateQtyAndAmt(week).then(function (json) {
                            week.dispTotal = json.data.dispTotal;
                            pvm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
                            week.entryTotal = json.data.entryTotal;
                            pvm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
                        })
                        break;
                    }
                }
            }
        }

        pvm.calentry2 = function(index){
            //console.log(index);
            var idx = index.$scope.$index;
            var week = pvm.entries[idx];
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
            if(pvm.order.paymentStat=='20'){
                if('payment20EndDispDate' == index.$id){
                    rest.calculateQtyAndAmt(week).then(function (json) {
                        week.dispTotal = json.data.dispTotal;
                        pvm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
                        week.entryTotal = json.data.entryTotal;
                        pvm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
                    })
                }
                else{
                    rest.calculateAmtAndEndDate(week).then(function (json) {
                        week.endDispDateStr = json.data.endDispDateStr;
                        pvm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
                        week.entryTotal = json.data.entryTotal;
                        pvm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
                    })
                }
            }else{
                rest.calculateQtyAndAmt(week).then(function (json) {
                    week.dispTotal = json.data.dispTotal;
                    pvm.order.frontAmt -= week.entryTotal==undefined?0:week.entryTotal;
                    week.entryTotal = json.data.entryTotal;
                    pvm.order.frontAmt += week.entryTotal==undefined?0:week.entryTotal;
                })
            }
        }


         pvm.deleteEntry = function(rowNum){
            for (var idx = 0; idx < pvm.entries.length; idx++) {
                if(pvm.entries[idx].rowNum == rowNum){
                    pvm.entries.splice(idx,1);
                    break;
                }
            };
        }


        pvm.order = {"milkboxStat":"20","frontAmt":0.00,"preorderSource":"20","preorderStat":"20"};

         /*创建订单！*/
        pvm.toCreateOrder = function(){
           
            var entity = {};
            entity.order = pvm.order;
            entity.entries = pvm.entries;
            if (!entity.order.empNo) {
                var saveAlert = $alert({
                    content: '请选择送奶员！',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
            
            if(pvm.order.paymentStat == '20'){
                if(pvm.account!=undefined&&pvm.account!=""){
                    entity.account = pvm.account;
                }
            }
            if(pvm.address.addressMode == "1"){
                /*格式转换*/
                    entity.address = pvm.address;
                    entity.address.province =pvm.cust.custAddress[0].itemCode;
                    entity.address.city = pvm.cust.custAddress[1].itemCode;
                    entity.address.county = pvm.cust.custAddress[2].itemCode;
                    entity.address.residentialArea = pvm.cust.subdist;
                    entity.address.addressTxt = pvm.cust.room;
                    entity.address.recvName = pvm.cust.custName;
                    entity.address.mp = pvm.cust.custTel;
                    entity.address.sapMp = pvm.cust.vipCustTel;
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
            pvm.orderCreating = true;
           
            // alert(pvm.haveCreated);
            if(pvm.haveCreated == true){
                 var saveAlert = $alert({
                    content: '已创建成功,订单号为'+pvm.orderNo,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                pvm.orderCreating = false;
                return;
            }
            rest.toCreateOrder(entity).then(function (json) {
                    var result = json.type;
                    if(result == 'success'){
                        pvm.orderNo = json.data;
                        pvm.haveCreated = true;
                        var saveAlert = $alert({
                            content: '订单创建成功！订单号为:'+pvm.orderNo,
                            container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            pvm.orderCreating = false;
                            saveAlert.show();
                        }).then(function () {
                          
                           
                        }).then(function(){
                              if(confirm("订单已成功创建，是否要刷新创建新的订单?")){
                                $state.go('newhope.bookOrderCreate', {}, {reload: true});
                              }
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
                pvm.orderCreating = false;
                var saveAlert = $alert({
                    content: '订单创建失败！' + json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        }


         /*测试用方法看json*/
        pvm.tosee = function(){
            //console.log(JSON.stringify(pvm.order));
            //console.log(JSON.stringify(pvm.cust));
            //console.log(JSON.stringify(pvm.entries));
            //console.log(JSON.stringify(pvm.cust.custAddress));
        }

         pvm.getPromotions = function(matnr){
            pvm.promotions = undefined;
            rest.getPromotionByMatnr(matnr).then(function(json){
              pvm.promotions = json.data;   
            })
        }


         pvm.deliveryTime = {
            data:[
            {"code":"10","text":"上午配送"},
            {"code":"20","text":"下午配送"}]
        };

        pvm.milkBoxs = {
            data:[
            {"code":"10","text":"已安装"},
            {"code":"20","text":"需要安装"},
            {"code":"30","text":"不需要安装"}]
        };

        pvm.payStyles = {
            data:[
            {"code":"10","text":"卡支付"},
            {"code":"20","text":"现金支付"}]
        };

        pvm.priceTypes = {
            data:[
            {"code":"10","text":"自取"},
            {"code":"20","text":"送奶到户"}]
        };


    }
   })();

  