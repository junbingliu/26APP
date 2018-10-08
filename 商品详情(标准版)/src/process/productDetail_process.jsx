//#import Util.js
//#import product.js
//#import productCredit.js
//#import credit.js
//#import file.js
//#import column.js
//#import appraise.js
//#import message.js
//#import merchant.js
//#import commend.js
//#import price.js
//#import inventory.js
//#import ViewHistory.js
//#import login.js
//#import pageManager.js
//#import bom.js
//#import buyAlsoBuy.js
//#import viewAlsoView.js
//#import sysArgument.js
//#import merchantDomain.js
//#import user.js


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

    processor.on("#all",function(pageData,dataIds,elems){
        //加入浏览历史
        ViewHistoryService.addProductViewHistory();
        var id = $.params.id;
        var mid = $.params.mid||$.params.m||pageData._m_;
        var columnId = $.params.columnId||"c_10000";
        var spec = $.params.spec||"350X350";
        var appraisePage = $.params.appraisePage||"1";
        var messagePage = $.params.messagePage||"1";
        var enquiryType = $.params.enquiryType||"";
        var userId = LoginService.getFrontendUserId();


        var jProduct=ProductService.getProduct(id);
        var combiType = jProduct.combiType;
        if(combiType=="1"){
            var cxts='{isGetInventory:\"true\",isCombi:\"true\",attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true},{factory:UGF,isGroup:true,entityId:c_101}]}';
        }else{
            var cxts='{isGetInventory:\"true\",attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true},{factory:UGF,isGroup:true,entityId:c_101}]}';
        }
        /*获取商品会员价*/
        var priceList=ProductService.getPriceValueList(id, userId, mid, 1, cxts, "normalPricePolicy");



        jProduct.memberPrice=priceList[0]&&priceList[0].formatTotalPrice||"暂无价格";
        jProduct.marketPrice=priceList[1]&&priceList[1].formatTotalPrice||"暂无价格";
        jProduct.salesAmount=ProductService.getSalesAmount(id)||0;
        var domain = MerchantDomainService.getDomains(mid);

        //获取商家信息
        var merchantInfo=MerchantService.getMerchant(jProduct.merchantId);

        var merchantCredit=CreditService.getCredit(mid);
        merchantInfo.merchantCredit=merchantCredit;
        //获取登录用户信息
        var user = LoginService.getFrontendUser();
        //获取面包线数据
        var jColumn=ColumnService.getColumn(jProduct.columnId);
        var position=ColumnService.getProductColumnPath(jColumn,true);
        if(jProduct.combiType){
            position.push({name:"组合套餐"});
        }
        //获取图片列表
        var pics=ProductService.getPics(jProduct);
        var realPices=[];
        for(var i=0;i<pics.length;i++){
            var relatedUrl=FileService.getRelatedUrl(pics[i].fileId,spec);
            var bigRelatedUrl=FileService.getRelatedUrl(pics[i].fileId,"800X800");
            realPices.push(relatedUrl);
            realPices.push(bigRelatedUrl);
        }
        jProduct.pics=realPices;
        //获取商品属性
        jProduct.displayAttrs=ProductService.getProductAttrs(jProduct);
        //商品信用对象
        var jCredit=ProductCreditService.getCredit(id);
        var credit={};
        //获取可卖数
        var skus=ProductService.getSkus(id);
        if(skus.length==1){
            jProduct.skuId=skus[0].id;
            var inventory = InventoryService.getSkuInventory(id,jProduct.skuId);
            jProduct.sellableCount = inventory.sellableCount;
        }


        //获取商品优惠规则
        if(user==null){
            user={};
        }
        var rules=ProductService.getClassifiedPossibleRules(id,jProduct.merchantId,user.id||"-1");
        //获取换购和赠品图片
        if(rules){

            if(rules.exchange){
                for(var i=0;i<rules.exchange.length;i++){
                    var lowPriceBuyProducts=rules.exchange[i].lowPriceBuyProducts;
                    if(lowPriceBuyProducts){
                        for(var j=0;j<lowPriceBuyProducts.length;j++){
                            var exchangeProduct=ProductService.getProduct(lowPriceBuyProducts[j].id);
                            var exchangeProductPic=ProductService.getPics(exchangeProduct);
                            if(exchangeProductPic.length>0){
                                var relatedUrl=FileService.getRelatedUrl(exchangeProductPic[0].fileId,"40X40");
                            }else{
                                var relatedUrl="/upload/nopic_200.jpg";
                            }
                            rules.exchange[i].lowPriceBuyProducts[j].pic=relatedUrl;
                        }
                    }
                }
            }
            if(rules.gift){
                for(var i=0;i<rules.gift.length;i++){
                    var presentProducts=rules.gift[i].presentProducts;
                    if(presentProducts){
                        for(var j=0;j<presentProducts.length;j++){
                            var presentProduct=ProductService.getProduct(presentProducts[j].id);
                            var presentProductPic=ProductService.getPics(presentProduct);
                            if(presentProductPic.length>0){
                                var relatedUrl=FileService.getRelatedUrl(presentProductPic[0].fileId,"40X40");
                            }else{
                                var relatedUrl="/upload/nopic_200.jpg";
                            }
                            rules.gift[i].presentProducts[j].pic=relatedUrl;
                        }
                    }
                }
            }
        }

        //平均得分
        credit.averageDescStore=ProductCreditService.getAverageTotalDescStore(jCredit);
        //评价数量
        credit.descAmount=ProductCreditService.getDescAmount(jCredit);
        //好评率
        credit.positiveCommentRate=ProductCreditService.getPositiveCommentRate(jCredit);
        //中评率
        credit.moderateCommentRate=ProductCreditService.getModerateCommentRate(jCredit);
        //差评率
        credit.negativeCommentRate=ProductCreditService.getNegativeCommentRate(jCredit);

        //获取评价内容
        var appraisSearchArgs={"productId":id,"effect":"true","searchIndex":true,"doStat":true,"page":appraisePage,"limit":10,"logoSize":"60X60"};
        var appraisSearchResult=AppraiseService.getProductAppraiseList(appraisSearchArgs);

        //获取商品咨询
        var messageSearchArgs={"productId":id,"certifyState":"1","page":messagePage,"limit":20,"enquiryType":enquiryType};
        var messageSearchResult=MessageService.getProductEnquiry(id,enquiryType,messageSearchArgs);


        var productProcess=function(productList,imgSize){
            var newProductList=[];
            for(var i=0;i<productList.length;i++){
                var newProduct={};
                newProduct.id=productList[i]&&productList[i].objId;
                newProduct.name=productList[i]&&productList[i].name;
                if(!(productList[i]&&productList[i].price)){
                    var priceObj=priceService.getPrice(productList[i]&&productList[i].priceId);
                    if( productList[i]) {
                        productList[i].price = priceObj;
                    }
                }
                if( productList[i]) {
                    newProduct.marketPrice = ProductService.getMarketPrice(productList[i]) || "暂无价格";
                    newProduct.memberPrice = ProductService.getMemberPrice(productList[i]) || "暂无价格";
                }
                var pics=ProductService.getPics(productList[i]);
                var realPices=[];
                for(var j=0;j<pics.length;j++){
                    var relatedUrl=FileService.getRelatedUrl(pics[j].fileId,imgSize||"180X180");
                    realPices.push(relatedUrl);
                }
                newProduct.pics=realPices;
                newProduct.salesAmount=ProductService.getSalesAmount(productList[i]&&productList[i].objId)||0;
                var skus=ProductService.getSkus(productList[i]&&productList[i].objId);
                if(skus.length==1){
                    newProduct.skuId=skus[0].id;
                    var inventory = InventoryService.getSkuInventory(productList[i]&&productList[i].objId,newProduct.skuId);
                    newProduct.sellableCount = inventory.sellableCount;
                }
                newProductList.push(newProduct);
            }
            return newProductList;
        }



        //获取浏览记录
        var viewHistory=ViewHistoryService.getProductViewHistory(6);
        var viewHistoryProducts=productProcess(viewHistory,"180X180");
        //获取买过又买的数据
        var buyAlsoBuyIds=BuyAlsoBuyService.getBuyAlsoBuy(id);
        var buyAlsoBuyList=[];
        for(var i=0;i<buyAlsoBuyIds.size();i++){
            buyAlsoBuyList.push(ProductService.getProduct(buyAlsoBuyIds.get(i)));
        }
        var buyAlsoBuy=productProcess(buyAlsoBuyList,"120X120");
        if(buyAlsoBuy.length==0){

            //获取购买过该商品的还购买过的商品列表(后台推荐)
            var commendList=commendService.getCommendObjectList(mid,id,"historyBuy",10);
           buyAlsoBuy=productProcess(commendList,"180X180");
        }

        //获取看了又看的数据
        /* var viewAlsoViewIds=ViewAlsoViewService.getViewAlsoView(id);
        var viewAlsoViewList=[];
        for(var i=0;i<viewAlsoViewIds.size();i++){
            viewAlsoViewList.push(ProductService.getProduct(viewAlsoViewIds.get(i)));
        }

        var viewAlsoView;
        if(viewAlsoViewList){
            viewAlsoView =productProcess(JSON.stringify(viewAlsoViewList),"120X120");
        }
        if(viewAlsoView.length==0){*/
            //获取看了又看的商品列表(后台推荐)
            var commendList=commendService.getCommendObjectList(mid,id,"historyView",10);
            if(commendList){
                viewAlsoView=productProcess(commendList,"180X180");
            }
       /* }*/

        //获取最佳组合
        var bestCommendList=commendService.getCommendObjectList(mid,id,"combination",50);
        var bestCommend=productProcess(bestCommendList,"120X120");
        //获取超值组合
        if(jProduct.combiType==1){
            //当前商品是组合套餐
            var mealList=[];
            var boms=bomService.getListByObjid(id);
            mealList.push({boms:boms});
        }else{
            var mealList=bomService.getCBNListByProductId('col_m_Promotional_004',mid,id,-1);
        }
        for(var i=0;i<mealList.length;i++){
            var bomObj=mealList[i];
            var cxt='{isGetInventory:\"true\",isCombi:\"true\",attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true},{factory:UGF,isGroup:true,entityId:c_101},{factory:UGF,isGroup:true,entityId:c_102},{factory:UGF,isGroup:true,entityId:c_103}]}';
            bomObj.price=ProductService.getPriceValueList(bomObj.objId,'',bomObj.merchantId||mid,1,cxt,'normalPricePolicy');
            var boms=bomObj.boms;//套餐内商品
            for(var j=0;j<boms.length;j++){
                var productId=boms[j].relObjId;
                boms[j].product=ProductService.getProduct(productId);
                boms[j].product.memberPrice=ProductService.getMemberPrice(boms[j].product)||"暂无价格";
                var pics=ProductService.getPics(boms[j].product);
                var realPices=[];
                for(var i=0;i<pics.length;i++){
                    var relatedUrl=FileService.getRelatedUrl(pics[i].fileId,"120X120");
                    realPices.push(relatedUrl);
                }
                boms[j].product.pics=realPices;
            }
            bomObj.boms=boms;
        }

        //获取商品的sku
        var skus = ProductService.getSkus(id);
        var inventoryAttrs = ProductService.getInventoryAttrs(jProduct,"140X140");
        var validSkus =[];
        if(skus.length>1){
            skus.forEach(function(sku){
                if(!sku.isHead){
                    validSkus.push(sku);
                }
            });
        }
        else if(skus.length==1){
            validSkus.push(skus[0]);
        }


        var imgUrl =[];
        var pageManager = PageManagerService.getPageManagerList("ctmpl_000_216","m_100",2);
        if(pageManager){
            for(var i=0;i<pageManager.length;i++){
                var relatedUrl=FileService.getRelatedUrl(pageManager[i].DynaAttrs.attr_000_001.fileId,"1010X560");
                imgUrl.push(relatedUrl);
            }
        }


        var seo={};
        //获取所有同级的分类
        var allChildrenColumn=ColumnService.getChildren(jColumn.parentId);
        var seoColumnNames="";
        for(var i=0;i<allChildrenColumn.length;i++){
            seoColumnNames+=allChildrenColumn[i].name+",";
        }
        //用于seo得商品属性
        var seoProductAttr="";
        for(var i=0;i<jProduct.displayAttrs.length;i++){
            seoProductAttr+=jProduct.displayAttrs[i].name+":"+jProduct.displayAttrs[i].value;
        }
        //商品SEO优化
        var webName=SysArgumentService.getSysArgumentStringValue("head_merchant",'col_sysargument','webName_cn');
        if(!jProduct.seo_keywords){
            var seo_keywords=jProduct.name+"-"+webName+","+seoProductAttr+","+seoColumnNames;
            seo.seo_keywords=seo_keywords;
        }else{
            seo.seo_keywords=jProduct.seo_keywords
        }

        if(!jProduct.seo_title){
            var seo_title=jProduct.name+"-"+webName+","+jColumn.name+","+jProduct.name+"报价";
            seo.seo_title=seo_title;
        }else{
            seo.seo_title=jProduct.seo_title
        }
        if(!jProduct.seo_description){
            var seo_description=jProduct.name+"-"+webName+"报价"+seoProductAttr+",销量"+jColumn.name+","+webName+seoColumnNames+"价格优惠";
            seo.seo_description=seo_description;
        }else{
            seo.seo_description=jProduct.seo_description;
        }

        setPageDataProperty(pageData,"adv",imgUrl);
        setPageDataProperty(pageData,"product",jProduct);
        setPageDataProperty(pageData,"productRules",rules);
        setPageDataProperty(pageData,"productId",id);
        setPageDataProperty(pageData,"skus",JSON.stringify(validSkus));
        setPageDataProperty(pageData,"inventoryAttrs",JSON.stringify(inventoryAttrs));
        setPageDataProperty(pageData,"credit",credit);
        setPageDataProperty(pageData,"appraiseList",appraisSearchResult);
        setPageDataProperty(pageData,"messageList",messageSearchResult);
        setPageDataProperty(pageData,"position",position);//面包线
        setPageDataProperty(pageData,"bestCommend",bestCommend);//最佳组合
        setPageDataProperty(pageData,"bomList",mealList);//组合套餐
        setPageDataProperty(pageData,"viewHistoryProducts",viewHistoryProducts);
        setPageDataProperty(pageData,"buyAlsoBuy",buyAlsoBuy);//买了又买
        setPageDataProperty(pageData,"viewAlsoView",viewAlsoView);//看了又看
        setPageDataProperty(pageData,"seo",seo);//seo
        setPageDataProperty(pageData,"merchantInfo",merchantInfo);//商家信息
        setPageDataProperty(pageData,"merchantId",mid);//商家id
        setPageDataProperty(pageData,"userId",user.id);//用户id
        setPageDataProperty(pageData,"domain",domain);//二级域名


    });


})(dataProcessor);