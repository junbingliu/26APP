function HitAwardUserList(){
    var self=this;
    self.hitAwardUserList=ko.observableArray([]);
    self.getHitAwardUserList=function(lotteryId){
        $.post("../server/getHitAwardUserList.jsx",{lotteryId:lotteryId},function(data){
            if(data.state="ok"){
                ko.mapping.fromJS(data.hitAwardUserList, {},self.hitAwardUserList);
            }else{
                alert(data.msg);
            }
        },"json")
    }
    self.back=function(){
        $(".page").hide();
        $("#list").show();
    }
}

var hitAwardUserList = null;
$(document).ready(function(){
    hitAwardUserList = new HitAwardUserList();
    ko.applyBindings(hitAwardUserList,document.getElementById("hitAwardUserList"));
});

