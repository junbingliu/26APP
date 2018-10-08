/* Created by Qianglong Mo 2015 */

$(function (){
    //$('#myFavoriteSelectAll').click(function (){
    //    var curObj = $(this);
    //    if (curObj.attr('data-checked') == 'true') {
    //        //curObj.attr("data-checked","false").removeClass('active');
    //        $('.myFavoriteTable .checkbox').attr('data-checked', false).removeClass('active');
    //    } else {
    //        //curObj.attr("data-checked","true").addClass('active');
    //        $('.myFavoriteTable .checkbox').attr('data-checked', true).addClass('active');
    //    }
    //});
    //
    //$('.myFavoriteTable .checkbox').click(function (){
    //    //if($('.myFavoriteTable .checkbox[data-checked="true"]').length == $('.myFavoriteTable .checkbox').length){
    //    //    $('#myFavoriteSelectAll').attr('data-checked', true).addClass('active');
    //    //} else {
    //    //    $('#myFavoriteSelectAll').attr('data-checked', false).removeClass('active');
    //    //}
    //});

    var checkboxList = $(".myFavorite .checkbox");
    //checkboxList.unbind("click")
    checkboxList.on("click",function(){
        var curObj = $(this);
        var checked = curObj.attr("data-checked") == "true" ? "false" : "true";
        curObj.attr("data-checked",checked);
        if(checked == "true"){
            curObj.addClass("active");
        }else{
            curObj.removeClass("active");
        }
        if(curObj.is("#myFavoriteSelectAll")){
            if (curObj.attr("data-checked") == 'true') {
                $('.myFavoriteTable .checkbox').attr('data-checked', "true").addClass('active');
            } else {
                $('.myFavoriteTable .checkbox').attr('data-checked', "false").removeClass('active');
            }
        }else{
            if($('.myFavoriteTable .checkbox[data-checked="true"]').length == $('.myFavoriteTable .checkbox').length){
                $('#myFavoriteSelectAll').attr('data-checked', true).addClass('active');
            } else {
                $('#myFavoriteSelectAll').attr('data-checked', false).removeClass('active');
            }
        }
    });

    $(".myFavoriteTable").on("click",".btnCancel",function(){
        var self = $(this);
        $.post("/"+rappId+"/handler/favor_delete_handler.jsx",{type:"product",ids:self.attr("pid"),token:token},function(resp){
            if(resp.state){
                document.location.reload();
            }else{
                alert(resp.errorCode);
            }
        },"json");
    }).on("click",".btnAddCart",function(){
        var self = $(this);
        window.open(self.attr("src"));
    });

    $("#cancelAll").on("click",function(){
        var self = $(this);
        var checkedList = $('.myFavoriteTable .checkbox[data-checked="true"]');
        if(checkedList.length == 0){
            alert("请选择要取消收藏的商品");
            return;
        }
        var ids = "";
        checkedList.each(function(index,data){
            ids += $(this).find("input:hidden").val() + ",";
        });
        $.post("/"+rappId+"/handler/favor_delete_handler.jsx",{type:"product",ids:ids,token:token},function(resp){
            if(resp.state){
                document.location.reload();
            }else{
                alert(resp.errorCode);
            }
        },"json");
    });



});