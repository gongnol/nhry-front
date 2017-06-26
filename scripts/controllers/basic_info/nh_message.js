(function () {
    'use strict';
    angular
        .module('newhope')
        .directive('labelColor', LabelColor)
        .controller('MainCtrl', MainCtrl)
        .controller('ListCtrl', ListCtrl)
        .controller('DetailCtrl', DetailCtrl);


    MainCtrl.$inject = ['$scope','restService'];
    function MainCtrl($scope,  rest) {
        var vm = $scope;
        vm.code=1015;
        rest.messageTypes(vm.code).then(function (json) {


            vm.content = json.data;
            vm.total_count = json.data.total ? json.data.total : 0;
            vm.content.splice(0, 0, {itemCode: '', itemName: '全部通知'});
            ////console.log(vm.total_count);
            //console.log(vm.content);
            ////console.log(vm.total_count);
        });

        vm.folds = [
            {name: '全部通知', filter: ''},
            {name: '订单通知', filter: '20'},
            {name: '产品通知', filter: '10'},
            {name: '奶站通知', filter: '30'}
        ];

        vm.labels = [
            {name: '订单', filter: '订单', color: '#6887ff'},
            {name: '产品', filter: '产品', color: '#0cc2aa'},
            {name: '奶站', filter: '奶站', color: '#f77a99'},
            {name: '其它', filter: '其它', color: '#a88add'}
        ];

        vm.labelClass = labelClass;
        vm.labelBgClass = labelBgClass;
        vm.addLabel = addLabel;

        function addLabel() {
            vm.labels.push(
                {
                    name: $scope.newLabel.name,
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
        };

        function labelBgClass(label) {
            return {
                'info': angular.lowercase(label) === '订单',
                'primary': angular.lowercase(label) === '产品',
                'warning': angular.lowercase(label) === '奶站',
                'accent': angular.lowercase(label) === '其它'
            };
        };
    }

    ListCtrl.$inject = ['$scope', '$state', '$stateParams', 'restService'];
    function ListCtrl($scope, $state, $stateParams, rest) {
        var vm = $scope;
        vm.fold = $stateParams.fold;
        vm.finishFlag=$stateParams.finishFlag;

        vm.reload = reload;
        vm.unread = unread;

        vm.colors = ['info', 'primary', 'warning', 'accent', 'success', 'info', 'danger', 'dark', 'black'];
        vm.rgbaColors = ['#0dceb5', '#af94e0', '#ffc60a', '#7591ff', '#75cb8f', '#f886a2', '#f55060', '#2e3e4e', '#2a2b3c'];


        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        //vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.curpageno = 1;
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };


        vm.getData = function (pageno) {
            vm.curpageno = pageno;

            vm.tbParams.pageNum = pageno;

            if (vm.queryParam) {
                ////console.log(vm.queryParam);
                vm.tbParams.title = vm.queryParam;
            }

            //判断是否为roleId,是就根据roleId查询用户。
            if (Number(vm.fold)) {
                ////console.log(vm.fold);
                vm.tbParams.type= vm.fold

                rest.getAllMessage(vm.tbParams).then(function (json) {
                    json.data.list.forEach(function (item) {
                        var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                        item.color = vm.colors[n];
                    });

                    vm.content = json.data.list;
                    vm.total_count = json.data.total ? json.data.total : 0;
                    ////console.log(vm.total_count);
                    ////console.log(vm.content);
                    ////console.log(vm.total_count);
                });

            } else {  //按照查询参数查询用户，否则查询所有用户
                rest.getAllMessage(vm.tbParams).then(function (json) {
                    json.data.list.forEach(function (item) {
                        var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                        item.color = vm.colors[n];
                    });

                    vm.content = json.data.list;
                    vm.total_count = json.data.total ? json.data.total : 0;
                    ////console.log(vm.total_count);
                    ////console.log(vm.content);
                    ////console.log(vm.total_count);
                });
            }

        };

        //获取用户列表
        vm.getData(vm.pageno);

        function unread(finishFlag) {
            vm.tbParams.finishFlag = finishFlag;
            vm.getData(vm.pageno);
        }

        function reload() {
            $state.reload();
        }

    }

    DetailCtrl.$inject = ['$scope', '$state', '$stateParams', 'restService'];
    function DetailCtrl($scope, $state, $stateParams, rest) {

        var vm = $scope;
        vm.item = [];
        //vm.item = inboxStorage.find($stateParams);
        vm.messageNo = $stateParams.messageNo;

        rest.getMessage(vm.messageNo).then(function (json) {
            vm.item = json.data;
            ////console.log(vm.total_count);
            if(vm.item.finishFlag == 'N'){
                rest.closeMessage(vm.messageNo).then(function (json) {
                    ////console.log(json.data);
                });
            }
        });
    }

    function LabelColor() {
        return function (scope, $el, attrs) {
            $el.css({'color': attrs.color});
        }
    };

})();
