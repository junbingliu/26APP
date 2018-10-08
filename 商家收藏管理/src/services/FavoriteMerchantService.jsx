//#import pigeon.js
//#import eventBus.js

var FavoriteMerchantService = (function (pigeon) {
    var objPrefix = "favoriteMerchantObj";
    var listPrefix = "favoriteMerchantList";

    var f = {
        /**
         * 添加收藏
         * @param jFavorite
         * @param createUserId : 收藏人
         * @returns {*}
         */
        addFavorite: function (jFavorite, createUserId) {
            var merchantId = jFavorite.merchantId;
            if (!merchantId || merchantId == "") {
                return null;
            }
            var id = f.getId(merchantId, createUserId);

            //检查是否已经存在，如果已经存在，那么不需要添加
            var old = pigeon.getObject(id);
            if(old){
                return id;
            }
            var curTime = new Date().getTime();
            jFavorite.id = id;
            jFavorite.createTime = curTime;
            jFavorite.createUserId = createUserId;
            pigeon.saveObject(id, jFavorite);

            f.add2List("all", curTime, id);
            f.add2List(merchantId, curTime, id);
            f.add2List(createUserId, curTime, id);
            
            return id;
        },
        deleteFavorite: function (id) {
            var jFavorite = f.getFavorite(id);
            if (!jFavorite) {
                return;
            }
            var merchantId = jFavorite.merchantId;
            var createUserId = jFavorite.createUserId;
            var createTime = jFavorite.createTime;
            pigeon.saveObject(id, null);

            f.deleteFromList("all", createTime, id);
            f.deleteFromList(merchantId, createTime, id);
            f.deleteFromList(createUserId, createTime, id);

           
        },
        updateFavorite: function (id, jFavorite) {
            pigeon.saveObject(id, jFavorite);
        },
        getFavorite: function (id) {
            return pigeon.getObject(id);
        },
        getFavoriteByMerchantId: function (merchantId, userId) {
            var id = f.getId(merchantId, userId);
            return pigeon.getObject(id);
        },
        getAllFavoriteList: function (objId, start, limit) {
            var listId = f.getListName(objId);
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllFavoriteListSize: function (objId) {
            var listId = f.getListName(objId);
            return pigeon.getListSize(listId);
        },
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);
        },
        add2List: function (objId, createTime, favoriteId) {
            var listId = f.getListName(objId);
            var key = f.getKeyByRevertCreateTime(createTime);
            pigeon.addToList(listId, key, favoriteId);
        },
        deleteFromList: function (objId, createTime, favoriteId) {
            var listId = f.getListName(objId);
            var key = f.getKeyByRevertCreateTime(createTime);
            pigeon.deleteFromList(listId, key, favoriteId);
        },
        getId: function (merchantId, userId) {
            return objPrefix + "_fav_" + merchantId + "_" + userId;
        },
        /**
         * objId可以是userId也可以merchantId
         * @param objId
         * @returns {string}
         */
        getListName: function (objId) {
            return listPrefix + "_" + objId + "_all";
        }
    };
    return f;
})($S);