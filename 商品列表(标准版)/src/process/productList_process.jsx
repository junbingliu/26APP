//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import productCredit.js
//#import column.js
//#import search.js
//#import file.js


(function(processor){
    processor.on("#header.topNav1_login",function(pageData,dataIds,elems){
        var user = LoginService.getFrontendUser();
        if(user==null){
            pageData.alreadyLogin = false;
            return;
        }
        else{
            pageData.alreadyLogin = true;
        }
        var userName = "";
        if(user.realName){
            userName = user.realName;
        }
        else if(user.loginId){
            userName = user.loginId;
        }
        else{
            userName = user.id;
        }
        pageData.userId=user.id;
        for(var i=0;i<elems.length;i++){
            var elem = elems[i];
            var dataId = dataIds[i];
            elem = elem.replace("{userName}",userName);
            setPageDataProperty(pageData,dataId,elem);
        }

    });
    processor.on("all",function(pageData,dataIds,elems){
        var keyword = $.params.keyword||"";
        var page = $.params.page || 1;
        var displayStyle = $.params.displayStyle || "P";
        var spec = $.params.spec || "220X220";
        var showState="s";
        var columnId = $.params.columnId||"c_10000";
        var brandId = $.params.brandId;
        var orderBy = $.params.orderBy;
        var lowTotalPrice = $.params.lowTotalPrice;
        var highTotalPrice = $.params.highTotalPrice;
        var otherParams = $.params.otherParams;
        var userId = LoginService.getFrontendUserId();
        var groups = [];
        if(!userId ){
            groups.push({id:'c_101'});
        }
        else{
            groups = UserService.getUserGroups(userId);
        }


        //获取面包线数据
        var curColumn=ColumnService.getColumn(columnId);
        var position=[];
        position.push({id:curColumn.id,title:curColumn.title});
        while(curColumn.parentId!="col_ProductRoot"){
            var curColumn=ColumnService.getColumn(curColumn.parentId);
            position.unshift({id:curColumn.id,title:curColumn.title});
        }



        var searchArgs = {keyword:keyword,fromPath:(page-1)*12,fetchCount:12,showState:showState,path:columnId,brandId:brandId};
        if(otherParams){
            var arrayOtherParams=otherParams.split("--");
            var sOtherParams='{"'+arrayOtherParams[0]+'_multiValued":"'+arrayOtherParams[1]+'"}';

            var jOtherParams=JSON.parse(sOtherParams);
            searchArgs.otherParams=jOtherParams;
        }
        if(lowTotalPrice){
            searchArgs.lowTotalPrice=parseFloat(lowTotalPrice*100);
        }
        if(highTotalPrice){
            searchArgs.highTotalPrice=parseFloat(highTotalPrice*100);
        }

        var searchFactLevel=3+position.length-1;
        var column_facetColumn="column_facetColumn"+searchFactLevel;
        var column_facetColumn1="column_facetColumn"+(searchFactLevel+1);
        var column_facetColumn2="column_facetColumn"+(searchFactLevel+2);
        searchArgs.facetFields=["brandId",column_facetColumn,column_facetColumn1,column_facetColumn2];
        //属性搜索参数
        var  attrTemp = ColumnService.getCompleteAttrTemplateByColumnId(columnId);
        var  groups=null;
        if(attrTemp!=null){
            var jAttrTemp = new InfoscapeUtil.api.JSONObject(attrTemp);
            groups= ColumnService.getAttrGroups(jAttrTemp);
        }else{
            groups= ColumnService.getAttrGroups(attrTemp);
        }
        for (var num = 0; num < groups.size(); num++) {
            var obj = groups.get(num);
            var importAttrs = ColumnService.getImportantPropertyAttrs(obj);
            if(importAttrs) {
                for (var num2 = 0; num2 < importAttrs.size(); num2++) {
                    var attr = JSON.parse("" + importAttrs.get(num2));
                    searchArgs.facetFields.push(attr.id + "_multiValued");
                }
            }
        }
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

        var cxt="{attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true}]}";


        var searchArgsString = JSON.stringify(searchArgs);
        var javaArgs = ProductApi.ProductSearchArgs.getFromJsonString(searchArgsString);

        var results = ProductApi.IsoneFulltextSearchEngine.searchServices.search(javaArgs);
        var ids = results&&results.getLists();

        var listOfJSON = ProductApi.IsoneModulesEngine.productService.getListDataByIds(ids,false);
        if(spec){
            ProductApi.IsoneModulesEngine.productService.getLogosOfProducts(listOfJSON,spec);
        }
        var s = listOfJSON.toString();
        var products =  JSON.parse(s);
        var priceIds = new ProductApi.ArrayList();
        for(var i=0; i<products.length;i++){
            priceIds.add(products[i].priceId);
        }
        var jprices = ProductApi.IsoneModulesEngine.priceService.getListDataByIds(priceIds, true);
        var prices = JSON.parse(jprices.toString());
        for(var i=0; i< products.length; i++){
            products[i].price = prices[i];
        }
        for(var i=0; i<products.length; i++){
            var product = products[i];
            var highlight = ProductApi.DiscoveryHelper.getHighLightText(results,javaArgs,product.objId,product.title1&&product.title1.value);
            product.title = "" + highlight;
        }

        if(products){
            products = products.map(function(product){
                /*获取促销图标*/
                var promotionLogos=ProductService.getPromotionLogo(product.objId);
                if(promotionLogos&&promotionLogos.length>0){
                    var promotionLogo=promotionLogos[0].fullpath;
                }
                /*获取商品会员价*/
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
                /*销售数*/
                var salesAmount=ProductService.getSalesAmount(product.objId)||0;
                /*获取市场价*/
                var marketPrice = ProductService.getMarketPrice(product);
                if(marketPrice){
                    marketPrice = marketPrice.toFixed(2);
                }else{
                    marketPrice = "暂无价格"
                }
                var title = product.title;
                var logos = product.logos;

                var jCredit=ProductCreditService.getCredit(product.objId);
                //平均得分
                var averageDescStore=ProductCreditService.getAverageTotalDescStore(jCredit);

                //评价数量
                var descAmount=ProductCreditService.getDescAmount(jCredit);
                //获取卖点
                var jProduct=ProductService.getProduct(product.objId);
                var sellingPoint =jProduct.sellingPoint;
                return {
                    promotionLogo:promotionLogo||"",
                    credit:{averageDescStore:averageDescStore,descAmount:descAmount},
                    memberPrice:memberPrice,
                    marketPrice:marketPrice,
                    title : title,
                    logos : logos||"/upload/nopic_200.jpg",
                    id:product.objId ,
                    salesAmount:salesAmount,
                    id:product.objId,
                    merchantId:product.merchantId,
                    sellingPoint:sellingPoint
                }
            });
        }
        var pageNum = parseInt((results.getTotal() + 12 - 1) / 12);
        var result = {
            products:products,
            pageNum:pageNum,
            total:0 + results.getTotal(),
            displayStyle:displayStyle
        }
        var searchCondition=ProductService.getFacets(results.getFacets(),column_facetColumn);

        //过滤搜索有效的分类
        var columnFilter=function(columnData,displayColumn){
            var newColumnData=[];
            for(var i=0;i<columnData.length;i++){
                for(var j=0;j<displayColumn.length;j++){
                    if(columnData[i].id==displayColumn[j].name){
                        newColumnData.push(columnData[i]);
                    }
                }
            }
            return newColumnData;
        }
        //搜索出来的商品所属分类
        var allSearchColumnsValue=[];
        for(var i=0;i<3;i++){
           var searchColumnsValue=$.java2Javascript(results.getFacets().get("column_facetColumn"+(searchFactLevel+i)));
           for(var j=0;j<searchColumnsValue.length;j++){
               allSearchColumnsValue.push(searchColumnsValue[j]);
           }
        }
        //获取侧栏分类数据
        var columnData=ColumnService.getChildren(columnId);
        columnData=columnFilter(columnData,allSearchColumnsValue);//过滤分类
        for(var i=0;i<columnData.length;i++){
            var childObj=ColumnService.getChildren(columnData[i].id);
            childObj=columnFilter(childObj,allSearchColumnsValue);//过滤分类
            columnData[i].children=childObj;
        }
        searchCondition.DynaAttr=[];
        if(importAttrs) {
            for (var i = 0; i < importAttrs.size(); i++) {
                var attr = JSON.parse("" + importAttrs.get(i));
                var list = results.getFacets().get(attr.id + "_multiValued");
                var jAttr = JSON.parse(ProductService.getJSONFormList(list));
                attr.values = jAttr;
                searchCondition.DynaAttr.push(attr);
            }
        }
        //获取浏览记录
        var viewHistoryProducts=[];
        var viewHistory=ProductService.getProductViewHistory(request,6);
        for(var i=0;i<viewHistory.length;i++){
            var historyProduct={};
           var salesAmount = ProductService.getSalesAmount(viewHistory[i].objId)||0;
            historyProduct.salesAmount = salesAmount;
            historyProduct.id=viewHistory[i].objId;
            historyProduct.name=viewHistory[i].name;
            historyProduct.merchantId=viewHistory[i].merchantId;
            var hMarketPrice = ProductService.getMarketPrice(viewHistory[i]);
            var hMemberPrice = ProductService.getMemberPrice(viewHistory[i]);
            if(hMarketPrice){
                historyProduct.marketPrice = hMarketPrice.toFixed(2);
            } else{
                historyProduct.marketPrice = "暂无价格";
            }
            if(hMemberPrice){
                historyProduct.memberPrice = hMemberPrice.toFixed(2);
            }else{
                historyProduct.memberPrice= "暂无价格";
            }

            var pics=ProductService.getPics(viewHistory[i]);
            var realPices=[];
            for(var j=0;j<pics.length;j++){
                var relatedUrl=FileService.getRelatedUrl(pics[j].fileId,"180X180");
                realPices.push(relatedUrl);
            }
            historyProduct.pics=realPices;
            viewHistoryProducts.push(historyProduct);
        }

        //seo数据
        var seo={};
        var columnObj=ColumnService.getColumn(columnId);
        var allChildrenColumn=ColumnService.getChildren(columnObj.parentId);
        var seoColumnNames="";
        for(var i=0;i<allChildrenColumn.length;i++){
            seoColumnNames+=allChildrenColumn[i].name+",";
        }
        var webName=SysArgumentService.getSysArgumentStringValue("head_merchant",'col_sysargument','webName_cn');
        seo.seo_description=columnObj.name+"-"+webName+",销售"+seoColumnNames+","+webName+seoColumnNames+"价格优惠";
        seo.seo_title=columnObj.name+"-"+webName+","+columnObj.name+"报价";
        seo.seo_keywords=columnObj.name+"-"+webName+","+seoColumnNames;


        //商品分类
        setPageDataProperty(pageData,"curColumn",curColumn);
        setPageDataProperty(pageData,"seo",seo);
        setPageDataProperty(pageData,"columnId",columnId);
        setPageDataProperty(pageData,"columnChildren",columnData);
        //面包线
        setPageDataProperty(pageData,"position",position);
        //商品列表数据
        setPageDataProperty(pageData,"productList",result);
        //可用搜索条件
        setPageDataProperty(pageData,"searchCondition",searchCondition);
        //用户已选搜索条件
        searchArgs.orderBy=orderBy;
        setPageDataProperty(pageData,"searchHistory",searchArgs);
        //浏览历史
        setPageDataProperty(pageData,"viewHistoryProducts",viewHistoryProducts);
        setPageDataProperty(pageData,"allSearchColumnsValue",allSearchColumnsValue);

    });
    processor.on(":productGroup",function(pageData,dataIds,elems){
        try{
            var updateTime=0;
            var nowDate =new  Date().getTime();
            var updateDate = pageData['_updateDate'];
            if(!updateDate||nowDate-updateDate>updateTime*60*1000){
                updateDate=nowDate;
                pageData['_updateDate']=updateDate;
                for(var i=0;i<elems.length;i++){
                    var elem=elems[i];
                    if(elem){
                        for(var j=0;j<elem.length;j++){
                            var productId=elem[j].id;
                            var newProduct=ProductService.getProduct(productId);
                            elem[j]["name"] = newProduct.name;
                            elem[j]["merchantId"] = newProduct.merchantId;

                            var cxt="{attrs:{},factories:[{factory:MF},{factory:RPF}]}";
                            var newProductPrices=ProductService.getPriceValueList(productId,"",pageData["_m_"],1,cxt,"normalPricePolicy");
                            if(newProductPrices){
                                /*重新获取价格参数*/
                                var memberPrice = newProductPrices[1]&&newProductPrices[1].formatUnitPrice;
                                if(memberPrice){
                                    elem[j]["memberPriceString"] = "￥" + parseFloat(memberPrice).toFixed(2);
                                    elem[j]["memberPrice"] = parseFloat(memberPrice).toFixed(2);
                                }
                                else{
                                    elem[j]["memberPriceString"] = "暂无价格";
                                };
                            };

                        };
                    };
                };
                /*存进数据库*/
                saveMerchantPageData(pageData["_m_"],pageData["_appId_"],pageData["_pageId_"],pageData);
            };
        }
        catch (e){
            $.log(e);
        }

    });

})(dataProcessor);