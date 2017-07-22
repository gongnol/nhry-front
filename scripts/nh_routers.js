	/**
 * @ngdoc overview
 * @name routers
 *
 * 路由配置
 */
(function () {
    'use strict';
    angular
        .module('newhope')
        .run(runBlock)
        .config(config);
    runBlock.$inject = ['$rootScope', '$state', '$stateParams'];
      function runBlock($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }


    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$sessionStorage', 'accessService', 'restService'];
    function runBlock($rootScope, $state, $stateParams, $sessionStorage, access, rest) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$storage = $sessionStorage; // 存储当前user和权限信息
        $rootScope.access = access;
        $rootScope.curPage_Record = 0;

        // 字符串时间的格式化函数，定义在String原型上，方便调用
        String.prototype.nh_formatDate = function (hms) {
            if (this && typeof(this) === 'string') { 
                if (hms) {
                    return moment(this).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    return moment(this).format('YYYY-MM-DD');
                }
            } else {
                return '';
            }
        }

        $rootScope.back = function () {
            history.back();
        }

        $rootScope.getCurPage_Record = function () {
            var page = 1;
            // 如果记录当前页字段不为0，则返回该记录，然后清空记录数据
            if (typeof($rootScope.curPage_Record) == 'number' && $rootScope.curPage_Record !== 0) {
                page = $rootScope.curPage_Record;
                $rootScope.curPage_Record = 0;
            }
            return page;
        }

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
             // alert("toParams.appkey=="+toParams.appkey);
            if (toState.name === 'authed' && toParams.appkey) {

                $rootScope.$storage.appKey = toParams.appkey;
                rest.setDefHeader('appKey', toParams.appkey);
                rest.setDefHeader('dh-token', '-1');
                // event.preventDefault();
                // $state.go('newhope.home');
                return;
            }
           // alert("appKey=="+$rootScope.$storage.appKey);
            if ($rootScope.$storage.appKey) {
                // 若session里的appkey数据，则直接设置请求headers
                rest.setDefHeader('appKey', $rootScope.$storage.appKey);
                rest.setDefHeader('dh-token', '-1');
            }
            // 若url上有appkey参数，则更新session里的appkey和请求headers
            if (toParams.appkey) {
                $rootScope.$storage.appKey = toParams.appkey;
                rest.setDefHeader('appKey', toParams.appkey);
                rest.setDefHeader('dh-token', '-1');
            } else if ($rootScope.$storage.appKey) {
                // 若session里的appkey数据，则直接设置请求headers
                rest.setDefHeader('appKey', $rootScope.$storage.appKey);
                rest.setDefHeader('dh-token', '-1');
            }
           

            //alert(toState.name);

            // 远程中心库测试用权限管理
            if ($rootScope.$storage.pageLists && toState.name !== 'initpage' && toState.name !== 'error') {
                if ($rootScope.$storage.pageLists.indexOf(toState.name) == -1) {
                    event.preventDefault();
                    return;
                }
            } else if (toState.name === 'initpage') {
                if (rest.getDefHeaders()['dh-token']) {
                    event.preventDefault();
                    $state.go('newhope.home');
                } else {
                    rest.setDefHeader('dh-token', '-1');
                }
            } else if (toState.name === 'error') {
                $rootScope.$storage.user = undefined;
                $rootScope.$storage.pageLists = undefined;
                return;
            }
            // else if (!$rootScope.$storage.pageLists) {
            //     event.preventDefault();
            //     $rootScope.$storage.user = undefined;
            //     $state.go('initpage');
            //     return;
            // }

            // 本地测试用权限管理
            // if ($rootScope.$storage.pageLists && toState.name !== 'login') {
            //     if ($rootScope.$storage.pageLists.indexOf(toState.name) == -1) {
            //         event.preventDefault();
            //         return;
            //     }
            // } else if (toState.name === 'login') {
            //     //console.log('login');
            // } else if (!$rootScope.$storage.pageLists) {
            //     $state.go('login');
            //     event.preventDefault();
            //     return;
            // }

            if (toParams.reset_pageRecord) {
                $rootScope.curPage_Record = 0;
            }

            // if (toState.name === 'initpage') {
            //     if (rest.getDefHeaders()['dh-token']) {
            //         $state.go('newhope.home');
            //         event.preventDefault();
            //         return; 
            //     } else {
            //         rest.setDefHeader('dh-token', '-1');
            //     }
            // }

            rest.getCurUser().then(function (json) {
                //alert("-=-----"+toParams.appkey);
                if (toParams.appkey || !$rootScope.$storage.user || $rootScope.$storage.user.loginName !== json.data.loginName) {
                    $rootScope.$storage.user = json.data;
                    rest.getRoleRescpt().then(function (json) {
                        $rootScope.$storage.accLists = json.data;
                        $rootScope.access.setAccLists(json.data);
                    }, function (reject) {
                        event.preventDefault();
                        $state.go('error');
                    })
                    rest.getRoleRespage().then(function (json) {
                        var urls = json.data.map(function (ele) {
                            return ele.resUrl;
                        })
                        $rootScope.$storage.pageLists = urls.filter(function (ele) {
                            return ele ? true : false;
                        })
                    }, function (reject) {
                        event.preventDefault();
                        $state.go('error');
                    })
                } else if ($rootScope.access.getAccLists().length == 0) {
                    $rootScope.access.setAccLists($rootScope.$storage.accLists);
                }
            }, function (reject) {
                event.preventDefault(); 
            });
        })

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, options) {
            $rootScope.nhPreState = fromState.name;
            $rootScope.nhPreStateParams = fromParams;
        })
    }


    config.$inject = ['$stateProvider', '$urlRouterProvider', 'MODULE_CONFIG', '$provide'];

    function config($stateProvider, $urlRouterProvider, MODULE_CONFIG, $provide) {
        $provide.decorator('$location', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
            var skipping = false;

            $rootScope.$on('$locationChangeSuccess', function(event) {
                if (skipping) {
                  event.preventDefault();
                  skipping = false;
                }
            });

            $delegate.skipReload = function() {
                skipping = true;
                return this;
            };

            return $delegate;
        }]);
        //$urlRouterProvider.otherwise('/init');
         $urlRouterProvider.otherwise('/login');
        $stateProvider
            // .state('login', {	// 登录页面
            //     url: '/login',
            //     params: {
            //         logout: false
            //     },
            //     templateUrl: 'views/page/nh_login.html',
            //     controller: 'LoginCtrl',
            //     resolve: load(['scripts/controllers/nh_login.js', 'scripts/services/nh_loginService.js'])
            // })

             .state('login', {  // 登录页面
                url: '/login',
                params: {
                    logout: false
                },
                templateUrl: 'views/page/nh_login.html',
                controller: 'LoginCtrl',
                resolve: load(['scripts/controllers/nh_login.js', 
                    'scripts/services/nh_loginService.js',
                     'assets/styles/style.css'
                    ])
            })
            .state('initpage', {   // 登录页面
                url: '/init'
            })
            .state('authed', {   // 验证通过页面
                url: '/authed?appkey',
                controller: 'AuthedCtrl',
                resolve: load(['scripts/controllers/nh_authed.js'])
            })
            .state('error', {   // 错误页面
                url: '/error/:errType?appkey',
                templateUrl: 'views/page/nh_error.html',
                controller: 'ErrorCtrl',
                resolve: load(['scripts/controllers/nh_error.js'])
            })
            .state('newhope', {
                abstract: true,
                url: '/bzd',
                views: {
                    '': {
                        templateUrl: 'views/layout/nh_layout.html',
                        controller: 'LayoutCtrl',
                        resolve: load(['ui.bootstrap', 'ui.select',
                            'scripts/nh_config.js',
                            'scripts/controllers/nh_layout.js'])
                    }
                }
            })
            .state('newhope.home', {	// 首页
                url: '/home',
                data: {title: '首页', icons: 'fa-home'},
                templateUrl: 'views/home/nh_home.html',
                controller: 'HomeCtrl',
                resolve: load(['scripts/controllers/nh_home.js', 
                    'libs/js/echarts/build/dist/echarts-all.js', 
                    'libs/js/echarts/build/dist/macarons.js', 
                    'scripts/directives/nh_branchDayRepo_count.js'
                   ])
            })
            .state('newhope.productInfo', {	// 基础信息/产品信息
                url: '/product/infolist',
                data: {title: '产品信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_product_info.html',
                controller: 'productCtrl',
                controllerAs: 'data',
                resolve: load(['datatables', 'scripts/controllers/basic_info/nh_productInfo.js', 'scripts/services/nh_tableService.js'])
            })
              .state('newhope.productEdit', {   // 基础信息/修改产品
                url: '/product/edit/:productCode',
                params: {productCode: null},
                data: {title: '产品信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/product_edit.html',
                controller: 'productEditCtrl',
                resolve: load(['datatables', 'scripts/controllers/basic_info/product_edit.js'])
            })
            .state('newhope.setpro', { 
                url: '/product/setpro',
                data: {title: '分奶设置', icons: 'fa-dot-circle-o'},
                controller: 'productSetCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_product_set.html',
                resolve: load(['datatables','scripts/controllers/basic_info/nh_productSetInfo.js'])
            })
            .state('newhope.consumerlist', {	// 基础信息/订户信息列表
                url: '/consumer/infolist/:type',
                data: {title: '订户信息', icons: 'fa-th-large'},
                params: {
                    reset_pageRecord: false
                },
                controller: 'ConsumerListCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_consumerlist.html',
                resolve: load(['scripts/controllers/basic_info/nh_consumerlist.js', 'scripts/directives/nh_checkbox.js'])
            })
            
            
            .state('newhope.consumerDetail', {	// 基础信息/订户详情
                url: '/consumer/detail/:vipCustNo',
                data: {title: '订户详情', icons: 'fa-th-large'},
                params: {
                    // vipCustNo: null,
                    edit: null
                },
                templateUrl: 'views/basic_info/nh_consumerDetail.html',
                controller: 'ConsumerDetailCtrl',
                resolve: load(['scripts/controllers/basic_info/nh_consumerDetail.js',
                    'scripts/directives/nh_address.js'])
            })
            .state('newhope.addConsumer', {	// 基础信息/新增订户
                url: '/consumer/add',
                data: {title: '新增订户', icons: 'fa-th-large'},
                params: {mp: null},
                templateUrl: 'views/basic_info/nh_add_consumer.html',
                controller: 'AddConsumerCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/basic_info/nh_addConsumer.js','scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.addConsumer.record', {
                templateUrl: 'views/basic_info/nh_add_consumer_s.html',
                params: {mp: null},
                controller: 'AddOneCsmCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/basic_info/nh_add_consumer_s.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_keydown.js'])
                // views: {
                // 	'stationRole': {
                // 		templateUrl: 'views/basic_info/nh_add_consumer_s.html'
                // 		// ,
                // 		// controller: 'AddConsumerBySCtrl',
                // 		// controllerAs: 'data'
                // 	},
                // 	'orgRole': {
                // 		templateUrl: 'views/basic_info/nh_add_consumer_o.html'
                // 		// ,
                // 		// controller: 'AddConsumerByOCtrl',
                // 		// controllerAs: 'data'
                // 	}
                // }
            })
            .state('newhope.addConsumer.exitInfo', {
                templateUrl: 'views/basic_info/nh_consumerInfo.html',
                params: {user: null},
                controller: 'AddCsmExitCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/basic_info/nh_consumerInfo.js',
                    'scripts/directives/nh_address.js'])
            })
            .state('newhope.addCsmByOrg', { // 部门或机构新增订户
                url: '/consumer/addByOrg/:orgId',
                params: {orgId: null},
                data: {title: '新增订户', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_add_csm_by_org.html',
                controller: 'OrgAddConsumerCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/basic_info/nh_add_csm_by_org.js'])
            })
            .state('newhope.addCsmByOrg.record', {
                templateUrl: 'views/basic_info/nh_add_consumer_s.html',
                params: {mp: null, orgId: null},
                controller: 'AddOneCsmCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/basic_info/nh_add_consumer_s.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_keydown.js'])
            })
            .state('newhope.priceInfo', {	// 基础信息/价格信息
                url: '/price/infolist',
                controller: 'pricesCtrl',
                controllerAs: 'data',
                data: {title: '价格组信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_pricegroup_list.html',
                resolve: load(['scripts/controllers/basic_info/nh_priceInfo.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.priceGroupAdd', {	// 基础信息/价格信息/新增价格组
                url: '/price/add',
                data: {title: '新增价格组'},
                templateUrl: 'views/basic_info/nh_pricegroup_add.html',
                resolve: load(['scripts/controllers/basic_info/nh_pricegroupadd.js'])
            })
            .state('newhope.editPriceGroup', {	// 基础信息/价格信息/修改价格组
                url: '/price/edit/:priceId',
                data: {title: '修改价格组'},
                templateUrl: 'views/basic_info/nh_pricegroup_edit.html',
                resolve: load(['scripts/controllers/basic_info/nh_pricegroupedit.js'])
            })
            .state('newhope.empinfo', {	// 基础信息/员工信息
                url: '/emp/infolist',
                data: {title: '员工信息', icons: 'fa-th-large'},
                controller: 'EmpinfolistCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_empinfolist.html',
                resolve: load(['scripts/controllers/basic_info/nh_empinfolist.js'])
            })
            .state('newhope.updateEmp', {	// 基础信息/更新送奶工信息
                url: '/emp/update/{empNo}',
                params: {
                    'empNo': ''
                },
                data: {title: '更新员工信息', icons: 'fa-th-large'},
                controller: 'updateEmpCtrl',
                templateUrl: 'views/basic_info/nh_updateEmp.html',
                resolve: load(['scripts/controllers/basic_info/nh_updateEmp.js','scripts/services/nh_commonUtil.js'])
            })
             .state('newhope.userinfo', { // 基础信息/用户信息
                url: '/user/infolist',
                data: {title: '用户信息', icons: 'fa-th-large'},
                controller: 'UserinfoListCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_userlist.html',
                resolve: load(['scripts/controllers/basic_info/nh_userlist.js'])
            })
            .state('newhope.allocatRoute', {   // 基础信息/分配配送区域
                url: '/dispatch/alloc/:branchNo',
                data: {title: '关联奶站', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_allocatRoute.html',
                controller: 'AllocatRouteCtrl',
                resolve: load(['datatables', 'scripts/controllers/basic_info/nh_allocatRoute.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.dispatchArealist', { // 基础信息/配送区域列表
                url: '/dispatch/arealist',
                data: {title: '配送区域信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_dispatchArealist.html',
                controller: 'DispatchArealistCtrl',
                resolve: load(['scripts/controllers/basic_info/nh_dispatchArealist.js',
                    'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_address.js'])
            })

             .state('newhope.dealerlist', { // 基础信息/经销商信息
                url: '/dealers',
                data: {title: '经销商信息', icons: 'fa-th-large'},
                controller: 'DealerListCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/dealerlist.html',
                resolve: load(['scripts/controllers/basic_info/dealerlist.js',
                    'scripts/directives/nh_address.js'])
            })
            .state('newhope.addDealer', { // 基础信息/新增经销商
                url: '/addDealer',
                data: {title: '新增经销商', icons: 'fa-th-large'},
                controller: 'AddDealerCtrl',
                templateUrl: 'views/basic_info/addDealer.html',
                resolve: load(['scripts/controllers/basic_info/addDealer.js',
                    'scripts/directives/nh_address.js'])
            })
            .state('newhope.uptDealer', { // 基础信息/修改经销商
                url: '/uptDealer/{dealerNo}',
                data: {title: '修改经销商', icons: 'fa-th-large'},
                params: {
                    'dealerNo': ''
                },
                controller: 'UptDealerCtrl',
                controllerAs:'data',
                templateUrl: 'views/basic_info/uptDealer.html',
                resolve: load(['scripts/controllers/basic_info/uptDealer.js',
                    'scripts/directives/nh_address.js'])
            })
             .state('newhope.dealerInfo', { // 基础信息/经销商详情
                url: '/dealerInfo/{dealerNo}',
                data: {title: '经销商详情', icons: 'fa-th-large'},
                params: {
                    'dealerNo': ''
                },
                controller: 'DealerInfoCtrl',
                controllerAs:'data',
                templateUrl: 'views/basic_info/dealerInfo.html',
                resolve: load(['scripts/controllers/basic_info/dealerInfo.js',
                    'scripts/directives/nh_address.js'])
            })

            .state('newhope.milkstationlist', { // 基础信息/奶站信息
                url: '/milkstation',
                data: {title: '奶站信息', icons: 'fa-th-large'},
                controller: 'MSListCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_milkstationlist.html',
                resolve: load(['scripts/controllers/basic_info/nh_milkstationlist.js',
                    'scripts/directives/nh_address.js'])
            })

            .state('newhope.milkstationinfo', { // 基础信息/奶站详情
                url: '/milkstation/detail/{branchNo}',
                data: {title: '奶站详情', icons: 'fa-th-large'},
                params: {
                    'branchNo': '',
                    edit: null
                },
                templateUrl: 'views/basic_info/nh_milkstationinfo.html',
                controller: 'MilkInfoCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_milkstationinfo.js'])
            })
            .state('newhope.milkstationadd', { // 基础信息/新增奶站
                url: '/milkstation/add',
                data: {title: '奶站新增', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_milkstationadd.html',
                controller: 'MilkInfoAddCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_milkstationadd.js','scripts/directives/nh_keydown.js','scripts/directives/nh_address.js'])
            })
            .state('newhope.promotionlist', { // 基础信息/促销信息
                url: '/promotion',
                data: {title: '促销信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_promotionlist.html',
                controller: 'PromotionsCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_promotionlist.js'])
            })

            .state('newhope.promotionAdd', { // 基础信息/新增促销信息
                 url: '/promotionAdd/type:promSubType',
                params: {promSubType: null},
                data: {title: '促销信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/promotionAdd.html',
                controller: 'PromotionAddCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/promotionAdd.js'])
            })

             .state('newhope.allocatProm', { // 基础信息/促销分配奶站
                 url: '/allocatProm',
                data: {title: '促销分配', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/allocatProm.html',
                controller: 'alloctPromCtrl',
                resolve: load(['scripts/controllers/basic_info/allocatProm.js'])
            })

            .state('newhope.dictionarylist', {   // 字典信息列表
                url: '/dictionarylist',
                templateUrl: 'views/basic_info/nh_dictionarylist.html',
                data: {title: '字典信息列表', icons: 'fa-bar-chart'},
                controller: 'DictionaryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_dictionarylist.js'])                
            })

            .state('newhope.orginfolist', { // 基础信息/机构信息
                url: '/orginfo',
                data: {title: '机构信息', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_orgInfo.html',
                controller: 'OrginfoCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_orgInfo.js'])
            })
            .state('newhope.orginfoDetail', { // 基础信息/机构详情
                url: '/orginfo/detail/:orgId',
                data: {title: '机构详情', icons: 'fa-th-large'},
                params: {orgId: null},
                templateUrl: 'views/basic_info/nh_orgDetail.html',
                controller: 'OrginfoDetailCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_orgDetail.js'])
            })
            .state('newhope.orginfoPrice', { // 基础信息/机构价格详情
                url: '/orginfo/orgPirce/:orgId',
                data: {title: '机构价格详情', icons: 'fa-th-large'},
                params: {orgId: null},
                templateUrl: 'views/basic_info/nh_orginfoPrice.html',
                controller: 'OrginfoPriceCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_orginfoPrice.js','scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.yearcardPrice', { // 基础信息/年卡价格详情
                url: '/yearcardPrice',
                data: {title: '年卡价格详情', icons: 'fa-th-large'},
                templateUrl: 'views/basic_info/nh_yearcardPrice.html',
                controller: 'YearcardPriceCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/basic_info/nh_yearcardPrice.js','scripts/directives/nh_mulclick_disable.js'])
            })

 // --liuyin add start--
           .state('newhope.Cash_account', {   // 统计查询/现金账户信息查询
                url: '/Cash_account',
                templateUrl: 'views/statistic/nh_Cash_account.html',
                data: {title: '现金账户信息查询', icons: 'fa-bar-chart'},
                controller: 'Cash_account',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_Cash_account.js'])                
            })

            .state('newhope.inbox', {  // 站内通知
                url: '/inbox',
                templateUrl: 'views/basic_info/nh_message_main.html',
                data: {title: '站内通知', icons: 'fa-th-large'},
                controller: 'MainCtrl',
                resolve: load(['scripts/controllers/basic_info/nh_message.js'])
            })
            .state('newhope.inbox.list', {
                url: '/{fold}',
                templateUrl: 'views/basic_info/nh_message_list.html',
                data: {title: '站内通知', icons: 'fa-th-large'},
                controller: 'ListCtrl'
            })
            .state('newhope.inbox.item', {
                url: '/item/{messageNo}',
                templateUrl: 'views/basic_info/nh_message_item.html',
                data: {title: '站内通知', icons: 'fa-th-large'},
                controller: 'DetailCtrl'
            })
            .state('newhope.nhlogs', {    // 日志
                url: '/logs',
                templateUrl: 'views/basic_info/nh_logs.html',
                data: {title: '日志信息', icons: 'fa-th-large'},
                resolve: load(['scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.nhlogs.consumerlogs', { // 日志/订户
                url: '/consumer',
                data: {title: '日志信息', icons: 'fa-th-large'},
                controller: 'ConsumerLogsCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_logs_consumer.html',
                resolve: load(['scripts/controllers/basic_info/nh_logs_consumer.js'])
            })
            .state('newhope.nhlogs.orderlogs', { // 日志/订单
                url: '/order',
                data: {title: '日志信息', icons: 'fa-th-large'},
                controller: 'OrderLogsCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_logs_order.html',
                resolve: load(['scripts/controllers/basic_info/nh_logs_order.js'])
            })
            .state('newhope.nhlogs.planlogs', { // 日志/订奶计划
                url: '/plan',
                data: {title: '日志信息', icons: 'fa-th-large'},
                controller: 'PlanLogsCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_logs_plan.html',
                resolve: load(['scripts/controllers/basic_info/nh_logs_plan.js'])
            })
            .state('newhope.nhlogs.routelogs', { // 日志/路单
                url: '/route',
                data: {title: '日志信息', icons: 'fa-th-large'},
                controller: 'RouteLogsCtrl',
                controllerAs: 'data',
                templateUrl: 'views/basic_info/nh_logs_route.html',
                resolve: load(['scripts/controllers/basic_info/nh_logs_route.js'])
            })
            .state('newhope.inbox.compose', {
                url: '/compose',
                templateUrl: 'views/basic_info/nh_message_new.html',
                data: {title: '站内通知', icons: 'fa-th-large'},
                controller: 'NewCtrl',
                resolve: load(['summernote', 'ui.select'])
            })
            .state('newhope.currentOrder', {	// 订单管理/订单列表
                url: '/order/current',
                data: {title: '订单列表', icons: 'fa-dot-circle-o'},
                params: { 
                    csmPhone: null,
                    reset_pageRecord: false
                },
                controller: 'currentOrderCtrl',
                templateUrl: 'views/orders/nh_currentorder.html',
                resolve: load(['scripts/controllers/orders/nh_currentOrder.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.consumerBillReport', {	// 结算管理/订户结算报表
                url: '/consumer/billReport',
                data: {title: '订户结算报表', icons: 'fa-dot-circle-o'},
                params: { 
                    csmPhone: null,
                    reset_pageRecord: false
                },
                controller: 'billReportCtrl',
                templateUrl: 'views/billing/nh_consumer_bill_report.html',
                resolve: load(['scripts/controllers/billing/nh_consumer_bill_report.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.currentOrgOrder', {    // 订单管理/机构订单列表
                url: '/order/org/current',
                data: {title: '机构订单列表', icons: 'fa-dot-circle-o'},
                params: { 
                    csmPhone: null,
                    orgId: null
                },
                controller: 'currentOrgOrderCtrl',
                templateUrl: 'views/orders/nh_current_org_order.html',
                resolve: load(['scripts/controllers/orders/nh_current_org_order.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.currentYearOrder', {    // 订单管理/年卡订单列表
                url: '/order/year/current',
                data: {title: '年卡订单列表', icons: 'fa-dot-circle-o'},
                controller: 'currentYearOrderCtrl',
                templateUrl: 'views/orders/nh_current_year_order.html',
                resolve: load(['scripts/controllers/orders/nh_current_year_order.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.orderChangeEmp', {    // 订单管理/订单替换送奶员
                url: '/order/changeEmp',
                data: {title: '订单送奶员替换', icons: 'fa-dot-circle-o'},
                params: { 
                    csmPhone: null,
                    reset_pageRecord: false
                },
                controller: 'orderChangeEmpCtrl',
                templateUrl: 'views/orders/nh_order_changeEmp.html',
                resolve: load(['scripts/controllers/orders/nh_order_changeEmp.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.needResumeOrder', {    // 订单管理/待续订订单列表
                url: '/order/needResume',
                data: {title: '待续订订单列表', icons: 'fa-dot-circle-o'},
                params: { 
                    csmPhone: null,
                    reset_pageRecord: false 
                },
                controller: 'needResumeOrderCtrl',
                templateUrl: 'views/orders/nh_needresumeorder.html',
                resolve: load(['scripts/controllers/orders/nh_needresumeorder.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.orderEdit', {	// 订单管理/修改
                url: '/order/edit:orderNo/:isYearcard',
                templateUrl: 'views/orders/nh_orderedit.html',
                data: {title: '订单编辑', icons: 'fa-dot-circle-o'},
                controller: 'orderEditCtrl',
                resolve: load(['scripts/controllers/orders/nh_orderedit.js', 'scripts/directives/nh_editorderproduct.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.orderDetail', {	// 订单管理/订单详情
                url: '/order/detail:orderNo',
                data: {title: '订单详情', icons: 'fa-dot-circle-o'},
                templateUrl: 'views/orders/nh_orderdetail.html',
                controller: 'orderDetailCtrl',
                resolve: load(['scripts/controllers/orders/nh_orderdetail.js'])
            })
            .state('newhope.bookOrderCreate', {   // 订单管理/新增征订订单
                url: '/bookOrder/create',
                data: {title: '创建征订订单', icons: 'fa-dot-circle-o'},
                controller: 'BookOrderCreateCtrl',
                controllerAs:'data',
                templateUrl: 'views/orders/nh_create_bookOrder.html',
                resolve: load(['datatables', 'scripts/controllers/orders/nh_create_bookOrder.js', 'scripts/services/nh_tableService.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js','scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.orderCreate', {	// 订单管理/新增订单
                url: '/order/create',
                data: {title: '创建订单', icons: 'fa-dot-circle-o'},
                params: {
                    selectCust: null,
                    vipCustNo: null,
                    vipCustName: null,
                    vipCustTel: null,
                    branchNo: null,
                    branchName: null,
                    vipType:null,
                    orgId: null
                },
                templateUrl: 'views/orders/nh_create_order.html',
                resolve: load(['datatables', 'scripts/controllers/orders/nh_orderCreate.js', 'scripts/services/nh_tableService.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.freeOrderCreate', { // 订单管理/新增特殊订单
                url: '/order/free/create',
                data: {title: '创建特殊订单', icons: 'fa-dot-circle-o'},
                
                templateUrl: 'views/orders/nh_create_free_order.html',
                resolve: load(['datatables', 'scripts/controllers/orders/nh_create_free_order.js', 'scripts/services/nh_tableService.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.yearOrderCreate', { // 订单管理/新增年卡订单
                url: '/order/yearOrder/create',
                data: {title: '创建年卡订单', icons: 'fa-dot-circle-o'},
                templateUrl: 'views/orders/nh_create_year_order.html',
                resolve: load(['scripts/controllers/orders/nh_create_year_order.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.orderCreateZq', {	// 订单管理/新增订单
                url: '/order/createZq',
                data: {title: '创建机构自取订单', icons: 'fa-dot-circle-o'},
                params: {
                    selectCust: null,
                    vipCustNo: null,
                    vipCustName: null,
                    vipCustTel: null,
                    branchNo: null,
                    branchName: null,
                    vipType:null,
                    orgId: null
                },
                templateUrl: 'views/orders/nh_create_order_zq.html',
                resolve: load(['datatables', 'scripts/controllers/orders/nh_orderCreate_zq.js', 'scripts/services/nh_tableService.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.yearOrderCreateZq', { // 订单管理/新增年卡自取订单
                url: '/order/yearOrderCreateZq',
                data: {title: '创建年卡自取订单', icons: 'fa-dot-circle-o'},
                templateUrl: 'views/orders/nh_create_year_order_zq.html',
                resolve: load(['scripts/controllers/orders/nh_create_year_order_zq.js', 'scripts/directives/nh_addtoorder.js',
                    'scripts/directives/nh_address.js', 'scripts/directives/nh_calculateentry.js'])
            })
            .state('newhope.requiredOrder', {	// 订单管理/待确认订单
                url: '/order/required',
                data: {title: '待确认订单', icons: 'fa-dot-circle-o'},
                params: {
                    reset_pageRecord: false
                },
                controller: 'requiredOrderCtrl',
                templateUrl: 'views/orders/nh_requiredorder.html',
                resolve: load(['scripts/controllers/orders/nh_requiredorder.js', 'scripts/services/nh_commonUtil.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.requiredOrderOrg', {   // 订单管理/待确认订单
                url: '/order/requiredOrg',
                data: {title: '待确认订单', icons: 'fa-dot-circle-o'},
                controller: 'requiredOrderOrgCtrl',
                templateUrl: 'views/orders/nh_requiredorder_org.html',
                resolve: load(['scripts/controllers/orders/nh_requiredorder_org.js', 'scripts/services/nh_commonUtil.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.manHandle', {	// 订单管理/人工分单
                url: '/manhandle',

                data: {title: '人工分单', icons: 'fa-dot-circle-o'},
                templateUrl: 'views/orders/nh_manhandle.html',
                controller: 'ManHandleCtrl',
                resolve: load(['scripts/controllers/orders/nh_manHandle.js'])
            })
            .state('newhope.milkBox', {	// 订单管理/奶箱列表
                url: '/milkbox',
                data: {title: '奶箱列表', icons: 'fa-dot-circle-o'},
                templateUrl: 'views/orders/nh_milkbox.html',
                params: { orderNo: null },
                controller: 'MilkBoxCtrl',
                resolve: load(['scripts/controllers/orders/nh_milkBox.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.salOrder', {	// 送奶管理/销售订单
                url: '/salOrder',
                data: {title: '销售订单', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_sale_order.html',
                controller: 'SaleOrderCtrl',
                resolve: load(['scripts/controllers/milk_trans/nh_sale_order.js'])
            })
            .state('newhope.supply', { // 送奶管理/要货计划
                url: '/supply',
                data: {title: '要货计划  (如果创建要货日期为今天,则要的是明天的货)', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_requireGoods.html',
                controller: 'requireGoodCtrl',
                resolve: load(['scripts/controllers/milk_trans/nh_requireGoods.js', 'scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.supplyByDealer', { // 送奶管理/经销商要货计划
                url: '/dealer/supply',
                data: {title: '经销商要货计划  (如果创建要货日期为今天,则要的是明天的货)', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_dealerRequireGoods.html',
                controller: 'DearlerReGoodsCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_trans/nh_dealerRequireGoods.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.salOrderByDealer', { // 送奶管理/经销商销售订单
                url: '/dealer/salOrder/:orderDate',
                data: {title: '销售订单', icons: 'fa-truck'},
                params: { orderDate: null },
                templateUrl: 'views/milk_trans/nh_dealer_sale_order.html',
                controller: 'DearlerSaleOrderCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_trans/nh_dealer_sale_order.js'])
            })
            .state('newhope.demand', {	// 送奶管理/订奶计划
                url: '/demand:orderNo',
                data: {title: '订奶计划', icons: 'fa-truck'},
                params: { orderNo: null },
                templateUrl: 'views/milk_trans/nh_ordermilkproject.html',
                resolve: load(['xeditable', 'scripts/controllers/milk_trans/nh_ordermilkproject.js', 'scripts/directives/nh_clickdisable.js', 'scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.transplan', {	// 送奶管理/路单管理
                url: '/transplan',
                data: {title: '路单管理', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_routelist.html',
                controller: 'routeCtrl',
                resolve: load(['scripts/controllers/milk_trans/nh_routelist.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.transpath', {	// 送奶管理/路线管理
                url: '/transpath',
                data: {title: '路线管理', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_routemanagement.html',
                controller: 'routeManagementCtrl',
                resolve: load(['datatables', 'scripts/controllers/milk_trans/nh_routemanagement.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_tableService.js'])
            })
            .state('newhope.transpathEdit', {	// 送奶管理/路线修改
                url: '/transpath/edit',
                data: {title: '路线修改', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_routeedit.html',
                resolve: load(['datatables', 'scripts/controllers/milk_trans/nh_routeedit.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_tableService.js'])
            })
            .state('newhope.returnbox', {	// 送奶管理/回瓶管理
                url: '/returnbox',
                data: {title: '回瓶管理', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_returnboxlist.html',
                controller: 'ReturnBoxCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_trans/nh_returnboxlist.js', 'scripts/directives/nh_checkbox.js'])
            })
            .state('newhope.complainList', {   // 送奶管理/投诉查询
                url: '/complainlist',
                data: {title: '投诉查询', icons: 'fa-truck'},
                templateUrl: 'views/milk_trans/nh_complainList.html',
                controller: 'ComplainListCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_trans/nh_complainList.js', 'scripts/services/nh_commonUtil.js'])
            })
            /**
             * 库存管理
             * start
             */
            .state('newhope.proStock', {    // 库存管理
                url: '/proStock',
                templateUrl: 'views/milk_trans/nh_proStrock.html',
                data: {title: '库存管理', icons: 'fa-truck'}
            })
            .state('newhope.proStock.proStockList', {    // 库存列表
                url: '/proStockList',
                templateUrl: 'views/milk_trans/nh_proStockList.html',
                data: {title: '库存管理'},
                controller: 'ProStockListCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/milk_trans/nh_proStockListCtrl.js'])
            })
            .state('newhope.proStock.inproStock', {  // 入库-交货单列表
                url: '/inproStock',
                templateUrl: 'views/milk_trans/nh_inproStock.html',
                data: {title: '库存管理'},
                controller: 'InproStockCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/milk_trans/nh_inproStockCtrl.js']) 
            })
            .state('newhope.inproStockEdit', {  // 出库-交货单-详情
                url: '/inproStockEdit',
                params:{
                    stockId:'',
                    status:''
                },
                templateUrl: 'views/milk_trans/nh_inproStockEdit.html',
                data: {title: '库存管理'},
                controller: 'InproStockEditCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/milk_trans/nh_inproStockEditCtrl.js']) 
            })
            .state('newhope.proStock.outproStock', {  // 出库管理
                url: '/outproStock',
                templateUrl: 'views/milk_trans/nh_outproStock.html',
                data: {title: '库存管理'},
                controller: 'OutproStockCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/milk_trans/nh_outproStockCtrl.js']) 
            })
            .state('newhope.proStock.milkstationSales', {  // 出库-内部销售
                url: '/milkstationSales',
                templateUrl: 'views/milk_trans/nh_milkstationSales.html',
                data: {title: '库存管理'},
                controller: 'MilkstationSalesCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/milk_trans/nh_milkstationSalesCtrl.js']) 
            })
            //--end--
            .state('newhope.milkstationBill', {	// 结算管理/奶站结算
                url: '/milkstation/bill',
                data: {title: '奶站结算', icons: 'fa-fax'},
                templateUrl: 'views/billing/nh_milkstation_bill.html',
                controller: 'MilkstationBillCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/billing/nh_milkstation_bill.js', 'scripts/directives/nh_mulclick_disable.js'])
            })
            .state('newhope.empBill', {	// 结算管理/送奶工结算
                url: '/emp/bill',
                data: {title: '送奶工结算', icons: 'fa-fax'},
                templateUrl: 'views/billing/nh_emp_bill.html',
                controller: 'EmpBillCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/billing/nh_emp_bill.js'])
            })
            .state('newhope.consumerBill', {	// 结算管理/订户结算
                url: '/consumer/bill',
                data: {title: '订户结算', icons: 'fa-fax'},
                templateUrl: 'views/billing/nh_consumer_bill.html',
                controller: 'ConsumerBillCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/billing/nh_consumer_bill.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.delRecBills', {	// 结算管理/批量删除收款单
                url: '/rec_bill/del',
                data: {title: '批量删除收款单', icons: 'fa-fax'},
                templateUrl: 'views/billing/nh_del_rec_bill.html',
                controller: 'DelRecBillsCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/billing/nh_del_rec_bill.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.milkStudentSchoolInfo', {	// 学生奶/学校信息
                url: '/milk_student/schoolInfo',
                data: {title: '学校信息', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/nh_schoolInfo.html',
                controller: 'SchoolInfoCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_student/nh_schoolInfo.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            }).
            state('newhope.school_milk_product', {	// 学生奶/产品信息
                url: '/milk_student/school_milk_product',
                data: {title: '学生奶产品信息', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/nh_school_milk_product.html',
                controller: 'schoolMilkProductCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_student/school_milk_product.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
             .state('newhope.schoolInfoList', {	// 学生奶/学校信息
                url: '/milk_student/schoolInfoList',
                data: {title: '学校信息', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/nh_schoolInfoList.html',
                controller: 'schoolInfoListCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_student/nh_schoolInfoList.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
            
            .state('newhope.schoolMilkPolicy', {	// 学生奶/学校牛奶品种政策
                url: '/milk_student/schoolMilkPolicy',
                data: {title: '学校牛奶品种政策', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/nh_school_milk_policy.html',
                controller: 'schoolMilkPolicyCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_student/schoolMilkPolicy.js'])
            })
            
            .state('newhope.classForMilk', {	// 学生奶/班级订奶管理
                url: '/milk_student/classForMilk',
                data: {title: '班级订奶管理', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/class_for_milk.html',
                controller: 'classForMilkCtrl',
                resolve: load(['scripts/controllers/milk_student/classForMilk.js', 'scripts/directives/nh_address.js', 'scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            
            .state('newhope.milkStudentCommitMilk', {	// 学生奶/报货设置
                url: '/milk_student/commitMilk',
                data: {title: '报货设置', icons: 'fa-th-large'},
                templateUrl: 'views/milk_student/nh_commitMilk.html',
                controller: 'CommitMilkCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/milk_student/nh_commitMilk.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.schoolDetail', { // 学生奶/学校详情
                url: '/milk_student/detail/:schoolCode',
                data: {title: '学校详情', icons: 'fa-th-large'},
                params: {schoolCode: null},
                templateUrl: 'views/milk_student/nh_schoolDetail.html',
                controller: 'SchoolDetailCtrl',
                resolve: load(['scripts/controllers/milk_student/nh_schoolDetail.js', 'scripts/directives/nh_checkbox.js', 'scripts/directives/nh_mulclick_disable.js', 'scripts/services/nh_commonUtil.js'])
            })
             .state('newhope.dispRate', {   // 结算管理/配送费率
                url: '/disp/dispRate',
                data: {title: '配送费率', icons: 'fa-fax'},
                templateUrl: 'views/billing/nh_emp_disprate.html',
                controller: 'DispatchRateCtrl',
                resolve: load(['scripts/controllers/billing/nh_emp_disprate.js','xeditable'])
            })
            .state('newhope.dispRateRpt', {   // 报表/配送明细
                url: '/disp/dispRateRpt',
                data: {title: '配送数量明细结算报表', icons: 'fa-fax'},
                templateUrl: 'views/report/nh_disprate_rpt.html',
                controller: 'DispRateRptCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/report/nh_disprate_rpt.js'])
            })
            .state('newhope.accountReceAmount', {   // 报表/收款金额
                url: '/account/amountRpt',
                data: {title: '收款金额明细结算', icons: 'fa-fax'},
                templateUrl: 'views/report/nh_collect_detail_rpt.html',
                controller: 'AccountRptCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/report/nh_collect_detail_rpt.js'])
            })
            .state('newhope.milkBoxStat', {	// 统计查询/奶站统计
                url: '/milkBoxStat/statistic',
                templateUrl: 'views/statistic/nh_milkBoxStatisitc.html',
                resolve: load(['libs/js/echarts/build/dist/echarts-all.js', 'libs/js/echarts/build/dist/macarons.js', 'scripts/directives/milkBoxStat_Dt.js'])
            })
            .state('newhope.monthPlan', { // 统计查询/月任务计划查询填报
                url: '/monthPlan',
                templateUrl: 'views/statistic/nh_branchMonthPlan.html',
                controller:'BranchMonthPlanCtrl',
                controllerAs:'data',
                data: {title: '奶站月任务计划', icons: 'fa-bar-chart'},
                resolve: load(['angularFileUpload','scripts/controllers/statistic/nh_branchMonthPlanCtrl.js'])
            })
            /**
             * 送奶员配送信息统计查询报表
             * start
             */
            .state('newhope.emptransplanStat', {	// 统计查询/送奶员差异明细表
                url: '/emptransplanStat',
                templateUrl: 'views/statistic/nh_emptransplanStat.html',
                data: {title: '送奶员配送信息统计', icons: 'fa-bar-chart'}
            })
            .state('newhope.emptransplanStat.tranplanStat', {    // 统计查询/路单差异明细表
                url: '/tranplanStat',
                templateUrl: 'views/statistic/nh_tranplanStat.html',
                data: {title: '送奶员配送信息统计', icons: 'fa-bar-chart'},
                controller: 'TranplanStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_tranplanStatCtrl.js'])
            })
            .state('newhope.emptransplanStat.changeplanStat', {  // 统计查询/换货差异明细表
                url: '/changeplanStat',
                templateUrl: 'views/statistic/nh_changeplanStat.html',
                data: {title: '送奶员配送信息统计', icons: 'fa-bar-chart'},
                controller: 'ChangeplanStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_changeplanStatCtrl.js'])
                
            })
            //--end--
            .state('newhope.daymilkStStat', {	// 统计查询/奶站日报表统计
                url: '/daymilkStStat',
                templateUrl: 'views/statistic/nh_daymilkStStat.html',
                data: {title: '奶站日报表统计', icons: 'fa-bar-chart'},
                controller: 'DaymilkStStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_daymilkStStatCtrl.js'])
            })
            .state('newhope.retrunBoxStat', {   // 统计查询/回瓶统计
                url: '/retrunBoxStat',
                templateUrl: 'views/statistic/nh_returnBoxStat.html',
                data: {title: '回瓶汇总统计', icons: 'fa-bar-chart'},
                controller: 'ReturnBoxStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_retrunBoxStatCtrl.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.monthmilkStStat', {   // 统计查询/奶站月任务报表统计
                url: '/monthmilkStStat',
                templateUrl: 'views/statistic/nh_monthmilkStStat.html',
                data: {title: '奶站月报表统计', icons: 'fa-bar-chart'},
                controller: 'MonthmilkStStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_monthmilkStStatCtrl.js'])               
            })
            .state('newhope.milkorderCRStat', {   // 统计查询/奶站订单转化率
                url: '/milkorderCRStat',
                templateUrl: 'views/statistic/nh_milkorderCRStat.html',
                data: {title: '奶站订单转化率统计', icons: 'fa-bar-chart'},
                controller: 'MilkorderCRStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_milkorderCRStatCtrl.js'])
            })
            .state('newhope.subscriptionsNOStat', {   // 统计查询/征订场次报表
                url: '/subscriptionsNOStat',
                templateUrl: 'views/statistic/nh_subscriptionsNOStat.html',
                data: {title: '征订场次报表', icons: 'fa-bar-chart'},
                controller: 'SubscriptionsNOStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_subscriptionsNOStatCtrl.js'])                
            })
            .state('newhope.requireMilksStat', {   // 统计查询/要货计划查询
                url: '/requireMilksStat',
                templateUrl: 'views/statistic/nh_requireMilksStat.html',
                data: {title: '要货计划查询', icons: 'fa-bar-chart'},
                controller: 'RequireMilksStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_requireMilksStatCtrl.js'])                
            })
            .state('newhope.mstDispNumStat', {   // 统计查询/配送数量汇总-送奶员维度
                url: '/mstDispNumStat',
                templateUrl: 'views/statistic/nh_mstDispNumStat.html',
                data: {title: '配送数量汇总', icons: 'fa-bar-chart'},
                controller: 'MstDispNumStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_mstDispNumStatCtrl.js'])
            })
            .state('newhope.branchMstDispNumStat', {   // 统计查询/奶站配送汇总
                url: '/branchMstDispNumStat',
                templateUrl: 'views/statistic/nh_branchMstDispNumStat.html',
                data: {title: '奶站配送汇总', icons: 'fa-bar-chart'},
                controller: 'BranchMstDispNumStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_branchMstDispNumStatCtrl.js'])
            })
            .state('newhope.dayMstDispNumStat', {   // 统计查询/奶站日配送统计
                url: '/dayMstDispNumStat',
                templateUrl: 'views/statistic/nh_dayMstDispNumStat.html',
                data: {title: '奶站日配送统计', icons: 'fa-bar-chart'},
                controller: 'DayMstDispNumStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_dayMstDispNumStatCtrl.js'])
            })
            .state('newhope.branchDataCheck', {   // 统计查询/奶站数据核对导出
                url: '/branchDataCheck',
                templateUrl: 'views/statistic/nh_branchDataCheck.html',
                data: {title: '奶站数据核对', icons: 'fa-bar-chart'},
                controller: 'BranchDataCheckCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_branchDataCheckCtrl.js'])
            })  
            .state('newhope.refuseResendStat', {   // 统计查询/拒收复送统计
                url: '/refuseResendStat',
                templateUrl: 'views/statistic/nh_refuseResendStat.html',
                data: {title: '拒收复送统计', icons: 'fa-bar-chart'},
                controller: 'RefuseResendStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_refuseResendStatCtrl.js'])
            }) 
             .state('newhope.onlineOrder', {   // 统计查询/对账报表统计
                url: '/onlineOrder',
                templateUrl: 'views/statistic/nh_onlineOrderStat.html',
                data: {title: '对账报表', icons: 'fa-bar-chart'},
                controller: 'OnlineOrderStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_onlineOrderStatCtrl.js'])
            })     
            .state('newhope.yearCardExport', {   // 统计查询/年卡补偿单据
                url: '/yearCardExport',
                templateUrl: 'views/statistic/nh_yearCardExport.html',
                data: {title: '年卡数据导出', icons: 'fa-bar-chart'},
                controller: 'YearCardExportCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_yearCardExportCtrl.js'])
            })    
            .state('newhope.dayReportStStat', {   // 统计查询/要货计划日报表
                url: '/dayReportStStat',
                templateUrl: 'views/statistic/nh_dayReportStStat.html',
                data: {title: '要货计划日报表', icons: 'fa-bar-chart'},
                controller: 'DayReportStStatCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_dayReportStStatCtrl.js'])
            })    
            /**
             * 订户信息查询
             * start
             */
            .state('newhope.consumerStat', {	// 统计查询/订户统计
                url: '/consumerStat',
                templateUrl: 'views/statistic/nh_consumerStat.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'}
            })
            .state('newhope.consumerStat.consumerQuery', {    // 订户统计/订户查询
                url: '/consumerQuery',
                templateUrl: 'views/statistic/nh_consumerQuery.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'},
                controller: 'ConsumerQueryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_consumerQueryCtrl.js'])
            })
            .state('newhope.consumerStat.unconsumerQuery', {    // 订户统计/退订订户查询
                url: '/unconsumerQuery',
                templateUrl: 'views/statistic/nh_unconsumerQuery.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'},
                controller: 'UnconsumerQueryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_unconsumerQueryCtrl.js'])
            })
            .state('newhope.consumerStat.stopconsumerQuery', {    // 订户统计/停订订户查询
                url: '/stopconsumerQuery',
                templateUrl: 'views/statistic/nh_stopconsumerQuery.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'},
                controller: 'StopconsumerQueryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_stopconsumerQueryCtrl.js'])
            })
            .state('newhope.consumerStat.doconsumerQuery', {    // 订户统计/在订订户查询
                url: '/doconsumerQuery',
                templateUrl: 'views/statistic/nh_doconsumerQuery.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'},
                controller: 'DoconsumerQueryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_doconsumerQueryCtrl.js'])
            })   
            .state('newhope.consumerStat.changeconsumerQuery', {    // 订户统计/奶站更改统计
                url: '/changeconsumerQuery',
                templateUrl: 'views/statistic/nh_changeconsumerQuery.html',
                data: {title: '订户信息查询统计', icons: 'fa-bar-chart'},
                controller: 'ChangeconsumerQueryCtrl',
                controllerAs:'data',
                resolve: load(['scripts/controllers/statistic/nh_changeconsumerQueryCtrl.js'])
            })          
            //--end--
            .state('newhope.uihomelayout', {	// UI模板
                url: '/ui/homelayout',
                templateUrl: 'views/testui/nh_ui_home_layout.html',
                resolve: load(['scripts/controllers/nh_home.js', 'libs/js/echarts/build/dist/echarts-all.js', 'libs/js/echarts/build/dist/macarons.js', 'scripts/directives/nh_consumer_counts.js'])
            })
            .state('newhope.uimodallayout', {	// UI模板
                url: '/ui/modallayout',
                templateUrl: 'views/testui/nh_ui_modal_layout.html',
                resolve: load(['scripts/controllers/testui/nh_uimodallayout.js'])
            })
            .state('newhope.uicontentlayout', {	// UI模板
                url: '/ui/contentlayout',
                templateUrl: 'views/testui/nh_ui_content_layout.html',
                resolve: load(['scripts/controllers/testui/nh_uicontentlayout.js'])
            })
            .state('newhope.uiformlayout', {	// UI模板
                url: '/ui/formlayout',
                templateUrl: 'views/testui/nh_ui_form_layout.html',
                resolve: load(['scripts/controllers/testui/nh_uiformlayout.js'])
            })
            .state('newhope.authorization', {	// 权限控制
                url: '/sys/authorization',
                controller: 'MainCtrl',
                templateUrl: 'views/system/nh_sys_auth_main.html',
                resolve: load(['scripts/controllers/system/nh_sys_main.js'])
            })
            .state('newhope.salesOrgMain', {    //销售组织维护
                url: '/sys/salesOrgMain',
                templateUrl: 'views/system/nh_salesOrgMain.html',
                data: {title: '销售组织维护', icons: 'fa-cog'},
                controller: 'SalesOrgMainCtrl',
                resolve: load(['scripts/controllers/system/nh_salesOrgMain.js','scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.companyMain', {    //销售组织维护
                url: '/sys/companyMain',
                templateUrl: 'views/system/nh_companyMain.html',
                data: {title: '公司维护', icons: 'fa-cog'},
                controller: 'CompanyMainCtrl',
                resolve: load(['scripts/controllers/system/nh_companyMain.js','scripts/directives/nh_checkbox.js', 'scripts/services/nh_commonUtil.js'])
            })
            .state('newhope.authorization.auth', {	// 授权
                url: '/auth',
                templateUrl: 'views/system/nh_sys_auth_auth.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'AuthCtrl',
                resolve: load(['scripts/controllers/system/nh_sys_auth.js'])
            })
            .state('newhope.authorization.auth.res', {	// 授权
                url: '/res/:roleId',
                templateUrl: 'views/system/nh_sys_auth_auth_res.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'RoleResCtrl',
                resolve: load(['ui.ztree'])
            })
            .state('newhope.authorization.role', {	// 角色
                url: '/role',
                templateUrl: 'views/system/nh_sys_auth_role.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'RoleCtrl',
                resolve: load(['scripts/controllers/system/nh_sys_role.js'])
            })
            .state('newhope.authorization.user', {	// 用户
                url: '/user',
                templateUrl: 'views/system/nh_sys_auth_user.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'UserCtrl',
                resolve: load(['scripts/controllers/system/nh_sys_user.js'])
            })
            .state('newhope.authorization.user.list', {	// 用户
                url: '/{role}',
                templateUrl: 'views/system/nh_sys_auth_user_list.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'ListCtrl',
                controllerAs: 'data'
                // ,resolve: load(['mgcrea.ngStrap'])
            })
            .state('newhope.authorization.ztree', {
                url: '/ztree',
                templateUrl: 'views/system/nh_sys_auth_ztree.html',
                data: {title: '权限控制', icons: 'fa-th-cog'},
                resolve: load(['ui.ztree', 'scripts/controllers/system/nh_sys_ztree.js'])
            })
            .state('newhope.authorization.res', {	// 资源
                url: '/res',
                templateUrl: 'views/system/nh_sys_auth_res.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                resolve: load(['scripts/controllers/system/nh_sys_res.js', 'ui.ztree', 'scripts/directives/ui-ztree.js'])
            })
            .state('newhope.authorization.res.info', {	// 资源
                url: '/resinfo/:resCode',
                templateUrl: 'views/system/nh_sys_auth_res_info.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'ResCtrl'
                // ,resolve: load(['mgcrea.ngStrap'])
            })
            .state('newhope.authorization.list', {
                url: '/{fold}',
                templateUrl: 'views/system/nh_sys_page_list.html',
                data: {title: '权限控制', icons: 'fa-cog'},
                controller: 'productCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/system/nh_sys_page_list.js'])
            })
            .state('newhope.piInterface', {
                url: '/piInterface',
                templateUrl: 'views/system/nh_piInterface.html',
                data: {title: '同步主数据', icons: 'fa-cog'},
                controller: 'PiInterfaceCtrl',
                controllerAs: 'data',
                resolve: load(['scripts/controllers/system/nh_piInterfaceCtrl.js'])
            })
            .state('newhope.importTable', { //历史数据导入
                url: '/importTable',
                templateUrl: 'views/system/nh_importTable.html',
                data: {title: '历史数据导入', icons: 'fa-cog'},
                resolve: load(['angularFileUpload','scripts/controllers/system/nh_importTable.js'])
            })
            .state('newhope.importOrgTable', { //机构年卡导入
                url: '/importOrgTable',
                templateUrl: 'views/system/nh_importOrgTable.html',
                data: {title: '机构/年卡导入', icons: 'fa-cog'},
                resolve: load(['angularFileUpload','scripts/controllers/system/nh_importTable.js'])
            });

        // .state('newhope.empinfo', {
        // 	url: '/empinfo',
        // 	controller:'EmpinfoCtrl',
        // 	templateUrl: 'views/basic_info/nh_empinfo.html',
        // 	resolve: load(['mgcrea.ngStrap','ui.bootstrap','angular/scripts/controllers/nh_empinfo.js'])
        // })


        function load(srcs, callback) {
            return {
                deps: ['$ocLazyLoad', '$q',
                    function ($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        var promise = false;
                        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                        if (!promise) {
                            promise = deferred.promise;
                        }
                        angular.forEach(srcs, function (src) {
                            promise = promise.then(function () {
                                angular.forEach(MODULE_CONFIG, function (module) {
                                    if (module.name == src) {
                                        src = module.module ? module.name : module.files;
                                    }
                                });
                                return $ocLazyLoad.load(src);
                            });
                        });
                        deferred.resolve();
                        return callback ? promise.then(function () {
                            return callback();
                        }) : promise;
                    }
                ]
            }
        }
    }
})();