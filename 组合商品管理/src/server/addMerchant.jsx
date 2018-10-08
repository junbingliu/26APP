//#import Util.js
//#import merchant.js
//#import file.js
//#import DynaAttrUtil.js
//#import $combiproduct:services/CombiProductService.jsx
//#import $combiproduct:services/ComMerchantService.jsx
var IsoneModulesEngine = net.xinshi.isone.modules.IsoneModulesEngine;
var productIds = $.params.ids;
var productIdsArr = productIds.split(",");
var ret={};
var m = $.params.m;
if(m =="head_merchant") {
    productIdsArr.forEach(function (id) {
        var p = CombiProductService.getCombiProduct(id);
        var CombiId = "combiProduct_merchant" + p.merchantId;
        var comMerchant = ComMerchantService.get(CombiId);
        var IdResult = true;
        if (comMerchant) {
            if(p.published =="T"){
                IdResult = false;
            }
        }
        var merchant = MerchantService.getMerchant(p.merchantId);
        //$.log("========IdResult=========:" + IdResult);
        //为true说明之前没有加入
        if (IdResult&&merchant &&merchant.mainColumnId&&merchant.mainColumnId == "c_stylist_merchant") {
            var content = merchant.description;//个人介绍
            var stylistPic = FileService.getFullPath(merchant.logoPigeonFileId);//log图片地址
            var attributes = merchant.DynaAttrs;

            var goodsStyId = attributes["attr_stylist_001"].valueId;
            var goodStyle = DynaAttrService.getInheritedStandardValues('attrgrp_stylist_001', 'attr_stylist_001');
            for (var f = 0; f < goodStyle.length; f++) {
                if (goodStyle[f].id == goodsStyId) {
                    goodStyle = goodStyle[f].value;//擅长风格
                }
            }

            var pos = IsoneModulesEngine.merchantService.getPos(comMerchant.merchantId, merchant.columnId);
            var experience = attributes["attr_stylist_002"].value;//设计经验
            var goodsNumber = parseInt(1);
            if (merchant.name_cn) {//设计师名称
                var stylistName = merchant.name_cn;
            } else {
                var stylistName = merchant.name_en;
            }
            if (comMerchant) {
                goodsNumber = parseInt(comMerchant.goodsNumber) + 1;//作品数量
                var runParams = {
                    id: CombiId,
                    pos:pos,
                    merchantId: p.merchantId,
                    stylistPic: stylistPic,
                    content: content,
                    goodStyle: goodStyle,
                    goodsNumber: goodsNumber,
                    experience: experience,
                    styName: stylistName
                };
                ComMerchantService.update(runParams);
            } else {
                var runParams = {
                    pos:merchant.pos,
                    merchantId: p.merchantId,
                    stylistPic: stylistPic,
                    content: content,
                    goodStyle: goodStyle,
                    goodsNumber: goodsNumber,
                    experience: experience,
                    styName: stylistName
                };
                ComMerchantService.save(runParams);
            }
        }
        ret = {
            state: "ok"
        };
    });
}
out.print(JSON.stringify(ret));