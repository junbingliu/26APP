//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx

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
        jRecord.Sweepstakes_activity_type = $.params["Sweepstakes_activity_type"];
        jRecord.activityTypeName = $.params["activityTypeName"];
        jRecord.Activity_name = $.params["Activity_name"];
        jRecord.upload_image = $.params["upload_image"];
        jRecord.Starting_angle = $.params["Starting_angle"];
        jRecord.End_angle = $.params["End_angle"];
        jRecord.Prize_number = $.params["Prize_number"];
        jRecord.Maximum_number_prizes = $.params["Maximum_number_prizes"];
        jRecord.Activity_grade = $.params["Activity_grade"];
        jRecord.gradeName = $.params["gradeName"];
        jRecord.Award_notice = $.params["Award_notice"];
        jRecord.Front_end_display_information = $.params["Front_end_display_information"];
        jRecord.Prize_time = $.params["Prize_time"];
        jRecord.Prize_type = $.params["Prize_type"];
        jRecord.integral = $.params["integral"];
        jRecord.Integral_multiples = $.params["Integral_multiples"];
        jRecord.VIP_coupon = $.params["VIP_coupon"];
        jRecord.vipCouponName = $.params["vipCouponName"];
        jRecord.CPS_coupon = $.params["CPS_coupon"];
        jRecord.cpsCouponName = $.params["cpsCouponName"];
        var newId = PrizeSettingSomService.add(jRecord, loginUserId);
        result.code = "0";
        result.msg = "操作成功";
        result.newId = newId;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

