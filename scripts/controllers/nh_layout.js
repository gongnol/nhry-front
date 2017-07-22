/**
 * @ngdoc Controller
 * @name nh_consumer_bill
 *
 * 订户结算列表控制器
 */
(function () {
    'use strict';
    angular
        .module('newhope')
        .factory('inboxStorage', InboxStorage)
        .controller('LayoutCtrl', LayoutCtrl)
        .controller('userDetailCtrl', userDetailCtrl);

    InboxStorage.$inject = ['ngStore'];

    function InboxStorage(ngStore) {
        return ngStore.model('mail');
    }

    LayoutCtrl.$inject = ['$scope', 'inboxStorage', '$state', '$http', '$resource', '$uibModal', 'restService', '$sessionStorage'];

    function LayoutCtrl($scope, inboxStorage, $state, $http, $resource, $uibModal,rest, $sessionStorage) {
        var vm = $scope;
        vm.version = {};
        /* $http({
         url:$scope.app.preUrl + '/user/currentUser' ,
         method:'POST'
         }).success(function(data,header,config,status){
         $scope.user = angular.copy(data.data);
         });*/

        $http.get('VERSION').then(function (resp) {
            var verStr = resp.data;
            var idx = verStr.indexOf('v', 1);
            vm.version.front = verStr.slice(0, idx);
            vm.version.backend = verStr.slice(idx);
        });
        //根据用户编码查询资源信息--权限列表
        // if($scope.user!=undefined){
        //   rest.findResNav($scope.user.name).then(function(json){
        //    vm.treeNav = json.data;
        //     //console.log(json.data);
        // })          
        // }
        if($sessionStorage.user!=undefined){
            rest.findResNav($sessionStorage.user.loginName).then(function(json){
                vm.treeNav = json.data;
                ////console.log(json.data);
            })          
        }
        //获取当前登录人
        rest.getCurUser().then(function(json) {
            vm.curUser = json.data;

        })
        // rest.findResNav('032411').then(function(json){
        //    vm.treeNav = json.data;
        //     //console.log(json.data);
        // }) 

        vm.userDetail = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'views/layout/nh_user_detail.html',
                controller: 'userDetailCtrl',
                size: 'lg',
                resolve: {
                    userItem: function () {
                        return $resource($scope.app.preUrl + '/user/currentUser');
                    }
                }
            });
        }


        vm.content=[];
        vm.tbParams = {
            finishFlag:"N",
            pageSize: 7,
            pageNum : 1
        };

        rest.getAllMessage(vm.tbParams).then(function (json) {

            vm.content = json.data.list;
            vm.total_count = json.data.total ? json.data.total : 0;
            ////console.log(vm.total_count);
            ////console.log(vm.content);

        });

        function populateData() {
            $http.get('scripts/api/nh_message.json').then(function (resp) {
                vm.content = resp.data.inbox;
                vm.content.forEach(function (item) {
                    inboxStorage.create(item);
                });
                vm.total_count = resp.data.inbox.total;
            });
        }

        vm.logout = function () {
            // alert(JSON.stringify($sessionStorage));
            // if ($sessionStorage.appKey) {
                var keyToBase64 = window.btoa($sessionStorage.appKey);
                rest.userLogout(keyToBase64).then(function (resp) {
                    if (resp.type == 'success') {
                        var idx = window.location.href.indexOf("#");
                        var currentUrl = window.location.href;
                        if (idx > -1) {
                            currentUrl = currentUrl.substring(0, idx);
                        }
                        currentUrl += resp.data;
                        window.location.href = currentUrl;
                    }
                })
            // }
        }

    }

    userDetailCtrl.$inject = ['$scope', '$uibModalInstance', 'userItem'];

    function userDetailCtrl($scope, $uibModalInstance, userItem) {
        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.user = {};
        vm.showFlag = false;

        userItem.get(function (resp) {
            vm.user = resp.data;
        });

        vm.showUpdate = function () {
            vm.showFlag = true;
        }
        vm.updatePass = function () {


            vm.showFlag = false;

        }


        function cancelModal() {
            $uibModalInstance.dismiss();
        }

    }

})();