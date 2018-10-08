//#import Util.js
//#import product.js
//#import brand.js
//#import DynaAttrUtil.js
//#import DateUtil.js
//#import login.js
//#import user.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.functions.CommonFunctions
    );
    var productObjId = $.params["productObjId"];
    var productObj = tryOutManageServices.getById(productObjId);
    var jProduct = ProductApi.ProductFunction.getProduct(productObj.productId);
    var userId = LoginService.getFrontendUserId();
    if(!userId){
    userId = $.params["userId"];
    }
    var images = [];
    var countryName = "",
        countryImgUrl = "",
        country = {},
        originPlace = "",
        sellUnit = "",
        shelfLife = "",
        spec = "";
    var imgString = selfApi.CommonFunctions.getPicListSizeImages(jProduct, "attr_10000", "750X750", "/upload/nopic_120.gif") + "";
    if (imgString) {
        var tmpImg = imgString.substring(1, imgString.length - 1);
        if (tmpImg.indexOf(", ") > -1) {
            var img = tmpImg.split(", ");
            if (img) {
                for (var i = 0; i < img.length; i++) {
                    images.push({url: img[i]});
                }
            }
        } else {
            images.push({url: tmpImg});
        }
    }
    productObj.productImg = images;
    var jsProduct = ProductService.getProduct(productObj.productId);
    var dynaAttrs = jsProduct.DynaAttrs;
    var countryAttrId = "attr_730000";   //TODO 生产环境下需要修改
    var originPlaceId = GlobalVariableManagementService.getValueByName("ole_orginPlaceAttrId");
    var sellUnitId = GlobalVariableManagementService.getValueByName("ole_sellUnit");
    var shelfLifeId = GlobalVariableManagementService.getValueByName("ole_shelf_life");
    var specId = GlobalVariableManagementService.getValueByName("ole_spec");
    if (dynaAttrs) {
        for (var k in dynaAttrs) {
            if (k == countryAttrId) {
                countryName = dynaAttrs[k].value;
                if (countryName) {
                    countryImgUrl = GlobalVariableManagementService.getValueByName(countryName);
                    var countryCName = CountryManagementService.getValueByName(countryName);
                    country = {name: countryName, imgUrl: countryImgUrl, CName: countryCName};
                }
            } else if (k == originPlaceId) {
                originPlace = dynaAttrs[k].value;
            } else if (k == sellUnitId) {
                sellUnit = dynaAttrs[k].value;
            } else if (k == shelfLifeId) {
                shelfLife = dynaAttrs[k].value;
            } else if (k == specId) {
                spec = dynaAttrs[k].value;
            } else {
            }
        }
    }
    productObj.country = country;
    productObj.originPlace = originPlace;
    productObj.sellUnit = sellUnit;
    productObj.shelfLife = shelfLife;
    productObj.spec = spec;
    var brand = BrandService.getBrand(jsProduct.brandColumnId);
    productObj.brand = brand;
    productObj.temperatureControl = getTmpratureControl(jsProduct);
    productObj.name = jsProduct.htmlname;
    productObj.price = productObj.marketPrice || ProductService.getMemberPrice(jsProduct);
    var mobileContentHTML = jsProduct.mobileContent;
    var mobileContent = [];
    if (mobileContentHTML) {
        var reg = /<img src=\"([^\"]*)/gi;
        var s = mobileContentHTML.match(reg);
        if (s) {
            for (var i = 0; i < s.length; i++) {
                if (s[i].toLowerCase().indexOf("http://") > -1) {
                    var url = s[i].substring(s[i].toLowerCase().indexOf("http://"));
                    mobileContent.push({url: url});
                }
            }
        }
    }
    productObj.mobileContent = mobileContent;
    var activeObj = tryOutManageServices.getById(productObj.activeId);
    var endTime = DateUtil.getLongTimeByFormat(activeObj.endTime,"yyyy-MM-dd HH:mm");
    productObj.distanceEnd = endTime - new Date().getTime();//距离结束时间
    var applicationId = "ole_trial_product_"+userId+"_"+productObj.activeId+"_"+productObj.productId;
    var searchParams = {};
        searchParams.activeId = productObj.activeId;
        searchParams.productId = productObj.productId;
    var searchArgs = {
        fetchCount: 99999,
        fromPath: 0
    };
    var qValues = trialProductQuery.getQuery(searchParams);
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    productObj.totalRecords = result.searchResult.getTotal();
    productObj.isApplication = false;
    productObj.addressInfo = {

    };
    var user = UserService.getUser(userId);
    productObj.isMember = false;
    if(user){
    if(!user.memberid  || user.memberid == "" || user.memberid == "0"){
        productObj.isMember = false;
    }else{
        productObj.isMember = true;
    }
    }
    if(userId){
        var obj = TrialProductService.getObject(applicationId);
        $.log(applicationId);
        if(obj){
        productObj.isApplication = true;
        productObj.addressInfo = obj.addressInfo;
        productObj.applicationState = obj.state;
        }
    }
    ret.data = productObj;
    out.print(JSON.stringify(ret));
})();
function getTmpratureControl(product) {
    var temperatureControl = product.temperatureControl;
    var tempratrueObj = {};
    if (temperatureControl == "02") {
        tempratrueObj.state = "2";
        tempratrueObj.des = "冷藏";
    } else if (temperatureControl == "03") {
        tempratrueObj.state = "3";
        tempratrueObj.des = "冷冻";
    } else {
        tempratrueObj.state = "1";
        tempratrueObj.des = "常温";
    }
    return tempratrueObj;
}