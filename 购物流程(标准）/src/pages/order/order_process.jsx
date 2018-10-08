//#import Util.js
//#import login.js
//#import product.js
(function(processor){
    processor.on("all",function(pageData,dataIds,elems){
        var user = LoginService.getFrontendUser();
        if(user){
            pageData.mobile = user.mobilPhone;
        }
        if(!pageData.mobile){
            pageData.mobile = "";
        }

        setPageDataProperty(pageData, "statisticsCode", (pageData.config.statisticsCode && pageData.config.statisticsCode.value) || "");
    });
})(dataProcessor);