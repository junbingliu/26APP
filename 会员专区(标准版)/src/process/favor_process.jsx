//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import column.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.commons,
            Packages.net.xinshi.isone.functions.member,
            Packages.java.util,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.modules.filemanagement,
            Packages.net.xinshi.isone.modules.pricepolicy,
            Packages.net.xinshi.isone.functions.product
        );

        var requestURI = request.getRequestURI() + "";
        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            response.sendRedirect("/login.html?rurl="+requestURI);
        }

        var mid = "head_merchant";
        var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");

        var page = $.params.page || 1;
        var columnId = $.params.columnId || "";
        var favorType = "product",fTag = "",count = 15;
        var favorMap = {};
        var jFavorMap = selfApi.FavoriteFunction.getMemberProductFavoriteListByPage(userId,favorType,columnId,fTag,page,count);
        if(jFavorMap != null){
            if(jFavorMap.get("count") > 0){
                var productIds = new selfApi.ArrayList();
                var lists = jFavorMap.get("lists");
                for(var i=0;i<lists.size();i++){
                    var favor = lists.get(i);
                    favor.put("createTimeFormat",DateUtil.getShortDate(favor.optLong("createTime")));
                    productIds.add(favor.optString("objId") + "");
                }

                var cxt = "{attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true}]}";
                var jContext = new selfApi.JSONObject(cxt);
                var priceContext = jContext.getObjectMap();
                var versionList = selfApi.IsoneModulesEngine.productService.getListDataByIds(productIds, false);
                versionList = selfApi.PricePolicyHelper.getPriceValueList(versionList, userId, pageData["_m_"], priceContext, "normalPricePolicy");  //一次性获取商品价格
                versionList = selfApi.ImageRelatedFileUtil.getProductsFirstRelatedSizeImageFullPath(versionList, "90X90", "/upload/nopic_100.jpg");//一次性获取商品大小图
                if(versionList != null){
                    jFavorMap.put("productList",versionList);
                }
            }
            favorMap = JSON.parse(new selfApi.JSONObject(jFavorMap).toString());
            if(favorMap.columnIdList && favorMap.columnIdList.length > 0){
                for(var i=0;i<favorMap.columnIdList.length;i++){
                    var colObj = favorMap.columnIdList[i];
                    colObj.columnObj = ColumnService.getColumn(colObj.cId);
                }
            }
        }

        setPageDataProperty(pageData, "requestURI", requestURI + "");
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "favorMap", favorMap);
        setPageDataProperty(pageData, "columnId", columnId);

        var token = GenToken.get("favorToken");
        setPageDataProperty(pageData, "token", token);

    });
})(dataProcessor);