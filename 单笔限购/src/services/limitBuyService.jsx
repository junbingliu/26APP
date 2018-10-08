//#import pigeon.js
var LimitBuyService = (function (pigeon) {
    var prefix = "limitBuy";
    function Config(data){
        data = data || {minNumber:-1,maxNumber:-1, userGroupId:""};
        this.minNumber = data.minNumber;
        this.maxNumber = data.maxNumber;
        this.userGroupId = data.userGroupId;
    }
    var f = {
        saveConfig : function(productId,data){
            pigeon.saveObject(prefix + "_" + productId,data);
        },
        getConfig : function(productId){
            var data = pigeon.getObject(prefix + "_" + productId);
            return new Config(data);
        }
    };
    return f;
})($S);
