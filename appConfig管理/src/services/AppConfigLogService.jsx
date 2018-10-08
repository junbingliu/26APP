//#import pigeon.js
//#import jobs.js
//#import Util.js

var AppConfigLogService = (function (pigeon) {
    var prefix = "appConfig_Log";//ID前缀，在meta.json里定义
    var allList = prefix + "_list";//列表名称
    var f = {
        /**
         * 构造数据
         * @param param
         * @returns {f}
         */
        appConfigLog: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.data = data.data;
            self.oldData = data.oldData;
            self.createUserId = data.createUserId;
            self.createTime = data.createTime;
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            return self;
        },
        /**
         * 增加对象，保存数据
         * @param param
         * @returns {*}
         */
        add: function (param) {
            param = f.appConfigLog(param);//构造数据
            if (!param.id) {
                param.id = prefix + "_" + pigeon.getId(prefix);//获取ID
                var key = pigeon.getRevertComparableString(param.createTime, 13);
                pigeon.addToList(allList, key, param.id);//加入到列表中
            }
            pigeon.saveObject(param.id, param);//保存对象
            f.buildIndex(param.id);//建索引
            return param.id;
        },
        /**
         * 根据ID获取对象
         * @param id
         * @returns {*}
         */
        getById: function (id) {
            var p = pigeon.getObject(id);
            if (!p) {
                return null;
            }
            else {
                return p;
            }
        },
        /**
         * 获取list
         * @param start 从多少开始
         * @param limit 取多少条
         * @returns {*}
         */
        list: function (start, limit) {
            return pigeon.getListObjects(allList, start, limit);
        },
        /**
         * 获取list总数量
         * @returns {*}
         */
        listCount: function () {
            return pigeon.getListSize(allList);
        },
        /**
         * 修改对象
         * @param id
         * @param param
         * @returns {boolean}
         */
        update: function (id, param) {
            var obj = f.appConfigLog(param);
            pigeon.saveObject(id, obj);
            f.buildIndex(id);
            return true;
        },
        /**
         * 删除对象
         * @param id
         * @returns {boolean}
         */
        delete: function (id) {
            var obj = f.getById(id);
            if (obj) {
                var key = pigeon.getRevertComparableString(obj.createTime, 13);
                pigeon.deleteFromList(allList, key, id);
                pigeon.saveObject(id, null);
                f.buildIndex(id);
                return true;
            }
            return false;
        },
        /**
         * 重建索引
         * @param ids
         */
        buildIndex: function (ids) {
            //var jobPageId = "services/AppConfigLogBuildIndex.jsx";
            //JobsService.runNow(appId, jobPageId, {ids: ids});
        }
    };
    return f;
})($S);