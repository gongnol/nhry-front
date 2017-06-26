(function () {
    'use strict';
    angular
        .module('newhope')
        .controller('StatusCtrl', StatusCtrl);


    StatusCtrl.$inject = ['$scope', '$state', '$location', '$filter', 'restService'];
    function StatusCtrl($scope, $state, $location, $filter, rest) {
        var vm = $scope;
        vm.awesomeZtree = awesomeZtree;


        vm.setting = {
            data: {
                simpleData: {
                    enable: true
                }
            }
        };

        vm.zNodes = [
            {
                "resCode": "0067f4d5483511e6b7df06f535a8dcbe",
                "resName": "系统设置",
                "parent": "-1",
                "resType": "10",
                "resUrl": "",
                "index": 7,
                "attr1": "fa fa-cog"
            },
            {
                "resCode": "03df8f03483411e6b7df06f535a8dcbe",
                "resName": "订奶计划",
                "parent": "cc6218fd483311e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.demand",
                "index": 2,
                "attr1": ""
            },
            {
                "resCode": "08cc3a1d483311e6b7df06f535a8dcbe",
                "resName": "订单列表",
                "parent": "75d67a50d3284de7b068043b53812cce",
                "resType": "10",
                "resUrl": "newhope.currentOrder",
                "index": 2
            },
            {
                "resCode": "0eb10527483411e6b7df06f535a8dcbe",
                "resName": "路单管理",
                "parent": "cc6218fd483311e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.transplan",
                "index": 3,
                "attr1": ""
            },
            {
                "resCode": "19df9a18483411e6b7df06f535a8dcbe",
                "resName": "路线管理",
                "parent": "cc6218fd483311e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.transpath",
                "index": 4,
                "attr1": ""
            },
            {
                "resCode": "1f02874c483511e6b7df06f535a8dcbe",
                "resName": "权限控制",
                "parent": "0067f4d5483511e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.authorization.auth",
                "index": 1,
                "attr1": ""
            },
            {
                "resCode": "1f0c683b474c11e6b7df06f535a8dcbe",
                "resName": "员工信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "resUrl": "newhope.empinfo",
                "index": 4
            },
            {
                "resCode": "23722c62483411e6b7df06f535a8dcbe",
                "resName": "回瓶管理",
                "parent": "cc6218fd483311e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.returnbox",
                "index": 5,
                "attr1": ""
            },
            {
                "resCode": "394dd28f483411e6b7df06f535a8dcbe",
                "resName": "结算管理",
                "parent": "-1",
                "resType": "10",
                "resUrl": "",
                "index": 5,
                "attr1": "fa fa-fax"
            },
            {
                "resCode": "5b9918c8474d11e6b7df06f535a8dcbe",
                "resName": "价格组信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "resUrl": "newhope.priceInfo",
                "index": 6
            },
            {
                "resCode": "7342fbdb483611e6b7df06f535a8dcbe",
                "resName": "待确认订单",
                "parent": "75d67a50d3284de7b068043b53812cce",
                "resType": "10",
                "resUrl": "newhope.requiredOrder",
                "index": 3,
                "attr1": ""
            },
            {
                "resCode": "760652b0483411e6b7df06f535a8dcbe",
                "resName": "奶站结算",
                "parent": "394dd28f483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.milkstationBill",
                "index": 1,
                "attr1": ""
            },
            {
                "resCode": "7ef05bd3483411e6b7df06f535a8dcbe",
                "resName": "送奶工结算",
                "parent": "394dd28f483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.empBill",
                "index": 2,
                "attr1": ""
            },
            {
                "resCode": "89fa6d46483411e6b7df06f535a8dcbe",
                "resName": "订户结算",
                "parent": "394dd28f483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.consumerBill",
                "index": 3,
                "attr1": ""
            },
            {
                "resCode": "999ffdde483311e6b7df06f535a8dcbe",
                "resName": "人工分单",
                "parent": "75d67a50d3284de7b068043b53812cce",
                "resType": "10",
                "resUrl": "newhope.manHandle",
                "index": 4
            },
            {
                "resCode": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resName": "统计查询",
                "parent": "-1",
                "resType": "10",
                "resUrl": "",
                "index": 6,
                "attr1": "fa fa-bar-chart"
            },
            {
                "resCode": "a63d6616483311e6b7df06f535a8dcbe",
                "resName": "奶箱列表",
                "parent": "75d67a50d3284de7b068043b53812cce",
                "resType": "10",
                "resUrl": "newhope.milkBox",
                "index": 5
            },
            {
                "resCode": "ae4824e3474b11e6b7df06f535a8dcbe",
                "resName": "产品信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "resUrl": "newhope.productInfo",
                "index": 2
            },
            {
                "resCode": "b4efcee6483411e6b7df06f535a8dcbe",
                "resName": "奶箱统计",
                "parent": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.milkBoxStat",
                "index": 1,
                "attr1": ""
            },
            {
                "resCode": "bff4d495483411e6b7df06f535a8dcbe",
                "resName": "奶站统计",
                "parent": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "",
                "index": 2,
                "attr1": ""
            },
            {
                "resCode": "c4a6e1c7483411e6b7df06f535a8dcbe",
                "resName": "送奶工统计",
                "parent": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "",
                "index": 3,
                "attr1": ""
            },
            {
                "resCode": "c7f384f5483411e6b7df06f535a8dcbe",
                "resName": "产品统计",
                "parent": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "",
                "index": 4,
                "attr1": ""
            },
            {
                "resCode": "cb368aa6483411e6b7df06f535a8dcbe",
                "resName": "订户统计",
                "parent": "9c61e3a2483411e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "",
                "index": 5,
                "attr1": ""
            },
            {
                "resCode": "cc6218fd483311e6b7df06f535a8dcbe",
                "resName": "送奶管理",
                "parent": "-1",
                "resType": "10",
                "resUrl": "newhope.milkBox",
                "index": 4,
                "attr1": "fa fa-truck"
            },
            {
                "resCode": "eb261ace474b11e6b7df06f535a8dcbe",
                "resName": "奶站信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "resUrl": "newhope.milkstationlist",
                "index": 3
            },
            {
                "resCode": "f7686732483311e6b7df06f535a8dcbe",
                "resName": "要货计划",
                "parent": "cc6218fd483311e6b7df06f535a8dcbe",
                "resType": "10",
                "resUrl": "newhope.supply",
                "index": 1,
                "attr1": ""
            },
            {
                "resCode": "fa8e6ddb483211e6b7df06f535a8dcbe",
                "resName": "创建订单",
                "parent": "75d67a50d3284de7b068043b53812cce",
                "resType": "10",
                "resUrl": "newhope.orderCreate",
                "index": 1
            },
            {
                "resCode": "fed09601483511e6b7df06f535a8dcbe",
                "resName": "站内通知",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "resUrl": "newhope.inbox.list",
                "index": 7,
                "attr1": ""
            },
            {
                "resCode": "81a5e150a8474c0e99bf6a6a498c1436",
                "resName": "首页",
                "parent": "-1",
                "resType": "10",
                "createAt": "2016-07-07T18:28:40.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户",
                "resUrl": "www.baidu.com",
                "index": 1,
                "attr1": "fa fa-home"
            },
            {
                "resCode": "f902840013ea42bb97a0ff2b66214deb",
                "resName": "基础信息",
                "parent": "-1",
                "resType": "10",
                "createAt": "2016-07-09T16:41:17.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户",
                "index": 2,
                "attr1": "fa fa-th-large"
            },
            {
                "resCode": "d738a7da035f458eb4be9271a5886630",
                "resName": "订户信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "createAt": "2016-07-09T16:47:33.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户",
                "resUrl": "newhope.consumerlist",
                "index": 1
            },
            {
                "resCode": "cust_add",
                "resName": "新增",
                "parent": "d738a7da035f458eb4be9271a5886630",
                "resType": "20",
                "createAt": "2016-07-09T17:24:49.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "cust_filter",
                "resName": "筛选",
                "parent": "d738a7da035f458eb4be9271a5886630",
                "resType": "20",
                "createAt": "2016-07-09T17:26:53.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "cust_status_list",
                "resName": "订户状态列表",
                "parent": "d738a7da035f458eb4be9271a5886630",
                "resType": "20",
                "createAt": "2016-07-09T17:27:39.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "cust_branch_group",
                "resName": "奶站类别",
                "parent": "d738a7da035f458eb4be9271a5886630",
                "resType": "20",
                "createAt": "2016-07-09T17:28:29.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "79a6fac9b1d841df92f34841c3e679a0",
                "resName": "配送区域信息",
                "parent": "f902840013ea42bb97a0ff2b66214deb",
                "resType": "10",
                "createAt": "2016-07-10T13:32:48.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户",
                "resUrl": "newhope.dispatchArealist",
                "index": 5
            },
            {
                "resCode": "area_add",
                "resName": "新增区域",
                "parent": "79a6fac9b1d841df92f34841c3e679a0",
                "resType": "20",
                "createAt": "2016-07-10T13:37:22.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "area_rel_branch",
                "resName": "关联奶站",
                "parent": "79a6fac9b1d841df92f34841c3e679a0",
                "resType": "20",
                "createAt": "2016-07-10T13:37:54.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            },
            {
                "resCode": "area_data_search",
                "resName": "筛选",
                "parent": "79a6fac9b1d841df92f34841c3e679a0",
                "resType": "20",
                "createAt": "2016-07-10T13:38:18.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户tttyyy"
            },
            {
                "resCode": "75d67a50d3284de7b068043b53812cce",
                "resName": "订单管理",
                "parent": "-1",
                "resType": "10",
                "createAt": "2016-07-11T08:17:19.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户4569000000",
                "resUrl": "",
                "index": 3,
                "attr1": "fa fa-dot-circle-o"
            }
        ];
            $.fn.zTree.init($("#treeDemo"), vm.setting, vm.zNodes);
            function awesomeZtree() {

            }

            ////console.log("ztree");
            //awesomeZtree();
        }
    }

    )();
