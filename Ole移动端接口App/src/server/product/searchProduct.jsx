//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import sysArgument.js


(function(){

    var keyword = $.params.keyword;
    var from = $.params.from || 0;
    var number = $.params.number || 20;
    var spec = $.params.spec || "200X200";
    var orderBy = $.params.orderBy;
    var columnId = $.params.columnId|| "c_10000";
    var brandIds = $.params.brandIds;
    var version = $.params.version;
    var showState="m";
    var userId = LoginService.getFrontendUserId();
    var groups = [];
    if(!userId ){
        groups.push({id:'c_101'});
    }
    else{
        groups = UserService.getUserGroups(userId);
    }

    var requestURI = request.getRequestURI() + "";//"/list-10000.html"
    $.log("requestURI=========="+requestURI);
    var curColumn = ColumnService.getColumn(columnId);
    var position = [];
    position.push({id: curColumn.id, title: curColumn.title, url: requestURI + "?columnId=" + curColumn.id});
    var tempColumn = curColumn;
    var safeCount = 10;
    while (tempColumn.parentId != "col_ProductRoot") {
        tempColumn = ColumnService.getColumn(tempColumn.parentId);
        position.unshift({id: tempColumn.id, title: tempColumn.title, url: requestURI + "?columnId=" + tempColumn.id});
        if(safeCount < 0){
            //超出10层了
            break;
        }
        safeCount--;
    }

    var searchArgs = {keyword:keyword,fromPath:from,fetchCount:number,showState:showState,path:columnId,publishState:1};
    if (brandIds) {
        var ids = [];
        var splitBrand = brandIds.split("--");  //前台传参用--来隔离每个id
        for (var i = 0; i < splitBrand.length; i++) {
            ids.push(splitBrand[i]);
        }
        searchArgs["brandIds"] = ids;
    }
    searchArgs["withoutColumnIds"] = ["c_2410000"];//不搜索生产环境赠品分类下的商品

    var searchFactLevel = 3 + position.length - 1;
    var column_facetColumn = "column_facetColumn" + searchFactLevel;
    var column_facetColumn1 = "column_facetColumn" + (searchFactLevel + 1);
    var column_facetColumn2 = "column_facetColumn" + (searchFactLevel + 2);
    searchArgs.facetFields = ["brandId", column_facetColumn, column_facetColumn1, column_facetColumn2];

    //判断搜索类型
    if(orderBy=='saleCount'){
        searchArgs.sortFileds = [{
            field:"salesCount",
            type:"LONG",
            reverse:true
        }];
    }
    if(orderBy=='priceHigh'){
        searchArgs.sortFields = [{
            field:"price",
            type:"LONG",
            reverse:true
        }];
    }
    if(orderBy=='priceLow'){
        searchArgs.sortFields = [{
            field:"price",
            type:"LONG",
            reverse:false
        }];
    }
    if(orderBy=='publishTime'){
        searchArgs.sortFields = [{
            fieldId:"lastModifyTime",
            type:"LONG",
            reverse:true
        }];
    }

    var searchArgsString = JSON.stringify(searchArgs);
    var javaArgs = ProductApi.ProductSearchArgs.getFromJsonString(searchArgsString);
    var results = ProductApi.IsoneFulltextSearchEngine.searchServices.search(javaArgs);
    $.log("results======"+results);
    $.log("results.getFacets======"+results.getFacets());
    var searchCondition = ProductService.getFacets(results.getFacets(), column_facetColumn);


    var cxt="{attrs:{},scope:'2',factories:[{factory:RPF},{factory:MF,isBasePrice:true}]}";


    var ret = ProductService.searchWithPriceAndHighlight(searchArgs,spec);

    var products = ret.products;
    var total = ret.total;
    var defaultProjectId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument","defaultProjectId");
    var zteMerchantString = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction","zteMerchantId");
    var zteMerchantArray = zteMerchantString.split(",");
    var newProducts=[];
    if(products){

        products.map(function(product){
            //亚泰项目差异
            if(defaultProjectId=="yatai"&&version<"1.8.2"){
                for(var i=0;i<zteMerchantArray.length;i++){
                    if(zteMerchantArray[i]==product.merchantId){
                        return;
                    }
                }
            }
            var skus=ProductService.getSkus(product.objId);
            //为手机版减少流量用，做以下的几种优化
            //1.只获取市场价
            //2.只获取title,不获取content
            //3.只获取其中一幅图，不获取其他的图
            var promotionLogos=ProductService.getPromotionLogo(product.objId);

            if(promotionLogos&&promotionLogos.length>0){
                var promotionLogo=promotionLogos[0].fullpath;
            }
            var priceList=ProductService.getPriceValueList(product.objId, userId, product.merchantId, 1, cxt, "normalPricePolicy");
            if(priceList&&priceList.length>0){
                if(priceList[0]==null){
                    var memberPrice="暂无价格";
                }else{
                    var memberPrice=priceList[0].formatTotalPrice;
                }
            }else{
                var memberPrice = ProductService.getRealPayPrice(product,userId,groups);
            }

            var title = product.htmlname;
            var logo = product.logo;
            var sellingPoint=product.sellingPoint;
            var tag=product.tag;
            newProducts.push({
                promotionLogo:promotionLogo||"",
                memberPrice:memberPrice,
                title : title,
                logo : logo,
                id:product.objId,
                sellingPoint:sellingPoint||"",
                tag:tag||"",
                skus:skus
            })

        });
    }
    var result = {
        products:newProducts,
        total:total,
        searchCondition:searchCondition
    };
    var returndata = {
        code : "S0A000000",
        msg : "搜索商品成功",
        data : result
    }
    out.print(JSON.stringify(returndata));


})();