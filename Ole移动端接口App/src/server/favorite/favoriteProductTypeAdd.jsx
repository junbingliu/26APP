//#import Util.js
//#import login.js
//#import pigeon.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import file.js
//#import base64.js
//#import cookie.js
//#import NoticeTrigger.js
//#import DESEncryptUtil.js
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
        if (!user) {
            setResultInfo("E1B0001","请先登陆");
            return;
        }
        var imageBytes = $.params["imageBytes"];
        var fileId;
        var favoriteClassName;
        if(imageBytes){
            var array = [];
            array.push(imageBytes);
            var imageName = $.params["imageName"];
            if (!imageName){
                setResultInfo("E1B0001","图片名称不能为空");
                return;
            }
            favoriteClassName = $.params["favoriteClassName"] ;
            var fileIdObj = FileService.addFileByBytes(imageBytes, imageName);
            fileId = fileIdObj.fileId;

        }else {
            var jFileInfos = $.uploadFiles("png,jpg", 1024 * 1024 * 10);
            var jFileInfo = jFileInfos[0];
            var jParameters = jFileInfo["parameters"];
            fileId = jFileInfo.fileId;
            favoriteClassName = jParameters.favoriteClassName ;
        }
        var userId = user.id;

        //var favoriteClassId = $.params.favoriteClassId;


        if(!favoriteClassName){
            setResultInfo("E1B0001","收藏夹");
            return;
        }
        var favoriteTypeList = FavoriteProductTypeService.getListByUserId(userId,0,-1);
        if(favoriteTypeList){
            for (var i=0; i<favoriteTypeList.length; i ++){
                if(favoriteTypeList[i] != null && favoriteClassName == favoriteTypeList[i].favoriteClassName){
                    setResultInfo("E1B0001","收藏夹名称已存在");
                    return;
                }
            }
        }
        //var favoriteClassId = $.params.favoriteClassId;

        FavoriteProductTypeService.addFavoriteType(userId, favoriteClassName, fileId);
        setResultInfo("S0A00000","success");
    } catch (e) {

        setResultInfo("E1B0001","加入收藏夹失败"+e);
        return;
    }
})();