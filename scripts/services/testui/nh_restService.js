/**
 * @ngdoc Service
 * @name nh_restService
 *
 * 远程请求服务
 */
(function () {
    'use strict';

    angular
        .module('newhope')
        .factory('restService', restService);

    restService.$inject = ['$rootScope', 'Restangular', '$state'];

	function restService($rootScope, Restangular, $state) {
		// 列表默认请求参数
		var tbDefParams = {
			pageNum: "1",
  			pageSize: "10"
		};
		// 地址默认请求参数
		var addrDefParams = {
			typeCode: '1001',
			parent: '-1'
		};
		// 请求头部设置
		// var headers = {'dh-token': '-1'};
		var headers = { appCode: 'dhxt' };
		//var baseUrl = 'http://' + window.location.host + '/hdms/b-service/api/v1';
        // var baseUrl = 'http://' + window.location.host + '/master/NhryService/api/v1';
         // var baseUrl = 'http://' + window.location.host + '/d/NhryService/api/v1';
		// 从VERSION文件中获取远程访问环境
		var env = 'd-dev';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'VERSION', false);
		xhr.onload = function (e) {
			if(this.status == 200 || this.status == 304){
		        var resp = this.responseText;
		        var idx = resp.indexOf('e-');
                if (idx !== -1) {
                    var newEnv = resp.slice(idx + 2).trim();
                    if (newEnv) {
                        env = newEnv;
                    }
                }
		    }
		}
		xhr.send(null);
		var baseUrl = 'http://' + window.location.host + '/' + env + '/api/v1';
		// 从VERSION文件中获取远程访问环境end

		var rest = Restangular.withConfig(function (configurer) {
			configurer.setBaseUrl(baseUrl);
			if (window.location.host == 'localhost') {
				headers['nh-flag'] = 'true';
			}
			configurer.setDefaultHeaders(headers);
			// configurer.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
			// 	//console.log('rest'+response);
			// 	if (response.status=='200') {
			// 		window.location.href = 'http://54.222.169.214:8070/idm/auth';
			// 	}
			// 	return data;
			// });
			configurer.setErrorInterceptor(function (response, deferred, responseHandler) {
				////console.log(response);
				if (response.data && response.data.type == 'session_expire') {
					window.location.href = response.data.data;
					// return false;
					return;
				}
				if (response.status == '401') {
					// response.data.msg += '： 登录信息已过期，请重新登录！';
					// $state.go('login');
					// return false;
					// $state.go('initpage');
                    if (window.location.pathname === '/front/' || window.location.host === 'localhost') {
                        $state.go('login');
                    } else {
                       $state.go('login');
                    }
					return;
				}
				return true;
			})
			configurer.addRequestInterceptor(function (element, operation, what, url) {
				if (headers['dh-token'] && headers['appKey']) {
                    // var ts;
                    // if (env === 'b-service') {
                    //     ts = moment().utcOffset(8);
                    // } else {
                    //     ts = moment.utc();
                    // }
					// headers['timestamp'] = ts.format('YYYYMMDDHHmmss');
					// headers['dh-token'] = $rootScope.access.hashedToken('dhxt', headers['appKey'], ts);
                    var ts;
                    xhr.open('GET', baseUrl + '/dic/sys/date', false);
                    xhr.onload = function (e) {
                        if(this.status == 200 || this.status == 304){
                            ts = JSON.parse(this.responseText).data;
                        }
                    }
                    xhr.send(null);
                    if (ts) {
                        headers['timestamp'] = ts;
                        headers['dh-token'] = $rootScope.access.hashedToken('dhxt', headers['appKey'], ts);
                    }
                    
				}
				return element;
			})
			
        })

        var branch = rest.all('branch');//网点客户信息(奶站)信息
        var dic = rest.all('dic');//字典信息
        var emp = rest.all('emp');//网点员工信息
        var order = rest.all('order');//订单信息
        var milkbox = rest.all('milkbox');//送奶管理
        var deliverMilk = rest.all('deliverMilk');//送奶管理
        var prod = rest.all('product');//产品信息
        var residentialArea = rest.all('residentialArea');//配送区域
        var price = rest.all('price');//价格
        var branchScope = rest.all('branchScope');//删除配送区域
        var consumer = rest.all('vipcust'); // 订户信息接口
        var milkTrans = rest.all('milkTrans'); // 送奶管理信息接口
        var user = rest.all('user'); // 用户信息
        var group = rest.all('user/group'); // 用户信息
        var role = rest.all('role'); // 角色信息
        var res = rest.all('res'); // 资源信息
        var bill = rest.all('bill');//结算管理
        var promotion = rest.all('promotion');//促销
        var dealer = rest.all('dealer');
        var statistics = rest.all('statistics'); //统计查询
        var mess = rest.all('mess'); //站内通知
        var stock = rest.all('stock');//库存管理
        var report = rest.all('report');//下载
        var pi = rest.all('pi');//手工同步主数据
        var operationLog = rest.all('operationLog');//日志信息维护
        var orderOrg = rest.all('orderOrg');//机构信息\
        
        var studentMilk = rest.all('studentMilk');//学生奶
        var studentMilkOrder = rest.all('studentMilk').all('order');//学生奶订奶管理
        
        return {
            // test: function () {
            // 	return rest.one('dic', 'allTypeCodes').get();
            // },
            randomCode: function () {
                return studentMilkOrder.one('randomCode').get({r:Math.random()});
            },
            getBaseUrl: function () {
                return baseUrl;
            },
            setDefHeader: function (key, val) {
                // var head = {};
                headers[key] = val;
                // rest.setDefaultHeaders(head);
            },
            getDefHeaders: function () {
                return headers;
            },
            /**
             * [dic 字典信息]
             *
             */
            dicItem: function (typeCode, itemCode) {
                return dic.all('find/codeitem').post({
                    typeCode: typeCode,
                    itemCode: itemCode
                });
            },
            saleORGs: function () {
                return dic.one('items', 1002).customPOST();
            },
            address: function (itemCode) {
                return dic.one('find', 'child').all('items').post({
                    typeCode: '1001',
                    parent: itemCode
                });
            },
            // 根据类型编码查找字典代码
            codeMap: function (typeCode) {
                return dic.one('items', typeCode).customPOST();
            },
            // 增量同步idm订户系统用户
            syncIDMUser: function () {
                return dic.one('sync', 'users').all('upt').post();
            },
            // 获取服务器系统时间
            getSysDate: function () {
                return dic.one('sys', 'date').get();
            },
            /**
             * [operationLog 日志信息]
             *
             */
            // 获取订户日志信息
            getCustOperationLog: function (params) {
                return operationLog.one('getCustOperationLog').post('', params);
            },
            // 获取订户日志信息
            getOrderOperationLog: function (params) {
                return operationLog.one('getOrderOperationLog').post('', params);
            },
            // 获取订户日志信息
            getPlanOperationLog: function (params) {
                return operationLog.one('getPlanOperationLog').post('', params);
            },
            // 获取订户日志信息
            getRouteOperationLog: function (params) {
                return operationLog.one('getRouteOperationLog').post('', params);
            },
            /**
             * [branch 网点客户信息(奶站)信息]
             *
             */
             addBranch : function(params){
                return branch.all('add').post(params);
             },
            branchs: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return branch.all('list').post(reqParams);
            },
            getBranchList: function () {
                return branch.one('searchBySalesOrg').get();
            },
            //根据销售组织查询网点客户信息列表
            branchSearch: function () {
                return branch.one('searchBySalesOrg').get();
            },
            // 根据奶站类型查询
            getBranchByType: function (type) {
                return rest.one('branch', 'getInfoByType').get({type: type});
            },
            //获取奶站信息
            getBranchInfo: function (params) {
                return branch.one('getBranchInfo', params).get();
            },
            //获取当前登录人所属奶站信息
            getCustBranchInfo: function () {
                return branch.one('getCustBranchInfo').get();
            },
            // 根据经销商类型查询奶站
            getBranchByDealer: function (dealerNo) {
                return branch.one('find', dealerNo).customPOST();
            },
            getBranchByBussiness: function (params) {
                return branch.all('getBranchByBussiness').post(params);
            },
            // 获取所属奶站的扩展信息
            getBranchExByNo: function (branchNo) {
                return branch.one('getBranchEx', branchNo).get();
            },
            // 更新网点客户(奶站)成品中心属性
            uptKostl: function (params) {
                return branch.all('uptKostl').post(params);
            },
            // 更新奶站是否上线
            uptValidBranch: function (params) {
                return branch.all('uptValidBranch').post(params);
            },
            //内部销售订单售达方更新
            uptTargetBranch:function(params){
                return branch.all('uptTargetBranch').post(params);
            },
            //更新奶站账户
            uptBankBranch:function(params){
                return branch.all('uptBankBranch').post(params);
            },

            /**
             * [dealer 经销商信息]
             *
             */
            getDealerBySalesOrg: function () {
                return dealer.one('getDealerBySalesOrg').get();
            },
            //根据权限内经销商
            getDealerOnAuth: function () {
                return dealer.one('getDealerOnAuth').get();
            },

            /**
             * [emp 网点员工信息]
             *
             */
            // 获取站内通知列表(本地数据)
            messagelist: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return emp.all('search').post(reqParams);
            },
            emplist: function (params) {

                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return emp.all('search').post(reqParams);
            },
            empitem: function (empNo) {
                return emp.get(empNo);
            },
            getAllEmpBySalesOrg: function () {
                return emp.one('getAllEmpBySalesOrg').get();
            },
            //保存员工结算方式信息
            saveEmpSalarymet: function (params) {
                return emp.all('upt').post(params);
            },
            /**
             * [order 订单信息]
             *
             */
            //根据订单号查询出续订的订单列表
            selectOrderByResumeOrderNo:function(params){
                return order.all('selectOrderByResumeOrderNo').post(params);
            },
            
            //订单停订后的续订订单导出
            stopOrderAfterExport:function(params){
                return order.all('stopOrderAfterExport').post(params);
            },
            
            //电商订单换奶站
            replaceOrderBranch:function(params){
                return order.all('replaceOrderBranch').post(params);
            },
            orders: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('search').post(reqParams);
            },
            //机构内勤撤回订单(奶站确认之前)
            cancelOrderRequire: function (params) {
                return order.all('cancelOrderRequire').post(params);
            },
            searchOrderWithConsumer: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('searchOrderWithConsumer').post(reqParams);
            },
            searchOrderWithConsumerExport: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('searchOrderWithConsumerExport').post(reqParams);
            },
            // 按电话号码批量查询订单
            searchOrderByMp: function (params) {
                return order.all('searchOrderByMp').post(params);
            },
            selectLatestOrder: function (params) {//查询该订户上一张订单
                return order.one('selectLatestOrder', params).get()
            },
            manHandleOrders: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('manHandSearch').post(reqParams);
            },
            manHandleDo: function (params) {
                return order.all('uptManHandOrder').post(params);
            },
            cancelOrder: function (params) {
                return order.all('backOrder').post(params);
            },
            advanceBackOrder: function (params) { //提前退订订单
                return order.all('advanceBackOrder').post(params);
            },
            yearCardBackOrder: function (params) { //年卡订单退订
                return order.all('yearCardBackOrder').post(params);
            },
            advanceYearCardBackOrder: function (params) { //年卡提前退订订单
                return order.all('advanceYearCardBackOrder').post(params);
            },
            orderDetail: function (params) {
                //console.log(params);
                return order.one(params).get();
            },
            returnOrder: function (params) {//退回订单
                //console.log(params);
                return order.all('returnOrder').post(params);
            },
            orderConfirm: function (params) {//确认订单
                //console.log(params);
                return order.all('orderConfirm').post(params);
            },
            batchOrderConfirm: function (params) {//奶站批量确认订单
                return order.all('batchOrderConfirm').post(params);
            },
            batchOrderConfirmUnOnline: function (params) {//奶站批量确认订单
                return order.all('batchOrderConfirmUnOnline').post(params);
            },
            uptOrderStatus: function (params) {
                //console.log(params);
                return order.all('uptOrderStatus').post(params);
            },
            toCreateOrder: function (params) {
                //console.log(params);
                return order.all('create').post(params);
            },
            toCreateFreeOrder: function (params) {
                //console.log(params);
                return order.all('createFree').post(params);
            },
            toViewOrderPlans: function (params) {//预览日计划
                //console.log(params);
                return order.all('viewDaliyPlans').post(params);
            },
             noResumeOrder: function (params) {//订单不参与续订
                //console.log(params);
                return order.all('orderNoResume').post(params);
            },
            resumeOrder: function (params) {//订单续订
                //console.log(params);
                return order.all('continueOrder').post(params);
            },
            stopOrder: function (params) {//订单停订
                //console.log(params);
                return order.all('stopOrder').post(params);
            },
            backOrder: function (params) {//订单退订
                //console.log(params);
                return order.all('backOrder').post(params);
            },
            resumeOrderFromStop: function (params) {//订单复订
                //console.log(params);
                return order.all('resumeFromStop').post(params);
            },
            toEditOrderLong: function (params) {//订单修改长期
                //console.log(params);
                return order.all('uptlong').post(params);
            },
            toEditOrderLongForView: function (params) {//订单修改长期,看日计划
                //console.log(params);
                return order.all('editOrderForLongForViewPlans').post(params);
            },

             uptOrderlongForViewPlans: function (params) {//订单修改长期,看日计划
                //console.log(params);
                return order.all('uptOrderlongForViewPlans').post(params);
            },
            
            getAllEmpByBranchNo: function (params) {//奶站下员工
                //console.log(params);
                return emp.one('getAllEmpByBranchNo').get({branchNo: params});
            },
            getAllMilkmanByBranchNo: function (params, type) {//奶站下送奶员
                var reqparams = {branchNo: params, type: type};
                return emp.all('getAllBranchEmpByNo').post(reqparams);
            },
            getPromotionByMatnr: function (params) {//该产品的促销
                //console.log(params);
                return promotion.one('product', params).get();
            },
            getPromotionList: function (params) {//促销列表
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return promotion.all('searchPromotionsByPage').post(reqParams);
            },


             searchPromoByPage: function (params) {//促销列表
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return promotion.all('searchPromoByPage').post(reqParams);
            },

             // 获取当前销售组织下的所有促销信息
            selectPromsBySelesOrg: function () {
                return promotion.one('selectPromsBySelesOrg').get();
            },

            // 查询促销信息
            selectProCreatOrder: function (params) {
                return promotion.one('selectProCreatOrder').post('', params);
            },
            // 添加促销信息
            addPromotion: function (params) {
                return promotion.all('addPromtion').post(params);
            },
            // 根据促销编号获取促销信息详情
            searchPromoDetailByNo: function (params) {

                return promotion.one('searchPromoDetailByNo',params).get();
            },
            //获取促销信息下的奶站列表
            getBranchsByPromNo: function (params) {
                 return promotion.all('getBranchsByPromNo').post(params);
            },

              //获取促销信息编号 和 奶站编号列表判断该促销是否已经存在订单
            promotionHasOrder: function (params) {
                 return promotion.all('promotionHasOrder').post(params);
            },

            //促销信息关联奶站
            relBranchByPromNo: function (params) {
                return promotion.all('relBranchByPromNo').post(params);
            },


              // 根据促销编号删除促销信息
            deleteProm: function (params) {
                 return promotion.one('delPromotion',params).get();
            },

            // 查询年卡促销信息
            selYearCardPromCreatOrder: function () {
                return promotion.one('selYearCardPromCreatOrder').post('', {});
            },
            calculateAmtAndEndDate: function (params) {//该产品行计算显示,先付款
                //console.log(params);
                return order.all('calculateAmtAndEndDateForFront').post(params);
            },
            calculateQtyAndAmt: function (params) {//该产品行计算显示,后付款
                //console.log(params);
                return order.all('calculateQtyAndAmtForFront').post(params);
            },
            calculateContinueOrder: function (params) {//续订时计算截止日期和开始日期和续费
                //console.log(params);
                return order.all('calculateContinueOrder').post(params);
            },
            queryCollectByOrderNo: function (param) {
                return order.one('queryCollectByOrderNo').get({"orderCode": param});
            },
            //该组织下还有5天就到期没续订的订单
            selectStopOrderNum: function (params) {
                return order.one('selectStopOrderNum').get();
            },
            //该组织下待确认的订单
            selectRequiredOrderNum: function (params) {
                return order.one('selectRequiredOrderNum').get();
            },
            //需要续订的订单，3天内
            needResumeOrders: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('searchNeedResumeOrders').post(reqParams);
            },
            //导出需要续订的订单  liuyin
            exportNeedResumeOrders: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('exportNeedResumeOrders').post(reqParams);
            },
             //农行打款    liuyin add
            Cash_account: function (params) {
                return statistics.all('Cash_account').post(params);
            },
            // LIU YIN ADD  END
            // 按电话号码批量查询需要续订的订单
            searchReNeedOrdersByMp: function (params) {
                return order.all('searchReNeedOrdersByMp').post(params);
            },
            //送奶员订单替换
            updateOrderEmp: function (params) {
                return order.all('updateOrderEmp').post(params);
            },
             selectUnfinishOrderNum: function (param) {
                return order.one('selectUnfinishOrderNum').get({"vipCustNo":param});
            },
            searchReturnOrdersNum:function(){
                return order.one('searchReturnOrdersNum').get();
            },
            // 订单生成日计划
            createDaliyPlansForIniOrders: function (orderno) {
                return order.one('createDaliyPlansForIniOrders', orderno).get();
            },
            // 搜索待确认订单上线奶站的订单
            searchPendingConfirmOnline: function (params) {
                return order.one('searchPendingConfirmOnline').post('', params);
            },
            // 搜索待确认订单未上线奶站的订单
            searchPendingConfirmUnOnline: function (params) {
                return order.one('searchPendingConfirmUnOnline').post('', params);
            },
            // 确认待确认订单未上线奶站的订单
            orderConfirmUnOnline: function (params) {
                return order.one('orderConfirmUnOnline').post('', params);
            },
            // 执行退回订单操作
            backUnBranchOrder: function (params) {
                return order.one('backUnBranchOrder').post('', params);
            },
            // 修改促销配送时间
            uptDispDateProm: function (params) {
                return order.one('uptDispDateProm').post('', params);
            },
            /**
             * [milkbox 送奶管理]
             *
             */
            getRouteList: function (params) {//路单列表
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return deliverMilk.all('search').post(reqParams);
            },
            getRouteDetails: function (params) {//路单详细的信息
                return deliverMilk.one(params).get();
            },
            getRouteDetailList: function (params) {//路单详细的列表
                return deliverMilk.one('searchDetails', params).get();
            },
            updateRouteStatus: function (params) {//更新路单状态
                return deliverMilk.all('uptRouteOrder').post(params);
            },
            saveRouteList: function (params) {//更新路单状态
                return deliverMilk.all('uptRouteOrderDetailList').post(params);
            },
            updateDaliyPlansByRoute: function (params) {//路单详细确认按钮，更新日计划
                return deliverMilk.one('changeDaliyPlans', params).get();
            },
            reEditRouteDetail:function (params) {//更新路单再次修改
                return deliverMilk.all('reEditRouteDetail').post(params);
            },
            searchChangeOrder: function (params) {//变化路单
                return deliverMilk.one('searchRouteChangeOrder', params).get();
            },
            createRouteOrder: function (params) {//生成路单
                return deliverMilk.one('createRouteOrders',params).get();
            },
            deleteRouteOrders: function (params) {//生成路单
                return deliverMilk.one('deleteRouteOrders',params).get();
            },
            createTemRouteOrders: function (params) {//生成临时路单
                return deliverMilk.all('createTemRouteOrders').post(params);
            },
            getDaliyPlans: function (params) {//送奶计划日计划
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return order.all('daliyPlansByPage').post(reqParams);
            },
            daliyBackAmt: function (params) {//送奶计划日计划退款
                return order.all('daliyBackAmt').post(params);
            },

            saveDaliyPlans: function (params) {//送奶计划日计划
                return order.all('uptshort').post(params);
            },
            recoverDaliyPlans: function (params) {//恢复日计划
                return order.all('recoverDaliyPlan').post(params);
            },
            milkboxes: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return milkbox.all('search').post(reqParams);
            },
            milkboxPlan: function (params) {
                //console.log(params);
                return milkbox.one(params).get();
            },
            saveMilkboxPlan: function (params) {
                //console.log(params.planNo + params.planDate + params.milkboxStat);
                return milkbox.all('upt').post({
                    code: params.planNo,
                    setDate: params.planDate,
                    status: params.milkboxStat,
                    entries: params.entries
                });
            },
            milkboxBatchEditStatus: function (params) {
                return milkbox.all('uptByList').post(params);
            },
            allStopOrders: function (params) {//批量停订订单
                //console.log(params);
                return order.all('batchStopOrder').post(params);
            },
            allContinueOrders: function (params) {//批量续订自动订单
                //console.log(params);
                return order.all('batchContinueOrder').post(params);
            },
            stopOrderInTime: function (params) {//区间停订订单
                //console.log(params);
                return order.all('stopOrderInTime').post(params);
            },
            //首页，未装箱总数
            selectMilkboxsCount:function(){
                return milkbox.one('selectMilkboxsCount').post();
            },
            //订单维护end
            /**
             * [product 产品信息]
             *
             */
            products: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return prod.all('search').post(reqParams);
            },
            productset: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return prod.all('searchSting').post(reqParams);
            },
            getCanSellProducts: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
               
                return prod.all('sell').all('lists').post(reqParams);
            },
            
            updateSort: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return prod.all('updateSort').post(reqParams);
            },
            
            listsBySalesOrg: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return prod.all('listsBySalesOrg').post(reqParams);
            },
            //根据价格编号查询当前组织下未被选择的商品列表
            getProList: function (params) {
                return prod.one('lists', params).post();
            },
            productItem: function (prodNo) {
                return rest.one('product', prodNo).customPOST();
            },
            // 更新商品信息
            updateProductItem: function (params) {
                return prod.all('upt').post(params);
            },
            // 修改商品状态
            uptProductStatus: function (status, prodNo) {
                return prod.one('change', 'status').one(status, prodNo).customPOST();
            },
            //获取奶站可销售的产品清单列表
            branchCellList:function(){
                 return prod.one('branch', 'sell').one('lists').customPOST();
            },
            /**
             * [residentialArea branchScope 小区信息（配送区域）]
             *
             */
            //保更新小区信息
            saveAreaUpt: function (params) {
                return residentialArea.all('upt').post(params);
            },
            //根据小区编号获取配送区域(小区)列表
            getAreaById: function (params) {
                return residentialArea.one('getAreaById', params).get();
            },
            //根据奶站编号查询其分配区域
            getAreaByBranchNo: function (params) {
                return residentialArea.one('getAreaByBranchNo', params).get();
            },
            //根据省份、城市、状态查询小区(配送区域)信息列表
            getAreaList: function (params) {
                return residentialArea.all('list').post(params);
            },
            //获取权限下的获取小区(配送区域)列表
            searchAreaBySalesOrg: function (params) {
                return residentialArea.all('searchAreaBySalesOrg').post(params);
            },

             //获取当前销售组织下的获取小区(配送区域)列表
            searchSalesOrgArea: function (params) {
                return residentialArea.all('searchSalesOrgArea').post(params);
            },
            //获取该公司下卫分配小区信息
            getUnDistAreas: function () {
                return residentialArea.all('getUnDistAreas').post();
            },
            //小区信息关联奶站
            relBranch: function (params) {
                return residentialArea.all('relBranch').post(params);
            },
            //添加小区信息到奶站（给奶站添加配送区域）
            addArea: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return residentialArea.all('add').post(params);
            },
            //根据奶站编号获取配送信息带分页
            searchAreaByBranchNo: function (params) {
                return residentialArea.all('searchAreaByBranchNo').post(params);
            },
            //删除小区信息，并删除小区和奶站的关系表
            deleteAreaById: function (params) {
                return residentialArea.one('deleteAreaById', params).get();
            },
            //删除奶站下的配送区域
            delBranchScope: function (params1, params2) {
                return branchScope.all('deleteByBranchNo').one(params1, params2).get();
            },
            /**
             * [price 价格信息]
             *
             */
            //初始化机构价格
            orgPrice:function(params){
                 return price.one('orgPrice',params).post();
            },
            //机构下价格列表
            selectOrgPriceList:function(params){
                return price.all('selectOrgPriceList').customPOST(params);
            },
            //机构下商品价格列表分页
            selectOrgPricePage:function(params){
                return price.all('selectOrgPricePage').customPOST(params);
            },
            //机构下商品价格列表分页-根据订单创建日期带出老价格
            selectOrgPriceListOldPrice:function(params){
                return price.all('selectOrgPriceListOldPrice').customPOST(params);
            },
            //更新机构价格
            upOrgPrice:function(params){
                 return price.all('upOrgPrice').post(params);
             },
            //批量更新机构价格
            upOrgPriceList:function(params){
                return price.all('upOrgPriceList').post(params);
            },
            //年卡下价格列表
            selectYearcardPriceList:function(params){
                return price.all('search').all('yearcardPrice').customPOST(params);
            },
            //批量更新年卡价格
            upYearcardPriceList:function(params){
                return price.all('upt').all('yearcardPrices').post(params);
            },
            //更新年卡价格
            upYearcardPrice:function(params){
                return price.all('add').all('yearcardPrice').post(params);
             },
            //年卡价格-根据商品编码查
            getMatnrYearcardPrice:function(params){
                return price.all('search').one('yearcardPrice',params).post();
            }, 
            //年卡可销售的商品
            getYearcardCanSellProducts: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
               
                return price.all('sell').all('yearcard').post(reqParams);
            },  
            //年卡下商品价格列表分页-根据订单创建日期带出老价格
            selectYearcardPriceAndOldPrice:function(params){
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return price.all('search').all("yearcardPrice").all("oldPrice").customPOST(reqParams);
            }, 
            //机构商品价格-根据商品编号查
            selectOrgPriceByMatnr:function(params){
                return price.all('selectOrgPriceByMatnr').post(params);
            },
            //机构商品列表
            selectOrgPriceMatnrList:function(params){
                return price.all('selectOrgPriceMatnrList').post(params);
            },
            //根据奶站编号(branchNo)和价格组编号(id)删除价格组与奶站关系
            delPriceBranch: function (branchNo, id) {
                // return price.one('del/price/branch', branchNo + '/' + id).post();
                return price.all('del').one('price', 'branch').one(branchNo, id).post();
            },
            //添加价格组与奶站关系
            addPriceBranch: function (params) {
                // return price.one('add/price/branch').customPOST(params);
                return price.all('add').one('price', 'branch').customPOST(params);
            },
            //增加价格组
            addPrice: function (params) {
                return price.one('add', 'price').customPOST(params);
            },
            //根据奶站编号获取当前销售组织下该奶站已经选择的价格组列表
            getBranchPriceList: function (params) {
                return price.one('lists', params).post();
            },
            //根据奶站编号获取当前销售组织下该奶站适用范围内的价格组列表
            getAreaPriceList: function (params) {
                // return price.one('scope/lists', params).post();
                return price.all('scope').one('lists', params).post();
            },
            //停用价格组
            priceDisable: function (params) {
                return price.one('disable', params).post();
            },
            //根据价格组编号获取价格组关联的商品列表(带分页)
            getPriceProList: function (id, pageNum, pageSize) {
                // return price.one('maras', id + "/" + pageNum + "/" + pageSize).post();
                return price.one('maras', id).all(pageNum).all(pageSize).post();
            },
            getProductPrice: function (branchNo, matnr, type) {
                return price.one(branchNo, matnr).one(type).customPOST();
            },
            //获取价格组信息
            getPriceList: function (params) {
                //console.log(params)
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return price.all('search').post(reqParams);
            },
            //查询价格组基本信息
            priceView: function (params) {
                return price.one(params, 'edit').post();
            },
            //获取当前登录人所在公司下面的所有经销商
            priceDealers: function () {
                return price.all('dealers').post();
            },
            //编辑价格组信息
            savePriceUpt: function (params) {
                return price.all('upt').all('price').post(params);
            },
            //根据价格组编号查询信息(priceType：10 区域价;20 销售渠道价;30 奶站价)
            getpriceGroupCode: function (params) {
                return rest.one('price').post(params);
            },
            /**
             * [vipcust 订户信息]
             *
             */
            // 通过电话号码查询订户详情
            getCsmDetail: function (phone) {
                return rest.one('vipcust', phone).customPOST();
            },
            //订单维护
            getCustomerAddresses: function (params) {
                return consumer.one('find', 'cust').one('address', params).customPOST();
            },
            // 更新地址信息
            uptCustomerAddresses: function (params) {
                return consumer.one('upt', 'address').customPOST(params);
            },
            // 更新地址信息
            addCustomerAddresses: function (params) {
                return consumer.one('add', 'address').customPOST(params);
            },
            getCustomerRemainAmt: function (params) {
                return consumer.one('find', 'cust').one('acct', params).customPOST();
            },
            // 获取订户列表
            getCsmList: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return consumer.one('find', 'cust').customPOST(reqParams);
            },
            // 创建订单时获取机构订户列表
            getCsmListByOrg: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return consumer.one('find', 'custByOrg').customPOST(reqParams);
            },
            // 获取机构下的订户列表
            getOrgCsmList: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return consumer.one('find', 'orgCust').customPOST(reqParams);
            },
            // 获取非机构订户列表
            getCsmListWithoutOrg: function (params) {
                var reqParams = {};
                angular.extend(reqParams, tbDefParams, params);
                return consumer.one('find', 'custWithoutOrg').customPOST(reqParams);
            },
            // 新增订户
            addCsmItem: function (params) {
                return consumer.one('add', 'cust').customPOST(params);
            },
            // 更新订户
            uptCsmItem: function (params) {
                return consumer.one('upt', 'cust').customPOST(params);
            },
            //订户状态信息统计( 10-在订;20-暂停;30-停订;40-退订)
            vipcustStat: function (params) {
                return consumer.one('status', 'stat').customPOST();
            },
            //会员查询
            isVip: function (mp) {
                return consumer.all('crm').one('isVip', mp).customPOST();
            },
            // 为导入的订户生成会员号
            batchAddVipSapNo: function (no) {
                return consumer.one('batchAddVipSapNo', no).get();
            },
            findVipAcctByCustNo: function (custNo) {
                // return consumer.one('find/cust/acct', custNo).customPOST();
                return consumer.one('find', 'cust').one('acct', custNo).post();
            },
            /**
             * [requireOrder 要货计划]
             *
             */
            //统计奶站交货单数量
            sumGiOrder:function(params){
                return milkTrans.all('sumGiOrder').post(params);
            },
            //统计奶站销售订单数量
            sumSalOrder:function(params){
                 return milkTrans.all('sumSalOrder').post(params);
            },
            //发送送奶员销售订单
            batchSendSalOrderByDate:function(params){
                return milkTrans.all('batchSendSalOrderByDate').post(params);
            },
            //更新销售订单明细产品数量-送奶员报货
            updateSalOrderItems:function(params){
                return milkTrans.all('updateSalOrderItems').post(params);
            },
            //判断是否是送奶工报货
            isEmpSendMode:function(){
                return milkTrans.all('isEmpSendMode').post();
            },
            //查询要货计划信息
            getRequiredGoodsList: function (requiredDate) {
                return milkTrans.all('queryRequireOrder').post(
                    {"requiredDate": requiredDate}
                );
            },
            //生成当天的要货计划信息
            createRequiredGoodsList: function () {
                return milkTrans.all('creatRequireOrder').post();
            },
            //生成指定日期的要货计划信息
			createRequiredGoodsListByDate:function(param){
				return milkTrans.all('creatRequireOrderByDate').post({
					"requiredDate":param
				});
			},
            delRequireGoodsItem: function (orderNo, matnr) {
                return milkTrans.all('delRequireOrderItem').post(
                    {
                        "orderNo": orderNo,
                        "matnr": matnr
                    }
                );
            },
            //添加新的要货计划行
            addRequireGoodsItem: function (params) {

                return milkTrans.all('addRequireOrderItem').post(params);
            },
            //发送要货计划行
            sendRequireOrderToERP: function () {

                return milkTrans.one('sendRequireOrderToERP').post();
            },

            //模糊查询产品（输入产品名或者产品名称）
            getProductByCodeOrName: function (param) {
                return prod.one('getProductByCodeOrName').get(
                    {"product": param});
            },
            //更新生成的要货计划行
            updateNewItem: function (params) {
                return milkTrans.all('uptNewRequireOrderItem').post(params);
            },
            //更新新添加的要货计划行
            updateOldItem: function (params) {
                return milkTrans.all('uptRequireOrderItem').post(params);
            },
            //查询奶站下拒收复送产品信息
            getRefuseResendList: function (matnr,orderNo) {
                return milkTrans.one('queryRefuseResendByMatnr').one(matnr,orderNo).post();
            },
            //要货计划 确认使用拒收复送产品信息
            uptRequireOrderByResendItem: function (params) {
                return milkTrans.all('uptRequireOrderByResendItem').post(params);
            },
            //查询销售订单
            getSaleOrderByQueryDate: function (param) {
                // return milkTrans.all('salOrder/getSaleOrderByQueryDate').post(
                //     {"orderDate": param}
                // );
                return milkTrans.one('salOrder', 'getSaleOrderByQueryDate').customPOST({"orderDate": param});
            },

            //经销商奶站 创建 销售订单
            creaSalOrderOfDealerBranch: function (param) {
                return milkTrans.all('creaSalOrderOfDealerBranch').post();
            },

            //自营奶站 创建当天的销售订单
            creaSalOrderOfSelftBranch: function () {
                return milkTrans.all('creaSalOrderOfSelftBranch').post();
            },

            //自营奶站 创建指定日期的销售订单
            creaSalOrderOfSelftBranchByDate: function (param) {
                return milkTrans.all('creaSalOrderOfSelftBranchByDate').post({"orderDate":param});
            },

            //根据销售订单号获取详情
            getSaleOrderDetailByOrderNo: function (param) {
                // return milkTrans.one('salOrder/getSaleOrderDetailByOrderNo').get(
                //     {"orderNo": param});
                return milkTrans.one('salOrder', 'getSaleOrderDetailByOrderNo').get({"orderNo": param});
            },

            //回瓶管理
            getReturnBoxList: function (params) {
                return milkTrans.one('box', 'searchRetBoxPage').customPOST(params);
            },
            uptBoxRetrun: function (params) {
                return milkTrans.one('box', 'upt').customPOST(params);
            },
            //经销商内勤查询要货单信息
            getDealerReqGoods: function (params) {
                return milkTrans.one('search', 'dealer').post('', params);
            },
            //查询指定的要货计划
            queryRequireDealerOrder: function (orderNo) {
                return milkTrans.one('queryRequireOrder', orderNo).get();
            },
            //经销商内勤查询销售订单信息
            getDealerSalOrder: function (params) {
                return milkTrans.one('searchSalOrder', 'dealer').post('', params);
            },
            //经销商内勤发送销售订单到ERP
            batchSend2ERP: function (orderNos) {
                return milkTrans.one('batch', 'send').post('', orderNos);
            },
            /**
             * [bill 结算管理 信息]
             *
             */
            /*******订户结算*******/


            getCustSearch: function (params) {
                return bill.one('cust', 'search').customPOST(params);
            },
            getCustSearchForRecBill: function (params) {
                return bill.one('cust', 'searchForRecBill').customPOST(params);
            },
            getCustomerOrderDetialByCode: function (param) {
                return bill.one('cust', 'getCustomerOrderDetialByCode').get(
                    {"orderNo": param});
            },
            //退款
            custRefund: function (params) {
                // return bill.all('cust/custRefund').post(params);
                return bill.one('cust', 'custRefund').customPOST(params);
            },
            //收款
            customerPayment: function (params) {
                // return bill.all('cust/customerPayment').post(params);
                return bill.one('cust', 'customerPayment').customPOST(params);
            },
            //根据订单号 查看收款表
             delReceipt: function (param) {
                return bill.one('cust', 'delReceipt').get({"receiptNo":param});
            },
             //根据收款单号，删除收款单（状态为未冲销，并且只存在收款单，没有完成收款）
             getRecBillByOrderNo: function (param) {
                return bill.one('cust', 'getRecBillByOrderNo').get({"orderNo":param});
            },
              //选择收款人批量收款
            cacularTotalBeforBatch: function (params) {
                // return bill.all('cust/cacularTotalBeforBatch').post(params);
                return bill.one('cust', 'cacularTotalBeforBatch').customPOST(params);
            },
             //选择收款人批量收款
            custBatchCollect: function (params) {
                // return bill.all('cust/custBatchCollect').post(params);
                return bill.one('cust', 'custBatchCollect').customPOST(params);
            },
            //选择订单批量收款
            custBatchCollectBySelect: function (params) {
                // return bill.all('cust/custBatchCollectBySelect').post({"orders":params});
                return bill.one('cust', 'custBatchCollectBySelect').customPOST({"orders":params});
            },
            //批量删除收款单
            delRecBills: function (params) {
                // return bill.all('cust/delRecBills').post({"orders":params});
                return bill.one('cust', 'delRecBills').customPOST({"orders":params});
            },
            //设置奶站备注
            setBranchRemark: function (param) {
                //console.log(param);
                // return bill.all('cust/setBranchRemark').get(params);
                return bill.one('cust', 'setBranchRemark').get({"branchRemark": param});
            },
            //获取当前用户所属奶站
            getCurrentBranch: function () {
                // return bill.one('cust/getCurrentBranch').get();
                return bill.one('cust', 'getCurrentBranch').get();
            },
            createRecBillByOrderNo: function (param) {
                // return bill.one('cust/createRecBillByOrderNo').get({"orderNo": param});
                return bill.one('cust', 'createRecBillByOrderNo').get({"orderNo": param});
            },
              //订单冲销
            customerOffset: function (params) {
                // return bill.one('cust/customerOffset').get({"receiptNo":params});
                return bill.one('cust', 'customerOffset').get({"receiptNo":params});
            },
            paymentType: function (itemCode) {
                return dic.one('find', 'child').all('items').post({
                    typeCode: '1010',
                    parent: itemCode
                });
            },
            //首页,预付款未收总数
            selectOrdersNoBillCount:function(){
                return bill.one('selectOrdersNoBillCount').post();
            },
            /*******奶站结算*******/
            customerBranchBill: function (params) {
                // return bill.all('branch/customerBranchBill').post(params);
                return bill.one('branch', 'customerBranchBill').customPOST(params);
            },
            empBranchBill: function (params) {
                // return bill.all('branch/empBranchBill').post(params);
                return bill.one('branch', 'empBranchBill').customPOST(params);
            },
            getEmpBranchBillDetail: function (params) {
                // return bill.all('branch/getEmpBranchBillDetail').post(params);
                return bill.one('branch', 'getEmpBranchBillDetail').customPOST(params);
            },
            /**********送奶工结算************/
            searchEmpSalaryRep: function (params) {
                // return bill.all('emp/searchEmpSalaryRep').post(params);
                return bill.one('emp', 'searchEmpSalaryRep').customPOST(params);
            },
            getSalesOrgDispRate: function () {
                // return bill.all('emp/getSalesOrgDispRate').post();
                return bill.one('emp', 'getSalesOrgDispRate').post();
            },
            uptEmpDispRate: function (params) {
                // return bill.all('emp/uptEmpDispRate').post(params);
                return bill.one('emp', 'uptEmpDispRate').customPOST(params);
            },
            getEmpSalaryBySalaryNo: function (param) {
                // return bill.one('emp/getEmpSalaryBySalaryNo').get({"empSalLsh": param});
                return bill.one('emp', 'getEmpSalaryBySalaryNo').get({"empSalLsh": param});
            },
            setBranchEmpSalary: function () {
                // return bill.one('emp/setBranchEmpSalary').post();
                return bill.one('emp', 'setBranchEmpSalary').post();
            },
            setBranchEmpSalaryThisMonth: function () {
                // return bill.one('emp/setBranchEmpSalaryThisMonth').post();
                return bill.one('emp', 'setBranchEmpSalaryThisMonth').post();
            },

            /***************报表*********************/
            empDispDetialInfo: function (params) {
                // return bill.all('emp/empDispDetialInfo').post(params);
                return bill.one('emp', 'empDispDetialInfo').customPOST(params);
            },
            empAccountReceAmount: function (params) {
                // return bill.all('emp/empAccountReceAmount').post(params);
                return bill.one('emp', 'empAccountReceAmount').customPOST(params);
            },

            /**
             * [system 系统配置]
             *
             */
            //获取所有用户列表
            searchUserList: function (params) {
                return user.all('search').post(params);
            },
             //新增用户
            addUser: function (params) {
                return user.all('add').post(params);
            },
            //获取某角色下所有用户列表,带分页
            findUserByRole: function (params) {
                return user.all('findPageByRoleId').post(params);
            },
            //获取所有用户列表,无分页
            getNotRoleUser: function (params) {
                return user.all('findNotRoleUser').post(params);
            },
            //获取所有用户列表,无分页
            getAllUser: function (params) {
                return user.all('findByRoleId').post(params);
            },
            //更新用户
            updateUser: function (params) {
                return user.all('update').post(params);
            },
            // 用户登出
            userLogout: function (key) {
                return user.all('logout').post({}, {tk: key});
            },
            //根据销售组织获取经销商
            getDealersBySales: function (params) {
                return price.one('dealers', params).post();
            },

            //根据销售组织、经销商编号 获取奶站
            getBranchBySaleIdAndDealerId: function (saleId, dealerId) {
                // return branch.one('find', saleId + '/' + dealerId).post();
                return branch.all('find').one(saleId, dealerId).post();
            },
            //获取当前登录人
            getCurUser: function () {
                return user.one('current', 'logined').post();
            },
            

             //更新用户密码
            updatePass: function (params) {
                return user.all('updatePass').post(params);
            },
            //给单用户批量授角色
            assignUserRoles: function (params) {
                // return role.all('assign/user/roles').post(params);
                return role.one('assign', 'user').all('roles').post(params);
            },
            //给单用户批量删除角色
            deleteUserRoles: function (params) {
                // return role.all('delete/user/roles').post(params);
                return role.one('delete', 'user').all('roles').post(params);
            },
            //获取所有角色列表
            getRoleList: function () {
                return role.one('lists').post();
            },
            //获取所有资源列表
            getResList: function () {
                return res.one('lists').post();
            },
            //新增角色
            addRole: function (params) {
                return role.all('add').post(params);
            },
            //编辑角色
            updateRole: function (params) {
                return role.all('update').post(params);
            },
            //删除角色
            delRole: function (params) {
                return role.one('delete', params).post();
            },
            //详细资源信息
            getRes: function (params) {
                return res.one(params).post();
            },
            //新增资源信息
            addRes: function (params) {
                return res.all('add').post(params);
            },
            //编辑资源信息
            updateRes: function (params) {
                return res.all('update').post(params);
            },
            //删除资源信息
            delRes: function (params) {
                return res.one('delete', params).post();
            },
            //根据用户编码查询资源信息--权限列表信息
            findResNav: function (params) {
                return res.one('find', params).post();
            },
            //获取当前用户拥有组件资源信息列表
            getRoleRescpt: function () {
                return res.one('find', 'component').post();
            },
            //获取当前用户拥有页面资源信息列表
            getRoleRespage: function () {
                return res.one('find', 'pages').post();
            },
            //根据角色,查询所分配的资源
            searchResByRole: function (params) {
                ////console.log(params);
                return res.one(params).one('res', 'lists').post();
            },
            //指定角色下批量添加授权资源
            batchAddRoleRes: function (params) {
                // return role.all('add/batch/roleRes').post(params);
                return role.one('add', 'batch').all('roleRes').post(params);
            },
            //指定角色下批量删除授权资源
            batchDelRoleRes: function (params) {
                // return role.all('delete/batch/roleRes').post(params);
                return role.one('delete', 'batch').all('roleRes').post(params);
            },
            //获取所有group列表
            getAllGroup: function () {
                return group.one('find', 'all').post();
            },
            //批量生成UUID
            createUUID: function (count) {
                return res.one('createUUID').get({"count": count});
            },

            /**
             * [system 站内消息]
             *
             */
            // 根据类型编码查找字典代码
            messageTypes: function (typeCode) {
                return dic.one('items', typeCode).customPOST();
            },
            //获取指定ID的消息
            getMessage: function (params) {
                return rest.one('mess', params).customPOST();
            },
            //获取全部消息
            getAllMessage: function (params) {
                return mess.all('search').post(params);
            },
            //关闭指定ID的消息
            closeMessage: function (params) {
                return mess.one('close', params).customPOST();
            },

            /**
             * dist 统计查询
             * @auther gh
             */
            //路单配送名细
            findDifferInfo: function (params) {
                return statistics.all('findDifferInfo').post(params);
            },
            //日报表
            daybranchDayInfo: function (params) {
                return statistics.all('branchDayInfo').post(params);
            },
            //订单转化率T+3
            findOrderRatio: function (params) {
                ////console.log(params);
                return statistics.all('findOrderRatio').post(params);
            },
            //要货计划查询
            findReqOrder: function (params) {
                return statistics.all('findReqOrder').post(params);
            },
            //月任务报表查询
            findMonthReport: function (params) {
                return statistics.all('findMonthReport').post(params);
            },
            //换货差异明细查询
            findChangeplanStatReport: function (params) {
                return statistics.all('findChangeplanStatReport').post(params);
            },
            //回瓶汇总
            returnBoxStatReport: function (params) {
                return statistics.all('returnBoxStatReport').post(params);
            },
			//配送数量汇总-送奶员维度
			mstDispNumStat:function(params){
				return statistics.all('mstDispNumStat').post(params);
			},
			//配送数量汇总-奶站维度
			branchMstDispNumStat:function(params){
				return statistics.all('branchMstDispNumStat').post(params);
			},
			//奶站日配送数量汇总
			dayMstDispNumStat:function(params){
				return statistics.all('dayMstDispNumStat').post(params);
			},
            //公司部门、经销商日统计送奶份数
            branchDayRepo:function(params){
                return statistics.all('branchDayRepo').post(params);
            },
            //公司部门、经销商当日送奶份数 
            branchDayQty:function(params){
                return statistics.all('branchDayQty').post(params);
            },
            //拒收复送报表 
            refuse2receiveResend:function(params){
                return statistics.all('Refuse2receiveResend').post(params);
            },
            //拒收复送报表详情 
            refuse2receiveResendDetail:function(ordNo){
                return statistics.one('Refuse2receiveResendDetail', ordNo).post();
            },
            //查询公司奶站月任务计划
            findPlan:function(params){
                return rest.all('plan').all('findPlan').post(params);
            },
            exportTemplate:function(params){
                return rest.all('plan').all('exportTemplate').post(params);
            },
            //生成出奶表结余金额
            createOutMilk:function(params){
                 return statistics.all('createOutMilk').post(params);
            },
            //根据日期生成该奶站下送奶员以后日期的出奶表统计
            createAmtsByBranch:function(params){
                return statistics.all('createAmtsByBranch').post(params);
            },
            //查询奶站下送奶员初始化送奶表信息
            selectAmtInitList: function(){
                return statistics.all('selectAmtInitList').post();
            },
            //查询奶站下送奶员初始化送奶表信息
            updateAmtInit: function(params){
                return statistics.all('updateAmtInitByPrimaryKeySelective').post(params);
            },
            //要货计划日报表
            dayReportBasisForm:function(params){
                return statistics.all('dayReportBasisForm').post(params);
            },
            /**
             * stock 库存管理
             * @auther gh
             */
            findStockList: function (params) {
                return stock.all('findStock').post(params);
            },
            //查询-库存数量合计
            findStockTotal: function (params) {
                return stock.all('findStockTotal').post(params);
            },
            //查询-库存中剩余的产品数量生成销售订单
            findStockinsidesal: function (params) {
                return stock.all('findStockinsidesal').post(params);
            },
            //查询-库存中剩余的拒收复送
            findTmpStockinsidesal: function (params) {
                return stock.all('findTmpStockinsidesal').post(params);
            },
            //根据送奶员查询-库存中剩余的拒收复送
            findRefuseForInside: function (empNo) {
                return stock.one('findRefuseForInside', empNo).post();
            },
            getAllMilkmanByBranchNoList: function (params) {//奶站下员工信息
                return emp.all('getAllBranchEmpByNo').post(params);
            },
            updateStockToZero:function(){
                return stock.all('updateStockToZero').post();
            },
            //获取内部销售订单列表
            getstockInsideSalOrder: function (params) {
                return milkTrans.all('getInsideSalOrder').post(params);
            },
            //获取内部销售订单详情
            getstockInsideSalOrderDetail: function (params) {
                return milkTrans.all('getInsideSalOrderDetail').post(params);
            },
            //根据多余库存创建内部销售订单
            createInsideSalOrderByStock: function (params) {
                return milkTrans.all('createInsideSalOrderByStock').post(params);
            },
            //根据拒收复送创建内部销售订单
            createInsideSalOrderByTmpStock: function (params) {
                return milkTrans.all('createInsideSalOrderByTmpStock').post(params);
            },
            //生成交货单
            generateJHD: function (params) {
                return stock.all('generateJHD').post(params);
            },
            //奶站交货单列表
            findGiOrder: function (params) {
                return stock.all('findGiOrder').post(params);
            },
            //奶站交货单明细列表
            findGiOrderItem: function (params) {
                return stock.one('findGiOrderItem').post(params);
            },
            //更新奶站交货单明细列表-保存到库存
            updateGiOrderItems: function (params) {
                return stock.all('updateGiOrderItems').post(params);
            },
            //通过订单号生成要货单
            getJHDbyHands:function(params){
                return stock.one('getJHD',params).get();
            },
            /**
             *report 导出
             *
             */
             //模版导出
            exportTemp:function(filename){
                 return report.one('exportTemplate', filename).withHttpConfig({responseType: 'blob'}).get().then(function (resp) {
                        var doLink = document.createElement('a');
                        document.body.appendChild(doLink);
                        doLink.style.display = 'none';
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(resp);
                        doLink.href = fileURL;
                        doLink.download = filename+'.xlsx';
                        // doLink.click();
                        // var doLinkEvent = new MouseEvent('click');
                        // doLink.dispatchEvent(doLinkEvent);
                        var doLinkEvent = document.createEvent('MouseEvents');
                        doLinkEvent.initEvent('click', true, true);
                        doLink.dispatchEvent(doLinkEvent);
                        setTimeout(function(){
                            document.body.removeChild(doLink);  
                            (window.URL || window.webkitURL).revokeObjectURL(fileURL);
                        }, 200);
                    });
            },
            //行政区域信息下载
            exportAreasCode:function(params){
                return report.one('exportAreasCode',params).get();
            },
            //配送区域信息导出
            exportArea:function(params){
                return report.all('exportArea').customPOST(params);
            },
            //收款单到出
            reciveRMBexport: function (params) {
                return report.one('reportCollect').get({orderCode: params});
            },
            //获取条件下的订单编号
            searchForExp:function(params){
                // return bill.all('cust/searchForExp').post(params)
                return bill.one('cust', 'searchForExp').customPOST(params)
            },
            reportUrl: function () {
                 return 'http://' + window.location.host + '/'+env;
            },
            //上传月任务计划地址
            uploadattachment:function(){
                return baseUrl+'/plan/importPlans';
            },
            //上传小区信息地址
            uploadAreas:function(){
                return baseUrl+'/importTable/importResidentialArea';
            },
            //上传订户信息地址
            uploadVipCustInfos:function(){
                return baseUrl+'/importTable/importVipcustInfo';
            },
            //上传订单及行项目
            importPreorder:function(){
                 return baseUrl+'/importTable/importPreorder';
             },
            //上传奶站、小区关联表
            importLinks:function(){
                 return baseUrl+'/importTable/importLinks';
            },
             //上传机构订户信息地址
            importOrgVipcustInfo:function(){
                return baseUrl+'/importTable/importOrgVipcustInfo';
            },
            //上传机构订单及行项目
            importOrgPreorder:function(){
                 return baseUrl+'/importTable/importOrgPreorder';
             },
             //上传年卡订单及行项目
            importYearPreorder:function(){
                 return baseUrl+'/importTable/importYearPreorder';
            },
            //未确认订单导出
            pendingUnConfirmOnlineReport: function () {
                return report.one('pendingUnConfirmOnlineReport').post();
            },
            //路单导出
            reportDeliver: function (params) {
                return report.one('reportDeliver').get({orderCode: params});
            },
            //路单配送明细导出
            reportDispItem:function(params){
                return report.all('reportDispItem').customPOST(params);
            },
            //对账报表导出
            orderOnlineStatReport:function(params){
                return report.all('orderOnlineStatReport').post(params);
            },
            //奶站日计划明细导出
            reportOrderDaliyPlan:function(params){
                return report.all('reportOrderDaliyPlan').customPOST(params);
            },
            //年卡补偿导出
            reportyccExport:function(params){
                return report.all('yearCardCompensateList').customPOST(params);
            },
            //路单导出文件
            reportDeliverFile: function (filename) {
                return report.one('reportFile', filename).withHttpConfig({responseType: 'blob'}).get().then(function (resp) {
                        var doLink = document.createElement('a');
                        document.body.appendChild(doLink);
                        doLink.style.display = 'none';
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(resp);
                        doLink.href = fileURL;
                        doLink.download = filename;
                        // doLink.click();
                        // var doLinkEvent = new MouseEvent('click');
                        // doLink.dispatchEvent(doLinkEvent);
                        var doLinkEvent = document.createEvent('MouseEvents');
                        doLinkEvent.initEvent('click', true, true);
                        doLink.dispatchEvent(doLinkEvent);
                        setTimeout(function(){
                            document.body.removeChild(doLink);  
                            (window.URL || window.webkitURL).revokeObjectURL(fileURL);
                        }, 200);
                    });
            },
            //装箱单导出
            reportMilkBox: function (params) {
                return report.one('reportMilkBox', params).get();
            },
            //奶站日报表导出
            branchDayOutput: function (params) {
                return report.all('branchDayOutput').post(params);
            },
            //奶站月任务报表导出
            findMonthReportOutput: function (params) {
                return report.all('findMonthReportOutput').post(params);
            },
            //奶站订单转化率(T+3)报表导出
            findOrderRatioOupput: function (params) {
                return report.all('findOrderRatioOupput').post(params);
            },
            //根据日期,经销商,奶站编号生成要货计划导出
            findReqOrderOutput: function (params) {
                return report.all('findReqOrderOutput').post(params);
            },
            //分奶表导出
            exportOrderByModel:function(params){
            	console.debug(JSON.stringify(params));
                return report.all('exportOrderByModel').post(params);
            },
            //导出收款单--送奶员
            reportCollectByEmp:function(params){
                return report.all('reportCollectByEmp').post(params);
            },
            //收款单报表导出
            reportBatchCollectByEmp:function(params){
                return report.all('reportBatchCollectByEmp').post(params);
            },
            //台帐导出
            exportDispInlOrderByModel:function(params){
                return report.all('exportDispInlOrderByModel').post(params);
            },
            //要活计划导出
            exportQueryRequireOrder:function(requiredDate){
                return report.all('exportQueryRequireOrder').post(
                     {"requiredDate": requiredDate}
                    );
            },
            //回瓶汇总导出
            exportReturnBox:function(params){
                return report.all('exportReturnBox').post(params);
            },
            //要货计划日报表导出
            getDayReportBasisForm:function(params){
                return report.all('getDayReportBasisForm').post(params);
            },
            /**
             * pi
             * 手工同步主数据
             */
            //同步产品主数据
            getProducts:function(){
                return pi.one('getProducts').get();
            },
            //同步产品主数据(学生奶)
            getStudProducts:function(){
                return pi.one('getStudProducts').get();
            },
            //获取奶站经销商数据
            getCustomer:function(){
                return pi.one('getCustomer').get();
            },
            //获取学生奶数据
            getStudCustomer:function(){
                return pi.one('getStudCustomer').get();
            },
            //获取字典数据
            getZD:function(){
                return pi.one('getZD').get();
            },
            //查询送奶工投诉信息
            queryCustomerComplain:function(params){
                return pi.one('queryCustomerComplain').post('', params);
            },
            /**
             * orderOrg
             * 机构信息
             */
            //查询机构信息列表
            getOrginfoList:function(params){
                return orderOrg.one('findTMdOrderOrgList').post('', params);
            },
            //查询销售组织下所有机构
            getOrderOrgName: function () {
                return orderOrg.one('getOrderOrgName').get();
            },
            //查询机构详细信息
            getOrginfoDetail:function(orgID){
                return orderOrg.one('getOrderOrgByNo', orgID).get();
            },
            //更新机构信息
            uptOrderOrg:function(params){
                return orderOrg.one('uptOrderOrg').post('', params);
            },
            //添加机构信息
            addOrderOrg:function(params){
                return orderOrg.one('addOrderOrg').post('', params);
            },
            //删除机构订户关联关系
            deleteOrgCust: function (params) {
                return orderOrg.one('deleteOrgCust').post('', params);
            },
            //添加机构订户关联关系
            addOrgCust: function (params) {
                return orderOrg.one('addOrgCust').post('', params);
            },
            
            /**
             * 学生奶_订奶管理
             */
            //获取全部学校信息列表
            studOrderFindAllSchool:function(){
                 return studentMilkOrder.one('findAllSchool').customPOST({pageNum:1,pageSize:10000});
            },
            
            //分页获取订单列表
            studOrderFindOrderPage:function(params){
                 return studentMilkOrder.one('findOrderPage').customPOST(params);
            },
            
            //buildBatchInfo
            studOrderBuildBatchInfo:function(params){
                 return studentMilkOrder.one('buildBatchInfo').customPOST(params);
            },
            
            //createOrderWithBatch
            studOrderCreateOrderWithBatch:function(params){
                 return studentMilkOrder.one('createOrderWithBatch').customPOST(params);
            },
            
            //批量删除指定日期的订单
            studOrderDeleteOrderWithBatch:function(params){
                 return studentMilkOrder.one('deleteOrderWithBatch').customPOST(params);
            },
            
            //计算损耗calcLoss
            studOrderCalcLoss:function(params){
                 return studentMilkOrder.one('calcLoss').customPOST(params);
            },
            
            //导出EXCEl
            studOrderExportStudOrderMilk:function(params){
                 return studentMilkOrder.one('exportStudOrderMilk').customPOST(params);
            },
            
            //导出销售汇总报表EXCEl
            studOrderExportStudOrderMilkSum:function(params){
                 return studentMilkOrder.one('exportStudOrderMilkSum').customPOST(params);
            },
            
            //创建订单
            studOrderCreateOrder:function(params){
                 return studentMilkOrder.one('createOrder').customPOST(params);
            },
            studOrderCreateOrderUnpack:function(params){
                 return studentMilkOrder.one('createOrderUnpack').customPOST(params);
            },
            studOrderCreateOrderFill:function(params){
                 return studentMilkOrder.one('createOrderFill').customPOST(params);
            },
            
            //查询奶品列表
            studOrderFindMaraStudAllList:function(){
                 return studentMilkOrder.one('findMaraStudAllList').get();
            },
            
            //查询指定学校当前日期的奶品政策
            studOrderFindDefaultMaraForSchool:function(params){
                 return studentMilkOrder.one('findDefaultMaraForSchool').customPOST(params);
            },
            
            //根据学校，时间查询订单详情列表
            studOrderFindOrderInfoBySchoolCodeAndDate:function(params){
                 return studentMilkOrder.one('findOrderInfoBySchoolCodeAndDate').customPOST(params);
            },
            studOrderFindOrderInfoBySchoolCodeAndDateUnpack:function(params){
                 return studentMilkOrder.one('findOrderInfoBySchoolCodeAndDateUnpack').customPOST(params);
            },
            studOrderFindOrderInfoBySchoolCodeAndDateFill:function(params){
                 return studentMilkOrder.one('findOrderInfoBySchoolCodeAndDateFill').customPOST(params);
            },
            
            //根据订单ID获取订单、
            studOrderFindByOrderId:function(orderId){
                 return studentMilkOrder.all('findByOrderId').get(orderId);
            },
            
            
            /**
             * 学生奶
             * @param {Object} params
             */
            
            //查询出还未设置奶品政策的学校列表
            findAllSchoolWithOutSet:function(){
                 return studentMilk.all("schoolRule").all('findAllSchoolWithOutSet').post();
            },
            
            //获取学校
            findSchoolPage:function(params){
                 return studentMilk.all("school").all('findSchoolPage').post(params);
            },
            //更新学校
            uptSchool:function(params){
                 return studentMilk.all("school").all('upt').post(params);
            },
            //获取学校政策
             findSchoolrulePage:function(params){
                 return studentMilk.all("schoolRule").all('findSchoolPage').post(params);
            },
             saveschoolRule:function(params){
                 return studentMilk.all("schoolRule").all('uptSchoolRule').post(params);
            },
            //获取班级信息
             findClassListBySalesOrg:function(params){
                 return studentMilk.all("class").all('findClassListBySalesOrg').get("");
            },
            //保存班级基础信息
            addClassList:function(params){
            	return studentMilk.all("class").all('addClassList').post(params);
            },
            //通过学校获取班级信息
            findAllClassBySchool:function(params){
            	return studentMilk.all("schoolClass").all('findAllClassBySchool').post(params);
            },
            //查询学校还未关联的班级列表
            findNoneClassBySchool:function(params){
            	return studentMilk.all("schoolClass").all('findNoneClassBySchool').post(params);
            },
            //保存学校班级
             addSchoolClass:function(params){
            	return studentMilk.all("schoolClass").all('addSchoolClass').post(params);
            },
            //获取学校可销售的奶品
             findMaraStudAllList:function(){
            	return studentMilk.all("order").all('findMaraStudAllList').get("");
            },
            //通过学校和销售组织获取当前学校的所有的损耗政策
             findMaraRuleList:function(params){
            	return studentMilk.all("schoolMaraRule").all('findMaraRuleList').post(params);
            },
              findMaraRuleBaseByModel:function(params){
            	return studentMilk.all("schoolMaraRule").all('findMaraRuleBaseByModel').post(params);
            },
             maraRuleSave:function(params){
            	return studentMilk.all("schoolMaraRule").all('save').post(params);
            },
             findMaraStudAllPage:function(params){
            	return studentMilk.all("order").all('findMaraStudAllPage').post(params);
            },
             saveMaraStud:function(params){
            	return studentMilk.all("order").all('saveMaraStud').post(params);
            },
            
            generateSalesOrder18:function(){
            	return studentMilk.all("order").all('generateSalesOrder18').get("");
            }
            
        }
    }

})();