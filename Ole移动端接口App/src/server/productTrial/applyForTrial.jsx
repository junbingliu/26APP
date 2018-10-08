//#import Util.js
//#import login.js
//#import address.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
/**
 * 商品试用申请
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function () {
    
    try {
        var userId = LoginService.getFrontendUserId() || $.params.userId;
        Preconditions.checkArgument(userId, "请登陆");
        
        // 获取用户默认地址
        var addressInfo = AddressService.getDefaultAddress(userId);
        Preconditions.checkArgument(addressInfo, "请设置默认地址");
        
        $.log("\n\n addressInfo = " + JSON.stringify(addressInfo) + "\n\n");
        
        var productId = $.params.productId;
        Preconditions.checkArgument(productId, "商品ID不能为空");
        
        var activeId = $.params.activeId;
        Preconditions.checkArgument(activeId, "活动ID不能为空");
        
        var objectId = TrialProductService.getObjectId(userId, activeId, productId); // 获取一个对象ID, 检测用户是否已申请过此活动
        var checkExistsState = TrialProductService.getObject(objectId);
        $.log("\n\n checkExistsState " + JSON.stringify(checkExistsState) + "\n\n");
        Preconditions.checkArgument(!checkExistsState, "您已申请过此试用活动");
        
        var id = TrialProductService.addObject({
            "userId": userId,
            "productId": productId,
            "activeId": activeId,
            addressInfo: {
                userName: addressInfo.userName, // 收件人名称
                phone: addressInfo.mobile, // 收货人电话
                address: addressInfo.address // 收货详细地址
            }
        });
        
        ResponseUtil.success({
            id: id
        });
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
