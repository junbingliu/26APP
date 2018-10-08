$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_CLList.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    var search = function () {
        var articleId = $("#articleId").val();
        var loginId = $("#loginId").val();
        var merchantId = $("#merchantId").val();
        var searchArgs = {};
        searchArgs.m = merchantId;
        if (loginId != "") {
            searchArgs.loginId = loginId;
        }
            searchArgs.articleId = articleId;
        pagination.load(searchArgs);
    };
    search();
    $("#search").bind("click",function(){
       search();
    });
    $(".pass").live("click",function () {
        if (!confirm("确定要改变这条评论的审核吗？")) {
            return;
        }
        var id = $(this).attr("data-a");
        var data = {pass:"0",commentId:id};
        $.post("../handler/updataComment.jsx",data,function (res) {
            if(res.code == "ok"){
                alert(res.msg);
                search();
            }else{
                alert(res.msg);
            }
        },"json");
    });

    $(".reply").live("click",function () {
        var id = $(this).attr("data-a");
        var data = {pass:"2",commentId:id};
        $.post("../handler/updataComment.jsx",data,function (res) {
            $("#comments").val(res.replyComment);
            $("#repyComId").val(id) ;
        },"json")
    })
    $(".saveReply").live("click",function () {
        var id = $("#repyComId").val();
        var replyComment = $("#comments").val();
        var data = {pass:"1",commentId:id,replyComment:replyComment};
        $.post("../handler/updataComment.jsx",data,function (res) {
            if(res.code == "ok"){
                alert(res.msg);
                search();
            }else{
                alert(res.msg);
            }
        },"json")
    });
    $(".showZan").live("click",function(){
        var id = $(this).attr("data-a");
        $("#likeModal .modal-body table tbody").html("");
        var html = "";
        $.post("../handler/getlikeUsers.jsx",{id:id,code:"0"},function(res){
            var logins = res.logins;
            if(logins.length > 0){
                var length = 0;
                if(logins.length >100){
                    length = 100;
                }else{
                    length = logins.length
                }
                for(var i =length; i > 0; i--){
                    html += "<tr>"
                        +"<td>"+logins[i-1].loginId+"</td>"
                        +"<td>"+logins[i-1].createTime+"</td>"
                        +"</tr>";
                }
                $("#likeModal .modal-body table tbody").append(html);
            }
        },"json");
    });
    $(".articleData").live("click",function(){
        var id = $(this).attr("data-a");
        $("#dataModal .modal-body div").html("");
        $.post("../handler/getlikeUsers.jsx",{id:id,code:"2"},function(res){
            $("#dataModal .modal-body div").append(res.articleData);
        },"json");
    });
});