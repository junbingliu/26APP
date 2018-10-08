//#import Util.js

var LotteryLogQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "lotteryLog", type: 'term'});

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }


            //根据用户id查询
            if (searches.userId && searches.userId!="") {
                searchQuery.push({n: 'userId', v: searches.userId, type: 'text', op: "and"});
            }
            //根据活动id查询
            if (searches.eventId && searches.eventId!="") {
                searchQuery.push({n: 'eventId', v: searches.eventId, type: 'text', op: "and"});
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