(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('productSetCtrl', productSetCtrl);
	productSetCtrl.$inject = ['$scope','$state', '$resource','$alert','$uibModal','restService'];
	function productSetCtrl($scope, $state, $resource, $alert, $uibModal, rest) {
        $scope.isSearch = false;
        $scope.search = {};
        $scope.statuses = [{'code':'Y','text':'隐藏'},{'code':'N','text':'显示'}];
        $scope.showOrhide =true;
        //获取当前登录人
        rest.getCurUser().then(function(json){
        	if(json.data.branchNo){
        		$scope.showOrhide=false;
        	}
        	
        });
        
        /**
         * 产品修改
         * @param {Object} prtData
         */
        $scope.dataChange=function(prtData){
    		var  falg=true;
    		var i=0;
    		if(vm.updateMaraModels.length >0){
    			for ( i ;i<vm.updateMaraModels.length;i++) {
	    			if(vm.updateMaraModels[i].matnr == prtData.matnr ){
	    				vm.updateMaraModels[i].salesOrg=prtData.salesOrg;
	    				if(prtData.sort){
	    					vm.updateMaraModels[i].sort=prtData.sort;
	    				}else{
	    					vm.updateMaraModels[i].sort=0;
	    				}
	    				if(prtData.hide){
	    					vm.updateMaraModels[i].hide=prtData.hide;
	    				}else{
	    					vm.updateMaraModels[i].hide='N';
	    				}
		    			vm.updateMaraModels[i].matnr=prtData.matnr;
	    				falg=false;
	    			}
    			}
    		}
    		if(falg){
    			var updateMaraModel={"salesOrg": "","sort": "","hide": "","matnr": ""};
    			updateMaraModel.salesOrg=prtData.salesOrg;
    			updateMaraModel.sort=prtData.sort;
    			updateMaraModel.hide=prtData.hide;
    			updateMaraModel.matnr=prtData.matnr;
    			vm.updateMaraModels.push(updateMaraModel);
    		}
        }
        
        
        $scope.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                $scope.doSearch();
            }
        }
        
        
         $scope.updateSort= function(){
         	if(vm.updateMaraModels.length >0){
         		var param=vm.updateMaraModels;
         		var params={list:param};
         		rest.updateSort(params).then(function (json) {
	            	if(json.type == 'success'){
	            		vm.updateMaraModels=[];
	            		vm.getData(vm.curPageno); 
	            		 var saveAlert = $alert({
                                content: '保存成功',
                                container: '#modal-alert'
                           });
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                            
	            	}else{
	            		var saveAlert = $alert({
                                content: '保存失败',
                                container: '#modal-alert'
                           });
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
	            	}
           		});
         	}
         }
        
        $scope.doSearch = function () {
        	
            vm.curPageno = 1;
            
            vm.getData(1);
            
        }

        var vm = this;
        vm.handle = {
            statuses: [{
                code: 'Y',
                label: '有效'
            }, {
                code: 'N',
                label: '无效'
            }]
        };

        rest.codeMap('2001').then(function (json) {
            vm.handle.secCate = json.data;
        })

        vm.tbLoding = 1; // 数据表加载状态，-1初始状态，1加载中，0加载完成
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.updateMaraModels = []; //修改的容器
        vm.getData = function(pageno){ 
           	vm.tbLoding = 1;
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                hide  : $scope.search.hide,
                matnrTxt : $scope.search.matnrTxt
            };
            rest.productset(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
       } 

       vm.getData(vm.pageno);
        vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') {
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        } 
	}
})();