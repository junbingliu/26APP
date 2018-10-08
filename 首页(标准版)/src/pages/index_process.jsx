//#import Util.js
//#import login.js
//#import product.js
//#import file.js
//#import DateUtil.js


(function(processor){
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
    processor.on("#all",function(pageData,dataIds,elems){
        try{
            /*设置seo数据*/
            var config=$.params.config;
            if(config){
                var jConfig=JSON.parse(config);
                pageData.config=jConfig;
            }
            var m = request.getAttribute("_productMerchantId");

            var obj=  SpecCodeService.getData(m);
            var data="";
            if(obj!=null){
                data="" + SpecCodeService.getData(m);
            }
            pageData.specCode=data;
            setPageDataProperty(pageData,"specCode",data);
        }
        catch (e){
        }


    });
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
        else if(user.nickName){
            userName = user.nickName;
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

    var updateOther=false;
    processor.on(":productGroup",function(pageData,dataIds,elems){
        try{
            var updateTime=pageData.config&&pageData.config.updateTime.value||5;
            var nowDate =new  Date().getTime();
            var updateDate = pageData['_updateDate'];
            if(!updateDate||nowDate-updateDate>updateTime*60*1000){
                updateOther=true;
                updateDate=nowDate;
                pageData['_updateDate']=updateDate;
                for(var i=0;i<elems.length;i++){
                    var elem=elems[i];
                    if(elem){
                        for(var j=0;j<elem.length;j++){
                            var productId=elem[j].id;
                            var newProduct=ProductService.getProduct(productId);
                            elem[j]["name"] = newProduct.name;
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




})(dataProcessor);
