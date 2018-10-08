//#import Util.js

var likeQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "likeList2", type: 'term'});

            //点赞用户
            if (searches.loginId && searches.loginId != "") {
                searchQuery.push({n: 'loginId', v: searches.loginId, type: 'text', op: "and"});
            }
            if (searches.type && searches.type != "") {
                searchQuery.push({n: 'type', v: searches.type, type: 'text', op: "and"});
            }
            if (searches.articleTitle && searches.articleTitle != "") {
                searchQuery.push({n: 'articleTitle', v: searches.articleTitle, type: 'text', op: "and"});
            }
            if (searches.articleId && searches.articleId != "") {
                searchQuery.push({n: 'articleId', v: searches.articleId, type: 'text', op: "and"});
            }
            if (searches.likes && searches.likes != "") {
                searchQuery.push({n: 'likes', v: searches.likes, type: 'term', op: "and"});
            }
            if (searches.createTime && searches.createTime != "") {
                searchQuery.push({n: 'createTime', v: searches.createTime, type: 'term', op: "and"});
            }
            //所在文章
            if (searches.formName) {
                searchQuery.push({n: 'formName', v: searches.formName, type: 'text', op: "and"});
            }
            //id
            if (searches.id) {
                searchQuery.push({n: 'id', v: searches.id, type: 'term', op: "and"});
            }
            return searchQuery;
        }
    };
    return f;

})();