//#import Util.js
//#import product.js
//#import login.js
//#import file.js
//#import @oleTrialReport:utils/TrialReportUtil.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
;(function () {
    try {
        var userId = $.params.userId || "";
        if (!userId) {
            userId = LoginService.getFrontendUserId();
        }
        TrialReportUtil.checkArgument(userId, "用户没有登录！");

        var state = $.params.state || "";
        var isHistory = $.params.isHistory || "0";//非历史

        var result = {};

        result.list = [
            {}
            ];
        result.allCount = result.list.length;
        result.NumOfPage =  Math.ceil(result.allCount / 10);

        if (isHistory == "0") {
            result.list = [
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {}
            ];
            result.allCount = result.list.length;
            result.NumOfPage =  Math.ceil(result.allCount / 10);
            //0 未支付
            result.list[0].id = "test0";
            result.list[0].userId = "u_4080002";
            result.list[0].activityId = "tryOutManage_60000";
            result.list[0].productObjId = "tryOutManage_product_50000";
            result.list[0].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[0].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[0].orderId = "test0";
            result.list[0].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[0].applyState = 1;//审核通过
            result.list[0].isHistory = 0;//非历史订单
            result.list[0].orderState = "TA002";//未付款
            result.list[0].createTime = new Date().getTime();


            //1 订单已取消
            result.list[1].id = "test1";
            result.list[1].userId = "u_4080002";
            result.list[1].activityId = "tryOutManage_60000";
            result.list[1].productObjId = "tryOutManage_product_50000";
            result.list[1].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[1].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[1].orderId = "test1";
            result.list[1].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[1].applyState = 1;//审核通过
            result.list[1].isHistory = 0;//非历史订单
            result.list[1].orderState = "TA001";//订单已取消
            result.list[1].createTime = new Date().getTime();


            //2 试用报告已提交
            result.list[2].id = "test2";
            result.list[2].userId = "u_4080002";
            result.list[2].activityId = "tryOutManage_60000";
            result.list[2].productObjId = "tryOutManage_product_50000";
            result.list[2].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[2].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[2].orderId = "o_12344556";
            result.list[2].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[2].applyState = 1;//审核通过
            result.list[2].isHistory = 0;//非历史订单
            result.list[2].orderState = "TA003";//试用报告已提交
            result.list[2].createTime = new Date().getTime();

            //3 试用报告未提交
            result.list[3].id = "test3";
            result.list[3].userId = "u_4080002";
            result.list[3].activityId = "tryOutManage_60000";
            result.list[3].productObjId = "tryOutManage_product_50000";
            result.list[3].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[3].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[3].orderId = "test3";
            result.list[3].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[3].applyState = 1;//审核通过
            result.list[3].isHistory = 0;//非历史订单
            result.list[3].orderState = "TA004";//试用报告未提交
            result.list[3].createTime = new Date().getTime();


            //4 试用报告提交超时
            result.list[4].id = "test4";
            result.list[4].userId = "u_4080002";
            result.list[4].activityId = "tryOutManage_60000";
            result.list[4].productObjId = "tryOutManage_product_50000";
            result.list[4].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[4].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[4].orderId = "test4";
            result.list[4].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[4].applyState = 1;//审核通过
            result.list[4].isHistory = 0;//非历史订单
            result.list[4].orderState = "TA005";//试用报告提交超时
            result.list[4].createTime = new Date().getTime();

            //5 仍在物流配送中
            result.list[5].id = "test5";
            result.list[5].userId = "u_3710001";
            result.list[5].activityId = "tryOutManage_60000";
            result.list[5].productObjId = "tryOutManage_product_50000";
            result.list[5].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[5].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[5].orderId = "o_common_7830006";
            result.list[5].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[5].applyState = 1;//审核通过
            result.list[5].isHistory = 0;//非历史订单
            result.list[5].orderState = "TP006";//仍在物流配送中
            result.list[5].createTime = new Date().getTime();

            //6 未审核
            result.list[6].id = "test6";
            result.list[6].userId = "u_4080002";
            result.list[6].activityId = "tryOutManage_60000";
            result.list[6].productObjId = "tryOutManage_product_50000";
            result.list[6].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[6].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[6].orderId = "";
            result.list[6].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[6].applyState = 2;//没操作过
            result.list[6].isHistory = 0;//非历史订单
            result.list[6].orderState = "";
            result.list[6].createTime = new Date().getTime();

            //7 审核不通过非历史
            result.list[7].id = "test7";
            result.list[7].userId = "u_4080002";
            result.list[7].activityId = "tryOutManage_60000";
            result.list[7].productObjId = "tryOutManage_product_50000";
            result.list[7].productName = ProductService.getProduct("p_2880000").name;//商品名称
            result.list[7].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
            result.list[7].orderId = "";
            result.list[7].postageInfo = {cash:"100",integral:"100"};//邮费和积分
            result.list[7].applyState = 0;//审核不通过
            result.list[7].isHistory = 0;//非历史订单
            result.list[7].orderState = "";
            result.list[7].createTime = new Date().getTime();
        }

        //8 审核不通过历史
        result.list[0].id = "test7";
        result.list[0].userId = "u_4080002";
        result.list[0].activityId = "tryOutManage_60000";
        result.list[0].productObjId = "tryOutManage_product_50000";
        result.list[0].productName = ProductService.getProduct("p_2880000").name;//商品名称
        result.list[0].productLogo = FileService.getFullPath(ProductService.getProduct("p_2880000").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.list[0].orderId = "";
        result.list[0].postageInfo = {cash:"100",integral:"100"};//邮费和积分
        result.list[0].applyState = 0;//审核不通过
        result.list[0].isHistory = 1;//历史订单
        result.list[0].orderState = "";
        result.list[0].createTime = new Date().getTime();


        var ret = {};
        ret.code = "S0A00000";
        ret.msg = "success";
        ret.data = result;
        out.print(JSON.stringify(ret));
    }catch (e){
        ResponseUtil.error(e.message);
    }

})();