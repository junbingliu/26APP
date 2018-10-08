//#import Util.js
//#import appraise.js
//#import file.js
//#import login.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import $oleMobileApi:services/ProductCommentLikeService.jsx

/**
 * 获取商品评论接口
 * 获取好中差评数量，评论总数 根据好评 中评 差评 追加 等条件获取评论列表
 * apprType: "-1" 差评 "0" 中评 "1" 好评 "all" 总评价  根据此参数获取相应的评论列表
 */
(function () {
    var res = CommonUtil.initRes();
    try {
        var page = $.params.page || 1,
            limit = $.params.limit || 20,
            apprType = $.params.apprType || "all", //如果此参数不传，则默认取所有的评论
            productId = $.params.productId;
        if (!productId) {
            CommonUtil.setErrCode(res, ErrorCode.product.E1M00004);
            return;
        }

        var appraisSearchArgs = {
            "productId": productId,
            "effect": "true",
            "searchIndex": true,
            "doStat": true, //是否统计当前条件下的好中差数量
            "page": page,
            "total": apprType, //好评、中评、差评
            "limit": limit,
            "logoSize": "60X60",
            "waitingCertifyState": "0", ////0：已审核 1：待审核
            "isGetRelAppraise": true
        };

        var appraisSearchResult = AppraiseService.getProductAppraiseList(appraisSearchArgs);
        $.log("appraisSearchResult=="+JSON.stringify(appraisSearchResult));
        //处理图片路径，获取评论点赞数，当前用户是否已点赞
        var records = appraisSearchResult.recordList;
        if (records.length > 0) {
            //处理评论图片路径
            for (var i = 0, len = records.length; i < len; i++) {
                var images = records[i].images;
                $.log("images"+images);
                var imagesUrl = [];
                if (images && images.length > 0) {
                    for (var j = 0; j < images.length; j++) {
                        var fileId = images[j];
                        var fullPath = FileService.getFullPath(fileId);
                        imagesUrl.push(fullPath);

                    }
                    appraisSearchResult.recordList[i].images = imagesUrl;
                }
                //处理追评图片路径
                if (records[i].hasRelAppraise == 'Y' && records[i].relAppraise) {
                    var reImages = records[i].relAppraise.images;
                    var tmpImgs = [];
                    if (reImages && reImages instanceof Array) {
                        for (var j = 0; j < reImages.length; j++) {
                            fileId = reImages[j];
                            fullPath = FileService.getFullPath(fileId);
                            tmpImgs.push(fullPath);
                        }
                        appraisSearchResult.recordList[i].relAppraise.images = tmpImgs;
                    }
                }
                var commentId = records[i].id;
                var loginUserId = LoginService.getFrontendUserId();
                var ret = ProductCommentLikeService.getProductCommentLike(loginUserId, productId, commentId, "get");
                if (ret.data) {
                    appraisSearchResult.recordList[i].likes = ret.data;
                }
            }
        }
        CommonUtil.setRetData(res, appraisSearchResult);
        return;
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.product.E1Z00002, e);
    }


})();