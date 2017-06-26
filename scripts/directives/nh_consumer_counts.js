(function() {
    'use strict';   
   angular
    .module('newhope')
    .directive('hello1', ['DemoBarChartOptionc', '$timeout', '$window','restService',
    function(DemoBarChartOptionc, $timeout, $window,rest) {
      return {
        scope: {},
        restrict: 'A',
        replace: true,
        template: '<div style="width:100%; height:100%;"></div>',
        link: function(scope, element, attrs) {

          var option = DemoBarChartOptionc.getDemoBarChartOption();

          var chart = echarts.init(element[0],'macarons');
          chart.setOption(option);
          loadChartData();


          // get data from server, use $timeout for demo
          function loadChartData() {
            chart.showLoading();
            $timeout(function() {
            var date1=moment(new Date()).format('YYYY-MM-DD');
            var date2=moment(date1).subtract(3, 'days').format('YYYY-MM-DD');
            var params={
                pageNum: 1,
                pageSize: 1
            }
            rest.findOrderRatio(params).then(function(json){
              var testData = {};
              var ratio="";
                if(json.data.list[0]!=undefined && json.data.total==1){
                  if(json.data.list[0].ratio!=undefined){
                          ratio = json.data.list[0].ratio+'%';
                  }else{
                        ratio = "";
                  }
                  testData = {
                    datacol: [date1, date2, '信息错误', '客户原因','超区订单','其他',ratio],
                    seriesData: [
                      {value:json.data.list[0].validQty,name:date1},
                      {value:json.data.list[0].initQty,name:date2},
                      {value:json.data.list[0].infoErrQty,name:'信息错误'},
                      {value:json.data.list[0].custQty,name:'客户原因'},
                      {value:json.data.list[0].superQty,name:'超区订单'},
                      {value:json.data.list[0].otherQty,name:'其他'}
                    ]
                  };                  
                }
                  chart.hideLoading();
                  updateChart(testData);
              })
            }, 30);
          }

          function updateChart(data) {
            if (angular.isDefined(option)) {
              option.legend.data = data.datacol;
              option.series[0].data = data.seriesData;
              chart.setOption(option, true);
            }
          }

          // resize chart on window size change
          angular.element($window).bind('resize', function() {
            $timeout(function() {
              if (chart) {
                chart.resize();
              }
            }, 300);
          });

        }
      };
    }
  ])
    .factory('DemoBarChartOptionc', [function() {
    return {
      getDemoBarChartOption: function() {
                var option = { 
                  title : {
                      text: 'T+3奶站订单转化率',
                      x:'center'
                  },
                  tooltip : {
                      trigger: 'item',
                      formatter: "{a} <br/>{b} : {c} ({d}%)"
                  },
                  legend: {
                      orient : 'vertical',
                      x : 'left',
                      data:['暂无数据']
                  },
                  toolbox: {
                      show : true,
                      feature : {
                          mark : {show: true},
                          magicType : {
                              show: true, 
                              type: ['pie', 'funnel'],
                              option: {
                                  funnel: {
                                      x: '25%',
                                      width: '50%',
                                      funnelAlign: 'left',
                                      max: 1548
                                  }
                              }
                          },
                          restore : {show: true},
                          saveAsImage : {show: true}
                      }
                  },
                  calculable : true,
                  series : [
                      {   name:'订奶数',
                          type:'pie',
                          radius : '70%',
                          center: ['50%', '60%'],
                          data:[]
                      }
                  ]
            };             
        return option;
      }
    };
  }]);
})();