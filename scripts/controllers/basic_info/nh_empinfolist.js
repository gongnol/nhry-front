(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('EmpinfolistCtrl', EmpinfolistCtrl)
        .controller('EmpDetailModalCtrl', EmpDetailModalCtrl)
        .controller('EmpAddModelCtrl', EmpAddModelCtrl);
    EmpinfolistCtrl.$inject = ['$scope', '$state', '$rootScope', '$alert', '$uibModal', 'restService'];

    function EmpinfolistCtrl($scope, $state, $rootScope, $alert, $uibModal, rest) {
        
        var vm = this;
        vm.tbLoding = -1;
        vm.search = {};
        vm.handle = {
            statuses: [{
                code: '0',
                label: '离职'
            }, {
                code: '1',
                label: '在职'
            }]
        };

        // 资源控件配置
        // $scope.authKits = {
        //     selectMS: $rootScope.access.hasAccOfThis('emp_branch_choice')
        // }
        // 资源控件配置end
        
        rest.getRoleList().then(function (json) {
            vm.handle.empRoles = json.data;
        })

        rest.getBranchList().then(function (json) {
            vm.handle.stations = json.data;
        })

        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };
        var params={};
        vm.getData = function(pageno){ 
            // if($state.params.branchNo!=undefined){
            //     params={
            //         branchNo:$state.params.branchNo,
            //         pageNum:pageno,
            //         pageSize:vm.itemsPerPage
            //     }
            // }else{
            //     params={
            //         pageNum:pageno,
            //         pageSize:vm.itemsPerPage
            //     }
            // }
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            vm.tbParams.pageNum = pageno;

            rest.emplist(vm.tbParams).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;

                // vm.content.forEach(function (item) {
                //     item.status = vm.handle.statuses[Number(item.status)].label;
                // })
                
                vm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        };

        vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 
        
        vm.showDetail  = function(empNo){
            var modalInst = $uibModal.open({
                templateUrl: 'empDetail.html',
                controller: 'EmpDetailModalCtrl',
                controllerAs: 'edm',
                size: 'xxls',
                resolve: {
                    empItem: function() {
                        return rest.empitem(empNo);
                    },
                    handle: vm.handle
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        vm.doSearch = function () {
            //console.log(vm.search);
            for (var item in vm.search) {
                if (vm.search.hasOwnProperty(item)) {
                    vm.tbParams[item] = vm.search[item];
                }
            }
            vm.curPageno = 1;
            vm.getData(1);
        }

        vm.getStatusLabel = function (status) {
            return vm.handle.statuses[Number(status)].label;
        }

        // vm.addEmp = function(){
        //     var modalInst = $uibModal.open({
        //         templateUrl: 'empAdd.html',
        //         controller: 'EmpAddModelCtrl',
        //         size: 'lg',
        //         resolve: {
        //             searchItem: null,
        //             update: false,
        //             editItem: function() {
        //                 return $resource(vm.app.preUrl + '/emp/add');
        //             },
        //             pScope: vm
        //         }
        //     });
        //     modalInst.result.then(function() {

        //     }, function(e) {
        //         //console.log(e);
        //         vm.dtInstance.reloadData();
        //     })
        // }


        // vm.edit = function (data){
        //     //$state.go('newhope.updateEmp');
        //     var modalInst = $uibModal.open({
        //         templateUrl: 'empAdd.html',
        //         controller: 'EmpAddModelCtrl',
        //         size: 'lg',
        //         resolve: {
        //             searchItem: function() {
        //                 return $resource(vm.app.preUrl + '/emp/:empNo', {
        //                     empNo: data
        //                 });
        //             },
        //             update: true,
        //             editItem: function() {
        //                 return $resource(vm.app.preUrl + '/emp/upt');
        //             },
        //             pScope: vm
        //         }
        //     });
        //     modalInst.result.then(function() {

        //     }, function() {
        //         vm.dtInstance.reloadData();
        //     })
        // }

    }

    EmpDetailModalCtrl.$inject = ['$alert', '$uibModalInstance', 'empItem', 'handle', 'restService'];

    function EmpDetailModalCtrl($alert, $uibModalInstance, empItem, handle, restService) {
        var vm = this;
        var emp = empItem.data.emp;
        vm.cancelModal = cancelModal;
        vm.saveSalaryMet = saveSalaryMet;

        if (emp.joinDate) {
            // emp.joinDate = emp.joinDate.slice(0, 10);
            emp.joinDate = moment(emp.joinDate).format('YYYY-MM-DD');
        }

        if (emp.status) {
            emp.status = handle.statuses[Number(emp.status)].label;
        }
        
        vm.payMethod = [
                {"code": "10","name": "按数量结算"},
                {"code": "20","name": "按产品结算"}
        ];

        angular.extend(vm, empItem.data.emp);

        function saveSalaryMet(){
            var params={
                baseSalary: vm.baseSalary,
                salaryMet: vm.salaryMet,
                sapcode: vm.sapcode,
                empNo: vm.empNo
            }
            restService.saveEmpSalarymet(params).then(function(json){
                if (json.type == 'success') {
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    }).then(function () {
                        closeModal();
                    })
                }
            }, function (reject) {
                //console.log(reject);
                var alert = $alert({
                    title: reject.status.toString() + ' ' + reject.statusText,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
            })
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }

    EmpAddModelCtrl.$inject = ['$scope', '$uibModalInstance', '$alert', 'searchItem', 'editItem', 'update', 'pScope'];

    function EmpAddModelCtrl($scope, $uibModalInstance, $alert, searchItem, editItem, update, pScope) {
        var saveAlert;
        var vm = $scope;
        vm.emp = {};
        vm.handle = {};
        vm.handle.empRoles = pScope.handle.empRoles
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
            // editItem.save({}, {
            //     "empNo": vm.emp.id,
            //     "empName": vm.emp.name,
            //     "branchNo": "002"
            // }, function(resp) {
            //     if(resp.type == "success") {
            //         //vm.succFlag = true;
            //         saveAlert = $alert({
            //             content: '保存成功',
            //             container: '#modal-alert'
            //         })
            //     }else {
            //         saveAlert = $alert({
            //             content: resp.msg,
            //             container: '#save-alert'
            //         })
            //     }
            //     saveAlert.$promise.then(function () {
            //         saveAlert.show();
            //     })
            // })

            saveAlert = $alert({
                content: '保存成功',
                container: '#modal-alert'
            })
            saveAlert.$promise.then(function () {
                saveAlert.show();
            })
        }
    }

})();