//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {

    var result = {};
    try {
        var id = $.params["id"];
        var jRecord = LotteryEventManageService.get(id);
        if(!jRecord){
            //todo:
            return;
        }
        var Sweepstakes_activity_type = $.params["Sweepstakes_activity_type"];
        var Event_name = $.params["Event_name"];
        var Winning_probability = $.params["Winning_probability"];
        var startDate = $.params["startDate"];
        var endDate = $.params["endDate"];
        var type_of_activity = $.params["type_of_activity"];
        var Province = $.params["Province"];
        var City = $.params["City"];
        var Village = $.params["Village"];
        var shopName = $.params["shopName"];
        var No_small_lottery_draw = $.params["No_small_lottery_draw"];
        var Participation_conditions = $.params["Participation_conditions"];
        var Lottery_credit = $.params["Lottery_credit"];
        var Lottery_order_amount = $.params["Lottery_order_amount"];
        var Theme = $.params["Theme"];
        var Background = $.params["Background"];
        var Turntable = $.params["Turntable"];
        var Pointer = $.params["Pointer"];
        var Shopping = $.params["Shopping"];
        var Go_shopping_url = $.params["Go_shopping_url"];
        var Activity_Rules = $.params["Activity_Rules"];
        var Winning_Record = $.params["Winning_Record"];
        var payMethod_1 = $.params["payMethod_1"];
        var Lottery_jackpot_credit = $.params["Lottery_jackpot_credit"];
        var Lottery_daily_numberr= $.params["Lottery_daily_numberr"];
        var Lottery_total_number = $.params["Lottery_total_number"];
        var Rich_text_box_content = $.params["Rich_text_box_content"];
        var Share_title = $.params["Share_title"];
        var Share_introduction = $.params["Share_introduction"];
        var Share_link = $.params["Share_link"];
        var Share_pictures = $.params["Share_pictures"];

        jRecord.Sweepstakes_activity_type = Sweepstakes_activity_type;
        jRecord.Event_name = Event_name;
        jRecord.Winning_probability = Winning_probability;
        jRecord.startDate = startDate;
        jRecord.endDate = endDate;
        jRecord.type_of_activity = type_of_activity;
        jRecord.Province=Province;
        jRecord.City=City;
        jRecord.Village=Village;
        jRecord.shopName=shopName;
        jRecord.No_small_lottery_draw = No_small_lottery_draw;
        jRecord.Participation_conditions = Participation_conditions;
        jRecord.Lottery_credit = Lottery_credit;
        jRecord.Lottery_order_amount = Lottery_order_amount;
        jRecord.Theme = Theme;
        jRecord.Background = Background;
        jRecord.Turntable = Turntable;
        jRecord.Pointer = Pointer;
        jRecord.Shopping = Shopping;
        jRecord.Go_shopping_url = Go_shopping_url;
        jRecord.Activity_Rules = Activity_Rules;
        jRecord.Winning_Record = Winning_Record;
        jRecord.payMethod_1 = payMethod_1;
        jRecord.Lottery_jackpot_credit = Lottery_jackpot_credit;
        jRecord.Lottery_daily_numberr = Lottery_daily_numberr;
        jRecord.Lottery_total_number = Lottery_total_number;
        jRecord.Rich_text_box_content = Rich_text_box_content;
        jRecord.Share_title = Share_title;
        jRecord.Share_introduction = Share_introduction;
        jRecord.Share_link = Share_link;
        jRecord.Share_pictures = Share_pictures;

        LotteryEventManageService.update(jRecord);
        var jActivity=ActivitiesHenService.get(jRecord.Sweepstakes_activity_type);
        jActivity.activityNumber=jActivity.activityNumber+1;
        ActivitiesHenService.update(jActivity);

        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

