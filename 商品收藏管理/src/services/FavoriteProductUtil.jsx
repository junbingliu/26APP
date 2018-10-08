//#import $FavoriteProduct:services/FavoriteProductService.jsx

var FavoriteProductUtil = (function () {
    var f = {
        /**
         * 是否已经收藏
         * @param productId
         * @param userId
         * @returns {boolean}
         */
        hasFavorite: function (productId, userId) {
            var jFavorite = FavoriteProductService.getFavoriteByProductId(productId, userId);
            if (jFavorite) {
                return true;
            }
            return false;
        },
        /**
         * 取消收藏
         * @param productId
         * @param userId
         */
        cancelFavorite: function (productId, userId) {
            var jFavorite = FavoriteProductService.getFavoriteByProductId(productId, userId);
            if (!jFavorite) {
                return;
            }

            var favoriteId = jFavorite.id;
            FavoriteProductService.deleteFavorite(favoriteId);
        }
    };
    return f;
})();