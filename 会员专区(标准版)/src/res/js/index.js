/* Created by Qianglong Mo 2015 */


$(function(){
    $(".recentFavorite").on("click",".btnCancelFavor",function(){
        var self = $(this);
        $.post("/"+rappId+"/handler/favor_delete_handler.jsx",{type:"product",ids:self.attr("pid")},function(resp){
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
});