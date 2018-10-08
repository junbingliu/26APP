//#import login.js
//#import Util.js
//#import price.js
//#import product.js
//#import @server/util/H5CommonUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx

/**
 * 获取我的试用报告
 *
 * @returns {*}
 */
;(function () {
    try {

        var userId = LoginService.getFrontendUserId() || ""; // 用户报告id
        if (!userId) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return
        }

        var id = $.params.id || ""; // 试用报告id
        var orderBy = $.params.orderBy || "like";//如何排序
        var pageNum = $.params.page || 1;//页码
        var limit = $.params.limit || 10;//每页数量
        var start = (pageNum - 1) * limit;//查询时从何处开始获取

        var params = {
            id: id,
            userId: userId
        };

        var trialReportList = TrialReportUtilService.get(params, orderBy, userId, limit, start);
        var ret = {
            totalCount: trialReportList.allCount,//总数量
            curPage: trialReportList.NumOfPage,//当前面码
            list: []
        };
        for (var g = 0; g < trialReportList.list.length; g++) {
            if (trialReportList.list[g] && trialReportList.list[g].userId) {
                var report = trialReportList.list[g];
                var userInfo = TrialReportUtilService.getUserInfo(trialReportList.list[g].userId);
                var product = getProduct(report.productObjId);//获取商品
                var productId=product.id;
                var memberPrice="";
                if(productId&&productId!=""&&productId!=undefined&&productId!=null){
                    memberPrice = ProductService.getMemberPriceByProductId(productId);
                }
                var obj = {
                    id: report.id,//试用报告Id
                    productObjId: report.productObjId,//活动商品id
                    productName: report.productName,//商品名称
                    activityId: report.activityId,//活动id
                    likesCount: report.likesInfo.likesCount,//点赞数量
                    content: report.wordContent,//评价
                    sentence: report.oneSentence,//一句话心情
                    nickName: userInfo && userInfo.nickName || "",//用户昵称
                    userLogoUrl: userInfo && userInfo.userLogoUrl || "",//会员头像
                    images: report.fileIdList,//试用报告图片
                    productLogo: product.logo || "",//试用商品图片
                    likeStatus: report.likesInfo.status || "0", //0：未点赞 1：已点赞
                    memberPrice: memberPrice && memberPrice.toFixed(2) || "暂无价格",// 会员价
                    marketPrice: ProductService.getMarketPrice(product) || "暂无价格"// 市场价
                };
                ret.list.push(obj);
            }
        }
        ResponseUtil.success(ret);


    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();

/**
 * 获取商品
 * @param productObjId  不是productId
 */
function getProduct(productObjId) {
    var productObj = tryOutManageServices.getById(productObjId) || "";
    var msg;
    if (!productObj) {
        msg = productObjId + "没有对应的试用商品！";
        return;
    }

    var productInfo = ProductService.getProduct(productObj.productId) || "";

    if (productInfo) {
        if (productInfo.DynaAttrs.attr_10000) {
            var logo = FileService.getFullPath(productInfo.DynaAttrs.attr_10000.value[0].fileId) || "";
        } else {
            msg = productObjId + "商品没有对应的Logo";
            return;
        }
    }

    return {
        // name: productInfo.name || "",
        id: productObj.productId || "",
        logo: logo || "",
        // freight: productObj.freight || "",
        // msg: msg
    }
};