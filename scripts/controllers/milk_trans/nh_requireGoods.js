// code style: https://github.com/johnpapa/angular-styleguide 

(function() {
    'use strict';
    angular
      .module('newhope')
      .controller('requireGoodCtrl', requireGoodCtrl )
      .controller('UpdateModalCtrl', UpdateModalCtrl)
      .controller('addModalCtrl', addModalCtrl)
      .controller('RefuseResendModalCtrl', RefuseResendModalCtrl);
      
    requireGoodCtrl.$inject = ['$state', '$scope', '$alert', '$uibModal', 'restService'];

    function requireGoodCtrl($state, $scope, $alert, $uibModal, rest) {
        var vm = $scope;
        vm.requireSending = false;
        vm.reqgoodsCreating = false;
        vm.reqbydateCreating = false;
        vm.search={};
        vm.edit = false;
        vm.orderNo = "";
        vm.search.requiredDate = new Date();
        vm.requiredDate = vm.search.requiredDate;
        vm.delPro="";
        vm.selfBranch = true;
        vm.orderDate  = null;
        vm.status = false;
        vm.voucherNo = "";
        vm.isEmpSend = true;
        vm.delear = true;
         //判断是否为送奶员要货
        rest.isEmpSendMode().then(function(json) {
          if (json.type == 'success') {
            console.log(1)
            if (json.data == true) {
              vm.isEmpSend = false;
               //是送奶员报货的
              rest.getCurUser().then(function(json) {
                console.log(2)
                if (json.data.dealerId != undefined) {
                  vm.delear = false;
                }

              })
            }

          }
        })
        
         rest.getCustBranchInfo().then(function(json){
               if(json.data.branchGroup == '02'){
                  vm.selfBranch = false;
               }
          })
         //要货计划导出
        vm.exportQuire = function(){
          rest.exportQueryRequireOrder(vm.search.requiredDate).then(function(json){
             rest.reportDeliverFile(json.data);
          })
        }
        vm.query = function(){
            //获取指定日期的要货计划
          rest.getRequiredGoodsList(vm.search.requiredDate).then(function(json){
             vm.requiredDate = json.data.requiredDate;
             vm.orderNo = json.data.orderNo;
             vm.nhmilks = json.data.entries;
             vm.orderDate  = json.data.orderDate;
             vm.voucherNo =json.data.voucherNo;
             vm.status = json.data.status;
             vm.createAt = json.data.createAt;
             vm.lastModified = json.data.lastModified;
          },function(json){
               var saveAlert = $alert({
                    content: ''+json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
              vm.orderNo ="";
               vm.nhmilks = [];
               vm.voucherNo ="";
          })

        }


       /****************************生成当天的要货计划***************************************/
        vm.create = function(){
               //生成当天的要货计划
          vm.reqgoodsCreating = true;
          rest.createRequiredGoodsList().then(function(json){
            if(json.type="success"){
                   var saveAlert = $alert({
                        content: '创建成功！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
              vm.requiredDate = json.data.orderDate;
              vm.orderDate  = json.data.orderDate;
              vm.orderNo = json.data.orderNo;
              vm.nhmilks = json.data.entries;
              vm.status = json.data.status;
              vm.createAt = json.data.createAt;
              vm.lastModified = json.data.lastModified;
              vm.reqgoodsCreating = false;
            }
          },function(json){
              vm.reqgoodsCreating = false;
              var saveAlert = $alert({
                    content: '创建失败'+json.data.msg,
                    container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
              })
          });

        }



       /****************************生成指定日期的要货计划***************************************/
        vm.createByDate = function(){
               //生成指定日期的要货计划
          vm.reqbydateCreating = true;
          rest.createRequiredGoodsListByDate(vm.search.requiredDate).then(function(json){
            vm.requiredDate = vm.search.requiredDate
            if(json.type="success"){
                   var saveAlert = $alert({
                        content: '创建成功！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
               vm.orderDate = json.data.orderDate;
               vm.orderNo = json.data.orderNo;
               vm.nhmilks = json.data.entries;
               vm.status = json.data.status;
               vm.reqbydateCreating = false;
            }
          },function(json){
              vm.reqbydateCreating = false;
              var saveAlert = $alert({
                    content:  '创建失败'+json.data.msg,
                    container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
              })
          });

        }
         /****************************添加要货计划行***************************************/

        vm.addProduct = function(){
          if( vm.orderNo == ""){
               var saveAlert = $alert({
                    content: '请先将今天的要货计划生成 或者查询出来',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
              return;
          }
          var modalInst = $uibModal.open({
              templateUrl: 'addModal.html',
              controller: 'addModalCtrl',
              size: 'lg',
              resolve: {
               orderNoItem: function() {
                       return  vm.orderNo;
                 }
              
              }
           });
            modalInst.result.then(function() {

            }, function() {
              vm.search.requiredDate = vm.requiredDate;
                vm.query();
            })
                 
       }
       /****************************删除要货计划行***************************************/
        
        vm.delItem = function(matnr){
           rest.delRequireGoodsItem(vm.orderNo,matnr).then(function(json){
                     if(json.type=="success"){
                          var saveAlert = $alert({
                              content: '删除成功',
                              container: '#body-alert'
                          })
                          saveAlert.$promise.then(function () {
                              saveAlert.show();
                          })
                          vm.search.requiredDate = vm.requiredDate;
                          rest.getRequiredGoodsList(vm.search.requiredDate).then(function(json){
                            vm.requiredDate = json.data.requiredDate;
                             vm.orderNo = json.data.orderNo;
                             vm.nhmilks = json.data.entries;
                           })

                     }
             },function(json){
                      var saveAlert = $alert({
                              content: json.data.msg,
                              container: '#body-alert'
                          })
                          saveAlert.$promise.then(function () {
                              saveAlert.show();
                      })
             })
        }


       /****************************修改要货计划行***************************************/
        vm.edit= function(matnr,matnrTxt,qty,increQty,flag,backQty,requiredDate){

                vm.product = {
                  "orderNo":vm.orderNo,
                  "matnr":matnr,
                  "matnrTxt":matnrTxt,
                  "qty":qty,
                  "increQty":increQty,
                  "flag":flag,
                  "backQty":backQty
                }

              var modalInst = $uibModal.open({
                    templateUrl: 'updateModal.html',
                    controller: 'UpdateModalCtrl',
                    size: 'lg',
                    resolve: {
                       productItem: function() {
                         return vm.product;
                       }
                    }
                });
                modalInst.result.then(function() {

                }, function() {
                     vm.search.requiredDate = vm.requiredDate;
                    vm.query();
                })
               
            }

             /****************************发送要货计划至ERP***************************************/

            vm.send = function(){
              vm.requireSending = true;
               rest.sendRequireOrderToERP().then(function(json){
                     if(json.type=="success"){
                      vm.requireSending = false;
                          if(vm.selfBranch){
                               var saveAlert = $alert({
                                    content: '发送成功',
                                    container: '#body-alert'
                                })
                                saveAlert.$promise.then(function () {
                                    saveAlert.show();
                                })
                                vm.voucherNo = json.data;
                                vm.search.requiredDate = new Date();
                                vm.query();
                          }else{
                               var saveAlert = $alert({
                                    content: '发送成功,可查询今天的销售订单',
                                    container: '#body-alert'
                                })
                                saveAlert.$promise.then(function () {
                                    saveAlert.show();
                                })
                                vm.search.requiredDate = new Date();
                                vm.query();
                          }
                     }
                 },function(json){
                      vm.requireSending = false;
                      var saveAlert = $alert({
                              content: json.data.msg,
                              container: '#body-alert'
                          })
                          saveAlert.$promise.then(function () {
                              saveAlert.show();
                      })
                 })
            }

            vm.getTotalgoods = function (entryList) {
              var sum = 0;
              for (var i = 0, len = entryList.length; i < len; i++) {
                sum += entryList[i].qty + entryList[i].increQty;
              }
              return sum;
            }

            vm.$watch('nhmilks', function (newVal) {
              if (newVal) {
                vm.totalGoods = vm.getTotalgoods(newVal);
              }
            })

            /*************拒收复送管理***********************/
            vm.refuseResend = function (matnr, totalNum) {
              var modalInst = $uibModal.open({
                templateUrl: 'refuseResendModal.html',
                controller: 'RefuseResendModalCtrl',
                controllerAs: 'rrm',
                size: 'lg',
                resolve: {
                    rrItem: function() {
                        return rest.getRefuseResendList(matnr,vm.orderNo);
                    },
                    orderNo: function () {
                      return vm.orderNo;
                    },
                    totalNum: function () {
                      return totalNum;
                    }
                }
              });
              modalInst.result.then(function() {
                  vm.query();
              })
            }
     
      }

    UpdateModalCtrl.$inject = ['$scope', '$uibModalInstance', '$alert', 'productItem', 'restService'];

    function UpdateModalCtrl($scope, $uibModalInstance,$alert,productItem,restService) {
          var vm = $scope;
            vm.product = productItem;
            vm.orderNo = vm.product.orderNo;
            vm.oldMatnr =  vm.product.matnr;       
            vm.cancelModal = cancelModal;

            vm.getProductTxt = function(product){
                 restService.getProductByCodeOrName(product).then(function(json){
                    vm.Rproducts = json.data;   
            
                })

            }
          vm.selected = function(matnr){
            
            vm.product.matnr = matnr;
          }


          vm.save = function(){
            //alert(vm.product.flag);
            if(vm.product.flag== 2){
                vm.newItem={
                    "orderNo":vm.orderNo,
                    "matnr":vm.product.matnr,
                    "oldMatnr":vm.oldMatnr,
                    "matnrTxt":vm.product.matnrTxt,
                    "qty":vm.product.qty,
                    "increQty":vm.product.increQty,
                    "backQty":vm.product.backQty
                }
                restService.updateNewItem(vm.newItem).then(function(json){
                     if(json.type == "success"){
                        var saveAlert = $alert({
                              content: "修改成功",
                              container: '#body-alert'
                          })
                          saveAlert.$promise.then(function () {
                              saveAlert.show();
                         })
                           cancelModal();
                        }
                  },function(json){
                    alert(json.data.msg);
                  })
            }


            if(vm.product.flag == 1){

                vm.oldItem = {
                  "orderNo":vm.orderNo,
                  "matnr":vm.product.matnr,
                  "increQty":vm.product.increQty,
                  "backQty":vm.product.backQty
                }
                  restService.updateOldItem(vm.oldItem).then(function(json){
                     if(json.type == "success"){
                        var saveAlert = $alert({
                              content: "修改成功",
                              container: '#body-alert'
                          })
                          saveAlert.$promise.then(function () {
                              saveAlert.show();
                         })
                           cancelModal();
                        }
                  },function(json){
                    alert(json.data.msg);
                  })

            }
          }


          function cancelModal() {
              $uibModalInstance.dismiss();
          }
    }

    addModalCtrl.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNoItem', 'restService'];

    function addModalCtrl($scope, $uibModalInstance,$alert,orderNoItem,restService) {
          var vm = $scope;
            vm.orderNo = orderNoItem;
            vm.cancelModal = cancelModal;
            vm.product = {};
            vm.getProductTxt = function(product){
                 restService.getProductByCodeOrName(product).then(function(json){
                    vm.Rproducts = json.data;   
                   
                })

            }
            vm.selected = function(matnr){
               vm.product.matnr = matnr;
            }

          vm.save = function(){

              if(vm.product.matnr=="" || vm.product.matnrTxt == "" || vm.product.qty=="" ){
                    var saveAlert = $alert({
                          content: "信息不完整",
                          container: '#body-alert'
                      })
                      saveAlert.$promise.then(function () {
                          saveAlert.show();
                     })
              }else{
                if(vm.product.increQty==""){
                  vm.product.increQty = 0;
                }
                vm.item = {
                  "orderNo":vm.orderNo,
                  "matnr":vm.product.matnr,
                  "matnrTxt":vm.product.matnrTxt,
                  "qty":vm.product.qty,
                  "increQty":vm.product.increQty
                }

                 restService.addRequireGoodsItem(vm.item).then(function(json){
                    if(json.type == "success"){
                       var saveAlert = $alert({
                          content: "添加成功",
                          container: '#body-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                       })
                       cancelModal();
                    }
                  },function(json){
                      var saveAlert = $alert({
                          content: json.data.msg,
                          container: '#body-alert'
                      })
                      saveAlert.$promise.then(function () {
                          saveAlert.show();
                     })
                  })
              }
          }


          function cancelModal() {
              $uibModalInstance.dismiss();
          }
    }

    RefuseResendModalCtrl.$inject = ['$uibModalInstance', '$alert', 'rrItem', 'orderNo', 'totalNum', 'restService'];

    function RefuseResendModalCtrl($uibModalInstance, $alert, rrItem, orderNo, totalNum, rest) {
      var vm = this;
      vm.saving = false;
      vm.totalQty = 0;
      vm.items = rrItem.data;
      vm.cancelModal = cancelModal;
      vm.uptTotalQty = uptTotalQty;
      vm.save = save;

      function save() {
        if (vm.totalQty > totalNum) {
          var saveAlert = $alert({
            content: "复送数量不能大于要货总数！",
            container: '#modal-alert'
          })
          saveAlert.$promise.then(function () {
              saveAlert.show();
          })
          return;
        }
        var entries = vm.items.map(function (ele) {
          if (ele.useQty) {
            return {
              resendOrderNo: ele.resendOrderNo,
              useQty: ele.useQty
            }
          } else {
            return;
          }
        });

        // var entries = vm.items.filter(function (ele) {
        //   if (ele.useQty) {
        //     return true;
        //   }
        // }).map(function (ele) {
        //     return {
        //       resendOrderNo: ele.resendOrderNo,
        //       useQty: ele.useQty
        //     }
        // });
        var entries = [];
        for (var i = 0, item; item = vm.items[i++];) {
          if (item.useQty>=0) {
            entries.push({
              resendOrderNo: item.resendOrderNo,
              useQty: item.useQty
            });
          }
        }

        var params = {
          reqOrderNo: orderNo,
          matnr: vm.items[0].matnr,
          entries: entries
        }
        vm.saving = true;
        rest.uptRequireOrderByResendItem(params).then(function (resp) {
          if (resp.type === 'success') {
            var saveAlert = $alert({
              content: "保存成功！",
              container: '#modal-alert'
            })
            saveAlert.$promise.then(function () {
              saveAlert.show();
              closeModal();
            })
            vm.saving = false;
          }
        }, function (reject) {
          var errorAlert = $alert({
              content: reject.data.msg,
              container: '#modal-alert'
          })
          errorAlert.$promise.then(function () {
              errorAlert.show();
          })
          vm.saving = false;
        })
      }

      function uptTotalQty(val) {
        // if (typeof(val) !== 'undefined') {
          vm.totalQty = vm.items.reduce(function (preVal, curVal) {
            return preVal + (curVal.useQty || 0);
          }, 0)
        // }
      }

      function cancelModal() {
        $uibModalInstance.dismiss();
      }

      function closeModal() {
        $uibModalInstance.close();
      }

    }

})();
