﻿(function () {
    angular.module('MetronicApp').controller('views.adsense.index', ['$scope', 'settings', '$uibModal',"dataFactory",'$rootScope',
        function ($scope, settings, $uibModal, dataFactory, $rootScope) {
            // ajax初始化
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();
            });
            var vm = this;
            vm.filter = { };
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
            //获取用户数据集，并且添加配置项
            vm.init = function () {
                vm.filter.pageNum= vm.table.pageConfig.currentPage;
                vm.filter.pageSize= vm.table.pageConfig.itemsPerPage;
                dataFactory.action("api/resource/selectAll", "", null, vm.filter)
                    .then(function (res) {
                        if (res.result=="1") {
                            vm.table.pageConfig.totalItems = res.total;
                            vm.table.data = res.list;
                            vm.table.pageConfig.onChange = function () {
                                vm.init();
                            }
                        }
                });
            };
            vm.init();
            vm.add = function () {
                var modal = $uibModal.open({
                    templateUrl: '/views/adsense/modal.html',
                    controller: 'views.adsense.modal as vm',
                    backdrop: 'static',
                    size: 'lg',//模态框的大小尺寸
                    resolve: {
                        model: function () { return {} },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })
            }
            vm.edit = function () {
                var id = Object.getOwnPropertyNames(vm.table.checkModel);
                if (id.length != 1) {
                    $rootScope.notify.show("请选择一个操作对象","warning");
                    return;
                }
                for (var i in vm.table.checkModel) {
                    if (vm.table.checkModel[i].state == 1) {
                        $rootScope.notify.show("已发布对象不允许操作", "warning");
                        return;
                    }
                }
                var modal = $uibModal.open({
                    templateUrl: '/views/adsense/modal.html',
                    controller: 'views.adsense.modal as vm',
                    backdrop: 'static',
                    size: 'lg',//模态框的大小尺寸
                    resolve: {
                        model: function () { return {id:id[0]} },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })
            }
            vm.delete = function () {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length <= 0) {
                    $rootScope.notify.show("请选择要删除的对象", "warning");
                    return;
                }
                for (var i in vm.table.checkModel) {
                    if (vm.table.checkModel[i].state == 1) {
                        $rootScope.notify.show("已发布对象不允许操作", "warning");
                        return;
                    }
                }
                //api/resource/delete
                dataFactory.action("api/resource/delete", "", null, { list: ids }).then(function (res) {
                    vm.init();
                });
            }
            vm.public = function () {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length <= 0) {
                    $rootScope.notify.show("请选择单个操作对象", "warning");
                    return;
                }
                for (var i in vm.table.checkModel) {
                    if (vm.table.checkModel[i].state == 1) {
                        $rootScope.notify.show("已发布对象不允许操作", "warning");
                        return;
                    }
                }
                dataFactory.action("api/resource/updateState", "", null, { list: ids, state: 1 }).then(function (res) {
                    $rootScope.notify.show("更新成功", "success");
                    vm.init();
                });
            }
        }])
})();

