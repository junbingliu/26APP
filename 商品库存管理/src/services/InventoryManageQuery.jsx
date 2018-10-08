//#import Util.js

var InventoryManageQuery = (function () {
    var f = {
        getQuery: function (searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "invM_log", type: 'term'});
            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //productId
            if (searches.productId) {
                searchQuery.push({n: 'productId', v: searches.productId, type: 'term', op: "and"});
            }
            //ID
            if (searches.id) {
                searchQuery.push({n: 'id', v: searches.id, type: 'term', op: "and"});
            }
            //skuId
            if (searches.skuId) {
                searchQuery.push({n: 'skuId', v: searches.skuId, type: 'term', op: "and"});
            }
            //sku
            if (searches.sku) {
                searchQuery.push({n: 'sku', v: searches.sku, type: 'term', op: "and"});
            }
            //productName
            if (searches.productName) {
                searchQuery.push({n: 'productName', v: searches.productName, type: 'text', op: "and"});
            }
            //merchantId
            if (searches.merchantId) {
                searchQuery.push({n: 'merchantId', v: searches.merchantId, type: 'term', op: "and"});
            }
            //创建时间
            var searchCreateTime = false;
            var createTimeQueryItem = {n: 'createTime', type: 'range', op: "and"};
            if (searches.beginCreateTime && searches.beginCreateTime != "") {
                createTimeQueryItem.low = searches.beginCreateTime;
                searchCreateTime = true;
            }
            if (searches.endCreateTime && searches.endCreateTime != "") {
                createTimeQueryItem.high = searches.endCreateTime;
                searchCreateTime = true;
            }
            if (searchCreateTime) {
                searchQuery.push(createTimeQueryItem);
            }
            return searchQuery;
        },
        getQueryArgs: function (searchParams) {
            var qValues = f.getQuery(searchParams);
            return {
                mode: 'adv',
                q: qValues
            };
        }
    };
    return f;

})();