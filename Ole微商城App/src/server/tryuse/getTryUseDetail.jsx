//#import Util.js
//#import file.js
//#import DateUtil.js
//#import @server/util/H5CommonUtil.jsx
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $oleMobileApi:services/ProductLikeUtilService.jsx
//#import $oleMobileApi:services/FavoriteGoodsService.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx

(function () {
    var activeId = $.params.id;//试用商品id
    var imageSize = $.params["imageSize"] || "750X420";//图片规格

    var ret = ErrorCode.S0A00000;
    if (!activeId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }

    if (activeId.indexOf("tryOutManage_") == -1) {
        activeId = "tryOutManage_" + activeId;
    }
    var obj = tryOutManageServices.getById(activeId);
    if (!obj) {
        H5CommonUtil.setErrorResult(ErrorCode.tryuse.E1M110001);
        return;
    }
    var channel = obj.channel;//发布渠道["app","h5"]
    if (!channel) {
        H5CommonUtil.setErrorResult(ErrorCode.tryuse.E1M110002, "", "试用活动没有配置渠道");
        return;
    }
    if (channel.indexOf("h5") == -1) {
        H5CommonUtil.setErrorResult(ErrorCode.tryuse.E1M110002, "", "试用活动渠道不匹配");
        return;
    }
    var productList = [];
    if (obj.state == "1") {
        var searchParams = {};
        searchParams.activeId = activeId;
        searchParams.state = "1";
        var searchArgs = {
            fetchCount: 30,
            fromPath: 0
        };
        var qValues = tryOutProductQuery.getQuery(searchParams);
        var queryArgs = {
            mode: 'adv',
            q: qValues
        };
        searchArgs.sortFields = [{
            field: "priority",
            type: "STRING",
            reverse: false
        }, {
            field: "createTime",
            type: "LONG",
            reverse: false
        }];
        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var result = SearchService.search(searchArgs);
        var ids = result.searchResult.getLists();
        if (ids.size() > 0) {
            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var productObj = tryOutManageServices.getProductObj("", objId);
                if (productObj) {
                    if (productObj.marketPrice) {
                        productObj.memberPrice = productObj.marketPrice;//将会员价设置成后台的市场价
                    }
                    var newObj = {
                        id: productObj.productObjId,
                        productId: productObj.id,
                        memberPrice: productObj.memberPrice,
                        unitPrice: productObj.unitPrice,
                        marketPrice: productObj.marketPrice,
                        name: productObj.name,
                        sellNum: productObj.sellNum || "0",//试用商品数量
                        productImage: productObj.productImage,
                        productDescription: productObj.productDescription,//商品描述
                    };
                    productList.push(newObj);
                }
            }
        }
    } else {
        H5CommonUtil.setErrorResult(ErrorCode.tryuse.E1M110003);
        return;
    }
    if (obj.headImageFileId) {
        obj.headImage = FileService.getRelatedUrl(obj.headImageFileId, "750X420");
        var endTime = DateUtil.getLongTimeByFormat(obj.endTime, "yyyy-MM-dd HH:mm");
        obj.distanceEnd = endTime - new Date().getTime();//距离结束时间
    }
    var data = {
        activeObj: {
            id: obj.id,
            title: obj.title,
            beginTime: obj.beginTime,
            endTime: obj.endTime,
            headImage: obj.headImage,
            distanceEnd: obj.distanceEnd,
            description: obj.description,//试用描述
        },
        productList: productList
    };

    H5CommonUtil.setSuccessResult(data);
})();