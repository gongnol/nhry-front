(function() {
	'use strict';
    angular
        .module('newhope')
        .controller('pricesGroupAddCtrl', pricesGroupAddCtrl);

    pricesGroupAddCtrl.$inject = ['$alert', '$filter', '$rootScope', '$scope', '$state', 'restService'];

    function pricesGroupAddCtrl($alert, $filter, $scope, $rootScope, $state, restService) {
        var vm = $scope;
        vm.priceView={};
        vm.priceAdding = false;
        vm.options = {
            title: '',
            filterPlaceHolder: '过滤配送区域',
            orderProperty: '',
            selectedItems:[],
            nowDate: new Date()
        };

        // 如果是经销商内勤，只能选奶站
        if ($rootScope.$storage.user && $rootScope.$storage.user.dealerId && !$rootScope.$storage.user.branchNo) {
            //优先级
            $scope.priorities = {
                data:[{"code":"30","text":"奶站"}]
            };
        } else {
            //优先级
            $scope.priorities = {
                data:[
                    {"code":"10","text":"公司"},
                    {"code":"20","text":"区域"},
                    {"code":"30","text":"奶站"}
                ]
            };
        }

        //获取当前登录人所在公司下面的所有经销商
        restService.priceDealers().then(function (json) {
                vm.priceDealers = json.data;
        })
        //查询未给选中价格组分配商品列表
        restService.getProList("-1").then(function(json){
            vm.proList = json.data;
        })
        //双向选择列表
        $scope.transfer = function(from, to, index) {
                if (index >= 0) {
                    to.push(from[index]);
                    from.splice(index, 1);
                } else {
                    for (var i = 0; i < from.length; i++) {
                        to.push(from[i]);
                    }
                    from.length = 0;
                }
        };
        vm.priceForm =function(){  
            if(vm.priceView.priceGroup.length > 10){
                var alert = $alert({
                    content: '价格组名称不能大于10位字符',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }


            if(vm.options.selectedItems!=[]){
                vm.priceView.mprices = vm.options.selectedItems;
            }       
                        
            //控制器中使用
            var startDate = $filter("date")(vm.priceView.startDate, "yyyy-MM-dd"); 
            var endDate =  $filter("date")(vm.priceView.endDate, "yyyy-MM-dd"); 
            vm.priceView.startDate = startDate;
            vm.priceView.endDate = endDate;

            if (invalidVal(vm.priceView.startDate) || invalidVal(vm.priceView.endDate)) {
                var alert = $alert({
                    content: '价格组起始结束时间不能为空',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }
            
            if (vm.priceView.priceType==20 && invalidVal(vm.priceView.scope)) {
                var alert = $alert({
                    content: '适用范围不能为空',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }

            var len = vm.priceView.mprices.length;
            var priceReg = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
            for (var i = 0; i < len; i++) {
                var item = vm.priceView.mprices[i];
                if (invalidVal(item.price1) || invalidVal(item.price2)) {
                    var alert = $alert({
                        content: '关联商品的订户价或自取价不能为空！',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                    return;
                }
                if (!priceReg.test(item.price1) || !priceReg.test(item.price2)) {
                    var alert = $alert({
                        content: '关联商品的订户价或自取价不合法，请输入非0整数或小数！',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                    return;
                }
            }
            vm.priceAdding = true;
            restService.addPrice(vm.priceView).then(function (json) {
                if(json.type == 'success'){
                    $state.go('newhope.priceInfo');
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                   
                }
            }, function (reject) {
                vm.priceAdding = false;
                //console.log(reject);
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
            })
        }

        /*校验是否价格数字*/
        $scope.clearNoNum = function(obj,attr){
            if(obj[attr]==undefined){return;}
            //先把非数字的都替换掉，除了数字和.
            obj[attr] = obj[attr].replace(/[^\d.]/g,"");
            //必须保证第一个为数字而不是.
            obj[attr] = obj[attr].replace(/^\./g,"");
            //保证只有出现一个.而没有多个.
            obj[attr] = obj[attr].replace(/\.{2,}/g,"");
            //保证.只出现一次，而不能出现两次以上
            obj[attr] = obj[attr].replace(".","$#$").replace(/\./g,"").replace("$#$",".");
        }

        function invalidVal(value) {
            return value === '' || typeof(value) === 'undefined' || value === null;
        }
    }

	
})();