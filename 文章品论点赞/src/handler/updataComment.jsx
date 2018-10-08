//#import Util.js
//#import login.js
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    var pass = $.params["pass"] || "";
    var commentId = $.params["commentId"] || "";
    var replyComment = $.params["replyComment"] || "";
    var data = {"code": "", "msg": ""};
    var comment = commentLikeService.getById(commentId);
    var now = new Date();
    if (pass == "0") {
        if(comment.commentType == "0"){
            comment.commentType = "1";
        }else{
            comment.commentType = "0";
        }
        comment.approverId = LoginService.getBackEndLoginUserId();
        comment.approvalTime = now.getTime();
    }
    if(pass == "1"){
        if(!comment){
            data.code = "error";
            data.msg = "修改失败，没有评论";
            out.print(JSON.stringify(data));
        }
        comment.replyComment = replyComment;
        comment.replyTime = now.getTime();
    }
    if(pass == "2"){
        var data = {replyComment:comment.replyComment};
        out.print(JSON.stringify(data));
        return;
    }

    var result = commentLikeService.update(comment.id, comment);
    if (result) {
        data.code = "ok";
        data.msg = "修改成功";
    } else {
        data.code = "error";
        data.msg = "修改失败";
    }
    out.print(JSON.stringify(data));
})();