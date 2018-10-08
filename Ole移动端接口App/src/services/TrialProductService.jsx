//#import pigeon.js
//#import Util.js
//#import jobs.js
//#import search.js
//#import login.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 商品试用Service
 * by fuxiao
 * email fuxiao9@crv.com.cn
 */
;
var TrialProductService = (function (pigeon) {
    var prefix = "ole_trial_product_";
    var listId = prefix + "list";
    var indexOT = prefix + "ot_index"; // 索引类型名称
    var uid = "tryOutManage_user_group"; // 试用名单申请
    
    /**
     * 试用申请对象
     * @constructor
     */
    function TrialProduct(params) {
        var self = this;
        self.id = params.id;
        self.productId = params.productId; // 试用商品ID
        self.userId = params.userId; // 试用申请人ID
        self.activeId = params.activeId; // 活动ID
        self.state = params.state || 2; // 申请状态 0没通过 1通过 2没操作过的
        self.isHistory = params.isHistory || 0; // 是否历史记录: 0 否 1 是
        self.aliasCode = ""; // 试用申请成功后的订单号
        self.applicationTime = params.applicationTime || "";
        self.controlUser = params.controlUser || "";
        self.remarks = params.remarks || "";
        self.addressInfo = params.addressInfo || {};
        self.orderId =params.orderId || "";
        self.createDate = params.createDate || new Date().getTime(); // 对象创建时间
    }
    
    var fun = {};
    
    /**
     * 获取一个试用申请对象
     * @param id
     */
    fun.getObject = function (id) {
        var trialProduct = pigeon.getObject(id);
        
        // TODO 获取试用其他信息, 如用户信息: 头像, 名称
        
        return trialProduct;
    };
    
    /**
     * 生成一个对象ID
     * @param userId 登录用户ID
     * @param activeId 活动ID
     * @param productId 商品ID
     * @return {string} 对象ID
     */
    fun.getObjectId = function (userId, activeId, productId) {
        // return prefix + pigeon.getId(prefix);
        return prefix + userId + "_" + activeId + "_" + productId;
    };
    
    /**
     * 保存一个对象
     * @param data
     */
    fun.addObject = function (data) {
        var trialProduct = new TrialProduct(data);
        if (!trialProduct.id) {
            trialProduct.id = fun.getObjectId(data.userId, data.activeId, data.productId);
        }
        $.log("\n\n new  TrialProduct = " + JSON.stringify(trialProduct) + "\n\n");
        pigeon.saveObject(trialProduct.id, trialProduct); // 保存对象
        
        var key = pigeon.getRevertComparableString(trialProduct.createTime, 13); // list的KEY
        pigeon.addToList(listId, key, trialProduct.id); // 保存对象到列表中
        
        addTrialUserList(trialProduct.userId); // 添加试用名单列表
        
        buildIndex(trialProduct.id); // 添加索引
        return trialProduct.id;
    };
    
    /**
     * 添加试用名单列表
     */
    var addTrialUserList = function (userId) {
        var userObj = tryOutManageServices.getById(uid) || {
            id:uid,
            trialUserList:{}
        };
        if (!userObj.trialUserList) {
            userObj.trialUserList = {};
        }
        if(userObj.trialUserList[userId]){
            var b = userObj.trialUserList[userId];
            userObj.trialUserList[userId] = b+1;
        }else{
            userObj.trialUserList[userId] = 1;
        }
        tryOutManageServices.addObj(uid, userObj);
    };
    
    /**
     * 添加索引, 用于查询
     * @param id 劵活动对象ID
     */
    fun.update = function (id, param) {
        pigeon.saveObject(id, param);
        buildIndex(id);
        return true;
    };
    
    /**
     * 删除
     * @param id
     */
    fun.delete = function(id) {
        var o = pigeon.getObject(id);
        if (o) {
            pigeon.saveObject(id, null);
            var key = pigeon.getRevertComparableString(o.createTime, 13);
            pigeon.deleteFromList(listId, key, id);
        }
        buildIndex(id)
    };
    
    /**
     * 查询
     * @param searchParam
     */
    fun.search = function (searchParam) {
        var pageNum = searchParam["pageNum"] || 1;
        var limit = searchParam["limit"] || 10;
        var start = (pageNum - 1) * limit;
        
        var queryAttr = [{n: "ot", v: indexOT, type: 'term'}];
        
        // 商品ID
        if (searchParam.productId) {
            queryAttr.push({n: 'productId', v: searchParam.productId, type: 'text', op: 'and'});
        }
        
        // 用户ID
        if (searchParam.userId) {
            queryAttr.push({n: 'userId', v: searchParam.userId, type: 'text', op: 'and'});
        }
        
        // 活动ID
        if (searchParam.activeId) {
            queryAttr.push({n: 'activeId', v: prefixActiveId + searchParam.activeId, type: 'text', op: 'and'});
        }
        
        // 构建搜索条件
        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
            // 排序字段
            sortFields: [
                {
                    field: "createDate",
                    type: "LONG",
                    reverse: true
                }],
            // 查询参数
            queryArgs: JSON.stringify({
                mode: 'adv',
                q: queryAttr
            })
        };
        
        // 通过搜索引擎获取搜索结果
        var result = SearchService.search(searchArgs);
        var allCount = result.searchResult.getTotal();
        var idsJavaList = result.searchResult.getLists();
        var ids = [];
        for (var i = 0, len = idsJavaList.size(); i < len; i++) {
            var id = idsJavaList.get(i) + "";
            if (id) ids.push(id);
        }
        $.log("\n\n\n search ids = " + JSON.stringify(ids) + "\n\n\n");
        return {
            "allCount": allCount,
            "list": getListByIds(ids)
        }
    };
    
    /**
     * 查询ID对应的对象信息
     * @param ids
     * @return {Array}
     */
    var getListByIds = function (ids) {
        var array = [];
        if (ids && ids.length > 0) {
            ids.forEach(function (id) {
                var tempObj = fun.getObject(id);
                if (tempObj) {
                    array.push(tempObj);
                }
            });
        }
        return array;
    };
    
    var buildIndex = function (id) {
        var jobPageId = "jobs/TrialProductIndexJob.jsx";
        JobsService.runNow("oleMobileApi", jobPageId, {ids: id});
    };
    
    return fun;
})($S);