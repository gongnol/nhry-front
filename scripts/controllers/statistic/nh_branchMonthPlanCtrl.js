(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('UploadFileCtrl', UploadFileCtrl)
        .controller('BranchMonthPlanCtrl', BranchMonthPlanCtrl);

    BranchMonthPlanCtrl.$inject = ['$window','$scope', '$state', '$uibModal', 'restService'];

    function BranchMonthPlanCtrl($window,$scope, $state, $uibModal, rest) {

        var vm = this;
/*        vm.choseStation = false;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
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
            rest.findReqOrder(params).then(function(json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };
        vm.getData(vm.pageno); */
        $scope.search = {};

        vm.getData = function() {
	        var params = {
        		taskYear:moment($scope.search.fromDate).format('YYYY')
       		 }
	        rest.findPlan(params).then(function(json){
	        	vm.content = json.data;
	        })
        }
        vm.getData();
        //获取该组织下经销商列表信息
        rest.priceDealers().then(function(json){
            vm.dealers = json.data;
        })
		vm.uploadFileDetail = function() {
				var modalInst = $uibModal.open({
					templateUrl: 'views/statistic/nh_uploadfile.html',
					controller: 'UploadFileCtrl',
					size: 'lg'
				});
				modalInst.result.then(function () {
					vm.getData();
				})
		}

        $scope.ReqOrderOutput = function(){
            var searchParams={
                theDate:moment($scope.search.fromDate).format('YYYY-MM-DD'),
                branchNo:$scope.search.branchNo,
                dealerId:$scope.search.dealerNo
            }
            rest.findReqOrderOutput(searchParams).then(function(json){
				rest.reportDeliverFile(json.data);
                //$window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');
            })
        }
        //查询
        $scope.filter = function(){  
            vm.getData();
        }
        //导出模版
        $scope.exportTem= function(){
        	var params={}
        	rest.exportTemplate(params).then(function(json){
                rest.reportDeliverFile(json.data);
                //$window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');
            })
        }
    }

    UploadFileCtrl.$inject = ['$alert', '$rootScope', '$scope', '$uibModalInstance', 'FileUploader', 'restService'];
    
	function UploadFileCtrl($alert, $rootScope, $scope, $uibModalInstance,FileUploader,restService) {

		var vm = $scope;

		vm.Areainfo = {};
		vm.cancelModal = cancelModal;
		var url = restService.uploadattachment();
	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: url,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
        rest.getSysDate().then(function(resp) {
            var ts = resp.data;
            uploader.headers['appCode'] = 'dhxt';
            if ($rootScope.$storage.appKey) {
                uploader.headers['appKey'] = $rootScope.$storage.appKey;
                uploader.headers['timestamp'] = ts;
                uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
            }
        });
	    $scope.clearItems = function(){    //重新选择文件时，清空队列，达到覆盖文件的效果
	        uploader.clearQueue();
	    }
	    uploader.onAfterAddingFile = function(fileItem) {
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
			var alert = $alert({
					content: '上传成功!',
					container: '#action-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
		function cancelModal() {
            $uibModalInstance.close();
			$uibModalInstance.dismiss('cancel');
		}
        function closeModal() {
            
            $uibModalInstance.close();
        }
	}

})();
