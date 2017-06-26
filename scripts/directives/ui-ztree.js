(function() {
    'use strict';

    angular
        .module('newhope')
        .directive('tree', ['$state', 'restService', function($state, restService) {
            return {
                require: '?ngModel',
                restrict: 'A',

                link: function ($scope, element, attrs, ngModel) {
                    var vm = $scope;
                    var setting
                    if (attrs.id == "auth-tree") {
                        setting = {
                            view: {
                                removeHoverDom: removeHoverDom,
                                selectedMulti: false
                            },
                            check: {
                                enable: true
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            edit: {
                                enable: false
                            },
                            callback: {
                                onClick: onClick,
                                onCheck: onCheck
                            }
                        };
                    } else if (attrs.id == "res-tree") {
                        setting = {
                            view: {
                                addHoverDom: addHoverDom,
                                removeHoverDom: removeHoverDom,
                                selectedMulti: false
                            },
                            check: {
                                enable: false
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            edit: {
                                enable: true
                            },
                            callback: {
                                beforeDrag: beforeDrag,
                                beforeDrop: beforeDrop,
                                beforeEditName: beforeEditName,
                                beforeRemove: beforeRemove,
                                onRemove: onRemove,
                                onRename: onRename,
                                onClick: onClickedit,
                                onCheck: onCheck,
                                onExpand: onExpand
                            }
                        };
                    }else if (attrs.id == "awesome-tree") {
                        setting = {
                            view: {
                                addHoverDom: addHoverDom,
                                removeHoverDom: removeHoverDom,
                                selectedMulti: false
                            },
                            check: {
                                enable: false
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            edit: {
                                enable: true
                            },
                            callback: {
                                beforeDrag: beforeDrag,
                                beforeDrop: beforeDrop,
                                beforeEditName: beforeEditName,
                                beforeRemove: beforeRemove,
                                onRemove: onRemove,
                                onRename: onRename,
                                onClick: onClickedit,
                                onCheck: onCheck,
                                onExpand: onExpand
                            }
                        };
                    }


                    //获取资源列表,并初始化tree
                    restService.getResList().then(function (json) {
                        vm.treedata = json.data;
                        ////console.log(vm.treedata);
                        //装载tree数据
                        $.fn.zTree.init(element, setting, vm.treedata);

                    });

                    var newCount = 1;

                    function onExpand(e, treeId, treeNode) {
                        ////console.log(treeNode.resName);
                    }

                    function addHoverDom(treeId, treeNode) {

                        var sObj = $("#" + treeNode.tId + "_span");
                        if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
                        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                            + "' title='t' onfocus='this.blur();'></span>";
                        sObj.after(addStr);
                        var btn = $("#addBtn_" + treeNode.tId);
                        if (btn) btn.bind("click", function () {
                            var zTree = $.fn.zTree.getZTreeObj("res-tree");
                            var tmpCount = (newCount++);
                            //增加子结点
                            var newNode = {
                                //resCode: (100 + newCount),
                                parent: treeNode.resCode,
                                resName: treeNode.resName+"子节点" + tmpCount
                            };

                            restService.addRes(newNode).then(function (json) {
                                ////console.log(json);
                                var newNode = zTree.addNodes(treeNode, {
                                    resCode: json.data,
                                    parent: treeNode.resCode,
                                    resName: treeNode.resName+"子节点" + tmpCount,
                                    open: true
                                });
                            });
                            return false;
                        });
                    }

                    function removeHoverDom(treeId, treeNode) {
                        $("#addBtn_" + treeNode.tId).unbind().remove();
                    }
                    //节点移动前监控
                    function beforeDrag(treeId, treeNodes) {
                        for (var i = 0, l = treeNodes.length; i < l; i++) {
                            if (treeNodes[i].drag === false) {
                                return false;
                            }
                        }
                        return true;
                    }

                    //节点移动后监控并进行数据库更新操作
                    function beforeDrop(treeId, treeNodes, targetNode, moveType) {
                        // //console.log(treeNodes);
                        // var params = {
                        //     uuid: treeNodes.uuid,
                        //     parentId:targetNode.uuid,
                        //     treeName: treeNodes.treeName
                        // }
                        // restService.updateTree(params).then(function(json){
                        //     alert(移动完成);
                        // });
                        return targetNode ? targetNode.drop !== false : true;
                    }

                    var log, className = "dark";
                    //节点编辑前确认
                    function beforeEditName(treeId, treeNode) {
                        className = (className === "dark" ? "" : "dark");
                        showLog("[ " + getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
                        var zTree = $.fn.zTree.getZTreeObj("res-tree");
                        zTree.selectNode(treeNode);
                        //return confirm("进入 -- " + treeNode.resName + " --的编辑状态吗？");
                    }

                    function showLog(str) {

                        if (!log) log = $("#log");
                        log.append("<li class='" + className + "'>" + str + "</li>");
                        if (log.children("li").length > 8) {
                            log.get(0).removeChild(log.children("li")[0]);
                        }
                    }

                    //节点删除前确认
                    function beforeRemove(treeId, treeNode) {
                        className = (className === "dark" ? "" : "dark");
                        showLog("[ " + getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
                        var zTree = $.fn.zTree.getZTreeObj("res-tree");
                        zTree.selectNode(treeNode);
                        //return confirm("进入 -- " + treeNode.resName + " --的删除状态吗？");
                    }

                    function getTime() {
                        var now = new Date(),
                            h = now.getHours(),
                            m = now.getMinutes(),
                            s = now.getSeconds(),
                            ms = now.getMilliseconds();
                        return (h + ":" + m + ":" + s + " " + ms);
                    }

                    //移除结点，删除操作
                    function onRemove(e, treeId, treeNode) {
                        ////console.log("onRemove移除了:"+treeNode.resName);
                        restService.delRes(treeNode.resCode).then(function(json){
                            ////console.log(json);
                        });
                        showLog("[ " + getTime() + " onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
                    }

                    //更改结点名称，更新操作
                    function onRename(e, treeId, treeNode, isCancel) {
                        if (treeNode.resCode){
                            ////console.log("编辑节点："+treeNode.resCode)
                            restService.updateRes(treeNode).then(function(json){
                                ////console.log(json);
                            });
                        }else{
                            ////console.log("onRename更新名字为："+treeNode.resName);
                            restService.addRes(treeNode).then(function(json){
                                ////console.log(json);
                            });
                        }
                        $state.go('newhope.authorization.res.info', {resCode: treeNode.resCode});
                        //$state.go($state.current, {}, {reload: true});
                        $state.reload();
                        //showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + getTime() + " onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>" : ""));
                    }


                    function onClick(event, treeId, treeNode, clickFlag) {
                        if (treeNode.treeLevel != 3) {
                        } else {
                            $state.go('newhope.devicesview.content', {treeId: treeNode.resCode});
                        }
                        ////console.log("999")
                    }

                    function onClickedit(event, treeId, treeNode) {
                        $scope.$apply(function () {
                            ////console.log(treeNode.resCode);
                            $state.go('newhope.authorization.res.info', {resCode: treeNode.resCode});

                        });
                    }

                    function onCheck(event, treeId, treeNode) {
                        ////console.log(treeNode.treeName + $scope.kuuyee);

                        ////console.log("是否包含"+isContain);

                        $scope.folds.push(
                            {
                                name: treeNode.treeName,
                                filter: ''
                            }
                        );

                        //$state.go('newhope.authorization.status', {fold: treeNode.treeName});
                            
                    };  
                }          
            }
        }]);
})();