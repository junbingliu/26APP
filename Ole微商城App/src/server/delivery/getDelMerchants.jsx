//#import Util.js
//#import open-afterSale.js
//#import afterSale.js
//#import delMerchant.js
//#import delivery.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
(function () {
    var res = CommonUtil.initRes();
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000003);
        return;
    }
    var merchantId = CartUtil.getOleMerchantId();
    if (!merchantId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000002);
        return;
    }
    var delMerchants = DelMerchantService.getDelMerchants(merchantId);
    var delMerchantsForm=[];
    if(delMerchants&&delMerchants.length>0){
        delMerchantsForm=delMerchants.map(function (v,i) {
            var item={
                id:v.id,
                delMerchantName:v.delMerchantName
            };
            return item;
        })
    }
    if(delMerchantsForm.length>0){
        CommonUtil.setRetData(res, {delMerchantsForm:delMerchantsForm});
    }else {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00010, "缺少物流商");
    }
})();