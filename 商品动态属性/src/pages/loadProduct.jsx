//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import merchant.js
//#import product.js
//#import user.js
//#import UserUtil.js
(function () {
    var page = $.params.page || 1;
    var page_size = $.params.page_size || 10;
    var keyword = $.params.keyword;
    var beginCreateTime = $.params.beginCreateTime;
    var endCreateTime = $.params.endCreateTime;
    var merchantId = $.params['m'];
    var recordType = "商品";
    var displayNum = 6;
    var jSearchArg = {};
    jSearchArg.page = page;
    jSearchArg.page_size = page_size;
    if (keyword) {
        jSearchArg.keyword = keyword;
    }
    if (beginCreateTime) {
        jSearchArg.beginCreateTime = beginCreateTime;

    }
    if (endCreateTime) {
        jSearchArg.endCreateTime = endCreateTime;

    }
    //if(merchantId){
    //    jSearchArg.merchantId=merchantId;
    //}
    var searchResult;
    searchResult = ProductService.searchProduct(jSearchArg);

    var products = [];
    for (var i = 0; i < searchResult.products.length; i++) {
        var obj = ProductService.getProduct(searchResult.products[i].productId);
        products.push(obj);
    }

    var totalRecord = searchResult.total;
    var totalPages = (totalRecord + page_size - 1) / page_size;
    var pageParams = {
        recordType: recordType,
        pageLimit: page_size,
        displayNum: displayNum,
        totalRecords: totalRecord,
        totalPages: totalPages,
        currentPage: page
    };
    products = getMsg(products);
    var pageData = {
        products: products,
        pageParams: pageParams
    }
    var template = $.getProgram(appMd5, "pages/loadProduct.html");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
    function getMsg(products) {
        var array = [];
        for (var i = 0; i < products.length; i++) {
            var jProduct = products[i];
            if(!jProduct){
                continue;
            }
            var obj = {};
            obj.productId = jProduct.objId;
            obj.name = jProduct.name;
            obj.productLogo = ProductService.getProductLogo(jProduct, "40X40", "/upload/none_40.jpg");
            obj.skuId = ProductService.getSkus(obj.productId)[0].id;
            obj.utilPrice = ProductService.getRealPayPrice(jProduct.createUserId, jProduct.merchantId, obj.productId, obj.skuId) / 100;//售价
            if(jProduct.noversion.certifyState){
                if(jProduct.noversion.certifyState == "1"){
                    obj.certifyState ="<span style='color: green'>审核通过</span>";
                }
                else if(jProduct.noversion.certifyState == "2"){
                    obj.certifyState ="<span style='color: red'>审核通过</span>"
                }
                else if(jProduct.noversion.certifyState == "0"){
                    obj.certifyState="<span >未审核</span>"
                }
            }
            else{
                obj.certifyState="<span></span>"
            }
            obj.SellableCount = ProductService.getSellableCount(obj.productId, obj.skuId);
            obj.sellState = ProductService.getPublishState(jProduct);
            obj.sellState = sellState(obj.sellState);
            if(MerchantService.getMerchant(jProduct.merchantId)){
                obj.merchant = MerchantService.getMerchant(jProduct.merchantId).name_cn;
            }
            else{
                obj.merchant ="";
            }
            if(ProductService.getColumn(jProduct.columnId).columnPath){
                obj.column = column(ProductService.getColumn(jProduct.columnId).columnPath);

            }
            else{
                obj.column="";
            }
            obj.attrs = ProductService.getProductAttrs(jProduct);
            obj.attrs=setAttrs(obj.attrs);
            array.push(obj);
        }
        return array
    }

    function column(columnPath) {
        var str = "";
        var path = columnPath.split("|");
        for (var i = 0; i < path.length; i++) {
            if (path[i] != "" && path[i].indexOf("_") == -1 && i != 0) {
                str += path[i].toString() + ">";
            }
        }
        return str.substring(0, str.length - 1);
    }
    function sellState(sellState) {
        switch (sellState) {
            case "0" :
                return "<span style='color: #FF3300'>待上架</span>";
            case "1":
                return "<span style='color: #333333'>在售中</span>";
            default:
                return "<span style='color: #a94442'>" + sellState + "</i>"
            //case "0" :
            //    return "待上架";
            //case "1":
            //    return "在售中";
            //default:
            //    return sellState;
        }

    }
    function setAttrs(obj){
        var str="";
        for(var i=0; i<obj.length; i++){
            str+=obj[i].name+"："+obj[i].value+"<br/>";
        }
        return str;
    }
})()