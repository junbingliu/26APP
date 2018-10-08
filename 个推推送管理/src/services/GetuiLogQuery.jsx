//#import Util.js

var GetuiLogQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "getui_log", type: 'term'});

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }

            //objectId可能是订单ID或其他的
            if (searches.objId) {
                searchQuery.push({n: 'objId', v: searches.objId, type: 'term', op: "and"});
            }

            //日志类型
            if (searches.type) {
                searchQuery.push({n: 'type', v: searches.type, type: 'term', op: "and"});
            }
            //是否成功
            if (searches.isSuccess) {
                searchQuery.push({n: 'isSuccess', v: searches.isSuccess, type: 'term', op: "and"});
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
        getQueryArgs : function(searchParams) {
            var qValues = f.getQuery(searchParams);
            var queryArgs = {
                mode: 'adv',
                q: qValues
            };

            return JSON.stringify(queryArgs);
        }
    };
    return f;

})();