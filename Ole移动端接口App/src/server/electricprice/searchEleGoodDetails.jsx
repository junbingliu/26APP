//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import sysArgument.js
//#import code2product.js
//#import cardBatch.js
//#import product.js
//#import DateUtil.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx
//#import $OleProductLabelApp:services/ProductLabelService.jsx
//#import @server/util/CartUtil.jsx

/**
 * 查询电子价签商品详情以及赠送优惠券信息
 * @author
 * @email
 * @date 2017-07-31
 */
(function () {
    var ret = {
        code: 'E1B200001',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        var buyerId = "";//u_4110001
        if (jUser) {
            buyerId = jUser.id;
        }
        var barCode = $.params.barCode;
        var merchantId = CartUtil.getOleStandardMerchantId();
        $.log("barCode="+barCode);
        $.log("merchantId="+merchantId);
        var returnObj = {};
        //获取商品详情信息
        var gdObj = {};
        //商品ID
        var productId = Code2ProductService.getProductIdByBarcode(merchantId,barCode);
        $.log("productId="+productId);
        //productId = "p_180316";
        if(productId){
            var pageNum = 1;
            var limit = 10;
            var params = {
                productId:productId,
                pageNum:pageNum,
                limit:limit
            };
            //获取商品对象
            var proObj = ProductService.getProduct(productId);
            //商品名称
            var productName = proObj.name;
            //头图url
            var headImageUrls = [];
            //商详类型
            var contentType;
            //纯文字列头
            var wordColumns;
            //纯图片内容
            var imageContents;
            //纯文字内容
            var wordContents;
            var gooddetailobj = ProductLabelService.search(params);
            $.log("gooddetailobj=="+JSON.stringify(gooddetailobj));
            if(gooddetailobj){
                var gooddetailList = gooddetailobj.list;
                var len = gooddetailList.length;
                if(len>0){
                    var tempObj = gooddetailList[0];
                    var headImages = tempObj.headImages;
                    for(var i=0;i<headImages.length;i++){
                        var headImageObj = headImages[i];
                        headImageUrls.push(headImageObj.url);
                    }
                    contentType = tempObj.contentType;
                    wordColumns = tempObj.wordColumns;
                    imageContents = tempObj.imageContents;
                    wordContents = tempObj.wordContents;
                    gdObj.productName = productName;
                }
            }
            gdObj.headImageUrls = headImageUrls;
            gdObj.contentType = contentType;
            gdObj.wordColumns = wordColumns;
            gdObj.imageContents = imageContents;
            gdObj.wordContents = wordContents;
        }

        //获取优惠券信息
        var jActivityObj = {};
        //多个活动券批次id，以,分隔
        var cardBatchIds = "";
        var electricActivityshowIds = "";
        //可领取券数量
        var cardNum = 0;
        //展示券批次信息
        var cardBatchShowObj = {};
        //验证券批次对象
        var cardBatchcheckObj = {};
        var electricActivityIds = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "electric_activity");
        var electricActivityIdArr = electricActivityIds.split(",");
        var k=0;
        for(var i =0;i<electricActivityIdArr.length;i++){
            var electricActivityId = electricActivityIdArr[i];
            if(electricActivityId!="" && electricActivityId != null){
                var jActivity = FreeGetCardService.getActivity(electricActivityId);
                //校验活动的合法性
                var checkResult = FreeGetCardService.checkActivity(jActivity);
                if (checkResult.code != "0") {
                    continue;
                }
                //如果已登录
                if(buyerId){
                    var jLimitAmount = FreeGetCardService.getLimitAmount(electricActivityId,buyerId);
                    if (jLimitAmount) {
                        //如果可领取张数小于领取张数,则过滤此活动
                        if ( jActivity.amount - jLimitAmount.amount < jActivity.count) {
                            continue;
                        }
                    }
                }
                //验证卡批次是否过期
                var tempbatchId = jActivity.batchIds;
                cardBatchcheckObj = CardBatchService.getCardBatchById(tempbatchId);
                var curTime = (new Date()).getTime();
                var longEndTime = cardBatchcheckObj.effectedEnd;
                //如果券批次已过期，则过滤此券批次
                if(curTime > longEndTime){
                    continue;
                }
                //展示券信息
                if(k == 0){
                    cardBatchShowObj = cardBatchcheckObj;
                    var effectedBeginStr = DateUtil.getShortDate(cardBatchShowObj.effectedBegin);
                    var effectedEndStr = DateUtil.getShortDate(cardBatchShowObj.effectedEnd);
                    cardBatchShowObj.effectedBegin = effectedBeginStr;
                    cardBatchShowObj.effectedEnd = effectedEndStr;
                    k++;
                }
                electricActivityshowIds = electricActivityshowIds + electricActivityId + ",";
                cardBatchIds = cardBatchIds + tempbatchId + ",";
                cardNum = cardNum + parseInt(jActivity.count);
            }
        }
        //去掉最后一个逗号
        electricActivityshowIds = electricActivityshowIds.substr(0,electricActivityshowIds.length-1);
        cardBatchIds = cardBatchIds.substr(0,cardBatchIds.length-1);
        jActivityObj.electricActivityIds = electricActivityshowIds;
        jActivityObj.cardNum = cardNum;
        jActivityObj.cardBatchIds = cardBatchIds;
        jActivityObj.cardBatchShowObj = cardBatchShowObj;
        returnObj.activityObj = jActivityObj;
        returnObj.goodObj = gdObj;
        ret.code = "S0A00000";
        ret.msg = "查询电子价签商品详情以及优惠券成功";
        ret.data = returnObj;
        out.print(JSON.stringify(ret));

    } catch (e) {
        $.log("电子价签异常日志searchEleGoodDetails："+e);
        ret.code = "E1B200003";
        ret.msg = "查询电子价签商品详情以及优惠券异常";
        out.print(JSON.stringify(ret));
    }
})();

