(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('productEditCtrl', productEditCtrl);

	productEditCtrl.$inject = ['$scope','$state', '$resource','$alert', '$stateParams','$uibModal','restService'];

	function productEditCtrl($scope, $state, $resource, $alert,$stateParams,$uibModal, rest) {
        var pvm = this;
        var vm = $scope;
        vm.product = {};
        vm.productCode = $stateParams.productCode;
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
      
        vm.statusMap = function (code) {
            if (code == 'Y') {
                return vm.handle.statuses[0].label;
            } else if (!code || code == 'N') {
                return vm.handle.statuses[1].label;
            } else {
                return '';
            }
        }
        
        vm.back = function(){
            $state.go('newhope.productInfo');
        }

        rest.productItem($stateParams.productCode).then(function (json) {
            vm.product = json.data;
        })


        rest.codeMap('2004').then(function (json) {
            vm.handle.zbotCodeNames =  json.data;
        });
        rest.codeMap('2000').then(function (json) {
            vm.handle.firstCateNames =  json.data;
        });
        rest.codeMap('2001').then(function (json) {
            vm.handle.secCateNames =  json.data;
        });
        rest.codeMap('2002').then(function (json) {
            vm.handle.brandNames =  json.data;
        });
        rest.codeMap('2003').then(function (json) {
            vm.handle.specNames =  json.data;
        });
        rest.codeMap('2005').then(function (json) {
            vm.handle.importantPrdFlags =  json.data;
        });

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


        vm.productForm = function(){
             rest.updateProductItem(vm.product).then(function (json) {
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



	}

})();