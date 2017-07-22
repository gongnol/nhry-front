(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('productEditCtrl', productEditCtrl);

	productEditCtrl.$inject = ['$scope','$state', '$resource','$alert', '$stateParams','$uibModal','restService'];

	function productEditCtrl($scope, $state, $resource, $alert,$stateParams,$uibModal, rest) {

        var pvm = this;
        var vm = $scope;
        vm.productCode = $stateParams.productCode;

        var actResult; // 操作结果
        vm.handle = {
            // 回瓶选项
            retBotFlags: [{
                code: '30',
                label: '大口瓶'
            }, {
                code: '20',
                label: '中口瓶'
            }, {
                code: '10',
                label: '小口瓶'
            }, {
                code: 'N',
                label: '否'
            }],
            // 已选不可销售范围数组
            selectedNotsellList: [],
            // 经销商数组
            dealers: [],
            //中类
            secCateNames: [],
            zbotCodeNames: []
        };
        vm.product = {};
        vm.cancelModal = cancelModal;
        vm.save = save;

        vm.back = function(){
            $state.go('newhope.productInfo');
        }

        rest.productItem($stateParams.productCode).then(function (json) {
            vm.product = json.data;
            console.log(vm.product);
            rest.secCateByParent(vm.product.firstCat).then(function (json) {
                vm.handle.secCateNames =  json.data;
                //vm.product.secCate = vm.handle.secCateNames[0].itemCode;
            });
            if('Y'!=vm.product.maraEx.returnFlag){
                vm.product.returnFlag = 'N';
                vm.handle.retBotFlags = [
                    {
                        code: 'N',
                        label: '否'
                    }
                ];
            }else{
                vm.product.returnFlag = vm.product.maraEx.botType;
                vm.handle.retBotFlags = [
                    {
                        code: '30',
                        label: '大口瓶'
                    }, {
                        code: '20',
                        label: '中口瓶'
                    }, {
                        code: '10',
                        label: '小口瓶'
                    }
                ];
            }
        })

        
        //大类 
        rest.codeMap('2000').then(function (json) {
            vm.handle.firstCateNames =  json.data;
            //vm.product.firstCat = vm.handle.firstCateNames[0].itemCode;
            //vm.getFirstCate(vm.product.firstCat);
        });

        vm.getFirstCate = function(item){
            //中类
            vm.product.secCate = '';
            vm.handle.secCateNames = [];
            rest.secCateByParent(item.itemCode).then(function (json) {
                vm.handle.secCateNames =  json.data;
                vm.product.secCate = vm.handle.secCateNames[0].itemCode;
            });
        };

        //包装类型
        rest.codeMap('2004').then(function (json) {
            vm.handle.zbotCodeNames =  json.data;
            //vm.product.zbotCode = vm.handle.zbotCodeNames[0].itemCode;
            //vm.getRetBotFlag(vm.product.zbotCode);
        });

        vm.getRetBotFlag = function (item){
            if('Y'!=item.attr1){
                vm.product.returnFlag = 'N';
                vm.handle.retBotFlags = [
                    {
                        code: 'N',
                        label: '否'
                    }
                ];
            }else{
                vm.product.returnFlag = '20';
                vm.handle.retBotFlags = [
                    {
                        code: '30',
                        label: '大口瓶'
                    }, {
                        code: '20',
                        label: '中口瓶'
                    }, {
                        code: '10',
                        label: '小口瓶'
                    }
                ];
            }
        };
        
        rest.codeMap('2002').then(function (json) {
            vm.handle.brandNames =  json.data;
            //vm.product.brand = vm.handle.brandNames[0].itemCode;
        });
        rest.codeMap('2003').then(function (json) {
            vm.handle.specNames =  json.data;
            //vm.product.spec = vm.handle.specNames[0].itemCode;
        });
        rest.codeMap('2005').then(function (json) {
            vm.handle.importantPrdFlags =  json.data;
            //vm.product.importantPrdFlag = vm.handle.importantPrdFlags[0].itemCode;
        });

        rest.getBranchByType('01').then(function (json) {
            json.data.branchList.forEach(function (ele, idx) {
                vm.handle.dealers.push({
                    id: '-1' + ele.branchNo,
                    dealerNo: '-1',
                    branchNo: ele.branchNo,
                    name: '自营——' + ele.branchName
                })
            })
            rest.priceDealers().then(function (json) {
            
                json.data.forEach(function (ele, idx) {
                    if (ele.dealerNo !== '-1') {
                        vm.handle.dealers.push({
                            id: ele.dealerNo,
                            dealerNo: ele.dealerNo,
                            name: ele.dealerName
                        })
                    }
                })
                if (vm.product.notsellList) {
                    vm.product.notsellList.forEach(function (ele, idx) {
                        var selectedItem;
                        if (ele.dealerNo === '-1') {
                            selectedItem = {
                                id: '-1' + ele.branchNo,
                                dealerNo: '-1',
                                branchNo: ele.branchNo,
                                name: ele.branchName
                            }
                        } else {
                            selectedItem = {
                                id: ele.dealerNo,
                                dealerNo: ele.dealerNo,
                                name: ele.dealerName
                            }
                        }
                        vm.handle.selectedNotsellList[idx] = selectedItem;
                    })
                }
            })
        })

        function cancelModal() {
            $uibModalInstance.dismiss(actResult);
        }

        /*保存按钮*/
        function save() {
            /*验证输入*/
            // if(vm.product.shortTxt==undefined || vm.product.preDays==undefined){
            //  return false;
            // }

           console.log(vm.product); 
           if (typeof(vm.product.matnr) === 'undefined' || typeof(vm.product.matnrTxt) === 'undefined') {
                    var alert = $alert({
                        content: '产品编号和名称不能为空！',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function() {
                        alert.show();
                    })
                    return;
                }


            if (vm.product.returnFlag) {
                switch (vm.product.returnFlag) {
                    case '30':
                    case '20':
                    case '10':
                        vm.product.maraEx.botType = vm.product.returnFlag;
                        vm.product.maraEx.retBotFlag = 'Y';
                        break;
                    case 'N':
                        vm.product.maraEx.botType = '';
                        vm.product.maraEx.retBotFlag = 'N';
                }
            } else {
                vm.product.maraEx.botType = '';
                vm.product.maraEx.retBotFlag = '';
            }

            var notsellList = [];
            if (vm.handle.selectedNotsellList) {
                //console.log(vm.handle.selectedNotsellList);
                vm.handle.selectedNotsellList.forEach(function (ele) {
                    // notsellList.push({
                    //     matnr: vm.product.matnr,
                    //     dealerNo: ele.dealerNo
                    // })
                    if (ele.branchNo) {
                        notsellList.push({
                            matnr: vm.product.matnr,
                            dealerNo: '-1',
                            branchNo: ele.branchNo
                        })
                    } else {
                        notsellList.push({
                            matnr: vm.product.matnr,
                            dealerNo: ele.dealerNo
                        })
                    }
                })
            }

            var params = vm.product;
            params.notsellList = notsellList;

            rest.updateProductItem(vm.product).then(function (json) {
                if(json.type == 'success') {
                    actResult = 'success';
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            }, function (reject) {
                actResult = 'fail';
                var cancelAlert = $alert({
                    title: reject.status,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
           
        }

	}

})();