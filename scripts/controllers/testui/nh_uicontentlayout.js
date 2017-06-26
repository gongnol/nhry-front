(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ConsumerListCtrl', ConsumerListCtrl)

    ConsumerListCtrl.$inject = ['$scope', '$state', '$resource', '$uibModal','$http', 'restLocalService'];

    function ConsumerListCtrl($scope, $state, $resource, $uibModal, $http, rest) {

		var vm = this;
		vm.testcontent = []; //定义的需要数据的集合，
		vm.pageno = 1; // 初始化页码为1
		vm.total_count = 0;	//页码总数
		vm.itemsPerPage = 10; //每页显示条数
		
		vm.getData = function(pageno){ 
			//分页请求数据，参数 为页码，请求数据最终要放到service里
			vm.users = [];
			//console.log(pageno);
			// var url = "scripts/api/datatable.json";
			// if(pageno==2){
			// 	url = "scripts/api/datatable6.json";
			// }
			// //console.log(url);
			// $http.get(url).success(function(data){ 
			// 	vm.testcontent = data.aaData;  //ajax request to fetch data into vm.data
			// 	//console.log(data.aaData);
			// 	vm.total_count = 50;
			// });
			rest.pageData(pageno).then(function (data) {
				vm.testcontent = data.aaData;
				//console.log(data.aaData);
				vm.total_count = 50;
			});

		//console.log(vm.total_count);
		};
		vm.getData(vm.pageno); // Call the function to fetch initial data on page load.   


		$scope.choseArr = []; //定义数组用于存放前端显示
		var str = ""; //
		var flag = ''; //是否点击了全选，是为a
		$scope.x = false; //默认未选中

		



    }

})();