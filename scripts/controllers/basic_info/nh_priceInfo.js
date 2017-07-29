(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('pricesCtrl', pricesCtrl)
	  .controller('priceDetailModal', priceDetailModal)
      .controller('stopPriceModal', stopPriceModal);

	pricesCtrl.$inject = ['$filter','$locale','$state', '$resource','$scope','$uibModal','restService'];

	function pricesCtrl($filter,$locale, $state, $resource, $scope, $uibModal, rest) {

        var pvm = this; var vm = $scope;
        pvm.tbLoding = -1;
        pvm.testcontent = []; //定义的需要数据的集合，
        pvm.pageno = 1; // 初始化页码为1
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
        var startDate='';
        var endDate='';
        var consumerStatus='';
        $scope.search = {};
        $scope.doSearch = function(){
        if($scope.search!=undefined){
            if($scope.search.fromDate!=undefined){
                 startDate = $filter("date")($scope.search.fromDate, "yyyy-MM-dd"); 
            }
            if($scope.search.untilDate!=undefined){
                 endDate =  $filter("date")($scope.search.untilDate, "yyyy-MM-dd"); 
            }
           
        }
           pvm.getData(pvm.pageno); 
        }



         $scope.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                $scope.doSearch();
            }
        }
        vm.handle = {
            statuses: [{code: '10',label: '换货'}, 
                       {code: '20',label: '缺货'},
                       {code: '30',label: '质量问题'},
                       {code: '40',label: '损毁'},
                       {code: '50',label: '拒收'}
                      ]
        };
        pvm.getData = function(pageno){ 
            pvm.tbLoding = 1;
            pvm.testcontent = [];
            pvm.total_count = 0;
            //分页请求数据，参数 为页码
            var params = {
                priceGroup:$scope.search.priceGroup,
                startDate: startDate,
                endDate: endDate,
                pageNum: pageno,
                pageSize: pvm.itemsPerPage
            }
            rest.getPriceList(params).then(function (json) {
                pvm.tbLoding = 0;
                pvm.testcontent = json.data.list;
                pvm.total_count = json.data.total;
            });
        };
        pvm.getData(pvm.pageno); 

    	$scope.addNewPriceGroup = function(){
    	 	$state.go("newhope.priceGroupAdd");
    	};
 
        $scope.statuses = 
            [{"code":"N","label":"停用"},
            {"code":"Y","label":"启用"}];
        //编辑价格组界面
        vm.editPriceDetail = function(data){
            $state.go("newhope.editPriceGroup",{priceId:data});
        };
        //停用价格组priceDisable
        
        /*stopPriceModal方法*/
        vm.stopPriceDetail = function(data){
             var modalInst = $uibModal.open({
                templateUrl: 'stopPriceModal.html',
                controller: 'stopPriceModal',
                controllerAs: 'pdm',
                resolve: {
                    priceItem: function() {
                       return rest.getpriceGroupCode(data);
                    },
                    handle: vm.handle
                }
            });
            modalInst.result.then(function() {
            }, function() {
                pvm.getData(pvm.pageno);
            })
        }
        /*stopPriceModal方法end*/

        /*priceGroupDetailModal方法*/
        vm.showPriceDetail  = function(priceNo){
            var modalInst = $uibModal.open({
                templateUrl: 'priceDetailModal.html',
                controller: 'priceDetailModal',
                controllerAs: 'pdm',
                size: 'lg',
                resolve: {
                    priceItem: function() {
                       return rest.getpriceGroupCode(priceNo);
                    },
                    handle: vm.handle
                }
            });   
        }
        /*priceGroupDetailModal方法end*/

	}

    priceDetailModal.$inject = ['$scope', '$uibModalInstance', 'priceItem', 'restService'];

    function priceDetailModal($scope, $uibModalInstance, priceItem, restService) {
        
        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.pdm = priceItem.data;
       
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 5; //每页显示条数
        vm.getData = function(pageno){ 
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            restService.getPriceProList(vm.pdm.id,pageno,vm.itemsPerPage).then(function (json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };
        vm.getData(vm.pageno); 
        //vm.status = handle.statuses[Number(vm.status)].label;
        $scope.priorities = {
            data:[
            {"code":"10","text":"公司"},
            {"code":"20","text":"区域"},
            {"code":"30","text":"奶站"}]
        };
        $scope.getPrioritiesLabel =function(code, arr) {
            var text = '',
                len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i].code == code) {
                    text =  arr[i].text;
                    break;
                }
            }
            return text;
        } 
        function cancelModal() {
            $uibModalInstance.dismiss();
        }

    }

    stopPriceModal.$inject = ['$alert', '$state', '$scope', '$uibModalInstance', 'priceItem', 'restService'];

    function stopPriceModal($alert, $state, $scope, $uibModalInstance, priceItem,restService) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.pdm = priceItem.data;
        vm.save = save;

        function save() {
            restService.priceDisable(vm.pdm.id).then(function(json){  
                if(json.type='success'){
                    var saveAlert = $alert({
                    content: '停用价格组成功！',
                    container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    cancelModal()
                }
            },function(json){
                    var saveAlert = $alert({
                    content: '停用价格组失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            })
        }
        function cancelModal() {
            $uibModalInstance.dismiss();

        }

    }

	
})();