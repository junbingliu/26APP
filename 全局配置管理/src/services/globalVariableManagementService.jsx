//#import pigeon.js

var GlobalVariableManagementService = (function (pigeon) {
    var objPrefix = "globalVariableObj";
    var listPrefix = "globalVariableList";

    var f = {
            getNewId: function () {
                var idNum = pigeon.getId("GlobalVariableManagement");
                return objPrefix + "_" + idNum;
            },
            getListName: function () {
                return listPrefix + "_all";
            },
            addGlobalVariable: function (jGlobalVariableInfo) {
                var id = f.getNewId();
                jGlobalVariableInfo.id = id;
                pigeon.saveObject(id, jGlobalVariableInfo);
                var listId = f.getListName();
                var key = "000001";
                pigeon.addToList(listId, key, id);
                return id;
            },
            getGlobalVariable: function (id) {
                return pigeon.getObject(id);
            },
            getValueByName: function (name) {
                var list = f.getAllGlobalVariableList(0, -1);
                if (name == null || name == '' || f.isEmptyObject(list)) {
                    return '';
                } else {
                    for (var i in list) {
                        if (f.isEmptyObject(list[i])) {
                            continue;
                        }
                        if (list[i].name == name) {
                            return list[i].val;
                        }
                    }
                }
            },
            getAllGlobalVariableList: function (start, limit) {
                var listId = f.getListName();
                return pigeon.getListObjects(listId, start, limit);
            },
            getAllGlobalVariableListSize: function () {
                var listId = f.getListName();
                return pigeon.getListSize(listId);
            },
            deleteGlobalVariable: function (objId) {
                var globalVariable = f.getGlobalVariable(objId);
                if (!globalVariable) {
                    return;
                }
                var key = "000001";
                pigeon.saveObject(objId, null);
                var listId = f.getListName();
                pigeon.deleteFromList(listId, key, objId);
            },
            updateGlobalVariable: function (jGlobalVariableInfo) {
                pigeon.saveObject(jGlobalVariableInfo.id, jGlobalVariableInfo);
            },
            getSortFun: function (order, sortBy) {
                var ordAlpah = (order == 'asc') ? '>' : '<';
                var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
                return sortFun;
            },
            isEmptyObject: function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            },
        }
    ;
    return f;
})($S);