//#import Util.js
//#import merchant.js
//#import file.js
//#import DynaAttrUtil.js
//#import $combiproduct:services/CombiProductService.jsx
//#import $combiproduct:services/ComMerchantService.jsx

var combiProductStr =$.params.combiProduct;
var combiProduct = JSON.parse(combiProductStr);
var ret={};
if(combiProduct.id){
    var p = CombiProductService.getCombiProduct(combiProduct.id);
    var certified = p.certified;
    var merchants = MerchantService.getMerchant(p.merchantId);
    //如果之前审核过，那么会放到索引里面去，此时，修改comMerchantService
    if(certified =="T" && merchants.mainColumnId =="c_stylist_merchant" && p.extended.fangXingType != combiProduct.extended.fangXingType){
        var ComId="combiProduct_merchant"+p.merchantId;
        var comMerchant =ComMerchantService.get(ComId);
        var oldHouseType = comMerchant.houseType;//获取之前的户型
        if(oldHouseType){
            var oldHouseTypeList =oldHouseType.split(",");//拆分
        }

        var stylistPic = FileService.getFullPath(merchants.logoPigeonFileId);//log图片地址
        var attributes = merchants.DynaAttrs;

        var goodsStyId = attributes["attr_stylist_001"].valueId;
        var goodStyle = DynaAttrService.getInheritedStandardValues('attrgrp_stylist_001', 'attr_stylist_001');
        for (var f = 0; f < goodStyle.length; f++) {
            if (goodStyle[f].id == goodsStyId) {
                goodStyle = goodStyle[f].value;//擅长风格
            }
        }
        if (merchants.name_cn) {//设计师名称
            var stylistName = merchants.name_cn;
        } else {
            var stylistName = merchants.name_en;
        }
        var experience = attributes["attr_stylist_002"].value;//设计经验
        var houseType="";
        var fangXingTypes = p.extended.fangXingType;
        //删除原来存有的此组合商品的风格
        if(oldHouseTypeList){
            for(var g=0;g<fangXingTypes.length;g++) {
                var fangXingType = fangXingTypes[g];
                for (var x = 0; x < oldHouseTypeList.length; x++) {
                    if (oldHouseTypeList[x] == fangXingType) {
                        oldHouseTypeList.splice(x, 1);
                        break;
                    }
                }
            }
            //重新加入
            var newFangXingTypes = combiProduct.extended.fangXingType;
            for(var x=0;x<newFangXingTypes.length;x++){
                oldHouseTypeList.push(newFangXingTypes[x]);
            }
            for(var o=0;o<oldHouseTypeList.length;o++){
                houseType += oldHouseTypeList[o]+",";
            }
        }

        comMerchant.id=ComId;
        comMerchant.stylistPic = stylistPic;
        comMerchant.goodsStyId = goodsStyId;
        comMerchant.experience = experience;
        comMerchant.stylistName =stylistName;
        comMerchant.houseType = houseType.substring(0,houseType.length-1);
        ComMerchantService.update(comMerchant);
    }
    ret = {
        state : "ok"
    }
}else{
    ret = {
        state : "ok"
    }
}

out.print(JSON.stringify(ret));
