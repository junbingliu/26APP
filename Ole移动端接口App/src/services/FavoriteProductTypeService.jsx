//#import pigeon.js

var FavoriteProductTypeService = (function (pigeon) {
    var prefix = "favoriteProductType";
    var favoriteListKey = prefix + "List_";
    var f = {

        initDefaultFavoriteType: function (userId) {
            //默认的商品收藏夹
            var id = prefix + "_" + userId + "_0";
            var obj = pigeon.getObject(id);
            if (!obj) {
                var createTime = new Date().getTime();
                var key = "" + createTime;
                var data = {
                    userId: userId,
                    id: id,
                    createTime: createTime,
                    favoriteClassName: "商品收藏夹",
                    fileId: ""
                };
                pigeon.saveObject(id, data);
                pigeon.addToList(favoriteListKey + userId, key, id);
            }
            return id;
        },

        addFavoriteType: function (userId, favoriteClassName, fileId) {
            var createTime = new Date().getTime();
            var key = "" + createTime;
            var id = prefix + "_" + userId + "_" + key;
            var data = {
                userId: userId,
                id: id,
                createTime: createTime,
                favoriteClassName: favoriteClassName,
                fileId: fileId
            }
            pigeon.saveObject(id, data);
            pigeon.addToList(favoriteListKey + userId, key, id);
        },
        getFavoriteById: function (favoriteTypeId) {
            var data = pigeon.getObject(favoriteTypeId);
            if (!data) return null;
            return data;
        },
        updateFavoriteType: function (id, favoriteObj) {

            pigeon.saveObject(id, favoriteObj);
            //pigeon.addToList(favoriteListKey+favoriteObj.userId,key,id);
        },
        getListByUserId: function (userId, from, number) {
            var data = pigeon.getListObjects(favoriteListKey + userId, from, number);
            if (!data) {
                return [];
            }
            return data;
        },
        deleteFavoriteType: function (favoriteTypeId, userId) {

            var myInfo = pigeon.getObject(favoriteTypeId);
            var key = "" + myInfo.createTime;
            pigeon.deleteFromList(favoriteListKey + userId, key, favoriteTypeId);
            pigeon.saveObject(favoriteTypeId, null);

        },
        getProductById: function (favoriteTypeId, productId) {
            var id = favoriteTypeId + "_" + productId;
            var data = pigeon.getObject(id);
            if (!data) return null;
            return data;
        },
        addFavoriteProduct: function (favoriteTypeId, productId, price, skuId) {
            var createTime = new Date().getTime();
            var key = "" + createTime;
            var id = favoriteTypeId + "_" + productId;
            var data = {
                favoriteTypeId: favoriteTypeId,
                id: id,
                createTime: createTime,
                productId: productId,
                price: price,
                skuId: skuId
            }
            pigeon.saveObject(id, data);
            pigeon.addToList(favoriteListKey + favoriteTypeId, key, id);
        },
        getProductList: function (favoriteTypeId, from, number) {
            var data = pigeon.getListObjects(favoriteListKey + favoriteTypeId, from, number);
            if (!data) {
                return [];
            }
            return data;
        },
        deleteFavoriteProduct: function (favoriteTypeId, productId) {
            var id = favoriteTypeId + "_" + productId;
            var myInfo = pigeon.getObject(id);
            var key = "" + myInfo.createTime;
            pigeon.deleteFromList(favoriteListKey + favoriteTypeId, key, id);
            pigeon.saveObject(id, null);

        }


    }
    return f;
})($S);
