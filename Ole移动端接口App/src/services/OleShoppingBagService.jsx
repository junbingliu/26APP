//#import Util.js
//#import pigeon.js
//#import search.js
//#import user.js
//#import region.js
var OleShoppingBagService = (function (pigeon) {
    var prefix = "ole_bigbag";//"trial_blackList";
    var listId = "oleshopbag_list" ;

    var f = {
        findAllList:function(){
            var data = pigeon.getListObjects(listId,0,-1);
            if(!data){
                return [];
            }
            return data;
        }
    };


    return f;
})($S);