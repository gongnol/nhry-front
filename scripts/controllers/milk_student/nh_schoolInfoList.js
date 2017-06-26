/**
 * 学生奶/学校牛奶品种政策
 */
(function() {
    'use strict';
    var myApp =angular
        .module('newhope')
        .controller('schoolInfoListCtrl', schoolInfoListCtrl);
        
     myApp.factory("staicSchool",function(){
 		return {'schoolInfo': {},breedList:[]};
     });
     
    schoolInfoListCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService'];
    function schoolInfoListCtrl($rootScope, $window, $scope, $state, $resource,  $alert, $uibModal, rest) {
        $scope.search = {};
        $scope.visibles = [
        	{code:'10', label:'可用'},
        	{code:'20', label:'禁用'}
        ];
       
        var vm = this;
        vm.tbLoding = 1; // 数据表加载状态，-1初始状态，1加载中，0加载完成
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 6; //每页显示条数
        vm.getData = function(pageno){ 
        	vm.content = [];
           	vm.tbLoding = 1;
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                visiable:$scope.search.visiable,
                keyWord:$scope.search.keyWord
            };
            rest.findSchoolPage(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
       } 
       vm.getData(vm.pageno);
       
	   $scope.doSearch = function(){
        	vm.curPageno = 1;
            vm.getData(1);
        }
	  
       	$scope.chekvisiable=function(item){
        	var msg="";
        	if(item.chekbox){
        		item.visiable=20;
        		msg='禁用成功';
        	}else{
        		item.visiable=10;
        		msg='解禁成功';
        	}
        	
        	rest.uptSchool(item).then(function (json) {
            	var myalert = $alert({
	        		content:msg,
	        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
            });
        	
        }
       	
     	$scope.addClassBase = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'addClassBase.html',
                controller: 'addClassBaseCtrl',
                size: 'xxl'
            });
            modalInst.result.then(function() {
            });
        }
     
     	
        //方法:编辑学校
        $scope.editSchoolInfo = function(item){
            var modalInst = $uibModal.open({
                templateUrl: 'newSchollInfo.html',
                controller: 'NewSchollInfoCtrl',
                resolve:{
                	school:function(){
                		return item;
                	}
                },
                size: 'xxl'
            });
            modalInst.result.then(function() {
            	vm.getData(vm.pageno);
            });
        }
     	
     	//损耗设置
        $scope.wastage = function(item){
            var modalInst = $uibModal.open({
                templateUrl: 'wastage.html',
                controller: 'wastageCtrl',
                resolve:{
                	school:function(){
                		return item;
                	}
                },
                size: 'xxl'
            });
            modalInst.result.then(function() {
            	vm.getData(vm.pageno);
            });
        }
     	
    }
    
    myApp.controller('NewSchollInfoCtrl', function($scope, school,$uibModalInstance,$uibModal,restService,$alert) {
        var vm = $scope;
		vm.school=school;
		//获取当前学校所有班级
		vm.getClassBySchoolId=function(){
			var params={schoolCode:school.schoolCode,salesOrg:"",List:[]};
			restService.findAllClassBySchool(params).then(function (json){
				school.classInfoArray=json.data;
            });
		}
		
		vm.getClassBySchoolId();
         //方法:班级设置
        vm.setClass = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'setClass.html',
                controller: 'SetClassCtrl',
                resolve:{
                	school:function(){
                		return school;
                	}
                }
                
            });
            modalInst.result.then(function(){
            	
            });
        }
        
         vm.deleteClas = function (index) {
         	school.classInfoArray.splice(index,1);
        }
         
         vm.save= function() {
            var params={schoolCode:school.schoolCode,salesOrg:"",tMdClass:school.classInfoArray};
            restService.addSchoolClass(params).then(function (json){
				var myalert = $alert({
	        		content:'保存成功',
	        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
	            $uibModalInstance.dismiss();
            },
            function(json){
            	var myalert=$alert({
            		content:'保存失败：'+json.data.msg,
            		container:'#modal-alert'
            	});
            	
            	myalert.$promise.then(function(){
            		myalert.show();
            	})
            	
            	
            }
            
            );
        }
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
    });
    
    
 
    
    
    /**
     * 添加班级
     */
    myApp.controller('SetClassCtrl', function($scope, school,staicSchool,$uibModalInstance,restService ) {
		var vm = $scope;
        vm.classes =[];
        vm.checkAll=false;
        vm.selectClass=[];
        vm.getClassData=function(){
        	var params={salesOrg:""};
			restService.findClassListBySalesOrg(params).then(function (json){
			  	var data=json.data;
			  	var  leg=json.data.length;
				for (var j=0; j<leg;j++ ){
					var item=json.data[j];
					if(item){
						for (var i=0; i<school.classInfoArray.length;i++ ){
							if(school.classInfoArray[i].classCode==item.classCode){
								data[j]=undefined;
							}
						}
					}
				};
				$.each(data,function(index,item){
					if(item !=undefined){
						vm.classes.push(item)
					}
          		});
            });
        }
        vm.getClassData();
        vm.chekOne=function(check,val){
        	if(check){
        		vm.selectClass.push(val);
        	}else{
        		$.each(vm.selectClass,function(index,item){
	          		 if(item){
	          		 	if(item.classCode==val.classCode){
	           	      		school.classInfoArray.splice(index,1);
	        	     	}
	          		 }
          		});
        	}
        }
        
        vm.chekAll=function(check){
        	if(check){
        		$.each(vm.classes,function(index,item){
	          		vm.classes[index].checkbox=true;
          		});
        		vm.selectClass=vm.classes;
        	}else{
        		$.each(vm.classes,function(index,item){
	          		vm.classes[index].checkbox=false;
          		});
        		vm.selectClass=[];
        	}
        }
        
        
        vm.save = function(){
        	$.each(vm.selectClass,function(index,item){
          		 if(item){
          		 	 school.classInfoArray.push(item);
          		 }
          	});
           vm.cancelModal();
           vm.selectClass=[];
        }
        
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
        
	});
     myApp.controller('wastageCtrl', function($scope, school,$uibModalInstance,$uibModal,restService,$alert) {
     	var vm=$scope;
     	vm.school=school;
     	vm.checkAll=false;
     	vm.maraRuleList=school.maraRuleList;
     	vm.selectMaraRule=undefined;
     	
		//获取当前学校所有奶品损耗
		vm.getMaraRuleList=function(){
			var params={schoolCode:school.schoolCode,salesOrg:"",list:[]};
			restService.findMaraRuleList(params).then(function (json){
				if(null == json.data || json.data == ''){
					school.maraRuleList=[];
				}
				else{
					school.maraRuleList=json.data;
				}
            });
		}
		vm.getMaraRuleList();
		//获取当前学校所有奶品基数
		vm.getfindMaraRuleBaseByModel=function(){
			var params={schoolCode:school.schoolCode,salesOrg:"",list:[]};
			restService.findMaraRuleBaseByModel(params).then(function (json){
				if(null == json.data || json.data == ''){
					school.ruleBase={};
				}
				else{
					school.ruleBase=json.data;
				}
            });
		}
		vm.getfindMaraRuleBaseByModel();
		
       	//选择产品
        vm.breed=function(){
     		 var modalInst = $uibModal.open({
                templateUrl: 'breed.html',
                controller: 'breedCtrl',
                resolve:{
	            	school:function(){
	            		return school;
	            	}
                },
                size:"lg"
            });
            modalInst.result.then(function(){
            });
     	}
        
         vm.deleteMaraRuleList = function (index) {
         	school.maraRuleList.splice(index,1);
        }
      
         vm.changBase=function(status){
         	
         	if(status){
         		if(school.ruleBase.fixedQty>0){
					if(school.ruleBase.fixedScale>0){
						school.ruleBase.fixedScale=0;
					}
				}
         	}else{
         		if(school.ruleBase.fixedScale>0){
					if(school.ruleBase.fixedQty>0){
						school.ruleBase.fixedQty=0;
					}
				}         	
         	}
         }
         
        /* vm.hover=function(item){
         	if(item.checkbox){
         		item.checkbox=false;
         		$("#"+item.matnr).removeClass("hover");
         	}else{
				$.each(school.maraRuleList,function(index,val){
        			if(school.maraRuleList[index].checkbox){
        				school.maraRuleList[index].checkbox=false;
        				$("#"+school.maraRuleList[index].matnr).removeClass("hover");
        			}
          		});
          		item.checkbox=true;
         		$("#"+item.matnr).addClass("hover");
         		vm.selectMaraRule=item;
         	}
         }*/
        
        
         vm.save= function() {
            var params={schoolCode:school.schoolCode,salesOrg:"",schoolMaraList:school.maraRuleList,ruleBase:school.ruleBase};
            restService.maraRuleSave(params).then(function (json){
				var myalert = $alert({
	        		content:'保存成功',
	        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
	            $uibModalInstance.dismiss();
            },function(json){
            	var myalert=$alert({
            		content:'保存失败：'+json.data.msg,
            		container:'#modal-alert'
            	});
            	myalert.$promise.then(function(){
            		myalert.show();
            	});
            });
        }
         
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
     	
     });
     
     
     
    myApp.controller('breedCtrl', function($scope, school,$uibModalInstance,$uibModal,restService) {
    	
     	var vm = $scope;
        vm.maraRuleList =[];
        vm.checkAll=false;
        vm.selectMara=[];
        vm.getClassData=function(){
			restService.findMaraStudAllList().then(function (json){
			  	var data=json.data;
			  	var leg=json.data.length;
				for (var j=0; j<leg;j++ ){
					var item=json.data[j];
					if(item){
						for (var i=0; i<school.maraRuleList.length;i++ ){
							if(school.maraRuleList[i].matnr==item.matnr){
								data[j]=undefined;
							}
						}
					}
				};
				$.each(data,function(index,item){
					if(item !=undefined){
						vm.maraRuleList.push(item)
					}
          		});
            });
        }
        vm.getClassData();
        vm.chekOne=function(check,val){
        	if(check){
        		vm.selectMara.push(val);
        	}else{
        		$.each(vm.selectMara,function(index,item){
	          		 if(item){
	          		 	if(item.mara==val.mara){
	           	      		vm.selectMara.splice(index,1);
	        	     	}
	          		 }
          		});
        	}
        }
        
        vm.chekAll=function(check){
        	if(check){
        		$.each(vm.maraRuleList,function(index,item){
	          		vm.maraRuleList[index].checkbox=true;
          		});
        		vm.selectMara=vm.maraRuleList;
        	}else{
        		$.each(vm.maraRuleList,function(index,item){
	          		vm.maraRuleList[index].checkbox=false;
          		});
        		vm.selectMara=[];
        	}
        }
        
        vm.save = function(){
        	$.each(vm.selectMara,function(index,item){
          		 if(item){
          		 	 item.checkbox=false;
          		 	 school.maraRuleList.push(item);
          		 }
          	});
           vm.cancelModal();
           vm.maraRuleList=[];
        }
        
        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
     	
     });
     
     
    myApp.controller('addClassBaseCtrl', function($scope, $uibModalInstance,restService ,$alert) {
		var vm = $scope;
		//获取所有班级信息
		vm.classData=[];
		vm.getClassDate=function(){
			var salesOrg="";
			restService.findClassListBySalesOrg().then(function (json){
					vm.classData=json.data;
            });
		}
		vm.getClassDate();
		//新增班级
		 vm.toAdd = function(){
		 	var div = document.getElementById('classDiv');
		 	vm.classData.push({classCode:'', className:''});
		 	div.scrollTop = div.scrollHeight;
        }
		 
		//删除学校
		vm.delClass = function (idx) {
			//获取该code是否被订单使用如果是有不能删除
        	vm.classData.splice(idx ,1);
        }
		
		//保存
		vm.save = function (val) {
			var params={salesOrg:"",classList:vm.classData};
         	restService.addClassList(params).then(function (json){
     			var myalert = $alert({
        		content:'保存成功',
        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
				
            },function(json){
    		var myalert = $alert({
        		content:'班级保存失败：'+json.data.msg,
        		container: '#modal-alert'
	        	});
	        	myalert.$promise.then(function () {
	                myalert.show();
	            });
            });
        }
		
		 vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }
		 
		vm.validateItem=function($index,item){
			$.each(vm.classData, function(index,val) {
				if(item.classCode==val.classCode){
					if($index !=index){
						item.classCode='';
					}
				}
			});
		}
		 
      
	});
     
})();