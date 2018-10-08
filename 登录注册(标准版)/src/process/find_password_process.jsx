//#import Util.js
//#import sysArgument.js
//#import session.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        try {
            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            setPageDataProperty(pageData,"webName",webName);
            var ret = {
                step:"1"
            };
            var skey = $.params.k;
            var type = $.params.t;
            if(skey){
                var loginKey = SessionService.getSessionValue(skey, request);
                if(!loginKey || loginKey == ""){
                    ret.step = "1";
                }else {
                    var user = SessionApi.IsoneModulesEngine.memberService.getUserByKey(loginKey);
                    if (user == null) {
                        ret.errorCode = "member_not_exist";
                        ret.step = "1";
                    } else {
                        if(type && type == "2"){
                            //手机
                            ret.type = "mobile"
                            var userMobilePhone = user.optString("mobilPhone") + "";
                            if (!userMobilePhone || userMobilePhone == "") {
                                ret.step = "2";
                                ret.noMobile = true;
                            }else{
                                ret.step = "2";
                                ret.showMobilePhone = function(){
                                    var encodePhone = "";
                                    for(var i=0;i<userMobilePhone.length;i++){
                                        var chat = userMobilePhone[i];
                                        if(i>2 && i< 8){
                                            encodePhone += "*";
                                        }else{
                                            encodePhone += chat;
                                        }
                                    }
                                    return encodePhone;
                                }();

                                var msgInterval = 60;//秒
                                if(pageData && pageData.config){
                                    if(pageData.config.msgInterval && pageData.config.msgInterval.value != ""){
                                        msgInterval = parseInt(pageData.config.msgInterval.value);
                                    }
                                }
                                ret.msgInterval = msgInterval;
                            }
                        }else{
                            //邮箱
                            ret.type = "email"
                            var userEmail = user.optString("email") + "";
                            if (!userEmail || userEmail == "") {
                                ret.step = "2";
                                ret.noEmail = true;
                            }else{
                                ret.step = "2";
                                ret.showEmail = function(){
                                    var splitIndex = userEmail.indexOf("@");
                                    if(splitIndex == -1){
                                        return userEmail;
                                    }
                                    var encodeEmail = "";
                                    for(var i=0;i<userEmail.length;i++){
                                        var chat = userEmail[i];
                                        if(i>0 && i<splitIndex-1){
                                            encodeEmail += "*";
                                        }else{
                                            encodeEmail += chat;
                                        }
                                    }
                                    return encodeEmail;
                                }();
                            }

                        }
                        ret.skey = skey;
                    }
                }
            }
            setPageDataProperty(pageData,"result",JSON.stringify(ret));

            var token = GenToken.get("findPwdToken");
            setPageDataProperty(pageData, "token", token);
        } catch (e) {
            $.log(e);
        }
    });
})(dataProcessor);