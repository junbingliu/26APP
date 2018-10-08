//#import Util.js
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    var resultList = commentLikeService.list(0, -1);
    for(var i =0; i < resultList.length; i++){
        if(resultList[i]){
        commentLikeService.delete(resultList[i].id);
        }
    }
    out.print("删除完了");
})();