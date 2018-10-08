//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx

(function () {

    var result = {};
    try {
        var id = $.params["id"];
        var jRecord = PrizeSettingSomService.get(id);

        if(!jRecord){
            //todo:
            return;
        }
        var Sweepstakes_activity_type = $.params["Sweepstakes_activity_type"];
        var Activity_name = $.params["Activity_name"];
        var upload_image = $.params["upload_image"];
        var Starting_angle = $.params["Starting_angle"];
        var End_angle = $.params["End_angle"];
        var Prize_number = $.params["Prize_number"];
        var Maximum_number_prizes = $.params["Maximum_number_prizes"];
        var Activity_grade = $.params["Activity_grade"];
        var gradeName =$.params["gradeName"];
        var Award_notice = $.params["Award_notice"];
        var Front_end_display_information = $.params["Front_end_display_information"];
        var Prize_time = $.params["Prize_time"];
        var integral = $.params["integral"];
        var Prize_type = $.params["Prize_type"];
        var Integral_multiples = $.params["Integral_multiples"];
        var VIP_coupon = $.params["VIP_coupon"];
        var vipCouponName = $.params["vipCouponName"];
        var CPS_coupon = $.params["CPS_coupon"];
        var cpsCouponName = $.params["cpsCouponName"];
        jRecord.Sweepstakes_activity_type = Sweepstakes_activity_type;
        jRecord.Activity_name = Activity_name;
        jRecord.upload_image = upload_image;
        jRecord.Starting_angle = Starting_angle;
        jRecord.End_angle = End_angle;
        jRecord.Prize_number = Prize_number;
        jRecord.Maximum_number_prizes = Maximum_number_prizes;
        jRecord.Activity_grade = Activity_grade;
        jRecord.gradeName = gradeName;
        jRecord.Award_notice = Award_notice;
        jRecord.Front_end_display_information = Front_end_display_information;
        jRecord.Prize_time = Prize_time;
        jRecord.integral = integral;
        jRecord.Prize_type = Prize_type;
        jRecord.Integral_multiples = Integral_multiples;
        jRecord.VIP_coupon = VIP_coupon;
        jRecord.vipCouponName = vipCouponName;
        jRecord.CPS_coupon = CPS_coupon;
        jRecord.cpsCouponName = cpsCouponName;
        PrizeSettingSomService.update(jRecord);
        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

