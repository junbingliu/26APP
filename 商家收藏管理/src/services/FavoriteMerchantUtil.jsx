//#import $favoriteMerchant:services/FavoriteMerchantService.jsx

var FavoriteMerchantUtil = (function () {
    var f = {
        /**
         * 是否已经收藏
         * @param merchantId
         * @param userId
         * @returns {boolean}
         */
        hasFavorite: function (merchantId, userId) {
            var jFavorite = FavoriteMerchantService.getFavoriteByMerchantId(merchantId, userId);
            if (jFavorite) {
                return true;
            }
            return false;
        },
        /**
         * 取消收藏
         * @param merchantId
         * @param userId
         */
        cancelFavorite: function (merchantId, userId) {
            var jFavorite = FavoriteMerchantService.getFavoriteByMerchantId(merchantId, userId);
            if (!jFavorite) {
                return;
            }

            var favoriteId = jFavorite.id;
            FavoriteMerchantService.deleteFavorite(favoriteId);
        }
    };
    return f;
})();