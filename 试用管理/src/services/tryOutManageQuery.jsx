//#import Util.js

var tryOutManageQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "tryOut", type: 'term'});

            if (searches.id && searches.id != "") {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }

            if (searches.state && searches.state != "") {
                searchQuery.push({n: 'state', v: searches.state, type: 'text', op: "and"});
            }
            if (searches.createTime && searches.createTime != "") {
                searchQuery.push({n: 'createTime', v: searches.createTime, type: 'text', op: "and"});
            }
            if (searches.title_text) {
                searchQuery.push({n: 'title_text', v: searches.title_text, type: 'text', op: "and"});
            }
            if (searches.channel) {
                searchQuery.push({n: 'channel_multiValued', v: searches.channel, type: 'term', op: "and"});
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