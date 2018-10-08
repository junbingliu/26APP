//#import doT.min.js
//#import Util.js
(function () {
    var merchantId = $.params["m"];
    var mess= $.params.mess;
    mess=JSON.parse(mess);
    var selectProductMess=[
        {title:"商品ID",field:"productId",checked:"checked"},
        {title:"货号",field:"productNumber"},
        {title:"SKU内部ID",field:"sku_id",checked:"checked"},
        {title:"SKU外部ID",field:"skuId",checked:"checked"},
        {title:"条形码",field:"barcode",checked:"checked"},
        {title:"默认SKU内部ID",field:"Head_sku_id"},
        {title:"默认SKU外部ID",field:"Head_skuId"},
        {title:"默认SKU条形码",field:"Head_barcode"},
        {title:"基准SKU内部",field:"baseSkuId"},
        {title:"基准SKU编码",field:"baseRealSkuId"},
        {title:"库存比例",field:""},//预留
        {title:"S",field:"" ,checked:"checked"},//预留
        {title:"商品名称",field:"name",checked:"checked"},
        {title:"所属商家",field:"merchant",checked:"checked"},
        {title:"分类ID",field:"columnId"},
        {title:"分类名称",field:"columnName",checked:"checked"},
        {title:"品牌",field:"brandName",checked:"checked"},
        {title:"仓库属性",field:"warehouseType",checked:"checked"},
        {title:"温控",field:"temperatureControl",checked:"checked"},
        {title:"重量（KG）",field:"weight",checked:"checked"},
        {title:"体积（ML）",field:"volume",checked:"checked"},
        {title:"长",field:"length",checked:"checked"},
        {title:"宽",field:"wide",checked:"checked"},
        {title:"高",field:"high",checked:"checked"},
        {title:"可卖数",field:"SellableCount",checked:"checked"},
        {title:"在售状态",field:"sellState"},
        {title:"审核状态",field:"certifyState"},
        {title:"上架状态",field:"selfState"},
        {title:"是否零负可卖",field:"zeroSellable"},
        {title:"零负可卖数量",field:"zeroSellCount"},
        {title:"安全可卖数",field:"SecuritySellableCount"},
        {title:"售价",field:"utilPrice",checked:"checked"},
        {title:"市场价",field:"marketPrice",checked:"checked"},
        {title:"会员价",field:"memberPrice",checked:"checked"},
        {title:"最低安全售价",field:"securitySellPrice"},
        {title:"供货价",field:"commodityPrice"},//预留
        {title:"原价",field:""},//预留
        {title:"总送积分",field:""},//预留
        {title:"创建人",field:"createPeople"},
        {title:"创建时间",field:"createTime"},
        {title:"标签",field:"tag"},
        {title:"卖点",field:"sellingPoint"},
        {title:"动态属性",field:"attrs"}
    ];
    var pageData = {
        merchantId:merchantId,
        selectProductMess:selectProductMess,
        mess:mess
    };
    var template = $.getProgram(appMd5, "pages/outPutProductMessage.html");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));

})();