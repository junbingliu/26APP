//#import pigeon.js
//#import jobs.js
//#import Util.js
//#import login.js
//#import product.js
//#import sku.js

var InventoryManageService = (function (pigeon) {
    var prefix = "inventoryManage";//ID前缀，在meta.json里定义
    var allList = prefix + "_list";//列表名称
    var f = {
        /**
         * 构造数据
         * @param param
         * @returns {f}
         */
        inventoryManage: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.productId = data.productId;
            self.productName = data.productName;
            self.skuId = data.skuId;
            self.sku = data.sku;
            self.merchantId = data.merchantId;
            self.newAmount = data.newAmount;
            self.oldAmount = data.oldAmount || 0;
            self.userId = data.userId;
            self.shipNode = data.shipNode;
            self.createTime = data.createTime;
            if (!data.createTime) {
                self.createTime = new Date().getTime();
            }
            return self;
        },
        /**
         * 增加对象，保存数据
         * @param param
         * @returns {*}
         */
        add: function (param) {
            param = f.inventoryManage(param);//构造数据
            if (!param.id) {
                param.id = f.getNewId();//获取ID
            }
            var key = pigeon.getRevertComparableString(param.createTime, 13);
            pigeon.addToList(allList, key, param.id);//加入到列表中
            pigeon.saveObject(param.id, param);//保存对象
            f.buildIndex(param.id);//建索引
            return param.id;
        },
        addLog: function (productId, skuId, merchantId, newAmount, shipNode, oldAmount) {
            var userId = 'u_sys';
            try {
                userId = LoginService.getBackEndLoginUserId();
            } catch (e) {
            }
            var jProduct = ProductService.getProduct(productId);
            var jSku = SkuService.getSkuById(productId, skuId);
            if(!jProduct || !jSku){
                return null;
            }
            var log = {
                productId: productId,
                productName: jProduct.name,
                skuId: skuId,
                sku: jSku.skuId,
                merchantId: merchantId,
                newAmount: newAmount,
                userId: userId,
                shipNode: shipNode,
                oldAmount: oldAmount || 0
            };
            return f.add(log);
        },
        getNewId: function () {
            return prefix + "_" + pigeon.getId('inventoryManage');
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
        getList: function (start, limit) {
            return pigeon.getList(allList, start, limit);
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
            var obj = f.inventoryManage(param);
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
            var jobPageId = "services/InventoryManageBuildIndex.jsx";
            JobsService.runNow("inventoryManage", jobPageId, {ids: ids});
        }
    };
    return f;
})($S);