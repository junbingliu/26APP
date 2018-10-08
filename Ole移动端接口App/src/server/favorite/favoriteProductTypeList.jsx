//#import Util.js
//#import file.js
//#import login.js
//#import pigeon.js
//#import user.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
;(function () {
    //获取收藏夹商品信息接口
    //返回函数
    //获取会员价
    //ProductService.getMemberPriceByProductId
    //获取实际支付价格
    //ProductService.getRealPayPric
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    };

    try {
        //获取登录用户信息
        var user = LoginService.getFrontendUser();
        var userId = "";
        if (!user) {
            userId = $.params.userId;
            //setResultInfo("E1B0001","请先登陆");
            //return;
        }else {
            userId = user.id;
        }
        if(!userId){
            setResultInfo("E1B0001","请先登陆");
            return;
        }
        var page = $.params.page || 1;//当前页数
        page = (page - 1) * 15;
        var pageSize = $.params.pageSize || 15;
        var favoriteTypeList = FavoriteProductTypeService.getListByUserId(userId, page, pageSize);

        var favoriteTypeArray = [];
        for(var i=0; i<favoriteTypeList.length; i++){

            var favoriteObj = favoriteTypeList[i];
            if(favoriteObj){
                var favoriteJson = {};
                favoriteJson.userId = favoriteObj.userId;
                favoriteJson.id = favoriteObj.id;
                favoriteJson.favoriteClassName = favoriteObj.favoriteClassName;
                var  fileId = favoriteObj.fileId;
                if(fileId){
                    favoriteJson.imgUrl = FileService.getFullPath(fileId+"");
                }else {
                    favoriteJson.imgUrl = "";
                }
                favoriteTypeArray.push(favoriteJson);
            }

        }
        var totalFavoriteTypeList = FavoriteProductTypeService.getListByUserId(userId, 0, -1);
        var pageTotal = 0;
        var totalCount = 0;

        if(totalFavoriteTypeList){
            totalCount = totalFavoriteTypeList.length;
            if(totalCount != 0){
                pageTotal = parseInt(parseInt(totalCount)/parseInt(pageSize)) + 1;
            }
        }
        setResultInfo("S0A00000", "success", {
            "favorTypeList": favoriteTypeArray,
            "pageTotal":pageTotal,
            "totalCount":totalCount
        });
    } catch (e) {
        setResultInfo("E1B0001","加入收藏夹失败"+e);
        return;
    }
})();