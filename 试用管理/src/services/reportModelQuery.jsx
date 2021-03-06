//#import Util.js

var reportModelQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "reportModel", type: 'term'});

            if (searches.id && searches.id != "") {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }

            if (searches.columnIds && searches.columnIds != "") {
                searchQuery.push({n: 'columnIds', v: searches.columnIds, type: 'text', op: "and"});
            }
            if (searches.createTime && searches.createTime != "") {
                searchQuery.push({n: 'createTime', v: searches.createTime, type: 'term', op: "and"});
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