//#import Util.js

var IDCardLibQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "IDCardLib", type: 'term'});

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //
            if (searches.state && searches.state != "") {
                searchQuery.push({n: 'state', v: searches.state, type: 'term', op: "and"});
            }
            //审核状态
            if (searches.certifyState && searches.certifyState != "") {
                searchQuery.push({n: 'certifyState', v: searches.certifyState, type: 'term', op: "and"});
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