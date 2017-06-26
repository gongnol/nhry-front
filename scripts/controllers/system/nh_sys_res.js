(function () {
    'use strict';
    angular
        .module('newhope')
        .controller('ResCtrl', ResCtrl);


    ResCtrl.$inject = ['$scope','$state', '$location', '$filter', 'restService'];
    function ResCtrl($scope,$state, $location, $filter, rest) {
        var vm = $scope;
        vm.expandNode = expandNode;
        vm.collapseNode = collapseNode;
        vm.addTopNode = addTopNode;
        vm.editItem = editItem;
        vm.doneEditing = doneEditing;
        vm.processForm = processForm;

        vm.selectedIcon = '';
        //$scope.selectedIcons = ['Globe', 'Heart'];
        vm.icons = [
            {value: '10', label: '<i class="fa fa-indent m-r-sm"></i> 菜单'},
            {value: '20', label: '<i class="fa fa-caret-square-o-right m-r-sm"></i> 控件'},
            {value: '30', label: '<i class="fa fa-plug m-r-sm"></i> 接口'}
        ];

        vm.resInfo=[];
        function processForm() {
            ////console.log("From提交！");
            vm.resInfo.resType = vm.selectedIcon;
            rest.updateRes(vm.resInfo).then(function(json){
                ////console.log(json);
            });

        }
        //取设备单条信息
        if($state.params.resCode){
            rest.getRes($state.params.resCode).then(function(json) {
                vm.resInfo = json.data;
                if(vm.resInfo.resType){
                    vm.selectedIcon=vm.resInfo.resType;
                }
               ////console.log(vm.selectedIcon)
            });
        }


        vm.isExpand = false;
        function expandNode() {
            var zTree = $.fn.zTree.getZTreeObj("res-tree");
            ////console.log(zTree);
            vm.isExpand = true;
            zTree.expandAll(true);
        }

        function collapseNode() {
            var zTree = $.fn.zTree.getZTreeObj("res-tree");
            ////console.log(zTree);
            vm.isExpand = false;
            zTree.expandAll(false);
        }

        var newCount = 1;

        function addTopNode() {
            var zTree = $.fn.zTree.getZTreeObj("res-tree");
            //增加一级结点
            var tmpCount = (newCount++);
            var resNode = {
                resName: "一级节点" + tmpCount,
                resType: 10
            };
            rest.addRes(resNode).then(function (json) {
                ////console.log(json);
                var newNode = zTree.addNodes(null, {
                    resCode: json.data,
                    //isParent: true,
                    parent: -1,
                    resName: "一级节点" + tmpCount,
                    resType: 10
                });
                ////console.log(newNode);
            });
        }

        function editItem(item) {
            item.editing = true;
        }

        function doneEditing(item) {
            item.editing = false;
            //contactStorage.update(item);
        }
    }
})();
