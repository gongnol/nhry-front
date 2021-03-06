(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('UserinfoListCtrl', UserinfoListCtrl)
        .controller('AddUserModalCtrl', AddUserModalCtrl)
        .controller('UpdateModalCtrl', UpdateModalCtrl)
        .controller('ResetModalCtrl', ResetModalCtrl)
        .controller('EditModalCtrl', EditModalCtrl);
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



         vm.resetPass  = function(loginName){
            var modalInst = $uibModal.open({
                templateUrl: 'resetPassword.html',
                controller: 'ResetModalCtrl',
                size: 'xxls',
                resolve: {
                    loginName: function() {
                        return loginName;
                    }
                }
            });
            modalInst.result.then(function(data) {
                if(data === 'Y'){
                    var  params = {
                       loginName :loginName,
                       password : '123456'
                    }
                     rest.resetPass(params).then(function(json){
                            if (json.type == 'success') {
                                var alert = $alert({
                                    content: '重置成功!',
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
             })
         } 

        vm.editUser = function (loginName){
           var modalInst = $uibModal.open({
                templateUrl: 'editUser.html',
                controller: 'EditModalCtrl',
                size: 'xxls',
                resolve: {
                    currentUser : function(){
                        return vm.currentUser;
                    },
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





    ResetModalCtrl.$inject = ['$window','$scope','$alert','$uibModal', '$uibModalInstance',  'restService'];

    function ResetModalCtrl($window,$scope,$alert,uibModal, $uibModalInstance,rest) {
          var vm = $scope;
          vm.cancelModal = cancelModal;
          vm.closeModal = closeModel;
        vm.save = function(){
           $uibModalInstance.close('Y');
        }

        function cancelModal(){
            $uibModalInstance.dismiss('cancel');
        }

        function  closeModel() {
            $uibModalInstance.close();
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
            vm.branchs = [];
            vm.add.branchNo = undefined
           if(data!== undefined){
              restService.getBranchByDealer(data).then(function(json){
                  vm.branchs = json.data;
             })
           }
        }

      vm.addUser = function(){
            var params={
               loginName:vm.add.loginName,
               password:vm.add.pass,
               displayName:vm.add.displayName,
               salesOrg:vm.add.salesOrg,
               mail:vm.add.mail,
               salesOrg:vm.currentUser.salesOrg,
               dealerId:vm.add.dealerNo === "-1"?"":vm.add.dealerNo,
               branchNo:vm.add.branchNo,
               customizedHrregion:vm.currentUser.customizedHrregion,
               mobile:vm.add.mobile
            }
            restService.addSysUser(params).then(function(json){
                if (json.type == 'success') {
                        var alert = $alert({
                            content: '保存成功!',
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function () {
                            alert.show();
                    }).then(function () {
                        $uibModalInstance.close();
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

    EditModalCtrl.$inject = ['$window','$scope','$alert','$uibModalInstance','restService','loginName','currentUser'];
    function EditModalCtrl($window,$scope,$alert, $uibModalInstance, restService,loginName,currentUser) {
        var vm = $scope;
         vm.user = {};
         vm.currentUser = currentUser;
         vm.dealers = [];
         vm.branchs = [];
         vm.user.dealerNo = vm.currentUser.dealerId;

        restService.getUserByLoginName(loginName).then(function (json) {
            vm.user = json.data;
            vm.branchs = [
                {  
                    branchName : vm.user.branchNo,
                    branchNo : vm.user.branchName
                }
            ];
            vm.user.branchNo = vm.user.branchName;
            if(json.data.dealerId == ''  || json.data.dealerId == undefined){
                vm.user.dealerNo = '-1';
            }else{
              vm.user.dealerNo = json.data.dealerId;
            }
        });

        restService.getDealerOnAuth().then(function(json){
             if (json.type == 'success') {
                    vm.dealers = json.data;
            }
        })
      /*  if(vm.user.dealerNo!=null){
            restService.getBranchByDealer(vm.user.dealerNo).then(function(json){
                  vm.branchs = json.data;
             })
        }*/
        

       vm.getBranchsByDealerNo = function (data){
            vm.branchs = [];
            vm.user.branchNo = undefined
           if(data!== undefined){
              restService.getBranchByDealer(data).then(function(json){
                  vm.branchs = json.data;
                  vm.user.branchNo = vm.branchs[0].branchNo;
             })
           }
        }

      vm.saveUser = function(){
            var params={
               loginName:vm.user.loginName,
               displayName:vm.user.displayName,
               salesOrg:vm.user.salesOrg,
               mail:vm.user.mail,
               salesOrg:vm.currentUser.salesOrg,
               dealerId:vm.user.dealerNo === "-1"?"":vm.user.dealerNo,
               branchNo:vm.user.branchNo,
               customizedHrregion:vm.currentUser.customizedHrregion,
               mobile:vm.user.mobile
            }

            restService.editUser(params).then(function(json){
                if (json.type == 'success') {
                        var alert = $alert({
                            content: '保存成功!',
                            container: '#modal-alert'
                        })
                        alert.$promise.then(function () {
                            alert.show();
                            vm.closeModal();

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