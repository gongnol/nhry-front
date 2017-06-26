(function() {
    'use strict';
     angular
        .module('newhope')
        .controller('ReturnBoxCtrl', ReturnBoxCtrl)
        .controller('ReturnBoxModifyCtrl', ReturnBoxModifyCtrl);

    ReturnBoxCtrl.$inject = ['$scope','$state', '$alert', '$uibModal', 'restService'];
    function ReturnBoxCtrl($scope, $state, $alert, $uibModal, rest) {

        var pvm = this; 
        var vm = $scope;
        pvm.tbLoding = -1;
        pvm.testcontent = []; //定义的需要数据的集合，
        pvm.pageno = 1; // 初始化页码为1
        pvm.curPageno = 1;
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
        vm.search = {};

        rest.branchSearch().then(function(json){
              vm.branchs = json.data;   
        });

        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
            //console.log(json);
                var result = json.type;
                if(result == 'success'){
                    vm.emps = json.data;
                }
       });
        
        vm.status = [{ "code":"10","label":"未回瓶"},{ "code":"20","label":"已回瓶"}]

        pvm.getData = function(pageno){ 
            pvm.tbLoding = 1;
            pvm.testcontent = [];
            pvm.total_count = 0;
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            var params = {
                pageNum: pageno,
                pageSize: pvm.itemsPerPage,
                branchNo:vm.search.branch,
                empNo:vm.search.emp,
                status:vm.search.status,
                startDate: vm.search.startDate,
                endDate: vm.search.endDate
            }
            //alert(JSON.stringify(params));
            rest.getReturnBoxList(params).then(function (json) {
                pvm.tbLoding = 0;
                pvm.testcontent = json.data.list;
                pvm.total_count = json.data.total;
            },function(json){
                var saveAlert = $alert({
                      content: json.data.msg,
                      container: '#body-alert'
                  })
                  saveAlert.$promise.then(function () {
                      saveAlert.show();
                  })
            });

       
        };

        vm.dateFormat = function (dateStr) {
            // if(!dateStr){
            //     return '';
            // }
            
            // if ('ActiveXObject' in window) {
            //     return dateStr.slice(0, 10);
            // } else {
            //     var date = new Date(dateStr);
            //     var y = date.getFullYear();
            //     var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
            //     var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            //     return y + '-' + m + '-' + d;
            // }
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }
        pvm.getData(pvm.pageno); // Call the function to fetch initial data on page load. 

        vm.filter = function(){
            pvm.curPageno = 1;
            pvm.getData(1); 
        }

     

        vm.batchProcess = function(){
           var check =  vm.dt.checked;
            if(check.length == 0){
                 var saveAlert = $alert({
                      content: '请至少选择一个',
                      container: '#body-alert'
                  })
                  saveAlert.$promise.then(function () {
                      saveAlert.show();
                  })
            }else{
                 var saveAlert = $alert({
                      content: '成功',
                      container: '#body-alert'
                  })
                  saveAlert.$promise.then(function () {
                      saveAlert.show();
                  })
            }
        }
       
        vm.update = function(detLsh,retLsh,receiveNum,spec,specName,empName,recDate){
            var modalInst = $uibModal.open({
                templateUrl: 'uptReturnBox.html',
                controller: 'ReturnBoxModifyCtrl',
                controllerAs:'data',
                size: 'lg',
                resolve: {
                    ReturnboxItem: function () {
                       return {
                        "detLsh":detLsh,
                        "retLsh":retLsh,
                        "spec":spec,
                        "specName":specName,
                        "empName":empName,
                        "receiveNum":receiveNum,
                        "recDate":recDate
                        };
                    }
                }
            });
            modalInst.result.then(function() {
               
            }, function() {
                  pvm.getData(pvm.curPageno);
            })
        }


    }

    ReturnBoxModifyCtrl.$inject = ['$scope','$uibModalInstance', 'ReturnboxItem', 'restService', '$alert'];

    function ReturnBoxModifyCtrl($scope, $uibModalInstance, ReturnboxItem, restService,$alert) {
        var vm = $scope;
        vm.info = ReturnboxItem;
        vm.realNum = ReturnboxItem.receiveNum
        vm.cancelModal = cancelModal;
        //console.log(JSON.stringify(ReturnboxItem));

        vm.updateRet = function(){
            var params = {
                detLsh:ReturnboxItem.detLsh,
                spec:ReturnboxItem.spec,
                realNum:vm.realNum
            }
            //console.log();
              restService.uptBoxRetrun(params).then(function (json) {
                  var saveAlert = $alert({
                      content: '录入成功',
                      container: '#body-alert'
                  })
                  saveAlert.$promise.then(function () {
                      saveAlert.show();
                  })
                cancelModal();
              },function(json){
                 var saveAlert = $alert({
                      content: json.data.msg,
                      container: '#body-alert'
                  })
                  saveAlert.$promise.then(function () {
                      saveAlert.show();
                  })
              });



        }

       /* 
        ReturnboxItem.query(function(resp) {
            vm.returnboxinfo = resp[0];
        });*/

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        
    }


})();