(function () {
    'use strict';
    angular
        .module('newhope')
        .directive('labelColor', LabelColor)
        .controller('UserCtrl', UserCtrl)
        .controller('ListCtrl', ListCtrl)
        .controller('DetailCtrl', DetailCtrl)
        .controller('DetailSalesModelCtrl', DetailSalesModelCtrl)
        .controller('NewCtrl', NewCtrl);

    UserCtrl.$inject = ['$scope', '$state', '$stateParams', 'restService'];
    function UserCtrl($scope, $state, $stateParams, rest) {
        var vm = $scope;
        vm.roles = [];
        vm.folds = [
            {name: '全部通知', filter: ''},
            {name: '订单通知', filter: '订单'},
            {name: '产品通知', filter: '产品'},
            {name: '奶站通知', filter: '奶站'}
        ];

        vm.labels = [
            {name: '订单', filter: '订单', color: 'info'},
            {name: '产品', filter: '产品', color: 'primary'},
            {name: '奶站', filter: '奶站', color: 'warning'},
            {name: '其它', filter: '其它', color: 'accent'}
        ];

        vm.labelClass = labelClass;
        vm.labelBgClass = labelBgClass;
        vm.addLabel = addLabel;


        function addLabel() {
            var n = Math.floor(Math.random() * vm.rgbaColors.length + 1) - 1;
            vm.groups.push(
                {
                    groupName: $scope.newLabel.name,
                    filter: angular.lowercase($scope.newLabel.name),
                    color: vm.rgbaColors[n]
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

        vm.colors = ['info', 'primary', 'warning', 'accent', 'success', 'info', 'danger', 'dark', 'black'];

        vm.rgbaColors = ['#0dceb5', '#af94e0', '#ffc60a', '#7591ff', '#75cb8f', '#f886a2', '#f55060', '#2e3e4e', '#2a2b3c'];
        //获取角色列表
        rest.getRoleList().then(function (json) {
            json.data.forEach(function (item) {
                //随机分配演示
                var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                item.filter = vm.colors[n];
            });
            vm.roles = json.data;
            //手工加入获取所有用户的左侧导航
            vm.roles.splice(0, 0, {id: 'list', roleName: '全部用户'});
            vm.roles.push({id: 'norole', roleName: '无角色'});
            ////console.log(vm.users);
        });

        vm.groups = [];
        //获取角色列表并组装下拉选取
        rest.getAllGroup().then(function (json) {
            json.data.forEach(function (item) {
                //随机分配演示
                var n = Math.floor(Math.random() * vm.rgbaColors.length + 1) - 1;
                item.filter = item.groupName;
                item.color = vm.rgbaColors[n];
                ////console.log(item.color);
            });
            vm.groups = json.data;
            ////console.log(vm.groups);
        });
    }

    ListCtrl.$inject = ['$locale', '$state', '$resource', '$scope', '$stateParams', '$modal', '$uibModal', 'restService'];

    function ListCtrl($locale, $state, $resource, $scope, $stateParams, $modal, $uibModal, rest) {

        var vm = this;
        vm.role = $stateParams.role;
        $scope.modal = {title: '加用户', content: 'Hello Modal<br />This is a multiline message!'};

        vm.showAddUserButton = false;
        //判断RoleId是否为true，是则显示添加用户按钮，否则隐藏
        if (Number(vm.role)) {
            vm.showAddUserButton = true;
        } else {
            vm.showAddUserButton = false;
        }


        vm.colors = ['info', 'primary', 'warning', 'accent', 'success', 'info', 'danger', 'dark', 'black'];

        //角色下拉控件值记录
        vm.selectedIcon = [];

        //单个用户指定角色
        vm.oneSelectedRoles = '';
        //$scope.selectedIcons = ['Globe', 'Heart'];
        vm.icons = [];


        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        //vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.curpageno = 1;
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };

        vm.roles = [];
        //获取角色列表并组装下拉选取
        rest.getRoleList().then(function (json) {
            vm.roles = json.data;
            json.data.forEach(function (item) {
                vm.icons.push({
                    value: item.id,
                    ico: '<i class="fa fa-indent m-r-sm"></i>',
                    label: item.roleName
                })
            });
        });

        vm.groups = [];
        //获取角色列表并组装下拉选取
        rest.getAllGroup().then(function (json) {
            vm.groups = json.data;
            ////console.log(vm.groups);
        });


        vm.getData = function (pageno) {
            vm.curpageno = pageno;

            vm.tbParams.pageNum = pageno;
            if (vm.queryParam) {
                ////console.log(vm.queryParam);
                vm.tbParams.uname = vm.queryParam;
            }else{
                vm.tbParams.uname = undefined;
            }

            //判断是否为roleId,是就根据roleId查询用户。
            if (Number(vm.role)) {
                vm.tbParams.roleId = vm.role;

                rest.findUserByRole(vm.tbParams).then(function (json) {
                    json.data.list.forEach(function (item) {
                        var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                        item.color = vm.colors[n];
                        setRoles(item);
                    });

                    vm.content = json.data.list;
                    vm.total_count = json.data.total ? json.data.total : 0;

                    ////console.log(vm.total_count);
                    ////console.log(vm.content);
                });
            } else if (vm.role == 'norole') {//查询无角色用户
                //console.log(vm.role);
                rest.getNotRoleUser(vm.tbParams).then(function (json) {
                    json.data.list.forEach(function (item) {
                        var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                        item.color = vm.colors[n];
                        //setRoles(item);
                    });

                    vm.content = json.data.list;
                    vm.total_count = json.data.total ? json.data.total : 0;
                    ////console.log(vm.total_count);
                    ////console.log(vm.content);
                });

            } else {  //按照查询参数查询用户，否则查询所有用户
                rest.searchUserList(vm.tbParams).then(function (json) {
                    json.data.list.forEach(function (item) {
                        var n = Math.floor(Math.random() * vm.colors.length + 1) - 1;
                        item.color = vm.colors[n];
                        setRoles(item);
                    });

                    vm.content = json.data.list;
                    vm.total_count = json.data.total ? json.data.total : 0;
                    ////console.log(vm.total_count);
                    ////console.log(vm.content);
                });
            }

        };

        //获取用户列表
        vm.getData(vm.pageno);

        //为每个用户组装角色下拉选取
        function setRoles(user) {
            var tmproles = []; //给每个用户定义临时下拉选项
            vm.roles.forEach(function (item) {
                tmproles.push({
                    value: user.role,
                    ico: '<i class="fa fa-indent m-r-sm"></i>',
                    label: item.roleName
                })
            });
            user.roles = tmproles;
            //将以前选取的角色列表放到一个新的属性preRoleIdArray中，以便选取新的角色列表与其比较
            user.preRoleIdArray = user.roleIdArray;
        }

        vm.sales = [];
        vm.salesIcons = [];
          //获取全部销售组织
        rest.messageTypes("1002").then(function (json) {
            vm.sales = json.data;
            json.data.forEach(function (item) {
                vm.salesIcons.push({
                    value: item.itemCode,
                    ico: '<i class="fa fa-indent m-r-sm"></i>',
                    label: item.itemName
                })
            });
        });

        vm.detailSalesModel = function (user) {
            if(user.roleIdArray == null){
                alert("请先选择角色");
                return;
            }

            var modalInst = $uibModal.open({
                templateUrl: 'views/system/nh_sys_auth_user_sales_model.html',
                controller: 'DetailSalesModelCtrl',
                size: 'lg',
                resolve: {
                    userItem: user,
                    pScope: $scope
                }

            });
             modalInst.result.then(function(data) {
                    vm.getData(vm.curpageno);
             })
              
        }
        //为每个用户组装销售组织下拉选取
        /**
         function setSales(user) {
            var tmpsales =[]; //定义临时的下拉选项
            vm.roles.forEach(function (item) {
                tmproles.push({
                    value: user.role,
                    ico: '<i class="fa fa-indent m-r-sm"></i>',
                    label: item.roleName
                })
            });
            user.roles = tmproles;
        }
         */

        $scope.saleModal = {title: '销售组织', content: 'Hello Modal<br />This is a multiline message!'};

        vm.markAll = markAll;
        vm.markOne = markOne;
        vm.saveMutiUserAssignOneRole = saveMutiUserAssignOneRole;//保存批量给多个用户授予一个角色
        vm.reload = reload;
        vm.oneUserAuth = oneUserAuth; //执行添加角色
        vm.selectRoles = selectRoles;
        //vm.selectSales = selectSales;
        vm.searchUserNoPages = searchUserNoPages;
        vm.searchAllUser = searchAllUser;

        function searchAllUser(queryParam) {
            rest.searchUserList({all: true}).then(function (json) {
                vm.allUser = json.data;
                ////console.log(vm.allUser);
            });
        }

        vm.allUser = []; //获取全部用户，不分页
        //user.findByRoleId接口参数
        vm.queryUserNP = {
            all: true
        };
        function searchUserNoPages() {
            //按照输入参数查询用户
            if (vm.queryUserParam) {
                vm.queryUserNP.uname = vm.queryUserParam;
            }
            rest.getAllUser(vm.queryUserNP).then(function (json) {
                json.data.forEach(function (user) {
                    var included = false;
                    if (user.roleIdArray) {
                        user.roleIdArray.forEach(function (item) {
                            if (vm.role == item) {
                                included = true;
                            }
                        });
                    }

                    if (included) {
                        user.hasRoleHide = true;
                    }
                });
                vm.allUser = json.data;
                ////console.log(vm.allUser);
            });
        }

        //记录角色选取
        vm.selectedArray = [];
        //全选
        function markAll(completed) {
            ////console.log(completed);
            vm.allUser.forEach(function (user) {
                user.completed = completed;
                var node = [];
                if (completed) {
                    //node.name = user.loginName;
                    //node.roles = user.roleIdArray;
                    vm.selectedArray.push(user.loginName);
                } else {
                    vm.selectedArray.splice(vm.selectedArray.indexOf(user.loginName), 1);
                }
                //todoStorage.update(user);
            });
            ////console.log(vm.selectedArray);
            //vm.remainingCount = !completed ? todos.length : 0;
        }

        function markOne(user) {
            ////console.log(user.completed);
            if (user.completed) {
                vm.selectedArray.push(user.loginName);
            } else {
                vm.selectedArray.splice(vm.selectedArray.indexOf(user.loginName), 1);
            }
            ////console.log(vm.selectedArray);
        }

        //保存批量给多个用户授予一个角色
        function saveMutiUserAssignOneRole() {
            if (vm.selectedArray.length) {
                var addUsersParam = {loginNames: vm.selectedArray, roleId: vm.role};
                rest.assignUserRoles(addUsersParam).then(function (json) {
                    ////console.log(addUsersParam);
                    //关闭摸态框
                    $state.reload();
                });
            } else {

            }

        }

        function reload() {
            $state.reload();
        }

        // 执行单用户授权动作，后台数据保存
        function oneUserAuth(user) {
             //console.log(user.changedAddRoleArray);
             //console.log(user.changedDelRoleArray);
             //console.log(user.roleIdArray);

             var isDepartOffice = user.roleIdArray.indexOf('10003') == 0? true : false; //是否是部门内勤
             var isDealerOffice = user.roleIdArray.indexOf('10005')== 0? true : false; //是否是经销商内勤
             var isBranchOffice = user.roleIdArray.indexOf('10004')== 0? true : false; //是否是奶站内勤
            //console.log(isDepartOffice);
            //console.log(isDealerOffice);
            //console.log(isBranchOffice);

           
            //判断是否有添加变化数组
            if (user.changedAddRoleArray.length > 0) {
               /* user.changedAddRoleArray.forEach(function (role) {
                    if((isDepartOffice || isDealerOffice ||  isBranchOffice) && (role =='10003' || role =='10004' || role =='10005')){
                        alert("不能同时选择 两个内勤");
                        return;
                    }
                }*/
                var addRolesParam = {loginName: user.loginName, roleIds: user.changedAddRoleArray};
                rest.assignUserRoles(addRolesParam).then(function (json) {
                    ////console.log(addRolesParam);
                    //隐藏保存按钮
                    user.doChangeRole = false;
                    if (user.preRoleIdArray) {
                        user.preRoleIdArray = user.preRoleIdArray.concat(user.changedAddRoleArray);
                    } else {
                        user.preRoleIdArray = user.changedAddRoleArray;
                    }
                });
            }

            //判断是否有删除变化数组
            if (user.changedDelRoleArray.length > 0) {
                var delRolesParam = {loginName: user.loginName, roleIds: user.changedDelRoleArray};
                rest.deleteUserRoles(delRolesParam).then(function (json) {
                    ////console.log(addRolesParam);
                    //隐藏保存按钮
                    user.doChangeRole = false;
                    user.preRoleIdArray = _.difference(user.preRoleIdArray, user.changedDelRoleArray);
                });
            }
        }

        //角色添加变化数组，统计新添加的角色配置
        vm.changedAddRoleArray = [];
        //角色删除变化数组，统计被删除的角色配置
        vm.changedDelRoleArray = [];

        // 批量给选取的用户选择权限
        function selectRoles(user) {
            ////console.log("原始选择"+user.preRoleIdArray);
            ////console.log(angular.isArray(user.preRoleIdArray));
         
            //一层循环，遍历所有选中的角色
            user.roleIdArray.forEach(function (role) {
                ////console.log(role);
                var selected = false; //定义一个标志是否已经选过的标志
                if (user.preRoleIdArray) {
                    //二层循环，遍历当前已经选中的角色，与一层循环的角色比较
                    user.preRoleIdArray.forEach(function (preRole) {
                        ////console.log(preRole);
                        //如果相等表示一层循环的角色已经选过了，不予记录到添加变化数组中
                        if (role == preRole) {
                           
                                 ////console.log(role + "选过");
                                selected = true; //相等则把选过标志位设置为true;
                            
                           
                        } else {
                            ////console.log(user.loginName+"的"+role + "没选过");
                        }
                    });
                }

                //判断，如果标志位是false，表示没选过，那么把这个角色加入到添加变化数组中
                if (!selected) {
                    vm.changedAddRoleArray.push(role);
                }

            });


            if (user.preRoleIdArray) {
                //组装删除变化数组
                //一层循环，遍历所有之前已选中的角色
                user.preRoleIdArray.forEach(function (preRole) {
                    ////console.log(preRole);
                    var deleted = true; //定义一个标志是否被删除的标志
                    //二层循环，遍历当前新经选中的角色，与一层循环的角色比较
                    user.roleIdArray.forEach(function (role) {
                        ////console.log(role);
                        //如果相等表示一层循环的角色不能删除，不予记录到删除变化数组中
                        if (preRole == role) {
                            ////console.log(role + "存在不能删");
                            deleted = false; //相等则把选过标志位设置为true;
                        } else {
                            ////console.log(user.loginName+"的"+role + "没选过");
                        }
                    });
                    if (deleted) {
                        vm.changedDelRoleArray.push(preRole);
                    }

                });
            }

            // if (vm.changedAddRoleArray.length != 0) {
            //     user.changedAddRoleArray = vm.changedAddRoleArray;
            // }
            // if (vm.changedDelRoleArray.length != 0) {
            //     user.changedDelRoleArray = vm.changedDelRoleArray;
            // }

            ////console.log(vm.changedAddRoleArray);
            ////console.log(vm.changedDelRoleArray);

            //判断用户角色是否发生调整
            if (vm.changedAddRoleArray.length == 0 && vm.changedDelRoleArray.length == 0) {
                user.doChangeRole = false;
            } else {
                user.doChangeRole = true;
            }
            user.changedAddRoleArray = vm.changedAddRoleArray;
            user.changedDelRoleArray = vm.changedDelRoleArray;
            vm.changedAddRoleArray = [];
            vm.changedDelRoleArray = [];

        }

        var mulselects = ['10001', '10002', '10004'];
        vm.beforeSelect = function (item, user) {
            // 点击已经选择的项时不做处理
            if (user.roleIdArray && user.roleIdArray.indexOf(item.value) === -1) {
                var unions =  _.union([item.value], user.roleIdArray);
                var intersec = _.intersection(unions, mulselects);
                if (!_.isEqual(unions, intersec)) {
                    user.roleIdArray = [];
                }
            }
        }
    }


    DetailCtrl.$inject = ['$scope', '$stateParams', '$state'];
    function DetailCtrl($scope, $stateParams, $state) {

        var vm = $scope;
        //vm.item = inboxStorage.find($stateParams);
        vm.labels = [
            {name: '订单', filter: '订单', color: '#6887ff'},
            {name: '产品', filter: '产品', color: '#0cc2aa'},
            {name: '奶站', filter: '奶站', color: '#f77a99'},
            {name: '其它', filter: '其它', color: '#a88add'}
        ];
        vm.removeItem = removeItem;
        vm.updateItem = updateItem;

        vm.updateItem(vm.item, '');

        function removeItem(item) {
            inboxStorage.destroy(item);
            $state.go('newhope.inbox.list');
        }

        function updateItem(item, label) {
            item.label = label;
            item.status = "starred";
            //console.log(item.subject + "-->标记为已读！");
            //inboxStorage.update(item);
        }
    }


    DetailSalesModelCtrl.$inject = ['$scope', '$uibModalInstance', 'restService', 'userItem'];
    //用户获取销售组织并授权
    function DetailSalesModelCtrl($scope, $uibModal, rest, userItem) {

        var vm = $scope;
        //console.log(userItem);
        vm.user = userItem;
        //vm.sales = [];
        vm.salesIcons = [];
        vm.selectSales = selectSales;
        vm.selectDealer = selectDealer;
        //vm.selectBranch = selectBranch;
        vm.cancelModal = cancelModal;

        vm.saveModal = saveModal;
        //console.log(userItem);

        //判断角色是否包含部门内勤
        vm.isDepartOffice = vm.user.roleIdArray.indexOf('10003') == 0 ? true : false;
        //判断角色是否包含经销商内勤
        vm.isDealerOffice = vm.user.roleIdArray.indexOf('10005') == 0 ? true : false;
        //判断角色是否包含奶站内勤
        vm.isBranchOffice = vm.user.roleIdArray.indexOf('10004') == 0 ? true : false;
        //判断角色是否包含送奶员
        vm.isMilkMan = vm.user.roleIdArray.indexOf('10001') == 0 ? true : false;
        //判断角色是否包含奶站站长
        vm.isMilkMaster = vm.user.roleIdArray.indexOf('10002') == 0 ? true : false;
        //console.log(vm.isDepartOffice);
        //console.log(vm.isDealerOffice);
        //console.log(vm.isBranchOffice);

        vm.saleChoseStation = vm.user.salesOrg == null ? false:true;
        vm.dealerChoseStation = false;
        vm.select = {};
        vm.select.saleOrg = vm.user.salesOrg;
        vm.select.dealerId = null;
        vm.select.branchNo = null;
        //vm.user.branchNo

        //获取全部销售组织
        // rest.messageTypes("1002").then(function (json) {
        //    vm.salesIcons = json.data;
        // });
         rest.getCurUser().then(function (json) {
                if(json.data.salesOrg!=null && json.data.salesOrg !=""){
                     rest.dicItem("1002",json.data.salesOrg).then(function (json) {
                        vm.salesIcons.push(json.data);
                    });
                }else{
                    //获取全部销售组织
                    rest.messageTypes("1002").then(function (json) {
                            vm.salesIcons = json.data;
                    });
                }
        });
        if(vm.saleChoseStation){
          rest.getDealersBySales(vm.select.saleOrg).then(function (json) {
             vm.dealers = json.data;
          });  
        }
        function selectSales(salesOrg) {
            if (salesOrg) {
                vm.saleChoseStation = true;
                rest.getDealersBySales(vm.select.saleOrg).then(function (json) {
                     vm.dealers = json.data;
                });
            }else {
                vm.saleChoseStation = false;
                vm.dealerChoseStation = false;
                vm.select.saleOrg = null;
                vm.select.dealerId = null;
            }
        }
        //经销商列表
        function selectDealer(dealer) {
            if (dealer) {
                vm.dealerChoseStation = true;
                //获取经销商下的所有奶站
                rest.getBranchBySaleIdAndDealerId(vm.select.saleOrg, vm.select.dealerId).then(function (json) {
                    vm.branchs = json.data;
                });
            } else {
                vm.dealerChoseStation = false;
                vm.select.dealerId = null;
                vm.select.branchNo =null;
            }
        }


        function saveModal() {
             if(vm.isMilkMan && vm.select.branchNo == null? true : false){
                    alert("送奶员必须选择奶站");
                    return;
            }
            if(vm.isMilkMaster && vm.select.branchNo == null? true : false){
                    alert("奶站站长必须选择奶站");
                    return;
            }
            if(vm.isBranchOffice && vm.select.branchNo == null? true : false){
                    alert("奶站内勤必须选择奶站");
                    return;
            }
            if(vm.isDealerOffice && vm.select.dealerId  == null? true : false){
                    alert("经销商内勤必须选择销售经销商");
                    return;
            }
            if(vm.isDepartOffice && vm.select.saleOrg == null ? true : false){
                    alert("部门内勤必须选择销售组织");
                    return;
            }
           
          
           

              vm.user.branchNo = vm.select.branchNo;
              vm.user.dealerId = vm.select.dealerId;
              vm.user.salesOrg = vm.select.saleOrg;
            //console.log(vm.user);
            rest.updateUser(vm.user).then(function (json) {
                closeModal();
            }, function (reject) {
                alert("保存失败！");
            });

        }
        function cancelModal() {
            $uibModal.dismiss('cancel');
        }
        function closeModal() {
             $uibModal.close();
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
            {name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States'},
            {name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina'},
            {name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina'},
            {name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador'},
            {name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador'},
            {name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States'},
            {name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia'},
            {name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador'},
            {name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia'},
            {name: 'Nicolás', email: 'nicolas@email.com', age: 43, country: 'Colombia'}
        ];
    }

    function LabelColor() {
        return function (scope, $el, attrs) {
            $el.css({'color': attrs.color});
        }
    };

  
})();
