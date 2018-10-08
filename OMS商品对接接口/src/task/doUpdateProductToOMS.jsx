//#import Util.js
//#import product.js
//#import merchant.js
//#import ProductUtil.js
//#import DynaAttrUtil.js
//#import DateUtil.js
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx
;
(function () {

    var jProduct = ProductService.getProduct(productId);
    if (!jProduct) {
        return;
    }

    var merchantId = jProduct.merchantId;//todo:限制商家对接
    //if (!(merchantId && merchantId == "m_100")) {
    //    //只对接m_100的商家
    //    return;
    //}
    var skuList = [];
    if (actionType == "productAdd") {
        //商品的添加
        skuList = getSkuListForProduct(productId, jProduct, "create");
    } else if (actionType == "productUpdate") {
        //商品的修改
        //skuList = getSkuListForProduct(productId, jProduct, "modify");
        skuList = getSkuListForProduct(productId, jProduct, "Manage");
    } else if (actionType == "productDelete") {
        //商品的删除
        skuList = getSkuListForProduct(productId, jProduct, "delete");
    } else if (actionType == "skuAdd") {
        //SKU的添加
        skuList = getSkuListForSku(productId, jProduct, skuId, "create");
    } else if (actionType == "skuUpdate") {
        skuList = getSkuListForProduct(productId, jProduct, "Manage");
        //SKU的修改
    } else if (actionType == "skuDelete") {
        //SKU的删除
        skuList = getSkuListForSku(productId, jProduct, skuId, "delete");
    }

    if (skuList.length > 0) {
        var jParams = {};
        jParams.skus = skuList;
        OmsEsbProductService.doSendToOMS(productId, jParams);
    }
})();

/**
 * 商品添加组合的skuList
 */
function getSkuListForProduct(productId, jProduct, action) {
    var jSkuInfo;
    var jSku;
    var skuList = [];
    var skus = ProductService.getSkus(productId);
    if (skus.length == 0) {
        return skuList;
    }

    var columnId = jProduct.columnId;
    var jTemplate = DynaAttrService.getCompleteAttrTemplateByColumnId(columnId);

    var formatCurTime = DateUtil.getLongDate(new Date().getTime());
    if (skus.length > 1) {
        for (var i = 0; i < skus.length; i++) {
            jSku = skus[i];
            if (jSku.isHead) {
                //continue;//默认的SKU也要对接过去，因为跨境的商品都是用默认的SKU来对接和管理库存的。
            }

            jSkuInfo = getSmallSku(jProduct, jSku, jTemplate, action, formatCurTime);
            skuList.push(jSkuInfo);
        }
    } else {
        jSku = skus[0];
        jSkuInfo = getSmallSku(jProduct, jSku, jTemplate, action, formatCurTime);
        skuList.push(jSkuInfo);
    }

    return skuList;
}

function getSkuListForSku(productId, jProduct, skuId, action) {
    var skuList = [];
    return skuList;
}


function getSmallSku(jProduct, jSku, jTemplate, action, formatCurTime) {
    var jSkuInfo = {};
    jSkuInfo.skuid = jSku.skuId;
    jSkuInfo.barcode = jSku.barcode;
    jSkuInfo.productnumber = jProduct.productNumber || "";
    jSkuInfo.name = jProduct.name;
    jSkuInfo.brandname = ProductUtilService.getBrandName(jProduct);
    jSkuInfo.weight = jProduct.weight || "";
    jSkuInfo.weightuom = "KG";
    jSkuInfo.volume = jProduct.volume || "";
    jSkuInfo.volumeuom = "ML";
    jSkuInfo.length = jProduct.length || "";
    jSkuInfo.lengthuom = "CM";
    jSkuInfo.wide = jProduct.wide || "";
    jSkuInfo.wideuom = "CM";
    jSkuInfo.high = jProduct.high || "";
    jSkuInfo.highuom = "CM";

    jSkuInfo.safetyqty = "";//安全库存数量
    jSkuInfo.safetyper = "";//安全库存比例（没有就不填）
    jSkuInfo.component = getAttrValue(jProduct, jTemplate, "原料成分");//原料成分

    jSkuInfo.origin = getAttrValue(jProduct, jTemplate, "产地名称");//产地名称
    jSkuInfo.specification = getAttrValue(jProduct, jTemplate, "详细规格");//详细规格
    jSkuInfo.storageAge = getAttrValue(jProduct, jTemplate, "保质期");//保质期
    jSkuInfo.minTemperature = getAttrValue(jProduct, jTemplate, "最低温度");//最低温度
    jSkuInfo.maxTemperature = getAttrValue(jProduct, jTemplate, "最高温度");//最高温度
    jSkuInfo.sellType = getSellType(jProduct, jTemplate);//销售模式（0：联营；1自营）
    jSkuInfo.ownertype = getOwnerType(jProduct, jTemplate);//0共有商品1独有商品
    jSkuInfo.storagetype = getStorageType(jProduct);//仓库属性（0干货，1生鲜，2异形）
    jSkuInfo.itemtype = getItemType(jProduct);//温控属性(0常温/1冷冻/2冷藏)
    jSkuInfo.operatetime = formatCurTime;//操作时间（格式yyyy-MM-dd HH:mm:ss）
    jSkuInfo.action = action;//Create：创建；Modify:修改；Delete：删除。首字母大写

    return jSkuInfo;
}

function getSellType(jProduct, jTemplate) {
    var sellType = getAttrValue(jProduct, jTemplate, "销售模式");
    if (sellType == "联营") {
        return "0";
    } else if (sellType == "自营") {
        return "1";
    }
    return "";
}

function getOwnerType(jProduct, jTemplate) {
    var sellType = getAttrValue(jProduct, jTemplate, "商品类型");//todo:
    if (sellType == "共有商品") {
        return "0";
    } else if (sellType == "独有商品") {
        return "1";
    }
    return "";
}

function getStorageType(jProduct) {
    var isAnomalous = OmsEsbProductService.isAnomalous(jProduct);
    var warehouseType = jProduct.warehouseType;
    if (isAnomalous) {
        return "2";
    } else if (warehouseType == "01") {
        return "0";
    } else if (warehouseType == "02") {
        return "1";
    }
    return "";
}

function getItemType(jProduct) {
    var temperatureControl = jProduct.temperatureControl;
    if (temperatureControl == "01") {
        return "0";
    } else if (temperatureControl == "02") {
        return "2";
    } else if (temperatureControl == "03") {
        return "1";
    }
    return "";
}


function getAttrIdByName(jTemplate, attrName) {
    return DynaAttrService.getAttrIdByAttrName(jTemplate, attrName, "0");
}

function getAttrValue(jProduct, jTemplate, attrName) {
    if (!jTemplate) {
        return "";
    }
    var jDynaAttrs = jProduct.DynaAttrs;
    if (!jDynaAttrs) {
        return "";
    }
    var attrId = getAttrIdByName(jTemplate, attrName);
    if (!attrId || attrId == "") {
        return "";
    }

    var jValue = jDynaAttrs[attrId];
    if (!jValue) {
        return "";
    }
    if (jValue.value) {
        return jValue.value;
    }
    return "";
}
