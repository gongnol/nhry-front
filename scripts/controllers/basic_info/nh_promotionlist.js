(function() {
	'use strict';
	angular
	  .module('newhope')
      .controller('SelectPromCtrl', SelectPromCtrl)
       .controller('PromotionDetail', PromotionDetail)
	  .controller('PromotionsCtrl', PromotionsCtrl);

	PromotionsCtrl.$inject =['$scope', '$state', '$rootScope', '$alert', '$uibModal', 'restService'];

	function PromotionsCtrl($scope, $state, $rootScope, $alert, $uibModal, rest) {

        var vm = this;
        vm.search = {};
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = getData;
        vm.getPromoMatnr = getPromoMatnr;
        vm.dateFormat = dateFormat;
        vm.selectProm = selectProm;
        vm.deleteProm = deleteProm;
        vm.allocatProm = allocatProm;
        vm.detail = detail;
        vm.getData(vm.curPageno);

        function getData(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            
            var params = {
                promNo:vm.search.promNo,
                orderDateStart: vm.search.fromDate,
                orderDateEnd: vm.search.untilDate,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };
            rest.searchPromoByPage(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        }
        function getPromoMatnr(matnr, qty) {
            if (matnr) {
                return qty ? matnr + ' ' + qty + '瓶' : matnr;
            } else {
                return '';
            }
        }

        function dateFormat(dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }



          function allocatProm(){
             $state.go('newhope.allocatProm');
          }




        function selectProm(){
            var modalInst = $uibModal.open({
                templateUrl: 'selectProm.html',
                controller: 'SelectPromCtrl',
                size: 'lg',
                resolve: {
                }
            });
            modalInst.result.then(function(data) {
                alert("返回结果为:"+data);
                 var url = $state.href('newhope.promotionAdd', {promSubType: data});
                 window.open(url,'_blank');
            })

        }

        function deleteProm(promNo) {
            if(promNo!==''){
                if(confirm("确定要删除?")){
                        rest.deleteProm(promNo).then(function (json) {
                         if (json.type === 'success') {
                            var alert = $alert({
                                content: '删除成功!',
                                container: '#modal-alert'
                            })
                            alert.$promise.then(function() {
                                alert.show();
                            })
                            vm.getData(vm.curPageno);

                    }
                    }, function (reject) {
                        var errorAlert = $alert({
                            title: reject.data.type,
                            content: reject.data.msg,
                            container: '#modal-alert'
                        })
                        errorAlert.$promise.then(function () {
                            errorAlert.show();
                        })
                        vm.tbLoding = 0;
                    });
                }
                  
            }
        }



          function detail(promNo){
            var modalInst = $uibModal.open({
                templateUrl: 'promotionDetail.html',
                controller: 'PromotionDetail',
                size: 'xxls',
                resolve: {
                     promNo: function () {
                        return promNo;
                    }
                }
            });
            modalInst.result.then(function(data) {
              
            })

        }


    }




    PromotionDetail.$inject = ['$window','$scope','$alert','$uibModal','promNo', '$uibModalInstance',  'restService'];

    function PromotionDetail($window,$scope,$alert,uibModal,promNo, $uibModalInstance,rest) {
          var vm = $scope;
          vm.cancelModal = cancelModal;
          vm.closeModal = closeModel;
          vm.getPromoMatnr = getPromoMatnr;
          vm.dateFormat = dateFormat;
          vm.promotions = [];
          vm.date = {};

            //促销类型
            rest.searchPromoDetailByNo(promNo).then(function (json) {
                if(json.data !=null){
                    vm.date.planStartTime = dateFormat(json.data[0].planStartTime);
                    vm.date.planStopTime = dateFormat(json.data[0].planStopTime);
                    vm.date.buyStartTime = dateFormat(json.data[0].buyStartTime);
                    vm.date.buyStopTime = dateFormat(json.data[0].buyStopTime);
                    
                }
                vm.promotions =  json.data;
            })




          function getPromoMatnr(matnr, qty) {
            if (matnr) {
                return qty ? matnr + ' ' + qty + '瓶' : matnr;
            } else {
                return '';
            }
        }

        function dateFormat(dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        function cancelModal(){
            $uibModalInstance.dismiss();
        }

        function  closeModel() {
            $uibModalInstance.close();
        }
    }





    SelectPromCtrl.$inject = ['$window','$scope','$alert','$uibModal', '$uibModalInstance',  'restService'];

    function SelectPromCtrl($window,$scope,$alert,uibModal, $uibModalInstance,rest) {

          var vm = $scope;
          vm.cancelModal = cancelModal;
          vm.closeModal = closeModel;
          vm.select = {};

        //促销类型
        rest.codeMap('2013').then(function (json) {
            vm.promotions =  json.data;
        })


        vm.add = function(){
            if(vm.select.promotion == '' || vm.select.promotion== undefined){
                alert("请选择促销类型");
            }else{
                 $uibModalInstance.close(vm.select.promotion);
            }
            
        }


        function cancelModal(){
            $uibModalInstance.dismiss('cancel');
        }

        function  closeModel() {
            $uibModalInstance.close();
        }
    }

})();