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
        $.log("------check user------");
        if (!user) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var userId = user.id;//用户ID
        //var userId = "u_50000";
        var shopid = $.params.shopid;//门店编号
        var levelid = user.memberlevel;//会员级别
        var memberid = user.memberid;//会员编码
        //var levelid = "hrtv2";//会员级别
        //var memberid = "6712690787182772452";//会员编码
        var goodslist = $.params.goodslist;//商品列表

        $.log("------check memberid------");
        if(!memberid){
            ret.code = "E1B120017";
            ret.msg = "会员编码不能为空";
            out.print(JSON.stringify(ret));
            return;
        }

        $.log("------check shopid------");
        if(!shopid){
            ret.code = "E1B120015";
            ret.msg = "门店编号不能为空";
            out.print(JSON.stringify(ret));
            return;
        }

        $.log("------check levelid------");
        if(!levelid){
            ret.code = "E1B120014";
            ret.msg = "会员级别不能为空";
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

        $.log("------check goods list------");
        if(!goodslist){
            ret.code = "E1B120012";
            ret.msg = "商品列表不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        var goodslistArr = JSON.parse(goodslist);
        var paramobj = {
            userId:userId,
            shopid:shopid,
            levelid:levelid,
            memberid:memberid,
            goodslist:goodslistArr
        }
        //查询促销商品信息
        $.log("------coupon before param------"+JSON.stringify(paramobj));
        var resultObj = ProductService.getUserScanbuyCouponList(paramobj);
        var status = resultObj.status;
        if(status == "0"){
            var retobj = resultObj.data;
            $.log("------coupon after retobj------"+JSON.stringify(retobj));
            ret.code = "S0A00000";
            ret.msg = "获取用户可用券列表成功";
            ret.data = retobj;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B120009";
            ret.msg = resultObj.msg;
            out.print(JSON.stringify(ret));
            return;
        }
    } catch (e) {
        $.log("error info="+e);
        ret.msg = "获取用户可用券列表异常";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

