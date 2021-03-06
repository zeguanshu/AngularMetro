﻿(function () {
    angular.module('MetronicApp').controller('views.advertising.putadsense',
        ['$scope', 'settings', "$stateParams", '$state', '$rootScope', 'dataFactory','$uibModal',
        function ($scope, settings, $stateParams, $state, $rootScope, dataFactory, $uibModal) {
            // ajax初始化
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();
            });
            var vm = this;
            vm.resourse = $stateParams.resourse;
            if (!vm.resourse) {
                $rootScope.notify.show("资源包不存在", "error");
                $state.go("advertising");
            }
            vm.filter = {};
          
            vm.date = {
                leftopen: false,
                rightopen: false,

                inlineOptions: {
                    showWeeks: false
                },
                dateOptions: {
                    //dateDisabled: disabled,
                    formatYear: 'yyyy',
                    maxDate: new Date(5000, 1, 1),
                    minDate: new Date(1900, 1, 1),
                    startingDay: 1
                },
                openleft: function () {
                    vm.date.leftopen = !vm.date.leftopen;
                },
                openright: function () {
                    vm.date.rightopen = !vm.date.rightopen;
                }
            }
            //页面属性
            vm.table = {
                data: [],               //数据集
                checkModel: {},         //选择的集合
                filter: "",//条件搜索
                pageConfig: {           //分页配置
                    currentPage: 1,//当前页
                    itemsPerPage: 10,//页容量
                    totalItems: 0//总数据
                }
            }
           var devicelist = [
              { id:1, devicename: "标题1", devicenote: "描述1", orgId: 1 },
              { id: 2, devicename: "标题a2", devicenote: "描述2", orgId: 2 },
              { id: 3, devicename: "标题a3", devicenote: "描述3", orgId: 3 },
              { id: 4, devicename: "标题a4", devicenote: "描述4", orgId: 4 },
                { id: 5, devicename: "标题11", devicenote: "描述11", orgId: 1 },
              { id:6, devicename: "标题a22", devicenote: "描述22", orgId: 2 },
              { id: 7, devicename: "标题a33", devicenote: "描述33", orgId: 3 },
              { id:8, devicename: "标题a44", devicenote: "描述44", orgId: 4 },
                  { id: 9, devicename: "标题111", devicenote: "描述111", orgId: 1 },
              { id: 10, devicename: "标题a222", devicenote: "描述222", orgId: 2 },
              { id: 11, devicename: "标题a333", devicenote: "描述333", orgId: 3 },
              { id: 12, devicename: "标题a444", devicenote: "描述444", orgId: 4 },
            ]

            //获取用户数据集，并且添加配置项
            vm.init = function () {
                var orgId = vm.organizationTree.selectedOu.id;
                    var arr = [];
                    angular.forEach(devicelist, function (val, index) {
                        if (val.orgId==orgId) {
                            arr.push(val);
                        }
                    })
                    vm.table.data = arr;
                    vm.table.pageConfig.totalItems = vm.table.data.length;
                //vm.filter.pageNum = vm.table.pageConfig.currentPage;
                //vm.filter.pageSize = vm.table.pageConfig.itemsPerPage;
                //vm.filter.orgId = orgId;
                //dataFactory.action("api/device/all", "", null, vm.filter).then(function (res) {
                //    if (res.result == "1") {
                //        vm.table.pageConfig.totalItems = res.total;
                //        vm.table.data = res.list;
                //        vm.table.pageConfig.onChange = function () {
                //            vm.init();
                //        }
                //    }
                //});
            };
            ///机构树
            vm.organizationTree = {
                $tree: null,
                unitCount: 0,
                setUnitCount: function (unitCount) {
                    $scope.safeApply(function () {
                        vm.organizationTree.unitCount = unitCount;
                    });
                },
                refreshUnitCount: function () {
                    vm.organizationTree.setUnitCount(vm.organizationTree.$tree.jstree('get_json').length);
                },
                selectedOu: {
                    id: null,
                    displayName: null,
                    code: null,
                    set: function (ouInTree) {
                        if (!ouInTree) {
                            vm.organizationTree.selectedOu.id = null;
                            vm.organizationTree.selectedOu.displayName = null;
                            vm.organizationTree.selectedOu.code = null;
                            vm.organizationTree.selectedOu.type = 1;
                        } else {
                            vm.organizationTree.selectedOu.id = ouInTree.id;
                            vm.organizationTree.selectedOu.displayName = ouInTree.original.displayName;
                            vm.organizationTree.selectedOu.code = ouInTree.original.code;
                            vm.organizationTree.selectedOu.type = ouInTree.original.type;
                        }
                        if (vm.organizationTree.selectedOu.id == null) {
                            return;
                        }
                        vm.init();
                        $("a.list-group-item:first-child").css("background-color", "transparent");
                    }
                },
               
             
                generateTextOnTree: function (ou) {
                    var displayName = ou.displayName;
                    displayName = displayName.length > 10 ? (displayName.substring(0, 10) + "...") : displayName;
                    var itemClass = ou.memberCount > 0 ? ' ou-text-has-members' : ' ou-text-no-members';
                    return '<span title="' + ou.code + '" class="ou-text' + itemClass + '" data-ou-id="' + ou.id + '">' + displayName + '  <i class="fa fa-caret-down text-muted"></i></span>';
                },
                incrementMemberCount: function (ouId, incrementAmount) {
                    var treeNode = vm.organizationTree.$tree.jstree('get_node', ouId);
                    treeNode.original.memberCount = treeNode.original.memberCount + incrementAmount;
                    vm.organizationTree.$tree.jstree('rename_node',
                        treeNode,
                        vm.organizationTree.generateTextOnTree(treeNode.original));
                },
                getTreeDataFromServer: function (callback, type) {
                    var list = [
                        { id: 1, parentId: 0,  displayName: "A机构" },
                        { id: 2, parentId: 1,  displayName: "A子机构"},
                        { id: 3, parentId: 0,  displayName: "B机构" },
                        { id: 4, parentId: 3,  displayName: "B子机构"},
                    ];
                 
                    var treeData = _.map(list, function (item) {
                        return {
                            id: item.id,
                            parent: item.parentId ? item.parentId : '#',
                            displayName: item.displayName,
                            text: vm.organizationTree.generateTextOnTree(item),
                            state: {
                                opened: true
                            }
                        };
                    });
                    callback(treeData);
                   
                },
                init: function (type) {
                    vm.organizationTree.getTreeDataFromServer(function (treeData) {
                        vm.organizationTree.setUnitCount(treeData.length);
                        vm.organizationTree.$tree = $('#OrganizationUnitEditTree');
                        var jsTreePlugins = [
                            'types',
                          //  'contextmenu',
                            'wholerow',
                            'sort'
                        ];

                        vm.organizationTree.$tree
                            .on('changed.jstree', function (e, data) {
                                $scope.safeApply(function () {
                                    if (data.selected.length != 1) {
                                        vm.organizationTree.selectedOu.set(null);
                                    } else {
                                        var selectedNode = data.instance.get_node(data.selected[0]);
                                        vm.organizationTree.selectedOu.set(selectedNode);
                                    }
                                });

                            })
                            .on('move_node.jstree', function (e, data) {

                                if (!vm.permissions.manageOrganizationTree) {
                                    vm.organizationTree.$tree.jstree('refresh'); //rollback
                                    return;
                                }

                                var parentNodeName = (!data.parent || data.parent == '#')
                                    ? app.localize('Root')
                                    : vm.organizationTree.$tree.jstree('get_node', data.parent).original.displayName;

                                abp.message.confirm(
                                    app.localize('OrganizationUnitMoveConfirmMessage', data.node.original.displayName, parentNodeName),
                                    function (isConfirmed) {
                                        if (isConfirmed) {
                                            organizationUnitService.moveOrganizationUnit({
                                                id: data.node.id,
                                                newParentId: data.parent
                                            }).success(function () {
                                                abp.notify.success('机构调整成功');
                                                vm.organizationTree.reload();
                                            }).catch(function (err) {
                                                vm.organizationTree.$tree.jstree('refresh'); //rollback
                                                setTimeout(function () { abp.message.error(err.data.message); }, 500);
                                            });
                                        } else {
                                            vm.organizationTree.$tree.jstree('refresh'); //rollback
                                        }
                                    }
                                );
                            })

                            .jstree({
                                'core': {
                                    data: treeData,
                                    multiple: false,
                                    check_callback: function (operation, node, node_parent, node_position, more) {
                                        return true;
                                    }
                                },
                                types: {
                                    "default": {
                                        "icon": "fa"
                                    },
                                    "file": {
                                        "icon": "fa"
                                    }
                                },
                                contextmenu: {
                                    items: vm.organizationTree.contextMenu
                                },
                                sort: function (node1, node2) {
                                    var left = this.get_node(node2).original.displayName;
                                    var right = this.get_node(node1).original.displayName;
                                    if (!left.localeCompare(right)) {
                                        return 1;
                                    }
                                    return -1;
                                },
                                plugins: jsTreePlugins
                            });

                        vm.organizationTree.$tree.on('click', '.ou-text .fa-caret-down', function (e) {
                            e.preventDefault();

                            var ouId = $(this).closest('.ou-text').attr('data-ou-id');
                            setTimeout(function () {
                                vm.organizationTree.$tree.jstree('show_contextmenu', ouId);
                            }, 100);
                        });
                    }, type);
                },
                reload: function () {
                    vm.organizationTree.getTreeDataFromServer(function (treeData) {
                        vm.organizationTree.setUnitCount(treeData.length);
                        vm.organizationTree.$tree.jstree(true).settings.core.data = treeData;
                        vm.organizationTree.$tree.jstree('refresh');
                    }, 1);
                }
            };
            vm.organizationTree.init();
            vm.init();

            vm.allow = function () {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length<=0) {
                    $rootScope.notify.show("请选择要分发的设备", "warning");
                    return;
                }
                var modal = $uibModal.open({
                    templateUrl: '/views/advertising/modal.html',
                    controller: 'views.advertising.modal as vm',
                    backdrop: 'static',
                 //   size: 'lg',//模态框的大小尺寸
                    resolve: {
                        model: function () { return { packageId: vm.resourse, deviceIds: ids } },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })

            //    $rootScope.notify.show("分发成功", "success");
            }

            vm.back = function () {
                $state.go("advertising");
            }
        }])
})();