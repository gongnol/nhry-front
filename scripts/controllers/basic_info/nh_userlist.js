(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('UserinfoListCtrl', UserinfoListCtrl)
        .controller('AddUserModalCtrl', AddUserModalCtrl)
        .controller('UpdateModalCtrl', UpdateModalCtrl);
    UserinfoListCtrl.$inject = ['$scope', '$state', '$rootScope', '$alert', '$uibModal', 'restService'];

    function UserinfoListCtrl($scope, $state, $rootScope, $alert, $uibModal, rest) {
       var vm = this;
        vm.tbLoding = -1;
        vm.search = {};
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.tbParams = {
            pageSize: vm.itemsPerPage
        };
        vm.handle = {
           
        };



          rest.getCurUser().then(function(json){
                vm.currentUser = json.data;
          })
            

        rest.getRoleList().then(function (json) {
            vm.handle.empRoles = json.data;
         })


        var params={};
        vm.getData = function(pageno){ 
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            vm.tbParams.pageNum = pageno;
            rest.searchUserList(vm.tbParams).then(function (json) {
                console.log(JSON.stringify(json));
                vm.tbLoding = 0;
                vm.content = json.data.list;
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

         vm.getData(vm.pageno); 


         vm.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
               vm.doSearch();
            }
        }
        //筛选
        vm.doSearch = function () {
            for (var item in vm.search) {
                if (vm.search.hasOwnProperty(item)) {
                    vm.tbParams[item] = vm.search[item];
                }
            }
            vm.curPageno = 1;
            vm.getData(1);
        }
       
        vm.addUser = function (){

           var modalInst = $uibModal.open({
                templateUrl: 'addUser.html',
                controller: 'AddUserModalCtrl',
                size: 'xxls',
                resolve: {
                    currentUser : function(){
                        return vm.currentUser;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })

        }

        vm.updatePass  = function(loginName){
            var modalInst = $uibModal.open({
                templateUrl: 'updatePassword.html',
                controller: 'UpdateModalCtrl',
                size: 'xxls',
                resolve: {
                    loginName: function() {
                        return loginName;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        } 
    }


    UpdateModalCtrl.$inject = ['$window','$scope','$alert', '$uibModalInstance', 'loginName', 'restService'];
    function UpdateModalCtrl($window,$scope,$alert, $uibModalInstance, loginName, restService) {
        var vm = $scope;
      
        vm.updatePass = function(){
            var params={
               loginName:loginName,
               password:vm.oldPassword,
               newPassword:vm.newPassword,
               confirmPassword:vm.confirmPassword
            }
            alert(JSON.stringify(params));
            restService.updatePass(params).then(function(json){
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

        vm.cancelModal = function(){
            $uibModalInstance.dismiss();
        }

       vm.closeModal =  function() {
            $uibModalInstance.close();
        }
    }

     AddUserModalCtrl.$inject = ['$window','$scope','$alert','currentUser','$uibModalInstance',  'restService'];
    function AddUserModalCtrl($window,$scope,$alert,currentUser, $uibModalInstance, restService) {
        var vm = $scope;
         vm.add = {"loginName":""};
         vm.currentUser = currentUser;
         vm.dealers = [];
         vm.branchs = [];
          vm.add.dealerNo = vm.currentUser.dealerId;
       
        restService.getDealerOnAuth().then(function(json){
             if (json.type == 'success') {
                    vm.dealers = json.data;
            }
        })
        if(vm.add.dealerNo!=null){
            restService.getBranchByDealer(vm.add.dealerNo).then(function(json){
                  vm.branchs = json.data;
             })
        
        }
        

       vm.getBranchsByDealerNo = function (data){
             restService.getBranchByDealer(data).then(function(json){
                  vm.branchs = json.data;
             })
        }

      vm.addUser = function(){
            var params={
               loginName:vm.add.loginName,
               password:vm.add.pass,
               displayName:vm.add.displayName,
               salesOrg:vm.add.salesOrg,
               mail:vm.add.mail,
               salesOrg:vm.currentUser.salesOrg,
               dealerId:vm.add.dealerNo,
               branchNo:vm.add.branchNo,
               customizedHrregion:vm.currentUser.customizedHrregion,
               mobile:vm.add.mobile
            }
            alert(JSON.stringify(params));
            restService.addSysUser(params).then(function(json){
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

        vm.cancelModal = function(){
            $uibModalInstance.dismiss();
        }

       vm.closeModal =  function() {
            $uibModalInstance.close();
        }
    }
})();