//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx

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
        jRecord.name = "李一刀";//产品问题
        jRecord.address= "广东广州";
        jRecord.content = "黄金会员";
        jRecord.contact = "13800138001";
        var newId = LotteryEventManageService.add(jRecord, loginUserId);
        //LotteryEventManageService.del('userMgtObj_60000');
       // var a = LotteryEventManageService.getAllListSize();

        result.code = "0";
        result.msg = "操作成功";
        //result.newId = newId;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

