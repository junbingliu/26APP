//#import pigeon.js
//#import jobs.js

var StoreService = (function (pigeon) {
    var objPrefix = "oleMemberClassSettingObj";
    var listPrefix = "oleMemberClassSettingList";

    var f = {

        addStore: function (jStore,createUserId) {

            var curTime = new Date().getTime();
            var id = f.getStoreId();
            jStore.createTime=curTime;
            jStore.id = id;
            jStore.createUserId = createUserId;

            pigeon.saveObject(id, jStore);
            var listId = f.getListName();
            var key = f.getKeyByRevertCreateTime(curTime);
            pigeon.addToList(listId, key, id);
            return id;

        },
        /**
         * 删除
         * @param id
         */
        delStore: function (id,deleteUserId) {
            var jStore = f.getStore(id);
            if (!jStore) {
                return;
            }

            jStore.isDeleted = true;
            jStore.deleteUserId = deleteUserId;
            jStore.deleteTime = new Date().getTime();
            
            var key = f.getKeyByRevertCreateTime(jStore.createTime);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);

            //放到删除列表
            var deletedListId = f.getDeletedListName();
            pigeon.addToList(deletedListId, key, id);

        },

        updateStore: function (jStore) {
            var id = jStore.id;
            pigeon.saveObject(id, jStore);
        },


        getStore: function (id) {

            var jStore = pigeon.getObject(id);
            if(jStore.isDeleted){
                return null;
            }
            return jStore;
        },

        /**
         *
         * @param id
         * @param check : true:要验证删除状态，false:不验证删除状态
         * @returns {*}
         */
        getStoreByDeleteState: function (id, check) {
            if(check){
                return f.getStore(id);
            }
            return pigeon.getObject(id);
        },

        /**
         * 获取指定数量的Store对象
         * @param start
         * @param limit
         * @returns {*}
         */
        getAllStoreList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        /**
         * 获取总数
         * @returns {*}
         */
        getAllStoreListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
        },

        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);//倒序 11111=00000099999
            //return pigeon.getComparableString(dateTime, 11);//升序 11111=00000011111
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getStoreId: function () {
            var idNum = pigeon.getId("oleMemberClassSetting_store");
            return objPrefix + "_store_" + idNum;
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {
            return listPrefix + "_store_all";
        },

        getDeletedListName: function () {
            return listPrefix + "_store_delete";
        }

    };
    return f;
})($S);