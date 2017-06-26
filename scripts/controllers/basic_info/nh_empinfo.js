
(function() {
	'use strict';
	/**
	 *  Module
	 *
	 * Description
	 */
	angular
		.module('newhope')
		.controller('EmpinfoCtrl', ['$scope','$state', function($scope, $state){
			$scope.nhmilks = {
				orderCenter:"86-8888888",
				saleOrganization:"Doe",
				nature:"自有",
				belongDealer:"自营",
				leader:"张三",
				employNo:"2984382934",
				tel:"12345455",
				level:"A级",
				email:"123@qq.coom",
				address:"中国四川",
				house:"dv",
				relateFactory:"ac"
			};
			$scope.dispatchAreainfo = [
				{dispatchNo:"0001",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"66号",guidepost:"中鼎国际1站",hourse:"66号小区",milkStationName:"1号奶站",tel:"123",Property:"A物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街66号" },
				{dispatchNo:"0002",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"99号",guidepost:"中鼎国际2站",hourse:"99号小区",milkStationName:"2号奶站",tel:"456",Property:"B物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街99号" },
				{dispatchNo:"0003",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"108号",guidepost:"中鼎国际3站",hourse:"108号小区",milkStationName:"3号奶站",tel:"789",Property:"C物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街108号" }
			]

			$scope.add = function(){
				$state.go('newhope.dispatchArea');
			}
			$scope.dispatchAreaDetail = function(dispatchNo){
				var areainfo = null;
				for(var i =0;i< $scope.dispatchAreainfo.length;i++){
					var area = $scope.dispatchAreainfo[i];
					if(dispatchNo ==area.dispatchNo){
						areainfo =  area;
					}
				}
				$scope.Areainfo = areainfo;
			}
		}]);
})();