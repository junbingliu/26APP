//#import Util.js
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    var list = commentLikeService.list(0,-1);
    for(var i = 0; i < list.length; i++){
        commentLikeService.buildIndex(list[i].id);
    }
    out.print(JSON.stringify(list));
})();