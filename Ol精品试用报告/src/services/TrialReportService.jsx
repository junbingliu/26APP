//#import pigeon.js
//#import Util.js
//#import user.js
//#import login.js
//#import search.js
//#import file.js
//#import Info.js
//#import job.js
//#import product.js
//#import @oleTrialReport:utils/TrialReportUtil.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
var TrialReportUtilService = (function (pigeon) {
    var prefix = "ole_productTrial_reports_";
    var listId = prefix + "list_";
    var indexType = prefix + "index";
    var f = {};

    /**
     * 建立索引
     * @param id
     *
     */
    var buildIndex = function (id) {

        if (!id) {
            return
        }
        var docs = [];
        var obj = pigeon.getObject(id);

        if (obj) {
            var doc = {};
            doc.keyword_text = obj.productName;//商品名称作为关键字
            doc.id = id;//试用报告id
            doc.userId = obj.userId;//用户id
            doc.orderId = obj.orderId;//订单id
            doc.activityId = obj.activityId;//活动id
            doc.activityName = obj.activityName;//活动名称
            doc.productId = obj.productId;//商品id
            doc.productObjId = obj.productObjId;//试用商品id，不是productId
            doc.productName = obj.productName;//商品名称
            doc.examineStatus = obj.examineInfo.examineStatus;//审核状态
            doc.createTime = obj.createTime;//创建时间
            doc.examinTime = obj.examineInfo.CreateTime;//审核时间
            doc.likesCount = obj.likesInfo.likesCount;//点赞数量
            doc.ot = indexType;
            docs.push(doc);
        }
        $.log("\n\n Indexdocs id = " + id + " = " + JSON.stringify(docs) + "\n\n");
        SearchService.index(docs, id);
        $.log("\n\n build Index end: \n\n");
    };
    /**
     * 活动报告对象构造函数
     * @param data
     */
    var TrialReportObject = function (data) {
        var self = this;
        self.id = data.id || "";//试用报告Id
        self.userId = data.userId || "";//用户id
        self.orderId = data.orderId || "";//订单id
        self.productObjId = data.productObjId || "";//试用商品Id,不是productId
        self.activityId = data.activityId || "";//活动Id
        self.oneSentence = data.oneSentence || "";//一句话评论
        self.moodWords = data.moodWords || "";//收到时的心情
        self.feelingWords = data.feelingWords || "";//该商品的XX感
        self.compareWords = data.compareWords || "";//与其他商品比较
        self.freeWords = data.freeWords || "";//自由发言
        self.wordContent = data.wordContent || "";//试用报告文字
        self.sourceFileIdList = data.fileIdList || [];//试用报告图片fileId
        self.createTime = data.createTime || new Date().getTime();//对象创建时间

        // self.examineStatus = false;//试用报告审核状态
        // self.likesCount = data.likesCount || "";//试用报告点赞数量
        // self.likesStatus = data.likesStatus ||"";//当前用户点赞状态
        // self.userName = data.userName || "";//用户昵称
        // self.userLogoURL = data.userLogoURL || "";//用户头像url
    };
    /**
     * 生成一个id
     * @returns {string}
     */
    var getObjectId = function () {
        return prefix + pigeon.getId(prefix);
    };
    /**
     * 获取活动名称
     * @param activityId
     * @returns {string}
     */
    var getActivityName = function (activityId) {
        return tryOutManageServices.getById(activityId).title;
    };

    /**
     * 获取用户信息
     * @param userId
     * @returns {{nickName: *, userLogoUrl: *}}
     */
    f.getUserInfo = function (userId) {
        $.log("\n\n userId = " + userId + "\n\n");
        var userInfo = UserService.getUser(userId);
        if (!userInfo) {
            userInfo = {};
        }

        return {
            "nickName": userInfo.nickName ? userInfo.nickName : userInfo.loginId,
            "userLogoUrl": userInfo.logo
        };
    };
    /**
     * 获取商品
     * @param productObjId  不是productId
     */
    var getProduct = function (productObjId) {
        var productObj = tryOutManageServices.getById(productObjId);
        var productInfo = ProductService.getProduct(productObj.productId);
        return {
            name: productInfo.name,
            id: productObj.productId
        }
    };

    /**
     * 通过图片的id获取图片的外网地址
     * @param fileIdList
     * @returns {Array}
     */
    var getPicRealPath = function (fileIdList) {
        // $.log("\n\n fileIdList = " + JSON.stringify(fileIdList) + "\n\n");
        var picRealPathList = [];
        for (var i = 0, len = fileIdList.length; i < len; i++) {

            var realpath = FileService.getFullPath(fileIdList[i] + "");
            picRealPathList.push(realpath);
        }
        // $.log("\n\n picRealPathList = " + JSON.stringify(picRealPathList) + "\n\n");
        return picRealPathList;
    };

    /**
     * 获取用于展示的点赞信息
     * @param likesInfo
     * @param userId
     * @returns {{likesCount, status: number}|*}
     */
    var getLikeInfo = function (likesInfo, userId) {
        // $.log("\n\n likesInfo = " + JSON.stringify(likesInfo) + "\n\n");
        var status = 0;
        if (userId in likesInfo) {
            status = 1;
        }
        var likesCount = likesInfo.likesCount;
        likesInfo = {
            likesCount: likesCount,
            status: status
        };
        // $.log("\n\n likesInfo = " + JSON.stringify(likesInfo) + "\n\n");
        return likesInfo;

    };

    var getExamineInfo = function (examineInfo) {

        // $.log("\n\n examineInfo.examineUserId = " + JSON.stringify(examineInfo.examineUserId) + "\n\n");
        var user = UserService.getUser(examineInfo.examineUserId);
        // $.log("\n\n user = " + JSON.stringify(user) + "\n\n");
        if (user) {
            examineInfo.examineUserName = user.realName;
        }

        return examineInfo;
    };
    /**
     * 初始化审核信息
     * @returns {{examineStatus: boolean, CreateTime: number, examineUserId: string, examineUserName: string, examinePassReason: string, examineRejectReasn: string}}
     */
    var initExamineInfo = function () {
        return {
            examineStatus: 0,
            examineStatusName: "notExamined ",
            CreateTime: new Date().getTime(),
            examineUserId: "",
            examineUserName: "",
            examineReason: ""

        };
    };

    /**
     * 初始化点赞信息
     *
     * @returns {*}
     */
    var initLikesInfo = function () {
        return {likesCount: 0};
    };

    /**
     * 通过一组id来获得一组json对象
     * @param ids
     * @returns {Array}
     */
    var getListByIds = function (ids) {
        if (ids && ids.length > 0) {
            return pigeon.getContents(ids).map(function (info) { //批量返回由字符串组成的列表
                return JSON.parse(info);
            })
        }
        return [];
    };

    /**
     * 通过对数据的处理获取显示给客户端的JSON数据
     * @param param  通过搜索引擎查询出来的对象，行如{  allCount：1，
     *                                                  list:[
     *                                                      {obj1},
     *                                                      {obj2}
     *                                                      ]
      *                                                }
     * @param userId
     * @returns {*}
     */
    var getShowInfo = function (param, userId) {
        // $.log("\n\n param.likesInfo = " + JSON.stringify(param.likesInfo) + "\n\n");
        // $.log("\n\n param = " + JSON.stringify(param) + "\n\n");
        var list = [];

        for (var i = 0, len = param.list.length; i < len; i++) {
            var trailReportObj = param.list[i];
            // $.log("\n\n fileIdList = " + JSON.stringify(trailReportObj) + "\n\n");
            trailReportObj.likesInfo = getLikeInfo(trailReportObj.likesInfo, userId);
            trailReportObj.userInfo = f.getUserInfo(trailReportObj.userId);//获取用户信息
            // trailReportObj.sourceFileIdList = {};
            // trailReportObj.sourceFileIdList.sourceFileIdList = trailReportObj.fileIdList;
            // trailReportObj.fileIdList = getPicRealPath(trailReportObj.fileIdList);
            // trailReportObj.sourceFileIdList.fileIdList = trailReportObj.fileIdList;
            trailReportObj.examineInfo = getExamineInfo(trailReportObj.examineInfo);
            trailReportObj.number_activity_id = (trailReportObj.activityId).substring(13);
            trailReportObj.formatTime = (new Date(trailReportObj.createTime)).toLocaleString();
            trailReportObj.examinLog = [];

            list.push(trailReportObj);
        }
        param.list = list;
        return param;
    };

    /**
     * 点赞操作
     * @param userId
     * @param id
     * @returns {{likesCount, status: number}}
     */
    f.like = function (userId, id) {
        var param = {id: id};
        $.log("\n\n param = " + JSON.stringify(param) + "\n\n");
        var trialReportObj = f.getTrialReportList(param, "like", 10, 0).list[0];
        var likesInfo = trialReportObj.likesInfo;
        if (likesInfo.status) {
            delete likesInfo.status;
        }
        //如果用户已在点赞列表中，那么再次点击说明用户要取消点赞
        if (userId in likesInfo) {
            delete likesInfo[userId];
            likesInfo.likesCount = Object.getOwnPropertyNames(likesInfo).length - 1;
            trialReportObj.likesInfo = likesInfo;
            pigeon.saveObject(trialReportObj.id, trialReportObj);//保存对象
            buildIndex(trialReportObj.id); // 添加索引
            return {
                likesCount: likesInfo.likesCount,
                status: 0
            };
        }

        // 如果用户ID不在点赞列表中则说明用户要点赞

        likesInfo[userId] = new Date().getTime();
        likesInfo.likesCount = Object.getOwnPropertyNames(likesInfo).length - 1;
        trialReportObj.likesInfo = likesInfo;
        pigeon.saveObject(trialReportObj.id, trialReportObj);//保存对象
        buildIndex(trialReportObj.id); // 添加索引
        return {
            likesCount: likesInfo.likesCount,
            status: 1
        };

    };

    /**
     * 审核单个试用报告
     * @param examineUserId 审核人id
     * @param id 试用报告id
     * @param option 操作类型 必填 1：审核通过 -1 审核不通过
     * @param examineReason 审核原因
     *
     */
    f.examineOne = function (examineUserId, id, option, examineReason) {
        var param = {id: id};
        $.log("\n\n id = " + id + "\n\n");

        var trialReportObj = f.getTrialReportList(param, "like", 10, 0).list[0];
        $.log(JSON.stringify(trialReportObj));
        var examineInfo = trialReportObj.examineInfo;

        if (examineInfo.examineStatus == 1 || examineInfo.examineStatus == -1) {
            return "该试用报告已完成审核，无法重复操作！";
        }
        var examineStatusName = "reject";
        if (option === "1") {
            examineStatusName = "pass";
        }

        var examineInfoTemp = {};
        examineInfoTemp.examineStatus = option; //试用报告状态
        examineInfoTemp.examineStatusName = examineStatusName;//试用报告状态名
        examineInfoTemp.examineUserId = examineUserId;//审核人id
        examineInfoTemp.CreateTime = new Date().getTime();//审核时间
        examineInfoTemp.examineReason = examineReason || "";//审核原因


        trialReportObj.examineInfo = examineInfoTemp;
        trialReportObj.examinLog.push(examineInfoTemp);

        pigeon.saveObject(trialReportObj.id, trialReportObj);//保存对象

        buildIndex(trialReportObj.id); // 添加索引

        $.log("\n\n trialReportObj = " + JSON.stringify(trialReportObj) + "\n\n");

        var productObj = tryOutManageServices.getById(trialReportObj.productObjId);

        if (option === "1") {
            if (!productObj.hasReport || productObj.hasReport === "" || productObj.hasReport == 0) {
                productObj.hasReport = "1";
                productObj.freight = (productObj.freight).join(",");
                tryOutManageServices.addProduct(productObj);
            }
        }

        return trialReportObj.id;

    };

    /**
     * 用户提交试用报告
     * @param param
     */
    f.addTrialReport = function (param) {
        var trialReportObject = new TrialReportObject(param);
        $.log("\n\n trialReportObject = " + JSON.stringify(trialReportObject) + "\n\n");

        var product = getProduct(trialReportObject.productObjId);//获取商品

        trialReportObject.id = getObjectId();//生成一个id
        trialReportObject.userInfo = f.getUserInfo(trialReportObject.userId);//获取用户信息
        trialReportObject.productName = product.name;//获取商品名称
        trialReportObject.productId = product.id;//获取商品id
        trialReportObject.activityName = getActivityName(trialReportObject.activityId);//获取活动名称
        trialReportObject.fileIdList = getPicRealPath(trialReportObject.sourceFileIdList);//图片的外网url
        trialReportObject.likesInfo = initLikesInfo();//初始化点赞信息
        trialReportObject.examineInfo = initExamineInfo();//初始化审核信息

        trialReportObject.examinLog = [];
        trialReportObject.examinLog.push(trialReportObject.examineInfo);//添加审核日志

        $.log("\n\n new trialReportObject = " + JSON.stringify(trialReportObject) + "\n\n");

        pigeon.saveObject(trialReportObject.id, trialReportObject);//保存对象
        $.log("\n\n saved trialReportObject = " + JSON.stringify(pigeon.getObject(trialReportObject.id)) + "\n\n");

        var key = pigeon.getRevertComparableString(trialReportObject.createTime, 13); // list的KEY
        $.log("\n\n key = " + key + "\n\n");

        pigeon.addToList(listId, key, trialReportObject.id); // 保存对象到列表中
        $.log("\n\n saved list = " + pigeon.getList(listId, 0, -1) + "\n\n");

        buildIndex(trialReportObject.id); // 添加索引
        return trialReportObject.id;
    };

    f.updateReport = function (param) {
        var params = {id: param.id};
        var trialReportObj = f.getTrialReportList(params, "like", 10, 0).list[0];

        trialReportObj.oneSentence = param.oneSentence;
        trialReportObj.moodWords = param.moodWords;
        trialReportObj.feelingWords = param.feelingWords;
        trialReportObj.compareWords = param.compareWords;
        trialReportObj.freeWords = param.freeWords;
        trialReportObj.wordContent = param.wordContent;
        trialReportObj.fileIdList = (param.fileIdList).split(",");
        pigeon.saveObject(trialReportObj.id, trialReportObj);
        return trialReportObj.id;
    };


    f.get = function (params, orderBy, userId, limit, start) {
        return getShowInfo(f.getTrialReportList(params, orderBy, limit, start), userId);
    };

    f.getNumInfo = function (productId) {
        var flag = true;
        var param = {
            productId: productId,
            examineStatus: "1"
        };
        var result = f.getTrialReportList(param, "like", 1, 0);
        if (result.allCount == 0) {
            flag = false;
        }
        return flag;
    };

    f.getNumInfoByOrderId = function (orderId) {
        var flag = true;
        var param = {orderId: orderId};
        var result = f.getTrialReportList(param, "like", 1, 0);
        if (result.allCount == 0) {
            flag = false;
        }
        return flag;
    };

    /**
     * 通过搜索引擎查询符合条件的对象
     * @param param 查询条件
     * @returns {{allCount: *, list: Array}}
     */
    f.getTrialReportList = function (param, orderBy, limit, start) {

        // $.log("\n\n param = " + JSON.stringify(param) + "\n\n");
        var queryAttr = TrialReportUtil.getQueryAttr(param);
        var sortFields = TrialReportUtil.getSortFields(orderBy);
        // $.log("\n\n queryAttr = " + JSON.stringify(queryAttr) + "\n\n");
        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
            sortFields:
            sortFields,
            queryArgs: JSON.stringify({
                mode: "adv",
                q: queryAttr
            })
        };
        var result = SearchService.search(searchArgs);
        var allCount = result.searchResult.getTotal();  //所有通过关键词查询到的数量
        var idsJavaList = result.searchResult.getLists(); //实际获取的查询出的Id


        $.log("\n\n allCount = " + allCount + "\n\n");
        $.log("\n\n idsJavaList = " + idsJavaList.size() + "\n\n");
        // $.log("\n\n saved list = " + JSON.stringify(pigeon.getList(listId, 0, -1)) + "\n\n");
        // $.log("\n\n saved list size = " + JSON.stringify(pigeon.getList(listId, 0, -1).length) + "\n\n");
        var ids = [];

        for (var i = 0, len = idsJavaList.size(); i < len; i++) {
            var id = idsJavaList.get(i) + "";
            if (id) {
                ids.push(id);
            }
        }

        return {
            "allCount": allCount,
            "NumOfPage": Math.ceil(allCount / limit),
            "list": getListByIds(ids)
        }


    };

    /**
     * 删除一个对象
     * @param id 对象ID
     */
    f.deleteObject = function (id) {
        var o = pigeon.getObject(id);
        if (o) {
            pigeon.saveObject(id, null);
            var key = pigeon.getRevertComparableString(o.createTime, 13);
            pigeon.deleteFromList(listId, key, id);
        }
        buildIndex(id)
    };


    return f;
})($S);
