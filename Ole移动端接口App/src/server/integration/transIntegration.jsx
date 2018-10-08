//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B130013',
        msg: ""
    };
    try {
        var shopid = $.params.shopid;//店号
        var memberid = $.params.memberid;//会员编号
        var cardno = $.params.cardno;//卡号
        var sdate = $.params.sdate;//营业日期
        var point = $.params.point;//积分
        var payvalue = $.params.payvalue;//金额
        var channel = "6";//渠道
        var pointstype = "100000";//积分类型
        var directflag = $.params.directflag;//交易增减方向
        var sheetid = $.params.sheetid;//交易单号
        var sheettype = $.params.sheettype;//交易类型
        var note = $.params.note;//备注
        if(!memberid || memberid == null){
            ret.msg = "会员编码不能为空";
            ret.code = "E1B130014";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!shopid || shopid == null){
            ret.msg = "门店id不能为空";
            ret.code = "E1B130015";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!cardno || cardno == null){
            ret.msg = "会员卡号不能为空";
            ret.code = "E1B130016";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!sdate || sdate == null){
            ret.msg = "营业日期不能为空";
            ret.code = "E1B130021";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!point || point == null){
            ret.msg = "消费积分不能为空";
            ret.code = "E1B130024";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!payvalue || payvalue == null){
            ret.msg = "交易金额不能为空";
            ret.code = "E1B130025";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!directflag || directflag == null){
            ret.msg = "增减方向不能为空";
            ret.code = "E1B130026";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!sheetid || sheetid == null){
            ret.msg = "交易单号不能为空";
            ret.code = "E1B130027";
            out.print(JSON.stringify(ret));
            return;
        }
        var integralobj = {
            saleshopid:shopid,
            memberid:memberid,
            cardno:cardno,
            sdate:sdate,
            points:point,
            pointstype:pointstype,
            payvalue:payvalue,
            channel:channel,
            directflag:directflag,
            sheetid:sheetid,
            sheettype:sheettype,
            note:note
        };
        var memberobj = UserService.transIntegration(integralobj);
        var status = memberobj.status;
        if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "积分交易成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B130003";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
            return;
        }

    } catch (e) {
        ret.msg = "积分交易失败";
        ret.code = "E1B130004";
        out.print(JSON.stringify(ret));
    }

})();

