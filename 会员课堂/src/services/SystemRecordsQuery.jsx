//#import Util.js

var SystemRecordsQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "SystemRecordsManagement", type: 'term'});

            // //关键字搜索
            // if (searches.keyword && searches.keyword != "") {
            //     searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            // }
            //一般性搜索
            // id
            if (searches.id && searches.id != "") {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }
            if (searches.backEndLoginId && searches.backEndLoginId != "") {
                searchQuery.push({n: 'backEndLoginId', v: searches.backEndLoginId, type: 'text', op: "and"});
            }
            if (searches.pushManagementId && searches.pushManagementId != "") {
                searchQuery.push({n: 'pushManagementId', v: searches.pushManagementId, type: 'text', op: "and"});
            }
            if (searches.project && searches.project != "") {
                searchQuery.push({n: 'project', v: searches.project, type: 'text', op: "and"});
            }
            //创建时间
            var searchCreateTime = false;
            var createTimeQueryItem = {n: 'operationTime', type: 'range', op: "and"};
            if (searches.beginTime && searches.beginTime != "") {
                createTimeQueryItem.low = searches.beginTime;
                searchCreateTime = true;
            }
            if (searches.endTime && searches.endTime != "") {
                createTimeQueryItem.high = searches.endTime;
                searchCreateTime = true;
            }
            if (searchCreateTime) {
                searchQuery.push(createTimeQueryItem);
            }
            return searchQuery;
        },
        getQueryArgs: function (searchParams) {
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