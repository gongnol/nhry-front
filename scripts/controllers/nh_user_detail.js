/**
 * @ngdoc Controller
 * @name nh_consumer_bill
 *
 * 订户结算列表控制器
 */
(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('AbstractCtrl', AbstractCtrl)
        .controller('userDetailCtrl', userDetailCtrl);

    AbstractCtrl.$inject = ['$scope', '$state', '$resource', '$uibModal'];

    function AbstractCtrl($scope, $state, $resource, $uibModal, tableService) {
         var vm = $scope;
          vm.userDetail = function() {
            var modalInst = $uibModal.open({
                templateUrl: 'views/layout/nh_user_detail.html',
                controller: 'userDetailCtrl',
                size: 'lg',
                resolve: {
                    userItem: function() {
                        return $resource('angular/api/nh_userinfo.json');
                    }
                }
            });
        }

    }

    userDetailCtrl.$inject = ['$scope', '$uibModalInstance', 'userItem'];

    function userDetailCtrl($scope, $uibModalInstance, userItem) {
        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.user = {};

        userItem.query(function(resp) {
            vm.user = resp[0];
        });
        function cancelModal() {
            $uibModalInstance.dismiss();
        }

    }
    
})();