(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('preorderTableCtrl',preorderTableCtrl)
        .controller('orderTableCtrl', orderTableCtrl)
        .controller('orgOrderTableCtrl',orgOrderTableCtrl)
        .controller('LinksTableCtrl',LinksTableCtrl)
        .controller('AreaTableCtrl', AreaTableCtrl)
        .controller('CreateUUIDsCtrl',CreateUUIDsCtrl)
        .controller('DistrictCodeCtrl',DistrictCodeCtrl)
        .controller('orgpreorderTableCtrl',orgpreorderTableCtrl)
        .controller('yearpreorderTableCtrl',yearpreorderTableCtrl);

    AreaTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
 	//上传小区主数据--导入
    function AreaTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.uploadAreas();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
		// var ts = moment.utc();
  //       uploader.headers['appCode'] = 'dhxt';
  //       if ($rootScope.$storage.appKey) {
  //           uploader.headers['appKey'] = $rootScope.$storage.appKey;
  //           uploader.headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
  //           uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
  //       }

		rest.getSysDate().then(function (resp) {
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
	    //上传成功则把状态改为true
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})

	    };
	    //上传失败给出提示信息
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
    //上传订户主数据--导入
    orderTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function orderTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.uploadVipCustInfos();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
		// var ts = moment.utc();
  //       uploader.headers['appCode'] = 'dhxt';
  //       if ($rootScope.$storage.appKey) {
  //           uploader.headers['appKey'] = $rootScope.$storage.appKey;
  //           uploader.headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
  //           uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
  //       }
  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
	        console.log(response);

			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
     //上传订单、订单行项目--导入
    preorderTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function preorderTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.importPreorder();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
		// var ts = moment.utc();
  //       uploader.headers['appCode'] = 'dhxt';
  //       if ($rootScope.$storage.appKey) {
  //           uploader.headers['appKey'] = $rootScope.$storage.appKey;
  //           uploader.headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
  //           uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
  //       }
  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
    //上传奶站、小区关联表--导入
    LinksTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function LinksTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.importLinks();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
		// var ts = moment.utc();
  //       uploader.headers['appCode'] = 'dhxt';
  //       if ($rootScope.$storage.appKey) {
  //           uploader.headers['appKey'] = $rootScope.$storage.appKey;
  //           uploader.headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
  //           uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
  //       }
  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
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
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }

    CreateUUIDsCtrl.$inject = ['$scope', '$alert','$uibModal','restService'];
    function CreateUUIDsCtrl($scope, $alert,$uibModal, rest) {
    	var vm = $scope;
    	// 批量生成UUID
        vm.createUUID =function(){
            if (!vm.uuidCount) {
                return;
            }
            rest.createUUID(vm.uuidCount).then(function(json){
                if (json.type == 'success') {
                    vm.uuids = json.data;
                }
            }, function(reject) {
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#action-alert'
                })
                alert.$promise.then(function() {
                    alert.show();
                })
            });             
        }
        //下载机构订户模版
        vm.downOrg = function(params){
        	console.log(params)
			rest.exportTemp(params);
        }
        vm.downArea = function(){
        	 var modalInst = $uibModal.open({
                templateUrl: 'districtCode.html',
                controller: 'DistrictCodeCtrl',
                size: 'lg',
                resolve: {
                    typeCode: function() {
                        return '1001';
                    }
                }
            });
        }
    }
    DistrictCodeCtrl.$inject = ['$scope', '$alert', 'restService', '$uibModalInstance', 'typeCode'];
    function DistrictCodeCtrl($scope, $alert, rest, $uibModalInstance, typeCode) {
        var vm = $scope;
        vm.typeCode = typeCode;
        vm.search = {};
        vm.cancelModal = cancelModal;

        // 初始请求所有省份
		rest.address('-1').then(function (json) {
			vm.areas = json.data;
		})
		vm.downloadAreas = function(){
			rest.exportAreasCode(vm.search.itemCode).then(function(json){
				rest.reportDeliverFile(json.data);
            })
		}
        /*rest.queryRequireDealerOrder(orderNo).then(function(json){
            vm.nhmilks = json.data.entries;
            vm.status = json.data.status;
        }, function(json){
            var saveAlert = $alert({
                content: ''+json.data.msg,
                container: '#body-alert'
            })
            saveAlert.$promise.then(function () {
                saveAlert.show();
            })
            vm.nhmilks = [];
        })*/

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }
     //上传订户主数据--导入
    orgOrderTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function orgOrderTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.importOrgVipcustInfo();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
	        console.log(response);

			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
     //上传订单、订单行项目--导入
    orgpreorderTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function orgpreorderTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.importOrgPreorder();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });
		// var ts = moment.utc();
  //       uploader.headers['appCode'] = 'dhxt';
  //       if ($rootScope.$storage.appKey) {
  //           uploader.headers['appKey'] = $rootScope.$storage.appKey;
  //           uploader.headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
  //           uploader.headers['dh-token'] = $rootScope.access.hashedToken('dhxt', uploader.headers['appKey'], ts);
  //       }
  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
      //上传订单、订单行项目--导入
    yearpreorderTableCtrl.$inject = ['$alert','$rootScope','$scope', '$state','restService', 'FileUploader','$uibModal'];
    function yearpreorderTableCtrl($alert,$rootScope,$scope, $state, rest, FileUploader,$uibModal) {

        var vm = $scope;
        var uploadAreas = rest.importYearPreorder();

	    $scope.uploadStatus = false; //定义两个上传后返回的状态，成功获失败
	    var uploader = $scope.uploader = new FileUploader({
	        url: uploadAreas,
	        queueLimit: 1,     //文件个数 
	        removeAfterUpload: true   //上传后删除文件
	    });

  		rest.getSysDate().then(function (resp) {
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
	    	console.log(fileItem._file)
	        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
	    };
	    uploader.onSuccessItem = function(fileItem, response, status, headers) {
	        $scope.uploadStatus = true;   //上传成功则把状态改为true
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    };
	    uploader.onErrorItem =function(fileItem, response, status, headers){
			var alert = $alert({
					content: response.msg,
					container: '#action-alert',
					duration:1000
				})
				alert.$promise.then(function() {
					alert.show();
				})
	    }
	    $scope.UploadFile = function(){
	        uploader.uploadAll();

	    }
    }
})();