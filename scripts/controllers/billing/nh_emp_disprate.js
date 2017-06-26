(function() {
    'use strict';
    angular
      .module('newhope')
      .controller('DispatchRateCtrl', DispatchRateCtrl)
      .controller('UpdateModalCtrl', UpdateModalCtrl);

    DispatchRateCtrl.$inject = ['$scope', '$uibModal', '$alert', 'restService'];

    function DispatchRateCtrl($scope, $uibModal, $alert, rest) {
      var vm = $scope;

      vm.salesOrg = "";
      vm.salesOrgName = "";
      vm.salaryMet  ="";
      vm.rates  = [];

      vm.delRate = delRate;
      vm.saveDispRate = saveDispRate;
      vm.uptDispRate = uptDispRate;
      
      loadData();

      function delRate(item, idx) {
        if (idx == 0) {
          vm.rates[1].startValue = 0; 
          vm.rates.shift();
        } else if (idx == vm.rates.length - 1) {
          vm.rates[idx-1].endValue = vm.rates[idx-1].startValue + '+'; 
          vm.rates.pop();
        } else {
          vm.rates[idx-1].endValue = item.endValue;
          vm.rates.splice(idx, 1);
        }
      }

      function saveDispRate() {
        var uptParams = {
          salesOrg: vm.salesOrg,
          salaryMet: vm.salaryMet
        };
        var newRates = angular.copy(vm.rates);
        newRates[newRates.length-1].endValue = 0;
        uptParams.dispNumEntries = newRates;
        rest.uptEmpDispRate(uptParams).then(function (json) {
          if (json.type == 'success') {
            var alert = $alert({
                content: '保存成功！',
                container: '#body-alert'
            })
            alert.$promise.then(function () {
                alert.show();
            })
          }
        }, function (reject) {
          var alert = $alert({
              title: reject.status,
              content: reject.data.msg,
              container: '#body-alert'
          })
          alert.$promise.then(function () {
              alert.show();
          })
        })
      }

      function uptDispRate() {
        var modalInst = $uibModal.open({
            templateUrl: 'uptDisprate.html',
            controller: 'UpdateModalCtrl',
            size: 'lg',
            resolve: {
              salesOrg: function () {
                return vm.salesOrg;
              },
              salesOrgName: function () {
                return vm.salesOrgName;
              },
              dispRates: function () {
                return angular.copy(vm.rates);
              }
            }
        });
        modalInst.result.then(function() {
          loadData();
        })
      }

      function loadData() {
        rest.getSalesOrgDispRate().then(function(json){
           vm.salesOrg = json.data.salesOrg;
           vm.salesOrgName =  json.data.salesOrgName;
           vm.salaryMet = json.data.salaryMet;

           var arr = json.data.dispNumEntries;
           
           if (arr && arr.length > 0) {
             var last = arr[arr.length-1];
             arr[0].startValue = 0;
             last.endValue = last.startValue + '+';
             vm.rates = arr;
           }
        })
      }
    }

    UpdateModalCtrl.$inject = ['$scope', '$uibModalInstance', '$alert', 'salesOrg', 'salesOrgName', 'dispRates', 'restService'];
    
    function UpdateModalCtrl($scope, $uibModalInstance, $alert, salesOrg, salesOrgName, dispRates, restService) {
      var uptParams = {
        salesOrg: salesOrg,
        salaryMet: '10'
      };
      var len = dispRates.length;
      var vm = $scope;
      vm.salesOrgName = salesOrgName;
      vm.update = update;
      vm.cancelModal = cancelModal;

      // 配送率最多为五层
      if (len < 5) {
        for (var i = len; i < 5; i++) {
          dispRates[i] = {};
        }
      }
      // dispRates[len-1].endValue = 0;
      dispRates[0].startValue = 0;
      if (len > 0) {
        dispRates[len-1].endValue = 0;
      }
      vm.dispRates = dispRates;

      function update() {
        var alert;
        if (isEmpty(vm.dispRates[0].rate)) {
          alert = $alert({
              content: '第一条配送费率不能为空！',
              container: '#modal-alert'
          })
          alert.$promise.then(function () {
              alert.show();
          })
        } else {
          var copyRates = angular.copy(vm.dispRates);
          // 按startValue从小到大排序
          copyRates.sort(function (a, b) {
            if (isEmpty(a.startValue) || isEmpty(a.rate)) {
              return 1;
            } else if (isEmpty(b.startValue) || isEmpty(b.rate)) {
              return -1;
            } else {
              return Number(a.startValue) - Number(b.startValue);
            }
          })

          vm.dispRates = angular.copy(copyRates);
          // 删除startValue为空的元素
          for (var i = 0; i < copyRates.length; i++) {
            if (isEmpty(copyRates[i].startValue) || isEmpty(copyRates[i].rate)) {
              copyRates.splice(i)
              break;
            }
          }

          if (hasDupVal(copyRates)) {
            alert = $alert({
                content: '不能有重复数值，请修改！',
                container: '#modal-alert'
            })
            alert.$promise.then(function () {
                alert.show();
            })
          } else {
            uptParams.dispNumEntries = copyRates;
            //console.log(copyRates);

            restService.uptEmpDispRate(JSON.stringify(uptParams)).then(function (json) {
              if (json.type == 'success') {
                alert = $alert({
                    content: '保存成功！',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                }).then(function () {
                    closeModal();
                })
              }
            }, function (reject) {
              alert = $alert({
                  title: reject.status,
                  content: reject.data.msg,
                  container: '#modal-alert'
              })
              alert.$promise.then(function () {
                  alert.show();
              })
            })
          }
        }
      }

      function cancelModal() {
          $uibModalInstance.dismiss();
      }

      function closeModal() {
        $uibModalInstance.close();
      }

      function sortRates(arrs) {
        
        for (var i = 0; i < arrs.length; i++) {
          if (!arrs[i].startValue) {
            arrs.splice(i)
            break;
          }
        }
      }

      function hasDupVal(arrs) {
        var flag = false;
        for (var i = 0; i < arrs.length - 1; i++) {
          if (arrs[i].startValue == arrs[i+1].startValue) {
            flag = true;
            break;
          }
        }
        return flag;
      }

      function isEmpty(val) {
        return val === null || typeof(val) === 'undefined';
      }
    }
})();
