//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/LotteryLogService.jsx
//#import doT.min.js

(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            result.code = "101";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }
        var jRecord = {};
        var  name = $.params["lotteryId"];
        jRecord =LotteryLogService.get(name);
        var pageDate ={
            id:name,
            jRecord:jRecord
        }
/*
        var template = $.getProgram(appMd5, "pages/Recordfrom.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageDate));*/


        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(jRecord));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

