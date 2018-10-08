//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

/**
 * 会员开卡接口，与原来app的接口只有渠道和openId的差异
 */
(function () {
    var ret = {
        code: 'E1B120010',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var buyerId = jUser.id;//u_4110001

        var channel = $.params.channel || "2";//来源渠道,1=门店,2=微信,3=电商,4=支付宝,5=微信支付,6=OLEAPP
        var thirdid = buyerId;//第三方Id(openid)
        var unionid = jUser.weixinUnionId || buyerId;//第三方Id(openid)
        var idcard = $.params.idcard;//身份证号
        var shopid = $.params.shopid || "";//门店$.params.shopid
        var guestname = $.params.guestname;//会员名称
        var guestsex = $.params.guestsex;//会员性别
        var mobile = $.params.mobile;//手机号码
        var province = $.params.province;//省
        var city = $.params.city;//市
        var district = $.params.district;//区
        var address = $.params.address;//地址
        var isforce = "0";//积分参与转券标识

        if(!thirdid || thirdid == null){
            ret.msg = "第三方id不能为空";
            ret.code = "E1B120011";
            out.print(JSON.stringify(ret));
            return;
        }
        if((shopid ==""||shopid == null)){
            ret.msg = "门店不能为空";
            ret.code = "E1B120012";
            out.print(JSON.stringify(ret));
            return;
        }
        if((guestname ==""||guestname == null)){
            ret.msg = "会员名称不能为空";
            ret.code = "E1B120013";
            out.print(JSON.stringify(ret));
            return;
        }
        if((mobile ==""||mobile == null)){
            ret.msg = "手机号码不能为空";
            ret.code = "E1B120014";
            out.print(JSON.stringify(ret));
            return;
        }
        var paramobj = {
            channel:channel,
            thirdid:thirdid,
            unionid:unionid,
            idcard:idcard,
            shopid:shopid,
            guestname:guestname,
            guestsex:guestsex,
            mobile:mobile,
            province:province,
            city:city,
            district:district,
            address:address,
            isforce:isforce
        }
        //调用会员新开卡接口
        var memberobj = UserService.openMemberCard(paramobj);
        var status = memberobj.status;
        if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "会员开卡成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B120015";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
        }

    } catch (e) {
        ret.msg = "会员开卡失败";
        ret.code = "E1B120016";
        out.print(JSON.stringify(ret));
    }

})();

