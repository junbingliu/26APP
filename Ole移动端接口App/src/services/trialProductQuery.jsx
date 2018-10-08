//#import Util.js

var trialProductQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "ole_trial_product_ot_index", type: 'term'});
            //用户
            if (searches.id) {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }
            if(searches.activeId){
                searchQuery.push({n: 'activeId', v: searches.activeId, type: 'text', op: "and"});
            }
            if (searches.productId) {
                searchQuery.push({n: 'productId', v: searches.productId, type: 'text', op: "and"});
            }
            if (searches.userId) {
                searchQuery.push({n: 'userId', v: searches.userId, type: 'text', op: "and"});
            }
            if(searches.state){
                searchQuery.push({n: 'state', v: searches.state, type: 'text', op: "and"});
            }
            return searchQuery;
        }
    };
    return f;

})();