$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_articleList.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    var search = function () {
        var articleTitle = $("#articleTitle").val();
        var merchantId = $("#merchantId").val();
        var searchArgs = {};
        searchArgs.m = merchantId;
        if (articleTitle != "") {
            searchArgs.articleTitle = articleTitle;
        }
        pagination.load(searchArgs);
    };
    search();
    $(".articleData").live("click",function(){
        var id = $(this).attr("data-a");
        $("#dataModal .modal-body div").html("");
        $.post("../handler/getlikeUsers.jsx",{id:id,code:"2"},function(res){
            $("#dataModal .modal-body div").append(res.articleData);
        },"json");
    });
    $("#search").bind("click",function () {
        search();
    });
});