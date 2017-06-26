(function() {
    'use strict';
    angular
        .module('newhope')
        .factory('inboxStorage', InboxStorage)
        .directive('labelColor', LabelColor)
        .controller('AuthCtrl', AuthCtrl)
        .controller('RoleResCtrl', RoleResCtrl)
        .controller('DetailCtrl', DetailCtrl)
        .controller('NewCtrl', NewCtrl);

    InboxStorage.$inject = ['ngStore'];


    function InboxStorage(ngStore) {
        return ngStore.model('mail');
    }

    AuthCtrl.$inject = ['$scope','$state',  'inboxStorage', '$stateParams', '$http', 'restService'];
    function AuthCtrl($scope,$state, inboxStorage, $stateParams, $http,rest) {
        var vm = $scope;
        vm.kuuyee="取外层值！";
        vm.authTab = "active";
        vm.folds = [];
        vm.users = [];

        vm.colors = ['info','primary','warning','accent','success','info','danger','dark','black'];


        ////console.log(vm.colors[n]);

        vm.labels = [
            {name: '奶站内勤', filter:'奶站内勤', color:'info'},
            {name: '订户内勤', filter:'订户内勤', color:'primary'},
            {name: '管理员', filter:'管理员', color:'warning'},
            {name: '其它', filter:'其它', color:'accent'}
        ];

        vm.labelClass = labelClass;
        vm.labelBgClass = labelBgClass;
        vm.addLabel = addLabel;


        function addLabel(){
            vm.users.push(
                {
                    roleName: $scope.newLabel.name,
                    filter: angular.lowercase($scope.newLabel.name),
                    color: '#ccc'
                }
            );
            vm.newLabel.name = '';
        }

        function labelClass(label) {
            return {
                'b-l-info': angular.lowercase(label) === '订单',
                'b-l-primary': angular.lowercase(label) === '产品',
                'b-l-warning': angular.lowercase(label) === '奶站',
                'b-l-accent': angular.lowercase(label) === '其它'
            };
        }

        function labelBgClass(label) {
            return {
                'info': angular.lowercase(label) === '订单',
                'primary': angular.lowercase(label) === '产品',
                'warning': angular.lowercase(label) === '奶站',
                'accent': angular.lowercase(label) === '其它'
            };
        }

        //获取角色列表
        rest.getRoleList().then(function(json) {
            json.data.forEach(function (item) {
                var n = Math.floor(Math.random() * vm.colors.length + 1)-1;
                item.color=vm.colors[n];
            });
            vm.users = json.data;
            ////console.log(vm.users);
        });
    }

    RoleResCtrl.$inject = ['$scope', '$state','inboxStorage', '$stateParams', '$http', 'restService'];
    function RoleResCtrl($scope,$state, inboxStorage, $stateParams, $http,rest) {
        var vm = $scope;
        vm.roleId = '';
        vm.changedCheck = changedCheck;
        vm.setting = {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            }
        };
        vm.roleResList = [];

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
                "createByTxt": "测试用户"
            },
            {
                "resCode": "75d67a50d3284de7b068043b53812cce",
                "resName": "订单管理",
                "parent": "-1",
                "resType": "10",
                "createAt": "2016-07-11T08:17:19.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户",
                "resUrl": "",
                "index": 3,
                "attr1": "fa fa-dot-circle-o"
            },
            {
                "resCode": "c627374ea4ec4c159ad569dd9c9285c7",
                "resName": "系统设置子节点1",
                "parent": "0067f4d5483511e6b7df06f535a8dcbe",
                "createAt": "2016-07-13T07:02:10.000+0000",
                "createBy": "032411",
                "createByTxt": "测试用户"
            }
        ];
        vm.zt=[];

        //获取角色对应的资源树
        if($state.params.roleId){
            rest.searchResByRole($state.params.roleId).then(function(json) {
                ////console.log(json.data);
                vm.roleId = $state.params.roleId;
                vm.roleResList=json.data;
                vm.zt=$.fn.zTree.init($("#role-res-tree"), vm.setting, vm.roleResList);
                ////console.log(vm.zt.getCheckedNodes());
            });
        }

        //需要删除的权限集合
        vm.delRoleRes={
            "records": []
        };
        //需要新增的权限集合
        vm.addRoleRes={
            "records": []
        };
        function changedCheck(){
            //console.log(vm.zt.getChangeCheckedNodes());
            vm.zt.getChangeCheckedNodes().forEach(function(items) {
                if(items.checkedOld){
                    //console.log("删除资源授权 "+items.resName);
                    // 组装要删除的资源集合
                    vm.delRoleRes.records.push({
                        "id": vm.roleId,
                        "resCode": items.resCode,
                        "isDefault": "N"
                    })
                }else{
                    //console.log("新增资源授权 "+items.resName);
                    // 组装要添加的资源集合
                    vm.addRoleRes.records.push({
                        "id": vm.roleId,
                        "resCode": items.resCode,
                        "isDefault": "N"
                    })
                }
            });
            //console.log(vm.delRoleRes.records.length);
            //console.log(vm.addRoleRes.records.length);
            //批量写入角色资源关系
            if(vm.addRoleRes.records.length != 0){
                rest.batchAddRoleRes(vm.addRoleRes).then(function(json) {
                    //console.log(json);
                });
            }

            if(vm.delRoleRes.records.length != 0){
                rest.batchDelRoleRes(vm.delRoleRes).then(function(json) {
                    //console.log(json);
                });
            }
            $state.reload();
        }
    }

    DetailCtrl.$inject = ['$scope', 'inboxStorage', '$stateParams', '$state'];
    function DetailCtrl($scope, inboxStorage, $stateParams, $state) {

        var vm = $scope;
        vm.item = inboxStorage.find($stateParams);
        vm.labels = [
            {name: '订单', filter:'订单', color:'#6887ff'},
            {name: '产品', filter:'产品', color:'#0cc2aa'},
            {name: '奶站', filter:'奶站', color:'#f77a99'},
            {name: '其它', filter:'其它', color:'#a88add'}
        ];
        vm.removeItem = removeItem;
        vm.updateItem = updateItem;

        vm.updateItem(vm.item,'');

        function removeItem(item){
            inboxStorage.destroy(item);
            $state.go('newhope.inbox.list');
        }
        function updateItem(item, label){
            item.label = label;
            item.status="starred";
            //console.log(item.subject+"-->标记为已读！");
            inboxStorage.update(item);
        }
    }

    NewCtrl.$inject = ['$scope'];
    function NewCtrl($scope) {
        var vm = $scope;
        vm.inbox = {
            to: {},
            subject: '',
            content: ''
        }
        vm.people = [
            { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
            { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
            { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
            { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
            { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
            { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
            { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
            { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
            { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
            { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
        ];
    }

    function LabelColor(){
        return function(scope, $el, attrs){
            $el.css({'color': attrs.color});
        }
    };

})();
/**
 * Created by kuuyee on 2016/7/6.
 */
