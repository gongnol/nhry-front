
(function() {
	'use strict';
	/**
	 *  Module
	 *
	 * Description
	 */
	angular
		.module('newhope')
		.controller('updateEmpCtrl', ['$scope','$state','$http', function($scope,$http,$state){
			$scope.emp= {
				"name":"张三",
					"gender":"woman",
					"subCompany":"川乳",
					"position":"送奶工",
					"employNo":"10001",
					"status":"在职",
					"empID":"411435199011149321",
					"webChat":"32874395",
					"milkStaton":"卓锦城订户中心2",
					"routes":[
					{"id":1,"routeName":"中国四川成都锦江三圣栀子街1号" },
					{"id":2,"routeName":"中国四川成都锦江三圣栀子街2号" },
					{"id":3,"routeName":"中国四川成都锦江三圣栀子街3号" },
					{"id":4,"routeName":"中国四川成都锦江三圣栀子街4号" },
					{"id":5,"routeName":"中国四川成都锦江三圣栀子街5号" },
					{"id":6,"routeName":"中国四川成都锦江三圣栀子街6号" },
					{"id":7,"routeName":"中国四川成都锦江三圣栀子街7号" },
					{"id":8,"routeName":"中国四川成都锦江三圣栀子街8号" }
				]
			}
			$scope.stations = [
				{"id" :1 ,name:"卓锦城订户中心1"},
				{"id" :2 ,name:"卓锦城订户中心2"},
				{"id" :3 ,name:"卓锦城订户中心3"}
			];
			$scope.dispatchAreainfo = [
				{dispatchNo:"0001",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"66号",guidepost:"中鼎国际1站",hourse:"66号小区",milkStationName:"1号奶站",tel:"123",Property:"A物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街66号" },
				{dispatchNo:"0002",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"99号",guidepost:"中鼎国际2站",hourse:"99号小区",milkStationName:"2号奶站",tel:"456",Property:"B物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街99号" },
				{dispatchNo:"0003",country:"中国",province:"四川",city:"成都",district:"锦江区",street:"三圣栀子街",streetNo:"108号",guidepost:"中鼎国际3站",hourse:"108号小区",milkStationName:"3号奶站",tel:"789",Property:"C物业",subcompany:"川乳",address:"中国四川成都锦江三圣栀子街108号" }
			]



		}]);
})();