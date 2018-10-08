//#import Util.js

var OleMemberClassQuery = (function () {
    var f = {
        getQuery: function getQuery(searches, bType) {
            if (typeof searches === "undefined") {
                return [];
            }
            if (typeof bType === "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            switch (bType) {
                case "activity":
                    searchQuery.push({n: 'ot', v: "memberClassActivityObj", type: 'term'});
                    if (searches.publishState && searches.publishState !== "") {
                        searchQuery.push({n: 'publishState', v: searches.publishState, type: 'text', op: "and"});
                    }
                    if (searches.auditState && searches.auditState !== "") {
                        searchQuery.push({n: 'auditState', v: searches.auditState, type: 'text', op: "and"});
                    }
                    if (searches.createUserId && searches.createUserId !== "") {
                        searchQuery.push({n: 'createUserId', v: searches.createUserId, type: 'text', op: "and"});
                    }
                    break;
                case "class":
                    searchQuery.push({n: 'ot', v: "memberClassObj", type: 'term'});
                    if (searches.activityId && searches.activityId !== "") {
                        searchQuery.push({n: 'activityId', v: searches.activityId, type: 'text', op: "and"});
                    }
            }
            //关键字
            if (searches.keyword && searches.keyword !== "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }


            return searchQuery;
        },
        getQueryArgs: function (searchParams, bType) {
            var qValues = f.getQuery(searchParams, bType);
            var queryArgs = {
                mode: 'adv',
                q: qValues
            };

            return JSON.stringify(queryArgs);
        }


    };
    return f;

})();