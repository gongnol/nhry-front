(function() {
  'use strict';
  angular
    .module('newhope')
    .factory('factoryGetJSONFile', factoryGetJSONFile);

    function factoryGetJSONFile($http,$state) {
        var devId = $state.params.devId;//设备主键ID
        var httpUrl = window.location.host + '/d';
        if (location.href.indexOf("https") > -1 ) {
            httpUrl = 'https://' + httpUrl;
        } else {
            httpUrl = 'http://' + httpUrl;
        }
        var service = {
            /**取设备树数据*/
            getDevTree : function(done) {
                //var myUrl = httpUrl+"/api/v1/device/getalltree";
                var myUrl = "scripts/controllers/system/tree.json";
                $http.get(myUrl)
                .success(function(data) {
                    //console.log(data);
                    done(data);
                })
                .error(function(data,header,config,status) {
                });
            },
            get4Dev: function(done){
                var parentId = $state.params.parentId;
                var myUrl = httpUrl+"/deviceTree/get?id="+parentId+"&callback=JSON_CALLBACK&name=dev"
                $http.jsonp(myUrl)
                .success(function(data) {
                   done(data);
                })
                .error(function(data,header,config,status) {
                });
            },
            /**取设备单条信息*/
            getDev : function(done){
                var myUrl = httpUrl+"/deviceTree/get?id="+$state.params.devId+"&callback=JSON_CALLBACK&name=dev"
                $http.jsonp(myUrl)
                .success(function(data) {
                   done(data);
                })
                .error(function(data,header,config,status) {
                });
            },
            /**取子设备信息*/
            getDev4Tree : function(done){
                var myUrl = "scripts/controllers/devices/parent.json";
                $http.get(myUrl)
                .success(function(data) {
                   done(data);
                })
                .error(function(data,header,config,status) {
                });
            },
            /**取子设备信息*/
            searchDev : function(done){
                //console.log($state.params.devParams);
                var myUrl = httpUrl+"/deviceTree/findListByParam?param="+$state.params.devParams+"&callback=JSON_CALLBACK&name=dev"
                $http.jsonp(myUrl)
                .success(function(data) {
                   done(data);
                   //console.log(data);
                })
                .error(function(data,header,config,status) {
                    alert("啥玩意，没数据呢");
                });
            }
        }
        return service;
    }


})();
