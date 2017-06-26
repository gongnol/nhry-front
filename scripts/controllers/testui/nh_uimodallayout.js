(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('modallayoutctrl', empinfolistCtrl)
        .controller('EmpDetailModalCtrl', EmpDetailModalCtrl)
        .controller('EmpAddModelCtrl', EmpAddModelCtrl);
    empinfolistCtrl.$inject = ['$scope','$state', '$resource', '$uibModal', 'tableService'];

    function empinfolistCtrl($scope, $state, $resource, $uibModal, tableService) {
   
        var vm = $scope;
        vm.handle = {
            statuses: [{
                code: '001',
                label: '在职'
            }, {
                code: '002',
                label: '离职'
            }, {
                code: '003',
                label: '休假中'
            }],
            stations: [{
                code: '001',
                label: '高新'
            }, {
                code: '002',
                label: '双楠'
            }, {
                code: '003',
                label: '龙泉'
            }]
        };
        // 获取datatables实例
        vm.dtInstanceCallback = function(dtInstance) {
            vm.dtInstance = dtInstance;
        };

        var tableUrl = '/emp/search';
        vm.dtOptions = tableService.dtOps(vm, tableUrl);

        vm.dtColumns = [
            tableService.dtCol('empName', '姓名'),
            tableService.dtCol('branchNo', '所属奶站'),
            tableService.dtCol('tel', '联系电话').renderWith(nullMap),
            tableService.dtCol('level', '状态').renderWith(nullMap),
            tableService.dtCol('marketOrg', '路线数').renderWith(nullMap),
            tableService.dtCol(null, '操作').notSortable().renderWith(actionsHtml),
            tableService.dtCol('empNo').notVisible() // 查询主键
        ];

        vm.showDetail  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'empDetail.html',
                controller: 'EmpDetailModalCtrl',
                size: 'lg',
                resolve: {
                    empItem: function() {
                        return $resource(vm.app.preUrl + '/emp/:empNo', {
                            empNo: data
                        });
                    }
                }
            });
        }

        vm.addEmp = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'empAdd.html',
                controller: 'EmpAddModelCtrl',
                size: 'lg',
                resolve: {
                    searchItem: null,
                    update: false,
                    editItem: function() {
                        return $resource(vm.app.preUrl + '/emp/add');
                    },
                    pScope: vm
                }
            });
            modalInst.result.then(function() {

            }, function(e) {
                //console.log(e);
                vm.dtInstance.reloadData();
            })
        }


        vm.edit = function (data){
            //$state.go('newhope.updateEmp');
            var modalInst = $uibModal.open({
                templateUrl: 'empAdd.html',
                controller: 'EmpAddModelCtrl',
                size: 'lg',
                resolve: {
                    searchItem: function() {
                        return $resource(vm.app.preUrl + '/emp/:empNo', {
                            empNo: data
                        });
                    },
                    update: true,
                    editItem: function() {
                        return $resource(vm.app.preUrl + '/emp/upt');
                    },
                    pScope: vm
                }
            });
            modalInst.result.then(function() {

            }, function() {
                vm.dtInstance.reloadData();
            })
        }

        vm.delete = function (data) {
            // body...
        }

        vm.distributionRoute = function (emp){
            $state.go('newhope.dispatchArea');
        }

        function nullMap(data) {
            if(!data) {
                return '未知';
            }else {
                return data;
            }
        }

        function actionsHtml(data, type, full, meta) {
            return '<div class="btn-group">' +
                '<button type="button" class="btn blueLt dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">操作 <span class="caret"></span>' +
                '</button>' +
                '<ul class="dropdown-menu">' +
                '<li><a ng-click="showDetail(' + data.empNo + ')">查看</a></li>' +
                '<li><a ng-click="edit(' + data.empNo + ')">编辑</a></li>' +
                '<li><a ng-click="delete(' + data.empNo + ')">删除</a></li>' +
                '<li><a ng-click="distributionRoute()">分配路线</a></li>' +
                '</ul>' +
                '</div>';
        }
    }

    function EmpDetailModalCtrl($scope, $uibModalInstance, empItem) {
        var vm = $scope;
        vm.emp = {};
        vm.cancelModal = cancelModal;

        empItem.get(function(resp) {
            vm.emp.name = resp.data.empName;
            vm.emp.id = resp.data.empNo;
        });

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }

    function EmpAddModelCtrl($scope, $uibModalInstance, searchItem, editItem, update, pScope) {
        var vm = $scope;
        vm.emp = {};
        vm.cancelModal = cancelModal;
        vm.update = update;
        vm.save = save;

        if(searchItem) {
            searchItem.get(function(resp) {
                vm.emp.name = resp.data.empName;
                vm.emp.id = resp.data.empNo;
            })
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }


        vm.routes = [
            {"id":1,"routeName":"中国四川成都锦江三圣栀子街1号" },
            {"id":2,"routeName":"中国四川成都锦江三圣栀子街2号" },
            {"id":3,"routeName":"中国四川成都锦江三圣栀子街3号" },
            {"id":4,"routeName":"中国四川成都锦江三圣栀子街4号" },
            {"id":5,"routeName":"中国四川成都锦江三圣栀子街5号" },
            {"id":6,"routeName":"中国四川成都锦江三圣栀子街6号" },
            {"id":7,"routeName":"中国四川成都锦江三圣栀子街7号" },
            {"id":8,"routeName":"中国四川成都锦江三圣栀子街8号" }
        ]

        vm.routeds=[
            {"id":9,"routeName":"中国四川成都锦江三圣栀子街9号" }
        ]

        vm.selected1 = [];
        vm.selected2 = [];

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

        vm.updateSelection1 = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected1(action,id);
        }

        vm.updateSelection2 = function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            updateSelected2(action,id);
        }

        vm.isSelected1 = function(id){
            return $scope.selected1.indexOf(id)>=0;
        }

        vm.isSelected2 = function(id){
            return $scope.selected2.indexOf(id)>=0;
        }

        vm.addroute = function(){
            ////console.log("需要加入的个数为："+$scope.selected1.length);
            for(var i = 0 ;i< $scope.selected1.length;i++){

                var id = $scope.selected1[i];
                var idx = $scope.selected1.indexOf(id);
                ////console.log("第"+i+"个要加入的id 为"+id+"在selected1中的位置：  "+idx);
                var idy ;
                for(var j=0;j<$scope.routes.length;j++){
                    var r = $scope.routes[j];
                    if(id == r.id){
                        //console.log(id+"==="+ r.id);
                        idy = $scope.routes.indexOf(r);
                    }
                }
                // //console.log("位置在原数组中："+idy);
                var route = $scope.routes[idy];
                // //console.log("数据为"+JSON.stringify(route));
                $scope.routes.splice(idy,1);
                $scope.routeds.push(route);
                $scope.selected2.push(id);
                // //console.log("右边的数据有"+JSON.stringify($scope.routeds));
            }
            $scope.selected1=[];
        }

        vm.removeroute = function(){
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
                // //console.log("位置在数组中："+idy);
                var route = $scope.routeds[idy];
                $scope.routeds.splice(idy,1);
                $scope.routes.push(route);
                $scope.selected1.push(id);
            }
            $scope.selected2=[];
        }

        function save() {
            editItem.save({}, {
                "empNo": vm.emp.id,
                "empName": vm.emp.name,
                "branchNo": "002"
            }, function(resp) {
                if(resp.type == "success") {
                    //vm.succFlag = true;
                    vm.succMsg = "保存成功";
                }else {
                    vm.succMsg = resp.msg;
                }
            })
        }
    }

})();