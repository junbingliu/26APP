//#import Util.js
//#import product.js
//#import login.js
//#import file.js
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
;(function () {
    try {
        var userId = $.params.userId || "";
        if (!userId) {
            userId = LoginService.getFrontendUserId();
        }
        Preconditions.checkArgument(userId, "用户没有登录！");

        var state = $.params.state || "0";

        var result = {};

        result.orderList = [{},{},{},{},{}];
        result.totalRecords = result.orderList.length;

        result.orderList[0].orderId = "test1";
        result.orderList[0].createTime = new Date().getTime();
        result.orderList[0].productId = "p_2000001";
        result.orderList[0].productName = ProductService.getProduct("p_2000001").name;//商品名称
        result.orderList[0].productLogo = FileService.getFullPath(ProductService.getProduct("p_2000001").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.orderList[0].activityId = "60000";// 活动id
        result.orderList[0].userInfo = {
            loginId: "free",
            userId: "u_4080002",
            lastModifyUserId: "u_4080002",
            realName: "free",
            lastModifyTime: "1500951903687"
        };
        result.orderList[0].states = {
            refundState: {
                state: "p300"
            },
            payState: {
                state: "p200"
            },
            approvalState: {
                state: "a100"
            },
            processState: {
                state: "p100"
            },
            trialReportState: {
                state: "TP002"
            }
        };

        result.orderList[1].orderId = "test1";
        result.orderList[1].createTime = new Date().getTime();
        result.orderList[1].productId = "p_200067";
        result.orderList[1].productName = ProductService.getProduct("p_200067").name;//商品名称
        result.orderList[1].productLogo = FileService.getFullPath(ProductService.getProduct("p_200067").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.orderList[1].activityId = "60000";// 活动id
        result.orderList[1].userInfo = {
            loginId: "free",
            userId: "u_4080002",
            lastModifyUserId: "u_4080002",
            realName: "free",
            lastModifyTime: "1500951903687"
        };
        result.orderList[1].states = {
            refundState: {
                state: "p300"
            },
            payState: {
                state: "p201"
            },
            approvalState: {
                state: "a100"
            },
            processState: {
                state: "p102"
            },
            trialReportState: {
                state: "TP002"
            }
        };

        result.orderList[2].orderId = "test1";
        result.orderList[2].createTime = new Date().getTime();
        result.orderList[2].productId = "p_2730002";
        result.orderList[2].productName = ProductService.getProduct("p_2730002").name;//商品名称
        result.orderList[2].productLogo = FileService.getFullPath(ProductService.getProduct("p_2730002").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.orderList[2].activityId = "60000";// 活动id
        result.orderList[2].userInfo = {
            loginId: "free",
            userId: "u_4080002",
            lastModifyUserId: "u_4080002",
            realName: "free",
            lastModifyTime: "1500951903687"
        };
        result.orderList[2].states = {
            refundState: {
                state: "p300"
            },
            payState: {
                state: "p201"
            },
            approvalState: {
                state: "a100"
            },
            processState: {
                state: "p112"
            },
            trialReportState: {
                state: "TP002"
            }
        };


        result.orderList[3].orderId = "test1";
        result.orderList[3].createTime = new Date().getTime();
        result.orderList[3].productId = "p_2730002";
        result.orderList[3].productName = ProductService.getProduct("p_2730002").name;//商品名称
        result.orderList[3].productLogo = FileService.getFullPath(ProductService.getProduct("p_2730002").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.orderList[3].activityId = "60000";// 活动id
        result.orderList[3].userInfo = {
            loginId: "free",
            userId: "u_4080002",
            lastModifyUserId: "u_4080002",
            realName: "free",
            lastModifyTime: "1500951903687"
        };
        result.orderList[2].states = {
            refundState: {
                state: "p300"
            },
            payState: {
                state: "p201"
            },
            approvalState: {
                state: "a100"
            },
            processState: {
                state: "p112"
            },
            trialReportState: {
                state: "TP001"
            }
        };

        result.orderList[4].orderId = "test1";
        result.orderList[4].createTime = new Date().getTime();
        result.orderList[4].productId = "p_2730002";
        result.orderList[4].productName = ProductService.getProduct("p_2730002").name;//商品名称
        result.orderList[4].productLogo = FileService.getFullPath(ProductService.getProduct("p_2730002").DynaAttrs.attr_10000.value[0].fileId);//商品logo
        result.orderList[4].activityId = "60000";// 活动id
        result.orderList[4].userInfo = {
            loginId: "free",
            userId: "u_4080002",
            lastModifyUserId: "u_4080002",
            realName: "free",
            lastModifyTime: "1500951903687"
        };
        result.orderList[4].states = {
            refundState: {
                state: "p300"
            },
            payState: {
                state: "p201"
            },
            approvalState: {
                state: "a100"
            },
            processState: {
                state: "p112"
            },
            trialReportState: {
                state: "TP003"
            }
        };


        out.print(JSON.stringify(result));
    }catch (e){
        ResponseUtil.error(e.message);
    }

})();