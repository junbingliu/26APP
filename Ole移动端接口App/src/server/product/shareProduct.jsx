//#import Util.js
//#import product.js
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx

/**
 * 商品分享接口
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function(){
    try {
        var productId = $.params.productId;
        Preconditions.checkArgument(productId, "商品ID不能为空");
        
        var productInfo = ProductService.getProduct(productId);
        if (productInfo) {
            
            // TODO 分享h5的URL待定
            ResponseUtil.success({
                title: productInfo.name,
                content: productInfo.sellingPoint,
                image: ProductService.getProductLogo(productInfo, "200X200", ""),
                url: ""
            });
        } else {
            ResponseUtil.error("商品信息获取失败")
        }
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
