//#import Util.js
//#import Info.js
//#import sysArgument.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        try {
            var mid = "head_merchant";
            var protocol = InfoService.getSimpleInfo("ctmpl_000_004",mid);

            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn")
            var returnUrl = $.params.url;
            if(!returnUrl){
                returnUrl = "";
            }

            var intervalTime = 120;//秒，发送间隔时间
            if(pageData && pageData.config && pageData.config.msgInterval && pageData.config.msgInterval.value != ""){
                var msgInterval = Number(pageData.config.msgInterval.value);
                if(!isNaN(msgInterval)){
                    intervalTime = msgInterval;
                }
            }

            var normalWebSite = $.getWebSite("");
            setPageDataProperty(pageData,"protocol",protocol);
            setPageDataProperty(pageData,"webName",webName);
            setPageDataProperty(pageData,"returnUrl",returnUrl);
            setPageDataProperty(pageData,"normalWebSite",normalWebSite);
            setPageDataProperty(pageData,"intervalTime",intervalTime);

            var token = GenToken.get("loginToken");
            setPageDataProperty(pageData, "token", token);

        } catch (e) {
            $.log(e);
        }
    });
})(dataProcessor);