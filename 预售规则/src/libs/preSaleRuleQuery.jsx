//#import Util.js

var PreSaleRuleQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "preSaleRule", type: 'term'});
            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //商家ID
            if (searches.mid) {
                searchQuery.push({n: 'mid', v: searches.mid, type: 'term', op: "and"});
            }
            //名称
            if (searches.name) {
                searchQuery.push({n: 'name', v: searches.name, type: 'text', op: "and"});
            }
            //备注
            if (searches.desc) {
                searchQuery.push({n: 'desc', v: searches.desc, type: 'text', op: "and"});
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
            if (searches.state) {
                searchQuery.push({n: 'state', v: searches.state, type: 'term', op: "and"});
            }
            if (searches.channel) {
                searchQuery.push({n: 'channel_multiValued', v: searches.channel, type: 'term', op: "and"});
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
        }
    };
    return f;

})();