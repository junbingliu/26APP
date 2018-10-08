//#import Util.js
//#import pigeon.js
//#import DateUtil.js
//#import merchant.js
//#import login.js
//#import jobs.js
//#import product.js
//#import sku.js
var tryOutManageServices = (function (pigeon) {
    var prefix = "tryOutManage",
        prefix_pro = prefix+"_product",
        prefix_model = prefix + "_model",
        listName = prefix+"_checks",
        productList = prefix_pro+"_checks",
        modelList = prefix_model+"_checks";
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.functions.CommonFunctions
    );
    var f={
        addObj :function (id,param) {
            pigeon.saveObject(id, param);//保存对象
        },
        aclData: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id || "";
            self.title = data.title || "";//活動標題
            self.beginTime = data.beginTime || "";//活動開始時間
            self.endTime = data.endTime || ""; //活動結束時間
            self.headImage = data.headImage || "";//活动图标
            self.productGroup = data.productGroup || [];//商品列表
            self.responsible = data.responsible || "";//责任人
            self.description = data.description || "";//活动说明
            self.createTime = data.createTime;
            self.state= data.state || "2";
            self.channel= data.channel || ["app","h5"];
            self.headImageFileId = data.headImageFileId || "";
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            return self;
        },
        add:function(data){
            var param = f.aclData(data);
            if (!param.id) {
                param.id = prefix + "_" + pigeon.getId(prefix);//获取ID
                var key = pigeon.getRevertComparableString(param.createTime, 13);
                pigeon.addToList(listName, key, param.id);//加入到列表中
            }
            pigeon.saveObject(param.id, param);//保存对象
            f.buildIndex(param.id);
            return param;
        },

        proData:function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id || "";
            self.activeId = data.activeId || "";
            self.productId = data.productId || "";
            self.sellNum =  data.sellNum || "";
            self.isMember = data.isMember;//是否会员专属
            self.isFreight = data.isFreight;//是否需要运费
            self.freight = data.freight.split(",") || "";
            self.cash = data.cash || 0;
            self.integral = data.integral || 0;
            self.state = data.state || 2;
            self.responsible = data.responsible;
            self.unitPrice = data.unitPrice;
            self.marketPrice = data.marketPrice;
            self.productDescription = data.productDescription || "";
            self.priority = Number(data.priority);
            self.hasReport = data.hasReport || "";
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            return self;
        },

        addProduct:function(data){
            var param = f.proData(data);
            if(param.activeId){
                if (!param.id || param.id&&param.id.indexOf(param.productId) == -1) {
                    f.deletePro(param.id);
                    param.id = param.activeId+param.productId;//获取ID
                    var key = pigeon.getRevertComparableString(param.createTime, 13);
                    pigeon.addToList(productList, key, param.id);//加入到列表中
                }
                pigeon.saveObject(param.id, param);//保存对象
                f.buildProIndex(param.id);
                return param;
            }else{
                return false;
            }
        },
        modelData:function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.columnIds = data.columnIds;
            self.statement1 = data.statement1;
            self.statement2 = data.statement2;
            self.statement3 = data.statement3;
            self.statement4 = data.statement4;
            self.statement5 = data.statement5;
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            return self;
        },

        addModel:function(data){
            var param = f.modelData(data);
            if (!param.id) {
                param.id = prefix_model + "_" + pigeon.getId(prefix_model);//获取ID
                var key = pigeon.getRevertComparableString(param.createTime, 13);
                pigeon.addToList(modelList, key, param.id);//加入到列表中
            }
            pigeon.saveObject(param.id, param);//保存对象
            f.buildModel(param.id);
            return param;
        },

        getById:function(id){
            return pigeon.getObject(id);
        },

        getLists:function(from,num){
            return pigeon.getListObjects(listName,from,num);
        },

        getListSize:function(){
            return pigeon.getListSize(listName);
        },

        update: function (id,param){
            if (param){
                pigeon.saveObject(id, param);
                f.buildIndex(id);
                return true;
            }
            return false;
        },

        delete: function (id){
            var ss= f.getById(id);
            if(ss){
                var key = ss.createTime;
                pigeon.deleteFromList(listName, key / 13, id);
                pigeon.saveObject(id, null);
                f.buildIndex(id);
                return true;
            }else{
                return false;
            }
        },
        deletePro: function (id){
            var ss= f.getById(id);
            if(ss){
                var key = ss.createTime;
                pigeon.deleteFromList(productList, key / 13, id);
                pigeon.saveObject(id, null);
                f.buildProIndex(id);
                return true;
            }else{
                return false;
            }
        },
        deleteModel: function (id){
            var ss= f.getById(id);
            if(ss){
                var key = ss.createTime;
                pigeon.deleteFromList(modelList, key / 13, id);
                pigeon.saveObject(id, null);
                f.buildModel(id);
                return true;
            }else{
                return false;
            }
        },
        getProductObj: function (proID,productObjId) {//此方法是用来把公共的商品数据跟app商品数据做融合
            var productObj = {};
            if(!proID){
                productObj = f.getById(productObjId);
                if(!productObj){
                    return
                }
                proID = productObj.productId;
            }
            if (ProductService.getProduct(proID)) {
                var sku = SkuService.getHeadSku(proID);
                var productObjects = ProductService.getProduct(proID);
                var regular = ProductService.getMemberPrice(productObjects);
                var realSkuId = sku.skuId;
                var mobileContentHTML = productObjects.mobileContent;
                var mobileContent = [];
                var columnPath = ColumnService.getColumnNamePath(productObjects.columnId,"c_10000",",").split(",");
                if (mobileContentHTML) {//获取商品详情的图片，简化为数组
                    var reg = /<img src=\"([^\"]*)/gi;
                    var s = mobileContentHTML.match(reg);
                    if (s) {
                        for (var i = 0; i < s.length; i++) {
                            if (s[i].toLowerCase().indexOf("http://") > -1) {
                                var url = s[i].substring(s[i].toLowerCase().indexOf("http://"));
                                mobileContent.push({url: url});
                            }
                        }
                    }
                }
                var productImage = "";
                var productJavaObj = ProductApi.ProductFunction.getProduct(proID);//获取商品图片
                var imgString = selfApi.CommonFunctions.getPicListSizeImages(productJavaObj, "attr_10000", "630X630", "/upload/nopic_120.gif") + "";
                if (imgString) {
                    var tmpImg = imgString.substring(1, imgString.length - 1);
                    if (tmpImg.indexOf(", ") > -1) {
                        productImage = tmpImg.split(", ")[0];
                    } else {
                        productImage = tmpImg;
                    }
                }

                var PParam = {
                    id:proID,
                    skuId: realSkuId,
                    memberPrice:regular,
                    name:productObjects.htmlname,
                    barcode: sku.barcode,
                    mobileContent:mobileContent,
                    columnName:columnPath[1],
                    productImage:productImage,
                    logo:ProductService.getProductLogo(productObjects,"50X50",""),
                    productObjId:"",
                    activeId :"",
                    isMember : "",//是否会员专属
                    isFreight : "",//是否需要运费
                    freight : "",
                    cash : "",
                    integral :""
                };
                if(productObjId){
                    var postage = "";
                    if(productObj.cash > 0 && productObj.integral < 1){
                        postage = productObj.cash+"元";
                    }
                    if(productObj.integral > 0 && productObj.cash < 1){
                        postage = productObj.integral+"积分";
                    }
                    if(productObj.integral > 0 && productObj.cash > 0){
                        postage = productObj.cash+"元或"+productObj.integral+"积分";
                    }
                    var activeObj  = f.getById(productObj.activeId);
                    PParam.period = activeObj.beginTime +"-" + activeObj.endTime;
                    PParam.createTime = DateUtil.getLongDate(productObj.createTime);
                    PParam.productObjId = productObj.id;
                    PParam.activeId = productObj.activeId;
                    PParam.state = productObj.state;
                    PParam.isMember = productObj.isMember;
                    PParam.isFreight = productObj.isFreight;
                    PParam.freight = productObj.freight;
                    PParam.cash = productObj.cash;
                    PParam.sellNum = productObj.sellNum;
                    PParam.priority = productObj.priority;
                    PParam.postage = postage;
                    PParam.integral = productObj.integral;
                    PParam.unitPrice = productObj.unitPrice || 0;//活动价，如果没有，默认是0
                    PParam.marketPrice = productObj.marketPrice || PParam.memberPrice;//市场价默认取会员价
                    PParam.productDescription = productObj.productDescription;
                }
                return PParam;
            } else {
                return false;
            }
        },
        buildIndex: function (ids) {
            var jobPageId = "services/tryOutManageBuildIndex.jsx";
            JobsService.runNow(appId, jobPageId, {ids: ids});
        },
        buildProIndex: function (ids) {
            var jobPageId = "services/tryOutProductBuildIndex.jsx";
            JobsService.runNow(appId, jobPageId, {ids: ids});
        },
        buildModel: function (ids) {
            var jobPageId = "services/reportModelBuildIndex.jsx";
            JobsService.runNow(appId, jobPageId, {ids: ids});
        }
    };

    return f;
})($S);