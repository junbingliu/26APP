//#import pigeon.js
//#import Util.js
//#import jobs.js
//#import order.js
//#import user.js

/**
 * 订单评价Server
 * by fuxiao
 * email: fuxiao9@crc.com.cn
 */
;
var OrderAppraiseService = (function (pigeon) {
    
    var prefix = "ole_order_appraise_";
    var listId = prefix + "list";
    var indexObjectType = "ole_order_appraise_ot_index";
    
    /**
     * 订单评价对象
     * @constructor
     */
    function OrderAppraise(params) {
        var self = this;
        self.id = params.id;
        self.userId = params.userId; // 评价人ID
        self.orderId = params.orderId; // 订单ID
        self.comment = params.comment; // 评价信息
        self.satisfaction = params.satisfaction; // 满意度: 0, 不满意, 1, 一般满意, 2, 非常满意
        self.createDate = params.createDate || new Date().getTime(); // 对象创建时间
    }
    
    var fun = {};
    
    /**
     * 获取一个新的ID
     */
    var getObjectId = function (userId, orderId) {
        // return prefix + pigeon.getId(prefix);
        return prefix + userId + "_" + orderId;
    };
    
    fun.getObject = function (id) {
        return pigeon.getObject(id);
    };
    
    /**
     * 新增订单评价
     * @param appraise 评价对象
     */
    fun.addOrderAppraise = function (appraise) {
        
        var id = getObjectId(appraise.userId, appraise.orderId);
        Preconditions.checkArgument(!fun.getObject(id), "订单已添加评论");
        
        // 通过订单外部ID获取订单信息
        var orderInfo = OrderService.getOrderByKey(appraise.orderId);
        Preconditions.checkArgument(orderInfo, "订单不存在");
        
        var userInfo = UserService.getUser(appraise.userId);
        Preconditions.checkArgument(userInfo, "用户不存在");
        
        var orderAppraise = new OrderAppraise(appraise);
        orderAppraise.id = id;
        pigeon.saveObject(id, orderAppraise);
        
        var key = pigeon.getRevertComparableString(orderAppraise.createTime, 13); // list的KEY
        pigeon.addToList(listId, key, orderAppraise.id); // 保存对象到列表中
        
        buildIndex(orderAppraise.id); // 添加索引
        
        return orderAppraise.id;
        
    };
    
    var buildIndex = function (id) {
        var jobPageId = "jobs/OrderAppraiseIndex.jsx";
        JobsService.runNow("oleMobileApi", jobPageId, {ids: id});
    };
    
    return fun;
})($S);
