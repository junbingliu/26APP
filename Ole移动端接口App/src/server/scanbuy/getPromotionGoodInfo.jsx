//#import Util.js
//#import product.js
//#import login.js
//#import session.js
//#import user.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120006',
        msg: ""
    };
    try {
        var user = LoginService.getFrontendUser();//前台登录的用户
        if (!user) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var shopid = $.params.shopid;//门店编号
        var levelid = user.memberlevel;//会员级别
        var memberid = user.memberid;//会员编码
        var numberid = $.params.numberid;//商品编码或条码
        //var levelid = "hrtv2";//会员级别
        //var memberid = "6712690787182772452";//会员编码
        $.log("---memberid---" + memberid);
        if (!memberid) {
            ret.code = "E1B120016";
            ret.msg = "会员编码不能为空";
            out.print(JSON.stringify(ret));
            return;
        }

        if (levelid == "hrtv2") {
            levelid = "1";
        } else if (levelid == "hrtv3") {
            levelid = "2";
        } else if (levelid == "hrtv1") {
            levelid = "0";
        } else {
            levelid = "-1";
        }
        var paramobj = {
            shopid: shopid,
            levelid: levelid,
            numberid: numberid,
            memberid: memberid
        }
        //查询促销商品信息
        var resultObj = ProductService.getPromotionGoodInfo(paramobj);
        var status = resultObj.status;
        if (status == "0") {
            var retobj = resultObj.data;
            ret.code = "S0A00000";
            ret.msg = "查询促销商品信息成功";
            ret.data = retobj;
            out.print(JSON.stringify(ret));
        } else {
            ret.code = "E1B120009";
            ret.msg = resultObj.msg;
            out.print(JSON.stringify(ret));
            return;
        }
    } catch (e) {
        ret.msg = "查询促销商品信息失败";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

