//#import Util.js

var OmsEsbLogQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "omsLog", type: 'term'});

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }

            //对接服务ID
            if (searches.serviceId) {
                searchQuery.push({n: 'serviceId', v: searches.serviceId, type: 'term', op: "and"});
            }

            //objectId可能是订单ID或其他的
            if (searches.objId) {
                searchQuery.push({n: 'objId', v: searches.objId, type: 'term', op: "and"});
            }

            //对接序列号
            if (searches.serialNumber) {
                searchQuery.push({n: 'serialNumber', v: searches.serialNumber, type: 'term', op: "and"});
            }

            //对接序列号
            if (searches.type) {
                searchQuery.push({n: 'type', v: searches.type, type: 'term', op: "and"});
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