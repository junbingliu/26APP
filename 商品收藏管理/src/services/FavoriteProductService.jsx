//#import pigeon.js
//#import eventBus.js

var FavoriteProductService = (function (pigeon) {
    var objPrefix = "favoriteProductObj";
    var listPrefix = "favoriteProductList";

    var f = {
        /**
         * 添加收藏
         * @param jFavorite
         * @param createUserId : 收藏人
         * @returns {*}
         */
        addFavorite: function (jFavorite, createUserId) {
            var productId = jFavorite.productId;
            if (!productId || productId == "") {
                return null;
            }
            var id = f.getId(productId, createUserId);
            var curTime = new Date().getTime();
            jFavorite.id = id;
            jFavorite.createTime = curTime;
            jFavorite.createUserId = createUserId;
            pigeon.saveObject(id, jFavorite);

            f.add2List("all", curTime, id);
            f.add2List(productId, curTime, id);
            f.add2List(createUserId, curTime, id);

            var ctx = {};
            ctx["productId"] = productId;
            ctx["userId"] = createUserId;
            ctx["favoriteId"] = id;
            EventBusService.fire("addFavoriteProductAfter",ctx);
            return id;
        },
        deleteFavorite: function (id) {
            var jFavorite = f.getFavorite(id);
            if (!jFavorite) {
                return;
            }
            var productId = jFavorite.productId;
            var createUserId = jFavorite.createUserId;
            var createTime = jFavorite.createTime;
            pigeon.saveObject(id, null);

            f.deleteFromList("all", createTime, id);
            f.deleteFromList(productId, createTime, id);
            f.deleteFromList(createUserId, createTime, id);

            var ctx = {};
            ctx["productId"] = productId;
            ctx["userId"] = createUserId;
            ctx["favoriteId"] = id;
            EventBusService.fire("deleteFavoriteProductAfter",ctx);
        },
        updateFavorite: function (id, jFavorite) {
            pigeon.saveObject(id, jFavorite);
        },
        getFavorite: function (id) {
            return pigeon.getObject(id);
        },
        getFavoriteByProductId: function (productId, userId) {
            var id = f.getId(productId, userId);
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
        getId: function (productId, userId) {
            return objPrefix + "_fav_" + productId + "_" + userId;
        },
        /**
         * objId可以是userId也可以productId
         * @param objId
         * @returns {string}
         */
        getListName: function (objId) {
            return listPrefix + "_" + objId + "_all";
        }
    };
    return f;
})($S);