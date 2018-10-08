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
        var memberid = user.memberid;//ncms会员编码
        var levelid = user.memberlevel;//会员级别
        //var levelid = "hrtv2";//会员级别
        //var memberid = "6712690787182772452";//会员编码
        var goodslist = $.params.goodslist;//商品列表
        var posid = $.params.posid;//pos机号
        var sheetid = $.params.sheetid;//流水号
        $.log("orderpaygoodslist="+goodslist);

        if(!memberid){
            ret.code = "E1B120013";
            ret.msg = "非会员不能进行扫码购";
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
        var goodslistArr = JSON.parse(goodslist);
        var paramobj = {
            shopid:shopid,
            levelid:levelid,
            memberid:memberid,
            goodslist:goodslistArr,
            posid:posid,
            sheetid:sheetid
        }
        //查询促销商品信息
        var resultObj = ProductService.getOrderNeedPayMoney(paramobj);
        var status = resultObj.status;
        if(status == "0"){
            var retobj = resultObj.data;
            ret.code = "S0A00000";
            ret.msg = "获取订单应付金额成功";
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
        ret.msg = "获取订单应付金额失败";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

