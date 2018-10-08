//#import Util.js

var commentQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "commentList", type: 'term'});
            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //用户
            if (searches.loginId) {
                searchQuery.push({n: 'loginId_text', v: searches.loginId, type: 'text', op: "and"});
            }
            if (searches.articleTitle) {
                searchQuery.push({n: 'articleTitle_text', v: searches.articleTitle, type: 'text', op: "and"});
            }
            if (searches.articleId) {
                searchQuery.push({n: 'articleId', v: searches.articleId, type: 'text', op: "and"});
            }
            if(searches.commentType){
                searchQuery.push({n: 'commentType', v: searches.commentType, type: 'text', op: "and"});
            }
            if(searches.likes){
                searchQuery.push({n: 'likes', v: searches.likes, type: 'term', op: "and"});
            }
            if(searches.createTime){
                searchQuery.push({n: 'createTime', v: searches.createTime, type: 'term', op: "and"});
            }
            if (searches.id) {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }
            return searchQuery;
        }
    };
    return f;

})();