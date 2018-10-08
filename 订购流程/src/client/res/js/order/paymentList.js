/**
 * Created with IntelliJ IDEA.
 * User: zgr
 * Date: 14-1-21
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */
function PaymentList(){
    var self=this;
    self.paymentList=ko.observableArray();
    self.currPayment=null;
    self.orderId=ko.observable();
    self.merchantId=ko.observable();
    self.showDialog=ko.observable(false);
    self.payment=function(param){
        this.name=ko.observable(param.name);
        this.id=ko.observable(param.id);
        this.payEntryUrl=ko.observable(param.payEntryUrl);
        this.selected=ko.observable(false);
    };
    self.back=function(){
        history.go(-1);
    };
    self.getPayMethod=function(merchantId){
        $.post(AppConfig.url+"/phone_page/payment/onlinePaymentList.jsp",{merchantId : merchantId},
            function(result){
                self.paymentList.removeAll();
                for(var i=0;i<result.length;i++){
                    var param={};
                    param.name=result[i].payInterfaceName;
                    param.id=result[i].id;
                    param.payEntryUrl=result[i].payEntryUrl;
                    var payment=new self.payment(param);
                    self.paymentList.push(payment);
                }
            },"json");
    };
    self.selectPayment=function(item){
        if(self.currPayment){
            self.currPayment.selected(false);
        }
        self.currPayment=item;
        item.selected(true);
    };
    self.browser={

        versions:function(){
            var u = navigator.userAgent, app = navigator.appVersion;

            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), //是否为移动终端
                ios: !!u.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language:(navigator.browserLanguage || navigator.language).toLowerCase()
    }
    self.toPay=function(){
        var url=self.currPayment.payEntryUrl()+"?paymentId="+self.currPayment.id()+"&&id="+self.orderId();
        self.showDialog(true);
        if(self.currPayment.name()=="手机支付宝"){
//            window.open(url, '_blank', 'location=yes');
            aliPay.url(url);
            aliPay.merchantId(self.merchantId());
            aliPay.orderId(self.orderId());

            window.location.href="#/aliPay";
        }else{
            if(AppConfig.isWeb){
                document.location = url;
                 if(self.browser.versions.iPhone||self.browser.versions.iPad||self.browser.versions.ios){
                      var downloadUrl='http://mobile.unionpay.com/getclient?platform=ios&type=securepayplugin';
                 }else{
                     var downloadUrl='http://mobile.unionpay.com/getclient?platform=android&type=securepayplugin';
                 }
                setTimeout(function(){
                    if(confirm('请先确保已经安装银联支付插件')){
                        window.open(downloadUrl, '_system', 'location=yes');
                    }
                }, 300);

            }else{
                var successCallback=function(ret){
                    if(ret=="success"){
                        alert("支付成功!");
                        orderDetail.back=function(){
                            window.location.href="#/homePage";
                            orderDetail.back=function(){
                                history.go(-1);
                            }
                        }
                        self.toOrderDetail();
                    }else if(ret=="cancel"){
                        alert("支付被取消!");
                    }else if(ret=="fail"){
                        alert("支付失败,请联系管理员!");
                    }

                }
                cordova.exec(successCallback,null, "Upmp", "startPay", [url,"00"]);
            }

        }

    };
    self.closeDialog=function(){
        self.showDialog(false);
    };
    self.toOrderDetail=function(){
        self.showDialog(false);
        window.location.href="#/orderDetail/"+self.orderId()+"";
    }

};
var paymentList = null;
$(document).ready(function(){
    paymentList = new PaymentList();
    ko.applyBindings(paymentList,document.getElementById("paymentListPage"));
});