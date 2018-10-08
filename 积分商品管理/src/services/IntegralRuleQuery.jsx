//#import Util.js

var IntegralRuleQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "integralRule", type: 'term'});
            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //用户
            if (searches.loginId) {
                searchQuery.push({n: 'loginId', v: searches.loginId, type: 'term', op: "and"});
            }
            //真实姓名
            if (searches.realName) {
                searchQuery.push({n: 'realName', v: searches.realName, type: 'text', op: "and"});
            }
            //状态
            if (searches.type) {
                searchQuery.push({n: 'type', v: searches.type, type: 'term', op: "and"});
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
        getQueryArgs: function (searchParams) {
            var qValues = f.getQuery(searchParams);
            return {
                mode: 'adv',
                q: qValues
            };
        }
    };
    return f;

})();