//#import DateUtil.js
//#import search.js
//#import product.js
//#import moment.min.js
//#import $combiproduct:services/CombiProductService.jsx
function getBooleanValue(v) {
    if (v == 'F') {
        return 'F';
    }
    if (v == 'T') {
        return 'T';
    }
    if (v == 'N') {
        return 'F';
    }
    if (v == 'Y') {
        return 'T';
    }
    if (v == true) {
        return 'T'
    }
    if (v == false) {
        return 'F'
    }
}
var productId = id;
try {
    SearchService.deleteSolr("isoneEmall", id);
} catch (e) {
    $.log("\n");
    $.log(e);
}
try {
    var combiProduct = CombiProductService.getCombiProduct(productId);
    if (combiProduct) {
        var doc = {};
        //套餐名称
        doc.title_text = combiProduct.title;
        //创建时间
        doc.createTime_tdt = moment(Number(combiProduct.createTime)).toISOString();
        var fixedPrice = getBooleanValue(combiProduct.fixedPrice);
        //套餐总价格索引
        if (fixedPrice === "T" && combiProduct.priceRecs && combiProduct.priceRecs.length > 0) {
            for (var x = 0; x < combiProduct.priceRecs.length; x++) {
                var value = combiProduct.priceRecs[x];
                if (value.entityType == "entitytype_usergroup" && value.entityId == "c_101") {
                    doc.price_f = value.price*1;
                }
            }
        } else {
            if(combiProduct.isDefault){
                doc.price_f = combiProduct.price*1;
            }else {
                var packagePriceTwo = 0;      //子商品会员价和
                var isNeed = false; //是否有默认商品
                for (var z = 0; z < combiProduct.parts.length; z++) {
                    var value = combiProduct.parts[z];
                    var options = value.options;
                    for (var s = 0; s < options.length; s++) {
                        if (options[s].priceType == "percent") {
                            if (!isNaN(options[s].price)) {
                                options[s].price = options[s].price * 1 * options[s].percentage / 100
                            }
                        }
                        if (options[s].isDefault) {
                            if (!isNaN(options[s].price)) {
                                packagePriceTwo += options[s].price * 1 * Number(options[s].num);
                            }
                            isNeed = true;
                        }
                        if (s == (options.length - 1) && !isNeed) {
                            if (!isNaN(options[0].price)) {
                                packagePriceTwo += options[0].price * 1 * Number(options[0].num);
                            }
                        }
                    }
                }
                doc.price_f = packagePriceTwo*1;
            }

        }
        $.log(combiProduct.id+"=== doc.price_f==="+ doc.price_f+"===/n")
        //是否一口价
        doc.fixedPrice = fixedPrice;
        //套餐创建人id
        doc.ownerUserId = combiProduct.ownerUserId;
        //套餐上下架状态
        doc.published = getBooleanValue(combiProduct.published);
        //套餐上下架时间
        if (combiProduct.publishedTime)
            doc.publishedTime_tdt = moment(Number(combiProduct.publishedTime)).toISOString();
        //套餐审核状态
        doc.certified = getBooleanValue(combiProduct.certified);
        //商家id
        doc.merchantId = combiProduct.merchantId;
        //分类
        if (combiProduct.columnIds && combiProduct.columnIds !== "") {
            if(combiProduct.columnIds.indexOf(',')!=-1){
                doc.columnIds_multiValued = combiProduct.columnIds.split(",");
            }else{
                doc.columnIds_multiValued = combiProduct.columnIds;
            }

        }

        //索引，多个productId
        if (combiProduct.parts) {
            var productIds = [], tags = [];
            combiProduct.parts.forEach(function (part) {
                if (part.options) {
                    var optionProductIds = part.options.map(function (option) {
                        return option.productId;
                    });
                    productIds = productIds.concat(optionProductIds);
                }
                tags.push(part.tag);
            });

            //套餐标签索引
            doc.tage_multiValued = tags;
            //套餐商品id索引
            doc.productIds_multiValued = productIds;
        }

        if (combiProduct.extended) {
            if (combiProduct.extended.building) {
                //索引，楼盘编码
                doc.buildingCode = combiProduct.extended.building.buildingCode;
            }

            //索引，多个房型id
            if (combiProduct.extended.fangXingCodes) {
                if (combiProduct.extended.fangXingCodes) {
                    doc.fanxinId_multiValued = combiProduct.extended.fangXingCodes;
                }
                //索引，位置
                doc.fangXingPart = combiProduct.extended.fangXingPart;
                //面积
                doc.fangXingArea_f = combiProduct.extended.areaSize;
            }

            //索引，房型风格
            if (combiProduct.extended.aboutFangXing) {
                var aboutFangXing = combiProduct.extended.aboutFangXing.map(function (productItem) {
                    return productItem
                });
                doc.aboutFangXings_multiValued = aboutFangXing;
            }
        }
        //套餐id
        doc.id = combiProduct.id;
        //套餐销量
        doc.sales_i = CombiProductService.getSales(CombiProductService.getSalesKey(productId));
        //套餐索引类型
        doc.type = "combiProduct";
        //是否删除
        doc.deleted = getBooleanValue(combiProduct.deleted);
        //keyword索引:包括名称,系列编码,系列内名称
        var keyword = combiProduct.id + "|";
        if (combiProduct.title)
            keyword += combiProduct.title + "|";
        if (combiProduct.seriesCode)
            keyword += combiProduct.seriesCode + "|";
        if (combiProduct.seriesDiffName)
            keyword += combiProduct.seriesDiffName;
        doc.keyword_text = keyword;
        try {
            SearchService.indexToSolr("isoneEmall", [doc]);
            //SearchService.index([doc], [id], "combiProduct");
        }
        catch (e) {
            $.log("\n");
            $.log(e);
        }
    }
} catch (e) {
    $.log("组合商品建索引出错：" + e);
    //SearchService.index([doc],[id],"PRODUCT");
}



