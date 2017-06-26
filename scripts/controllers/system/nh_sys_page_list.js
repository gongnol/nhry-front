(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('productCtrl', productCtrl)
	  .controller('productDetailModal', productDetailModal);

	productCtrl.$inject = ['$locale','$state', '$resource','$scope','$uibModal','restService'];

	function productCtrl($locale, $state, $resource, $scope, $uibModal, rest) {

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

        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.curpageno = 1;
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };

        vm.getData = function(pageno){
            vm.curpageno = pageno;

            vm.tbParams.pageNum = pageno;

            rest.searchUserList(vm.tbParams).then(function(json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total ? json.data.total : 0;
                //console.log(vm.total_count);
                //console.log(vm.content);
            });
        };

        vm.getData(vm.pageno);
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
        } else if (vm.product.maraEx.retBotFlag == 'N'){
            vm.product.returnFlag = 'N';
        }

        rest.priceDealers().then(function (json) {
            
            json.data.forEach(function (ele, idx) {
                vm.handle.dealers[idx] = {
                    dealerNo: ele.dealerNo,
                    dealerName: ele.dealerName
                }
            })
            if (vm.product.notsellList) {
                vm.product.notsellList.forEach(function (ele, idx) {
                    vm.handle.selectedNotsellList[idx] = {
                        dealerNo: ele.dealerNo,
                        dealerName: ele.dealerName
                    }
                })
            }
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
                    notsellList.push({
                        matnr: vm.product.matnr,
                        dealerNo: ele.dealerNo
                    })
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
                    title: reject.status,
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