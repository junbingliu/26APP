var userName =null;
$(function(){
    $.ajax({
        async: false,
        type : "POST",
        url : "/" + rappId +"/serverHandler/getUser.jsx",
        success : function(data) {
            userName = data;
        }
    });

    var loginMessage= $(".lgn_info").html();
   if(userName==null){
        return;
    }
    else{
       $(".lgn_info").html(loginMessage.replace("{userName}",userName));
    }

});