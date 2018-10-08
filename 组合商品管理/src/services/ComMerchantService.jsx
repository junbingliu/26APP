//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import jobs.js
;

var ComMerchantService = (function (pigeon) {
    var prefix = "combiProduct_merchant";
    var f = {
        save:function (param) {
            var now = (new Date()).getTime();
            var id =f.getId(param.merchantId);
            var params ={
                id:id,
                pos:param.pos,
                merchantId:param.merchantId,
                stylistPic:param.stylistPic,
                content:param.content,
                goodStyle:param.goodStyle,
                goodsNumber:param.goodsNumber,
                experience:param.experience,
                styName:param.styName,
                createTime:now,
                lastModifiedTime:now
            };
            pigeon.saveObject(id, params);
            JobsService.submitTask("combiProductsMgt","jobs/indexCombiMerchantJob.jsx",{id:id,merchantId:param.merchantId},now);
        },
        get:function(id) {
            return pigeon.getObject(id);
        },
        delete: function(id){
            var now = (new Date()).getTime();
            var oldObj = f.get(id);
            if (!oldObj) {
                return;
            }
            pigeon.saveContent(id, null);
            JobsService.submitTask("combiProductsMgt","jobs/cleanCombiMerchantJob.jsx",{id:id},now);
        },
        update: function (param) {
            var now = (new Date()).getTime();
            var oldObj = f.get(param.id);
            //$.log("oldObj:"+JSON.stringify(oldObj));
            if (!oldObj) {
                return;
            }
            var bean ={
                pos:param.pos,
                merchantId:param.merchantId,
                stylistPic:param.stylistPic,
                content:param.content,
                goodStyle:param.goodStyle,
                goodsNumber:param.goodsNumber,
                experience:param.experience,
                styName:param.styName,
                lastModifiedTime:now
            };
            bean.createTime = oldObj.createTime;
            //$.log("bean:"+JSON.stringify(bean));
            pigeon.saveObject(param.id, bean);
            JobsService.submitTask("combiProductsMgt","jobs/indexCombiMerchantJob.jsx",{id:param.id,merchantId:param.merchantId},now);
        },
        getId:function(merchantId) {
            return prefix + merchantId;
        },
        buildIndex: function (id, merchantId) {
            if (!id) {
                return;
            }
            var when = (new Date()).getTime();
            JobsService.submitTask("combiProductsMgt", "jobs/indexCombiMerchantJob.jsx", {id:id, merchantId:merchantId}, when);
        }
    };
    return f;
})($S);