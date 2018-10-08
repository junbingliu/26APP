//#import Util.js
//#import login.js
//#import file.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {

    var result = {
        RETURN_CODE: "S0A00000",
        RETURN_DESC: "删除成功"
    };
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先登录";
            return;
        }

        var id = $.params.id;
        var merchantId = $.params.m;
        var data={
            id:id,
            merchantId:merchantId,
            loginUserId:loginUserId
        };
        var ret = PushManagementService.delPushOperationRecord(data);
        //
        // result.code = "0";
        // result.msg = "删除成功！";
        out.print(JSON.stringify(ret));
        return;
    } catch (e) {
        result.RETURN_CODE = "S0A00001";
        result.RETURN_DESC = "操作出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    }


})();

