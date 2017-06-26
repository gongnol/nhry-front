(function() {
    'use strict';
    angular
        .module('newhope')
        .factory('todoStorage', TodoStorage)
        .controller('RoleCtrl', RoleCtrl);

        TodoStorage.$inject = ['ngStore'];
        function TodoStorage(ngStore) {
            return ngStore.model('todo');
        }

        RoleCtrl.$inject = ['$scope', '$state','$location', '$filter', 'todoStorage', 'restService'];
        function RoleCtrl($scope,$state, $location, $filter, todoStorage,rest) {
            var vm = $scope;
            vm.roleTab = "active";
            ////console.log("role "+vm.roleTab);
            vm.roles=[];
            //获取角色列表
            var todos=[];
            rest.getRoleList().then(function(json) {

                vm.roles = json.data;
                todos = vm.todos = vm.roles;
                ////console.log(vm.todos);
            });

            vm.newTodo = '';
            vm.remainingCount = $filter('filter')(todos, {completed: false}).length;

            vm.location = $location;

            vm.$watch('location.path()', function (path) {
                vm.statusFilter = { '/app/todo/active': {completed: false}, '/app/todo/completed': {completed: true} }[path];
            });

            vm.$watch('remainingCount == 0', function (val) {
                vm.allChecked = val;
            });

            vm.addTodo = addTodo;
            vm.editTodo = editTodo;
            vm.doneEditing = doneEditing;
            vm.revertEditing = revertEditing;
            vm.removeTodo = removeTodo;
            vm.todoCompleted = todoCompleted;
            vm.clearCompletedTodos = clearCompletedTodos;
            vm.markAll = markAll;
            
            function addTodo() {
                var newTodo = vm.newTodo.trim();
                if (newTodo.length === 0) {
                    return;
                }

                var item = {
                    id: todoStorage.nextId(),
                    title: newTodo,
                    completed: false
                };
                var role = {
                    roleName: newTodo,
                    createBy: '032411',
                    completed: false
                };
                rest.addRole(role).then(function(json) {
                    //console.log(role);
                    //todos.push( role );
                    $state.reload()
                });


                vm.newTodo = '';
                vm.remainingCount++;
            }

            function editTodo(todo) {
                todo.editedTodo = true;
                // Clone the original todo to restore it on demand.
                vm.originalTodo = angular.extend({}, todo);
            };

            function doneEditing(todo) {
                todo.editedTodo = false;
                //console.log(todo);
                if (!todo.roleName) {
                    //vm.removeTodo(todo);
                }else{
                    todo.roleName = todo.roleName.trim();
                }
                rest.updateRole(todo).then(function(json) {
                    //console.log(todo);
                });
                //todoStorage.update(todo);
            }

            function revertEditing(todo) {
                todos[todos.indexOf(todo)] = vm.originalTodo;
                vm.doneEditing(vm.originalTodo);
            };

            function removeTodo(todo) {
                vm.remainingCount -= todo.completed ? 0 : 1;
                todos.splice(todos.indexOf(todo), 1);
                //todoStorage.destroy(todo);
                rest.delRole(todo.id).then(function(json) {
                    //console.log(todo.id);
                    //todos.push( role );
                    // $state.reload()
                });
            };

            function todoCompleted(todo) {
                vm.remainingCount += todo.completed ? -1 : 1;
                todoStorage.update(todo);
            };

            function clearCompletedTodos() {
                todos.filter(function (todo) {
                    if(todo.completed){
                        todos.splice(todos.indexOf(todo), 1);
                        todoStorage.destroy(todo);
                    }
                });
            };

            function markAll(completed) {
                todos.forEach(function (todo) {
                    todo.completed = completed;
                    //console.log(completed);
                    //todoStorage.update(todo);
                });
                //vm.remainingCount = !completed ? todos.length : 0;
            };
        }
})();
