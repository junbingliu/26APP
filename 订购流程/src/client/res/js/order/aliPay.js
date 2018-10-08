/**
 * Created with IntelliJ IDEA.
 * User: zgr
 * Date: 14-1-21
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */
function AliPay(){
    var self=this;
    self.url=ko.observable();
    self.orderId=ko.observable();
    self.merchantId=ko.observable();
    self.showMessage=ko.observable(true);
    self.cancel=function(){
       self.url("");
       window.location.href="#/paymentList/"+self.orderId()+"/"+self.merchantId();
    };
};
var aliPay = null;
$(document).ready(function(){
    aliPay = new AliPay();
    ko.applyBindings(aliPay,document.getElementById("aliPayPage"));

    function iFrameHeight() {
        var ifm= document.getElementById("iframepage");
        var subWeb = document.frames ? document.frames["iframepage"].document : ifm.contentDocument;
        if(ifm != null && subWeb != null) {
            ifm.height = subWeb.body.scrollHeight;
        }

    }
    $("#iframepage").load(function(){
        var curUrl=this.contentWindow.location.href;
        if(curUrl.indexOf("alipayMobileReturn")>-1){
           paymentList.toOrderDetail();
            orderDetail.back=function(){
                window.location.href="#/homePage";
                orderDetail.back=function(){
                    history.go(-1);
                }
            }
            paymentList.showDialog(false);
        }
        window.scrollTo(0, 0);
        aliPay.showMessage(false);
    });
});