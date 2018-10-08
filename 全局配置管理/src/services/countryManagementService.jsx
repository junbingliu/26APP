//#import pigeon.js

var CountryManagementService = (function (pigeon) {
    var objPrefix = "countryObj";
    var listPrefix = "countryList";

    var f = {
        getNewId: function () {
            var idNum = pigeon.getId("CountryManagement");
            return objPrefix + "_" + idNum;
        },
        getListName: function () {
            return listPrefix + "_all";
        },
        addCountry: function (jCountry) {
            var id = f.getNewId();
            jCountry.id = id;
            jCountry.createTime=new Date().getTime();
            pigeon.saveObject(id, jCountry);
            var listId = f.getListName();
            var key = pigeon.getRevertComparableString(jCountry.createTime / 1000, 13);
            pigeon.addToList(listId, key, id);
            return id;
        },
        getCountry: function (id) {
            return pigeon.getObject(id);
        },
        getValueByName: function (name) {
            var list=f.getAllCountryList(0,-1);
            if(name == null || name == ''||f.isEmptyObject(list)){
                return '';
            } else{
                for(var i in list ) {
					if(f.isEmptyObject(list[i])){
						continue;
					}
                    if(list[i].key == name){
                        return list[i].val;
                    }
                }
            }
        },
        getAllCountryList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllCountryListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
        },
        deleteCountry: function (objId) {
            var country=f.getCountry(objId);
            if(!country){
                return;
            }
            var key = pigeon.getRevertComparableString(country.createTime / 1000, 13);
            pigeon.saveObject(objId, null);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, objId);
        },
        updateCountry: function (jCountry) {
            pigeon.saveObject(jCountry.id, jCountry);
        },
        getSortFun:function(order, sortBy){
            var ordAlpah = (order == 'asc') ? '>' : '<';
            var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
            return sortFun;
        },
        clearList:function(listName){
            pigeon.clearList(f.getListName());
        },
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },

    };
    return f;
})($S);