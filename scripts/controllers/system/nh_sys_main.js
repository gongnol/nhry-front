(function() {
    'use strict';
    angular
        .module('newhope')
        .factory('inboxStorage', InboxStorage)
        .directive('labelColor', LabelColor)
        .controller('MainCtrl', MainCtrl)
        .controller('ListCtrl', ListCtrl)
        .controller('DetailCtrl', DetailCtrl)
        .controller('NewCtrl', NewCtrl);

    InboxStorage.$inject = ['ngStore'];


    function InboxStorage(ngStore) {
        return ngStore.model('mail');
    }

    MainCtrl.$inject = ['$scope','$state',  'inboxStorage', '$stateParams', '$http', 'restService'];
    function MainCtrl($scope,$state, inboxStorage, $stateParams, $http,rest) {
        var vm = $scope;


    }

    ListCtrl.$inject = ['$scope', 'inboxStorage', '$stateParams', '$http', 'restService'];
    function ListCtrl($scope, inboxStorage, $stateParams, $http,rest) {
        //console.log("KuuYee");
        var vm = $scope;
        vm.fold = $stateParams.fold;

        vm.handle = {
            statuses: [{
                code: '0',
                label: '离职'
            }, {
                code: '1',
                label: '在职'
            }]
        };

        //vm.inboxes = inboxStorage.findAll();
        vm.inboxes = [];
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = function(pageno){

            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }

            vm.populateData = populateData;
            // populate data

            if(vm.inboxes.length == 0){
                vm.populateData();
            }
            /**
             rest.emplist(params).then(function (json) {
            vm.content = json.data.list;
            //console.log(vm.content);

            vm.content.forEach(function (item) {
              item.status = vm.handle.statuses[Number(item.status)].label;
            })

            vm.total_count = json.data.total;
          });
             */
        };

        vm.getData(vm.pageno); // Call the function to fetch initial data on page load.


        function populateData(){
            $http.get('scripts/api/nh_message.json').then(function (resp) {
                vm.content = resp.data.inbox;
                vm.content.forEach(function (item) {
                    inboxStorage.create(item);
                });
                vm.total_count = resp.data.inbox.total;
            });
        }

    }

    DetailCtrl.$inject = ['$scope', 'inboxStorage', '$stateParams', '$state'];
    function DetailCtrl($scope, inboxStorage, $stateParams, $state) {

        var vm = $scope;
        vm.item = inboxStorage.find($stateParams);
        vm.labels = [
            {name: '订单', filter:'订单', color:'#6887ff'},
            {name: '产品', filter:'产品', color:'#0cc2aa'},
            {name: '奶站', filter:'奶站', color:'#f77a99'},
            {name: '其它', filter:'其它', color:'#a88add'}
        ];
        vm.removeItem = removeItem;
        vm.updateItem = updateItem;

        vm.updateItem(vm.item,'');

        function removeItem(item){
            inboxStorage.destroy(item);
            $state.go('newhope.inbox.list');
        }
        function updateItem(item, label){
            item.label = label;
            item.status="starred";
            //console.log(item.subject+"-->标记为已读！");
            inboxStorage.update(item);
        }
    }

    NewCtrl.$inject = ['$scope'];
    function NewCtrl($scope) {
        var vm = $scope;
        vm.inbox = {
            to: {},
            subject: '',
            content: ''
        }
        vm.people = [
            { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
            { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
            { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
            { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
            { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
            { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
            { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
            { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
            { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
            { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
        ];
    }

    function LabelColor(){
        return function(scope, $el, attrs){
            $el.css({'color': attrs.color});
        }
    };

})();
/**
 * Created by kuuyee on 2016/7/6.
 */
