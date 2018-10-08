//#import Util.js
//#import jobs.js
//#import merchant.js
//#import file.js
//#import DynaAttrUtil.js
//#import $combiproduct:services/CombiProductService.jsx
//#import $combiproduct:services/ComMerchantService.jsx

(function () {

    var merchantId = "" + ctx.get("merchantId");

    var IsoneModulesEngine = net.xinshi.isone.modules.IsoneModulesEngine;
    $.log("...8u888888888888888888merchant=" + merchantId);
    //$.log("...productId=" + productId);
    //$.log("...priceId=" + priceId);
    //$.log("\n\n");

    var ret;
    try {
        var CombiId = "combiProduct_merchant" + merchantId;
        var comMerchant = ComMerchantService.get(CombiId);

        var merchant = MerchantService.getMerchant(merchantId);

        if (comMerchant&&merchant &&merchant.mainColumnId&&merchant.mainColumnId == "c_stylist_merchant") {

            var content = merchant.description;//个人介绍
            var stylistPic = FileService.getFullPath(merchant.logoPigeonFileId);//log图片地址
            var attributes = merchant.DynaAttrs;

            var pos = IsoneModulesEngine.merchantService.getPos(merchantId, merchant.columnId);


            var goodsStyId = attributes["attr_stylist_001"].valueId;
            var goodStyle = DynaAttrService.getInheritedStandardValues('attrgrp_stylist_001', 'attr_stylist_001');
            for (var f = 0; f < goodStyle.length; f++) {
                if (goodStyle[f].id == goodsStyId) {
                    goodStyle = goodStyle[f].value;//擅长风格
                }
            }
            var experience = attributes["attr_stylist_002"].value;//设计经验
            var goodsNumber = parseInt(1);
            if (merchant.name_cn) {//设计师名称
                var stylistName = merchant.name_cn;
            } else {
                var stylistName = merchant.name_en;
            }

            if (comMerchant) {
                goodsNumber = parseInt(comMerchant.goodsNumber);//作品数量
                var runParams = {
                    id: CombiId,
                    pos:pos,
                    merchantId: merchantId,
                    stylistPic: stylistPic,
                    content: content,
                    goodStyle: goodStyle,
                    goodsNumber: goodsNumber,
                    experience: experience,
                    styName: stylistName
                };
                ComMerchantService.update(runParams);
                 ret = {
                    state: "ok"
                };
            }
        }else{
            ret={
                state:"notMerchant"
            }
        }

        $.log("merchantId=e="+merchantId+"=="+JSON.stringify(ret))

    } catch (e) {
        $.log("error=="+e)
    }

})();

