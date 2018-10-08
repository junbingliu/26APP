//#import Util.js
//#import login.js
//#import product.js
//#import file.js
//#import DateUtil.js
//#import price.js
//#import sysArgument.js

(function(processor){

    var requestURI = request.getRequestURI() + "";
    var productionMode = true;
    if(requestURI == "/appEditor/handlers/getTemplate.jsx"){
        productionMode = false;
    }


    function every(elem){
        if(elem&&(!elem.url || !elem.url.length || elem.url.length==0)){
            if(elem.columnId){
                elem.url = "/product_list.jsp?cid=" + elem.columnId;
            };
        };
        if(elem&&elem.children){
            elem.children.forEach(function(child){every(child);})
        };
    };
    processor.on(":fancyCategories",function(pageData,dataIds,elems){
        if(elems && elems.length>0){
            elems.forEach(function(elem){
                every(elem);
            });
        };
    });

    // processor.on("all", function (pageData, dataIds, elems) {
    //     var userId = "";
    //     var userName = "";
    //     var user = LoginService.getFrontendUser();
    //
    //
    // });


    var updateOther=false;
    processor.on(":productGroup",function(pageData,dataIds,elems){
        try{
            var updateTime=0.1;
            var nowDate =new Date().getTime();
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
                            var moneyType=priceService.getDefaultMoneyType(newProduct.merchantId);
                            var moneyTypeCode=moneyType&&moneyType.code;
                            var showState="show";
                            if(newProduct.noversion.showPrice!="1"){
                                showState="close";
                            }
                            elem[j]["showState"]=showState;
                            //$.log("------------------------"+JSON.stringify(newProduct));
                            elem[j]["name"] = newProduct.name;
                            var cxt="{attrs:{},factories:[{factory:MF},{factory:RPF}]}";
                            var newProductPrices=ProductService.getPriceValueList(productId,"",pageData["_m_"],1,cxt,"normalPricePolicy");
                            elem[j]["moneyTypeCode"] =moneyTypeCode;
                            if(newProductPrices){
                                /*重新获取价格参数*/
                                var memberPrice = newProductPrices[1]&&newProductPrices[1].formatUnitPrice;
                                // $.log("===memberPrice====================="+memberPrice);
                                if(memberPrice){
                                    elem[j]["memberPriceString"] = "￥" + parseFloat(memberPrice).toFixed(2);
                                    elem[j]["memberPrice"] = parseFloat(memberPrice).toFixed(2);
                                }
                                else{
                                    elem[j]["memberPriceString"] = "暂无价格";
                                    elem[j]["memberPrice"]="暂无价格";
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
    processor.on(":imgLinkList",function(pageData,dataIds,elems){
        for(var i=0;i<elems.length;i++){
            var now=new Date().getTime();
            var elem=elems[i];
            var dataId = dataIds[i];
            var newElem=[];
            for(var j=0;j<elem.length;j++){
                var startDate=elem[j].startDate;
                var endDate=elem[j].endDate;
                if(startDate&&endDate){
                    var startDatelong=new Date(startDate.replace(/-/g,"/")).getTime();
                    var endDatelong=new Date(endDate.replace(/-/g,"/")).getTime();
                    if(startDatelong<now&&endDatelong>now){
                        newElem.unshift(elem[j]);
                    }else{
                        newElem.push(elem[j]);
                    }
                }else{
                    newElem.push(elem[j]);
                }
                setPageDataProperty(pageData,dataId,newElem);
            }
        }
    });

    processor.on(":tabsPlus",function (pageData,dataIds,elems) {

    });




})(dataProcessor);
