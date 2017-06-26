(function() {
    'use strict';   
   angular
    .module('newhope')
    .directive('brday', ['BranchDayRepoOption', '$timeout', '$window','restService',
    function(BranchDayRepoOption, $timeout, $window,rest) {
      return {
        scope: {},
        restrict: 'A',
        replace: true,
        template: '<div style="width:100%; height:100%;"></div>',
        link: function(scope, element, attrs) {

          var option = BranchDayRepoOption.getDemoBarChartOption();

          var chart = echarts.init(element[0],'macarons');
          chart.setOption(option);
          loadChartData();


          // get data from server, use $timeout for demo
          function loadChartData() {
            chart.showLoading();
            $timeout(function() {
            var day = new Date();

            var date5 =moment(day).format('YYYY-MM-DD');
            var date4 =moment(day).subtract(1, 'days').format('YYYY-MM-DD');
            var date3 =moment(day).subtract(2, 'days').format('YYYY-MM-DD');
            var date2 =moment(day).subtract(3, 'days').format('YYYY-MM-DD');
            var date1 =moment(day).subtract(4, 'days').format('YYYY-MM-DD');
            var params={
                theDate: date5
            }
            rest.branchDayRepo(params).then(function(json){
              var testData = {};
              var ratio="";
                if(json.data[0]!=undefined ){
                  testData = {
                    datacol: [date5, date4, date3, date2,date1],
                    seriesData: [
                      {value:json.data[0].date5,name:date5},
                      {value:json.data[0].date4,name:date4},
                      {value:json.data[0].date3,name:date3},
                      {value:json.data[0].date2,name:date2},
                      {value:json.data[0].date1,name:date1},
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
              option.xAxis[0].data = data.datacol;
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
    .factory('BranchDayRepoOption', [function() {
    return {
      getDemoBarChartOption: function() {
                var option = { 
                	title: {
			        text: '日报表',
			        subtext: '送奶数量统计'
			    },
			    tooltip: {
			        trigger: 'item'
			    },
			    toolbox: {
			        show: true,
			        feature: {
			            restore: {show: true},
			            saveAsImage: {show: true}
			        }
			    },
			    calculable: true,
			    grid: {
			        borderWidth: 0,
			        y: 80,
			        y2: 60
			    },
			    xAxis: [
			        {
			            type: 'category',
			            show: false,
			            data: []
			        }
			    ],
			    yAxis: [
			        {
			            type: 'value',
			            show: false
			        }
			    ],
			    series: [
			        {
			            name: '送奶份数',
			            type: 'bar',
			            itemStyle: {
			                normal: {
			                    color: function(params) {
			                        // build a color map as your need.
			                        var colorList = [
			                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
			                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
			                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
			                        ];
			                        return colorList[params.dataIndex]
			                    },
			                    label: {
			                        show: true,
			                        position: 'top',
			                        formatter: '{b}\n{c}'
			                    }
			                }
			            },
			            data: []
			        }
			    ]
            };             
        return option;
      }
    };
  }]);
})();