//#import pigeon.js

var FavoriteGoodsService = (function (pigeon) {
    var prefix = "favoriteProductCount_";
    var f = {



        addFavoriteCount:function(produceId){
            var id = prefix + produceId;
            var data = pigeon.getObject(id);
            if(!data){
                var createTime = new Date().getTime();
                data = {produceId:produceId,createTime:createTime,counts:0};
            }else {
                data.counts = parseInt(data.counts) + 1;
            }
            pigeon.saveObject(id,data);
        },
        removeFavoriteCount:function(produceId){
            var id = prefix + produceId;
            var data = pigeon.getObject(id);
            if(data){
                if(parseInt(data.counts) > 0){
                    data.counts = parseInt(data.counts) - 1;
                    pigeon.saveObject(id,data);
                }

            }
        },
        getFavoriteCountAndIsUserKeep:function(produceId, userId){
            var id = prefix + produceId;
            var data = pigeon.getObject(id);
            var favoriteCount = 0;
            if(!data){
                return {favoriteCount:0,isKeep:false};
            }
            favoriteCount = parseInt(data.counts) ;
            if(favoriteCount < 0){
                favoriteCount = 0;
            }
            var favoriteListKey = "favoriteProductTypeList_";
            var favoriteTypeList = pigeon.getListObjects(favoriteListKey+userId,0,-1);
            if(!favoriteTypeList){
                return {favoriteCount:favoriteCount,isKeep:false};
            }
            var isKeep = false;
            for(var i=0; i<favoriteTypeList.length; i++){

                var favoriteObj = favoriteTypeList[i];
                if(favoriteObj){
                    var favoriteTypeId = favoriteObj.id;
                    var id = favoriteTypeId +"_" + produceId;
                    var data = pigeon.getObject(id);
                    if(data) {
                        isKeep = true;
                        break;
                    }
                }
            }
            return {favoriteCount:favoriteCount,isKeep:isKeep};

        }

    }
    return f;
})($S);
