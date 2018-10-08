/**
 * Created by 208 on 2016/2/24.
 */
//#import Util.js
//#import jobs.js
//#import search.js
//#import product.js
//#import file.js
//#import DynaAttrUtil.js
//#import merchant.js
//#import $combiproduct:services/ComMerchantService.jsx

(function () {


    var searchArgs = {
        fq:"type:combiMerchant ",
        q:"*",
        fl:"id",
        start:"0",
        wt:"json",
        rows : "20"
    };

    try {
        var res = SearchService.directSearch("combiMerchant",searchArgs);

        updataCombiProduct(res,0)


    } catch (e) {
        $.log("组合商品价格变化修改状态："+e)
    }

})();

function updataCombiProduct(res,start){
    var total = res.response.numFound;
    var IsoneModulesEngine = net.xinshi.isone.modules.IsoneModulesEngine;

    var newStart=start+20;
    var end=newStart+20;
    var limit=20;
    var ids = res.response.docs.map(function(doc){return doc.id});

    for(var x=0;x< ids.length;x++){
        var comMerchant = ComMerchantService.get(ids[x]);

        if (comMerchant) {
            var merchant = MerchantService.getMerchant(comMerchant.merchantId);
            var pos = IsoneModulesEngine.merchantService.getPos(comMerchant.merchantId, merchant.columnId);
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
            var experience = attributes["attr_stylist_002"].value;//设计经验
            var goodsNumber = parseInt(1);
            if (merchant.name_cn) {//设计师名称
                var stylistName = merchant.name_cn;
            } else {
                var stylistName = merchant.name_en;
            }
            goodsNumber = parseInt(comMerchant.goodsNumber);//作品数量
            var runParams = {
                id: ids[x],
                pos:pos,
                merchantId: comMerchant.merchantId,
                stylistPic: stylistPic,
                content: content,
                goodStyle: goodStyle,
                goodsNumber: goodsNumber,
                experience: experience,
                styName: stylistName
            };
            ComMerchantService.update(runParams);
        }


    }
    if(total< newStart){

        out.print("total=="+total);
    }else{
        var searchArgs = {
            fq:"type:combiMerchant AND deleted:F",
            q:"*",
            fl:"id",
            start:newStart+"",
            wt:"json",
            rows : limit+""
        };
        var res = SearchService.directSearch("combiMerchant",searchArgs);
        updataCombiProduct(res,end);
    }

}