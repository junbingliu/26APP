//#import pigeon.js
//#import Util.js
//#import user.js
//#import login.js
//#import search.js
//#import Info.js
//#import job.js
//#import product.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
/**
 * 点赞接口：用于商品热度值和商品评论点赞
 * prefix:
 * likes_comment_：商品评论点赞前缀
 * likes_product_：商品点赞前缀
 * option：
 * get ：获取点赞情况，用户加载页面的时候调用
 * set ：操作点赞，未点赞情况下请求对评论点赞，已点赞情况下请求取消对评论点赞
 * getUsers : 获取对某个项目点赞的用户数
 * getObjs : 获取某个用户对那些项目进行了点赞
 * 返回码status：
 * 0：当前用户未点赞或者未登录情况下均为0，显示点赞图标
 * 1：当前用户已点赞，显示点赞后的图标
 */
var ProductLikeService = (function (pigeon) {

    var f = {};
    /**
     * 检验商品是否存在
     * @param productId
     * @returns {boolean}
     */
    f.checkProduct = function (productId) {
        var flag = false;
        var product = ProductApi.ProductFunction.getProduct(productId);

        if (product) {
            flag = true;
        }
        return flag;
    };

    /**
     * 检验评论是否存在
     * @param commentId
     * @returns {boolean}
     */
    f.checkComment = function (commentId) {
        var flag = false;
        var comment = pigeon.getObject(commentId);

        if (comment) {
            flag = true;
        }
        return flag;
    };

    /**
     * likeObj : 存储了点赞数和点赞用户列表
     * @param likeId
     * @returns {*}
     */
    f.initLikeObj = function (likeId) {
        var likeObj = pigeon.getObject(likeId);

        //若果没有就初始化一个
        if (!likeObj || likeObj === undefined || Object.getOwnPropertyNames(likeObj).length === 0) {
            likeObj = {};
            likeObj.likesCount = 0;
            pigeon.saveObject(likeId, likeObj);
        }

        return likeObj;
    };

    /**
     * 存储了用户的点赞数和点赞的项目列表
     * @param userLikeId
     * @returns {*}
     */
    f.initUserLikeObj = function (userLikeId) {
        var userLikeObj = pigeon.getObject(userLikeId);
        //若果没有就初始化一个
        if (!userLikeObj || userLikeObj === undefined || Object.getOwnPropertyNames(userLikeObj).length === 0) {
            userLikeObj = {};
            userLikeObj.likesCount = 0;
            pigeon.saveObject(userLikeId, userLikeObj);
        }

        return userLikeObj;
    };
    /**
     * 获取点赞信息
     * @param userId
     * @param likeObj
     * @param status
     * @param ret
     * @returns {*}
     */
    f.getLikeInfo = function (userId, likeObj, status, ret) {
        //用户没有登录则默认点赞状态为0
        $.log("\n\n" + JSON.stringify(likeObj) + "\n\n");
        if (!userId) {
            ret.data = {
                "likesCount": likeObj.likesCount,
                "status": status
            };
            return ret;
        }

        //如果用户ID在点赞列表中则点赞状态为1
        //如果用户ID不在点赞列表中则点赞状态为0
        ret.data = {
            "likesCount": likeObj.likesCount,
            "status": (userId in likeObj) ? 1 : 0
        };
        return ret;

    };

    /**
     * 设置点赞
     * @param userId
     * @param likeObj
     * @param likeId
     * @param status
     * @param ret
     * @returns {*}
     */
    f.setLikeInfo = function (userId,objId,likeId, likeObj, userLikeId,userLikeObj,status, ret) {
        if (!userId) {
            ret = ErrorCode.article.E1B04009;//当前用户没登录
            ret.msg = "用户没有登录，无法进行点赞操作";
            ret.data = {
                "likesCount": likeObj.likesCount,
                "status": status
            };
            return ret;
        }
        //如果用户已在点赞列表中，那么再次点击说明用户要取消点赞，取消后将status设置为0
        if (userId in likeObj) {
            delete likeObj[userId];
            delete userLikeObj[objId];
            likeObj.likesCount = Object.getOwnPropertyNames(likeObj).length - 1;
            userLikeObj.likesCount = Object.getOwnPropertyNames(userLikeObj).length - 1;
            try {
                pigeon.saveObject(likeId, likeObj);
                pigeon.saveObject(userLikeId,userLikeObj);
            } catch (e) {
                $.log(e);
                ret = ErrorCode.product.E1Z00002;
                return ret;
            }
            status = 0;
            ret.data = {
                "likesCount": likeObj.likesCount,
                "status": status
            };
            $.log("\n\n" + JSON.stringify(likeObj) + "\n\n");
            return ret;
        }
        // 如果用户ID不在点赞列表中则说明用户要点赞，点赞后将status设为1
        var now = new Date().getTime();
        likeObj[userId] = now;
        userLikeObj[objId] = now;
        likeObj.likesCount = Object.getOwnPropertyNames(likeObj).length - 1;
        userLikeObj.likesCount = Object.getOwnPropertyNames(userLikeObj).length - 1;
        try {
            pigeon.saveObject(likeId, likeObj);
            pigeon.saveObject(userLikeId,userLikeObj);
        } catch (e) {
            $.log(e);
            ret = ErrorCode.product.E1Z00002;
            return ret;
        }
        status = 1;
        ret.data = {
            "likesCount": likeObj.likesCount,
            "status": status
        };
        $.log("\n\n" + JSON.stringify(likeObj) + "\n\n");
        return ret;
    };

    /**
     * 获取某个项目的点赞的用户列表
     * @param likeObj
     * @param ret
     * @returns {*}
     */
    f.getLikeUserList = function (objId,likeObj, ret) {
        var userObj = likeObj;
        var likesCount = likeObj.likesCount;
        var LikeUserList = [];

        delete userObj.likesCount;
        for (var key in userObj) {
            if (userObj.hasOwnProperty(key)) {
                LikeUserList.push(key);
            }
        }
        ret.data = {
            "id" :objId,
            "likesCount": likesCount,
            "LikeUserList": LikeUserList
        };
        return ret;
    };


    /**
     * 获取某个用户的点赞项目的列表
     * @param userId
     * @param userLikeObj
     * @param ret
     * @returns {*}
     */
    f.getLikeObjList = function (userId,userLikeObj, ret) {
        var userLikeItemObj = userLikeObj;
        var likesCount = userLikeObj.likesCount;
        var userLikeObjList = [];

        delete userLikeItemObj.likesCount;
        for (var key in userLikeItemObj) {
            if (userLikeItemObj.hasOwnProperty(key)) {
                userLikeObjList.push(key);
            }
        }
        ret.data = {
            "userId":userId,
            "likesCount": likesCount,
            "LikeObjList": userLikeObjList
        };
        return ret;
    };
    /**
     * 调用getLikeInfo和setLikeInfo方法
     * @param userId
     * @param likeObj
     * @param likeId
     * @param status
     * @param option
     * @param ret
     * @returns {*}
     */
    f.optionSwich = function (userId,objId,likeObj, likeId,userLikeId,userLikeObj,status, option, ret) {

        var optionSwich = {
            "get": function () {
                return f.getLikeInfo(userId, likeObj, status, ret);
            },
            "set": function () {
                return f.setLikeInfo(userId,objId,likeId, likeObj, userLikeId,userLikeObj,status, ret);
            },
            "getUsers": function () {
                return f.getLikeUserList(objId,likeObj, ret);
            },
            "getObjs": function () {
                return f.getLikeObjList(userId,userLikeObj, ret);
            }

        };

        try {
            var result = optionSwich[option]();
        } catch (e) {
            $.log(e);
            ret = ErrorCode.article.E1B04006;//操作失败
            return ret;
        }

        return result;
    };


    return f;

})($S);

