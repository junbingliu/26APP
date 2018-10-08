//#import pigeon.js
//#import jobs.js
//#import product.js
//#import price.js
//#import underscore.js
var PaymentSettingService = (function (pigeon) {
    var prefix = "paymentSetting";
    var f = {
        setInheritPlatform : function(m,yes){
            var key = prefix + "_" + m + "_" + "inheritPlatform";
            pigeon.saveContent(key,yes?"T":"F");
        },
        getInheritPlatform : function(m){
            var key = prefix + "_" + m + "_" + "inheritPlatform";
            var s = pigeon.getContent(key);
            if(!s){
                return true; //默认继承
            }
            if(s=="T"){
                return true;
            }
            else{
                return false;
            }
        }


    };
    return f;
})($S);