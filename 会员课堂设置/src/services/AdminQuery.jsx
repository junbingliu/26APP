//#import Util.js

var AdminQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "oleMemberClassSetting_admin", type: 'term'});

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            if (searches.userId && searches.userId != "") {
                searchQuery.push({n: 'userId', v: searches.userId, type: 'term', op: "and"});
            }
            if (searches.adminType && searches.adminType != "") {
                searchQuery.push({n: 'adminType', v: searches.adminType, type: 'term', op: "and"});
            }
            if (searches.merchantId && searches.merchantId != "") {
                searchQuery.push({n: 'merchantId', v: searches.merchantId, type: 'term', op: "and"});
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