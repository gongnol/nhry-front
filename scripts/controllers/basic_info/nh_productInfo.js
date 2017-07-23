(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('productCtrl', productCtrl)
	  .controller('productDetailModal', productDetailModal)
      .controller('productDetailAddModal', productDetailAddModal);

	productCtrl.$inject = ['$scope','$state', '$resource','$alert','$uibModal','restService'];

	function productCtrl($scope, $state, $resource, $alert, $uibModal, rest) {

        $scope.isSearch = false;
        $scope.search = {};
        $scope.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                $scope.doSearch();
            }
        }
        $scope.statusMap = function (code) {
            if (code == 'Y') {
                return vm.handle.statuses[0].label;
            } else if (!code || code == 'N') {
                return vm.handle.statuses[1].label;
            } else {
                return '';
            }
        }
        $scope.doSearch = function () {
            //console.log($scope.search);
            for (var item in $scope.search) {
                if ($scope.search.hasOwnProperty(item)) {
                    vm.tbParams[item] = $scope.search[item];
                }
            }
            vm.curPageno = 1;
            vm.getData(1);
        }
        
         $scope.toProductEdit = function(){
            var url = $state.href('newhope.setpro');
            window.open(url,'_blank');
        };

     

        var vm = this;
        vm.handle = {
            statuses: [{
                code: 'Y',
                label: '有效'
            }, {
                code: 'N',
                label: '无效'
            }]
        };

        rest.codeMap('2001').then(function (json) {
            vm.handle.secCate = json.data;
        })

        vm.tbLoding = -1; // 数据表加载状态，-1初始状态，1加载中，0加载完成
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };

        vm.getData = function(pageno){ 
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            vm.tbParams.pageNum = pageno;

            rest.products(vm.tbParams).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total ? json.data.total : 0;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.status.toString() + ' ' + reject.statusText,
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        };

        vm.getData(vm.pageno); 

        vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') {
                // if ('ActiveXObject' in window) {
                //     return dateStr.slice(0, 10);
                // } else {
                //     var date = new Date(dateStr);
                //     var y = date.getFullYear();
                //     var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
                //     var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                //     return y + '-' + m + '-' + d;
                // }
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
            
        } 


        vm.editProduct = function(productCode){
            var url = $state.href('newhope.productEdit', {productCode: productCode});
            window.open(url,'_blank');
        }
	    /*showmodal方法*/
	    vm.showProductDetail  = function(prodNo, idx){
            var modalInst = $uibModal.open({
                templateUrl: 'productDetailModal.html',
                controller: 'productDetailModal',
                size: 'lg',
                resolve: {
                    productItem: function() {
                        return rest.productItem(prodNo);
                    },
                    pScope: $scope
                }
            });
            modalInst.result.then(function (argument) {
                // body...
            }, function (res) {
                //console.log(res);
                if (res == 'success') {
                    vm.getData(vm.curPageno);
                }
            })
        }
	    /*showmodal方法end*/

        /*showmodal方法*/
        $scope.showProductAddDetail  = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'productDetailAddModal.html',
                controller: 'productDetailAddModal',
                size: 'lg',
                resolve: {
                    pScope: $scope
                }
            });
            modalInst.result.then(function (argument) {
                // body...
            }, function (res) {
                //console.log(res);
                if (res == 'success') {
                    vm.getData(vm.curPageno);
                }
            })
        }
        /*showmodal方法end*/

        $scope.presskey = function (e) {
            
            //console.log(e.keyCode);
        }
	}


    productDetailAddModal.$inject = ['$scope','$uibModalInstance', '$alert','restService'];

    function productDetailAddModal($scope, $uibModalInstance, $alert, rest) {

        var actResult; // 操作结果
        var vm = $scope;
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
        vm.cancelModal = cancelModal;
        vm.save = save;

        vm.product = {
            returnFlag:'N',
            maraEx:{preDays:1}
        };

        
        //大类 
        rest.codeMap('2000').then(function (json) {
            vm.handle.firstCateNames =  json.data;
            vm.product.firstCat = vm.handle.firstCateNames[0].itemCode;
            vm.getFirstCate(vm.handle.firstCateNames[0]);
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
            vm.product.zbotCode = vm.handle.zbotCodeNames[0].itemCode;
            vm.getRetBotFlag(vm.handle.zbotCodeNames[0]);
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
            vm.product.brand = vm.handle.brandNames[0].itemCode;
        });
        rest.codeMap('2003').then(function (json) {
            vm.handle.specNames =  json.data;
            vm.product.spec = vm.handle.specNames[0].itemCode;
        });
        rest.codeMap('2005').then(function (json) {
            vm.handle.importantPrdFlags =  json.data;
            vm.product.importantPrdFlag = vm.handle.importantPrdFlags[0].itemCode;
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
        function save(isPub) {
            /*验证输入*/
            // if(vm.product.shortTxt==undefined || vm.product.preDays==undefined){
            //  return false;
            // }

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
            

            if (isPub) {
                params.status = 'Y';
            }

            

            rest.addProductItem(params).then(function (json) {
                if(json.type == 'success') {
                    actResult = 'success';
                    var alert = $alert({
                        content: isPub ? '发布成功!' : '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            }, function (reject) {
                actResult = 'fail';
                var cancelAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
        }

    }

    productDetailModal.$inject = ['$scope','$uibModalInstance', '$alert','restService','productItem'];

	function productDetailModal($scope, $uibModalInstance, $alert, rest, productItem) {

        var actResult; // 操作结果
        var vm = $scope;
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
            dealers: []
        };
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.publish = publish;
        vm.unpublish = unpublish;

        vm.product = productItem.data;
        vm.product.createAt = vm.product.createAt==undefined?"":productItem.data.createAt.toString().substring(0,10);
        if (vm.product.maraEx.retBotFlag == 'Y') {
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
        } else if (vm.product.maraEx.retBotFlag == 'N'){
            vm.product.returnFlag = 'N';
            vm.handle.retBotFlags = [
                    {
                        code: 'N',
                        label: '否'
                    }
            ];
        }
        if (!vm.product.maraEx.preDays) {
            vm.product.maraEx.preDays = 1;
        } 

        // rest.priceDealers().then(function (json) {
            
        //     json.data.forEach(function (ele, idx) {
        //         // vm.handle.dealers[idx] = {
        //         //     dealerNo: ele.dealerNo,
        //         //     dealerName: ele.dealerName
        //         // }
        //         if (ele.dealerNo !== '-1') {
        //             vm.handle.dealers.push({
        //                 id: ele.dealerNo,
        //                 dealerNo: ele.dealerNo,
        //                 name: ele.dealerName
        //             })
        //         }
        //     })
        //     if (vm.product.notsellList) {
        //         vm.product.notsellList.forEach(function (ele, idx) {
        //             vm.handle.selectedNotsellList[idx] = {
        //                 dealerNo: ele.dealerNo,
        //                 dealerName: ele.dealerName
        //             }
        //         })
        //     }
        // })

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
	    function save(isPub) {
	    	/*验证输入*/
	    	// if(vm.product.shortTxt==undefined || vm.product.preDays==undefined){
	    	// 	return false;
	    	// }
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

            var params = {
                matnr: vm.product.matnr,
                maraEx: vm.product.maraEx,
                notsellList: notsellList
            }

            if (isPub) {
                params.status = 'Y';
            }

            rest.updateProductItem(params).then(function (json) {
                if(json.type == 'success') {
                    actResult = 'success';
                    var alert = $alert({
                        content: isPub ? '发布成功!' : '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            }, function (reject) {
                actResult = 'fail';
                var cancelAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
            })
        }

        /*发布按钮*/
		function publish() {
            rest.publishProductItem(vm.product.matnr).then(function (json) {
                if(json.type == 'success'){
                    actResult = 'success';
                    var alert = $alert({
                        content: '发布成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }else{
                    actResult = 'fail';
                    var alert = $alert({
                        content: json.msg,
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            })
        }
        // 产品下架
        function unpublish() {
            rest.uptProductStatus('N', vm.product.matnr).then(function (json) {
                if(json.type == 'success'){
                    actResult = 'success';
                    var alert = $alert({
                        content: '成功下架!',
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