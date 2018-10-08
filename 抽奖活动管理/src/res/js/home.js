//#import  addLottery.js
//#import  hitAwardUserList.js
function LotteryList(){
    var self=this;
    self.lotteryList=ko.observableArray([]);
    self.getLotteryList=function(merchantId){
        $.post("../server/getLotteryList.jsx",{merchantId:merchantId},function(data){
           if(data.state=="ok"){
               ko.mapping.fromJS(data.lotteryList, {},self.lotteryList);
           }
        },"json")
    };
    self.toAddLottery=function(){
        $(".page").hide();
        $("#addLottery").show();
        addLottery.init();
    };
    self.updateLottery=function(item){
        $(".page").hide();
        $("#addLottery").show();
        addLottery.init(ko.mapping.toJS(item));
    };
    self.toHitAwardUserList=function(item){
        $(".page").hide();
        hitAwardUserList.getHitAwardUserList(item.id());
        $("#hitAwardUserList").show();
    };
    self.delete=function(item){
        $.post("../server/deleteLottery.jsx",{merchantId:"head_merchant",lotteryId:item.id()},function(data){
            if(data.state!="ok"){
                alert("删除失败");
            }else{
                self.getLotteryList("head_merchant");
            }
        },"json")
    }
}

    var lotteryList = null;
    $(document).ready(function(){
        $('.form_datetime').datetimepicker({
            format: 'yyyy/mm/dd hh:ii:ss',
            language:  'zh-CN',
            weekStart: 1,
            todayBtn:  1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            showMeridian: 1,
            minuteStep:1
        });
        lotteryList = new LotteryList();
        lotteryList.getLotteryList("head_merchant");
        ko.applyBindings(lotteryList,document.getElementById("list"));
});

