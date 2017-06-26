(function() {
	'use strict';
    angular
        .module('newhope')
        .controller('pricesGroupEditCtrl', pricesGroupEditCtrl);

    pricesGroupEditCtrl.$inject = ['$alert', '$filter', '$scope', '$state', 'restService'];

    function pricesGroupEditCtrl($alert, $filter, $scope, $state, restService) {
        var vm = $scope;
        vm.priceView={};
        vm.options = {
            title: '',
            filterPlaceHolder: '过滤配送区域',
            orderProperty: '',
            selectedItems:[],
            nowDate: new Date()
        }; 
       // //console.log($state.params.priceId);
       // 查询价格组基本信息
        restService.priceView($state.params.priceId).then(function (json) {
            vm.priceView = json.data;
            if(json.data.mprices!=undefined){
                vm.options.selectedItems = json.data.mprices ;
            }
        })
        //查询未给选中价格组分配商品列表
        restService.getProList($state.params.priceId).then(function(json){
            vm.proList = json.data;
        })
        //获取当前登录人所在公司下面的所有经销商
        restService.priceDealers().then(function (json) {
                vm.priceDealers = json.data;
        })
        //优先级
        $scope.priorities = {
            data:[
            {"code":"10","text":"公司"},
            {"code":"20","text":"区域"},
            {"code":"30","text":"奶站"}]
        };
        //双向选择列表
        $scope.transfer = function(branchs,from, to, index) {
            //console.log(to);
            if(branchs!=undefined){
                if (index >= 0) {
                    to.push(from[index]);
                    from.splice(index, 1);
                } else {
                    for (var i = 0; i < from.length; i++) {
                        to.push(from[i]);
                    }
                    from.length = 0;
                }
            }else{
                confirm("请选择奶站后在进行分配区域操作");
            }
        };

        vm.priceForm =function(){
           
            vm.priceView.mprices = vm.options.selectedItems;
            //console.log(vm.priceView);
           

            //控制器中使用
            // var startDate = $filter("date")(vm.priceView.startDate, "yyyy-MM-dd"); 
            var endDate =  $filter("date")(vm.priceView.endDate, "yyyy-MM-dd"); 
            // vm.priceView.startDate = startDate;
            vm.priceView.endDate = endDate;

            if (invalidVal(vm.priceView.endDate)) {
                var alert = $alert({
                    content: '价格组结束时间不能为空',
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

            restService.savePriceUpt(vm.priceView).then(function(json){
                    if(json.type='success'){
                        var alert = $alert({
                            content: '保存成功!',
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function() {
                            alert.show();
                        })
                    }
             }, function (reject) {
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

        /*返回按钮*/
        $scope.backToPriceList = function(){
            $state.go("newhope.priceInfo");
        };

        $scope.priceItem = {
            "pickupPrice" : "5.00" ,
            "deleveryPrice" : "5.00"  
        };

        
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


        /*关联添加左右*/
        $scope.routes = [
            {"id":1,"routeName":"CP2001  小牛  ￥4.00   1" },
            {"id":2,"routeName":"CP2001  小牛  ￥4.00   2" },
            {"id":3,"routeName":"CP2001  小牛  ￥4.00   3" },
            {"id":4,"routeName":"CP2001  小牛  ￥4.00   4" },
            {"id":5,"routeName":"CP2001  小牛  ￥4.00   5" },
            {"id":6,"routeName":"CP2001  小牛  ￥4.00   6" },
            {"id":7,"routeName":"CP2001  小牛  ￥4.00   7" },
            {"id":8,"routeName":"CP2001  小牛  ￥4.00   8" }
        ]

        $scope.routeds=[
            {"id":9,"routeName":"CP2001  小牛  ￥4.00   9" }
        ]

        $scope.selected1 = [];
        $scope.selected2 = [];
     
        var updateSelected1 = function(action,id){
            if(action == 'add' && $scope.selected1.indexOf(id) == -1){
                $scope.selected1.push(id);
            }
            if(action == 'remove' && $scope.selected1.indexOf(id)!=-1){
                var idx = $scope.selected1.indexOf(id);
                $scope.selected1.splice(idx,1);
            }
        }
        var updateSelected2 = function(action,id){
            if(action == 'add' && $scope.selected2.indexOf(id) == -1){
                $scope.selected2.push(id);
            }
            if(action == 'remove' && $scope.selected2.indexOf(id)!=-1){
                var idx = $scope.selected2.indexOf(id);
                $scope.selected2.splice(idx,1);
            }
        }

        $scope.updateSelection1 = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected1(action,id);
        }
        $scope.updateSelection2 = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected2(action,id);
        }

        $scope.isSelected1 = function(id){
            return $scope.selected1.indexOf(id)>=0;
        }
        $scope.isSelected2 = function(id){
            return $scope.selected2.indexOf(id)>=0;
        }

	    $scope.addroute = function(){
            //console.log("需要加入的个数为："+$scope.selected1.length);
            for(var i = 0 ;i< $scope.selected1.length;i++){

                var id = $scope.selected1[i];
                var idx = $scope.selected1.indexOf(id);
                //console.log("第"+i+"个要加入的id 为"+id+"在selected1中的位置：  "+idx);
                var idy ;
                for(var j=0;j<$scope.routes.length;j++){
                    var r = $scope.routes[j];
                    if(id == r.id){
                        //console.log(id+"==="+ r.id);
                        idy = $scope.routes.indexOf(r);
                    }
                }
                //console.log("位置在原数组中："+idy);
                var route = $scope.routes[idy];
                //console.log("数据为"+JSON.stringify(route));
                $scope.routes.splice(idy,1);
                $scope.routeds.push(route);
                $scope.selected2.push(id);
                //console.log("右边的数据有"+JSON.stringify($scope.routeds));
            }
            $scope.selected1=[];

        }

        $scope.removeroute = function(){
            for(var i = 0 ;i<$scope.selected2.length;i++){
                var id = $scope.selected2[i];
                var idx = $scope.selected2.indexOf(id);
                var idy ;
                for(var j=0;j<$scope.routeds.length;j++){
                    var r = $scope.routeds[j];
                    if(id == r.id){
                        idy = $scope.routeds.indexOf(r);
                    }
                }
                //console.log("位置在数组中："+idy);
                var route = $scope.routeds[idy];
                $scope.routeds.splice(idy,1);
                $scope.routes.push(route);
                $scope.selected1.push(id);
            }
            $scope.selected2=[];
       }

       /*end slide*/

        /*已关联量*/
        $scope.relationedCount = $scope.routeds.length;
        $scope.toRelated = function(){
            $scope.relationedCount = $scope.routeds.length;
        }
    }

})();