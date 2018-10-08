//#import Util.js

var tryOutProductQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "tryOutProduct", type: 'term'});

            if (searches.id && searches.id != "") {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }

            if (searches.state && searches.state != "") {
                searchQuery.push({n: 'state', v: searches.state, type: 'text', op: "and"});
            }
            if (searches.activeId) {
                searchQuery.push({n: 'activeId', v: searches.activeId, type: 'text', op: "and"});
            }
            if(searches.priority && searches.priority != ""){
                searchQuery.push({n:'priority',v:searches.priority,type:'term',op:"and"})
            }
            if(searches.hasReport && searches.hasReport != ""){
                searchQuery.push({n:'hasReport',v:searches.hasReport,type:'term',op:"and"})
            }
            if(searches.createTime && searches.createTime != ""){
                searchQuery.push({n:'createTime',v:searches.createTime,type:'term',op:"and"})
            }
            if(searches.productId && searches.productId != ""){
                searchQuery.push({n:'productId',v:searches.productId,type:'term',op:"and"})
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