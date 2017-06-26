(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('Cash_account', Cash_account);

    Cash_account.$inject = ['$window','$filter','$scope', '$state', '$uibModal', 'restService'];

    function Cash_account($window,$filter,$scope, $state, $uibModal, rest) {

        var vm = this;
        vm.choseStation = false;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
        //日报表第一次访问取当天日期
        var day = new Date();
        $scope.search.fromDate = day;








        vm.getData = function(pageno) {
            var params = {
                theDate: moment($scope.search.fromDate).format('YYYY-MM-DD'),
                branchNo:$scope.search.branchNo,
                dealerId:$scope.search.dealerNo,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.Cash_account(params).then(function(json) {
                console.log(JSON.stringify(json));
                
                vm.content = json.data.list;


                vm.total_count = json.data.total;
            });
        };
        $scope.dayReportOutput = function(){
            var searchParams={
                theDate:moment($scope.search.fromDate).format('YYYY-MM-DD'),
                branchNo:$scope.search.branchNo,
                dealerId:$scope.search.dealerNo
            }
            rest.branchDayOutput(searchParams).then(function(json){
                rest.reportDeliverFile(json.data);
                //$window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');
            })
        }
        //格式化日期
        $scope.dateformat = function(day){
            $scope.date5 =moment(day).format('YYYY-MM-DD');
            $scope.date4 =moment(day).subtract(1, 'days').format('YYYY-MM-DD');
            $scope.date3 =moment(day).subtract(2, 'days').format('YYYY-MM-DD');
            $scope.date2 =moment(day).subtract(3, 'days').format('YYYY-MM-DD');
            $scope.date1 =moment(day).subtract(4, 'days').format('YYYY-MM-DD');           
        }


  //充值
        $scope.jump_xxwzx = function(){
             
             console.log(JSON.stringify(vm.content));

            var  branchNo=   vm.content[0].branchNo;
          var  salesOrg=   vm.content[0].salesOrg;

            console.log(branchNo);
            console.log(salesOrg);
          
 
            $window.open('http://54.223.238.109:80/sale/jsp/NHOL010201.action?method=prePay&cztype=1&moduleId=4028801c314ffac6013150d9303a003d&orgNum='+salesOrg+'&FNUMBER='+branchNo+'&ami=dinghu', 'C-Sharpcorner', 'fullscreen=1');          
        }

        $scope.dateformat(day);
        //查询
        $scope.filter = function(){            
            if($scope.search.fromDate!=undefined){
                $scope.dateformat($scope.search.fromDate);
            }
            vm.getData(vm.pageno);
        }
        vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 

        //获取该组织下经销商列表信息-查询条件
        rest.priceDealers().then(function(json){
            vm.dealers = json.data;
        })
        vm.typeSelected = function(data){
            if(data!=undefined){
                vm.choseStation = true;
                rest.getBranchByDealer(data.dealerNo).then(function(json){
                    vm.milkStations = json.data;
                })                
            }else {
                vm.choseStation = false;
            }


        }
    }


})();
