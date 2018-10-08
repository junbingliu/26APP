//#import pigeon.js
//#import Util.js
//#import jobs.js
//#import search.js

/**
 * 到货提醒Service类
 * @author fuxiao9
 * @date 2017-07-12
 * @email fuxiao9@crv.com.cn
 */
;
var ArrivalRemindService = (function (pigeon) {


    var prefix = "arrivalRemind"; // 保存对象的前缀, 需要与meta.json中配置保持一致
    var listNamePrefix = prefix + "List"; // 列表ID前缀, 需要与meta.json中配置保持一致
    var signStr = "_";

    /**
     * 获取一个对象ID
     * @param userId 登陆用户ID
     * @param productId 产品ID
     * @param skuId skuID
     * @return {string}
     */
    var getId = function (userId, productId, skuId) {
        return prefix + signStr + userId + signStr + productId + signStr + skuId;
    };

    /**
     * 生成一个列表ID
     * @param productId 产品ID
     * @param skuId 产品skuID
     * @return {string}
     */
    var getListId = function (productId, skuId) {
        return listNamePrefix + signStr + productId + signStr + skuId;
    };

    /**
     * 订阅对象构造函数
     * @param params
     * @constructor
     */
    function ArrivalRemind(params) {
        var self = this;
        self.id = params.id || "";
        self.userId = params.userId || "";
        self.userName = params.userName || "";
        self.email = params.email || "";
        self.telephone = params.telephone || "";
        self.productId = params.productId || "";
        self.skuId = params.skuId || "";

        /**
         * 生成一个对象ID
         * @return {string}
         */
        self.getUID = function () {
            return getId(self.userId, self.productId, self.skuId);
        };

        /**
         * 生成一个列表ID
         * @return {string}
         */
        self.getListId = function () {
            return getListId(self.productId, self.skuId);
        }
    }

    var f = {};

    /**
     * 获取一个到货订阅对象
     * @param id
     * @return {*}
     */
    f.getObject = function (id) {
        return pigeon.getObject(id)
    };

    /**
     * 添加索引
     */
    f.addIndex = function (id, deleteState) {
        var jobPageId = "jobs/ArrivalRemindIndexJob.jsx";
        JobsService.runNow("oleMobileApi", jobPageId, {id: id, deleteState: deleteState});
    };

    /**
     * 保存一个到货订阅对象
     * @param data
     */
    f.addObject = function (data) {
        var arrivalRemind = new ArrivalRemind(data); // 生成一个直播对象
        var id = arrivalRemind.getUID(); // 生成一个对象ID
        $.log("\n\n new objectId = " + id + "\n\n");
        arrivalRemind.id = id;

        // 对象创建时间
        arrivalRemind.createTime = new Date().getTime();
        pigeon.saveObject(id, arrivalRemind);

        var listId = arrivalRemind.getListId(); // 生成一个列表ID
        $.log("\n\n new listId = " + listId + "\n\n");

        var key = pigeon.getRevertComparableString(arrivalRemind.createTime, 13); // list的KEY
        pigeon.addToList(listId, key, id); // 保存集合
    };


    /**
     * 判断对象是否存在
     * @param arrivalRemindObj
     */
    f.checkExists = function (arrivalRemindObj) {
        return !!pigeon.getObject(getId(arrivalRemindObj["userId"], arrivalRemindObj["productId"], arrivalRemindObj["skuId"]));
    };

    /**
     * 删除一个到货订阅对象
     * @param id
     */
    f.deleteObject = function (id) {
        var o = f.getObject(id);
        if (o) {
            pigeon.saveObject(id, null);
            var key = pigeon.getRevertComparableString(o.createTime, 13);
            var listId = getListId(o.productId, o.skuId);
            pigeon.deleteFromList(listId, key, id);
        }
    };

    /**
     *
     * 查询订阅数据
     *
     * @param productId 产品ID
     * @param skuId skuId
     * @return {Array}
     */
    f.search = function (productId, skuId) {
        if (!productId || !skuId) {
            return [];
        }
        var listId = getListId(productId, skuId);
        $.log("\n\n search listId = " + listId + "  \n\n");
        var listSize = pigeon.getListSize(listId) || 0;
        $.log("\n\n search listSize = " + listSize + "  \n\n");
        var arrivalRemindList = []; // 订阅列表集合
        if (listSize > 0) {
            arrivalRemindList = pigeon.getListObjects(listId, 0, listSize);
        }
        return arrivalRemindList;
    };

    return f;
})($S);