//#import Util.js
//#import order.js
//#import product.js
//#import merchant.js
//#import code2product.js
;
(function () {

    $.log("\n\n........5555555555555555555555............................doMoveOrderTask.jsx... begin");

    var jOrder = OrderService.getOrder(orderId);
    var merchantId = jOrder.merchantId;
    var storeMerchantId = jOrder.storeMerchantId;
    if (!storeMerchantId) {
        //不存在自提门店，则不继续
        return;
    }
    if (storeMerchantId == merchantId) {
        //订单已经属于目标门店商家，则不继续
        return;
    }


    var items = jOrder.items;
    for (var itemId in items) {
        var jItem = items[itemId];
        var realSkuId = jItem.realSkuId;
        var name = jItem.name;

        var productId = Code2ProductService.getProductIdByRealSkuId(storeMerchantId, realSkuId);

        var jProduct = ProductService.getProductWithoutPrice(productId);
        var headSku = ProductService.getHeadSku(productId);
        $.log("\n.................999999999...............storeMerchantId="+storeMerchantId);
        $.log("\n.................999999999...............realSkuId="+realSkuId);
        $.log("\n.................999999999...............productId="+productId);
        $.log("\n.................999999999...............productVersionId="+jProduct._v);
        jItem.productId = productId;
        jItem.productVersionId = jProduct._v;
        jItem.skuId = headSku.id;
    }

    var jMerchant = MerchantService.getMerchant(storeMerchantId);

    var deliveryInfo = jOrder.deliveryInfo;
    //todo:

    var sellerInfo = jOrder.sellerInfo;
    sellerInfo.merId = storeMerchantId;
    sellerInfo.merName = jMerchant.name_cn;

    jOrder.merchantId = storeMerchantId;
    // jOrder.put("shopId", "");//todo:
    // jOrder.put("bShopId", "");//todo:

    var isOk = OrderService.updateOrder(orderId, jOrder, "u_sys");
    if(isOk){
        OrderApi.IsoneOrderEngine.orderService.add2List(orderId, jOrder.createTime, storeMerchantId, "c_o_m_1000", "all");
        OrderApi.IsoneOrderEngine.orderService.deleteFromList(orderId, jOrder.createTime, merchantId, "c_o_m_1000", "all");
    }


    $.log("\n\n........5555555555555555555555............................doMoveOrderTask.jsx... end");

})();

