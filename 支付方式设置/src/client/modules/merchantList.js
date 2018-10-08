function Merchant(data){
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.inheritPlatform = data.inheritPlatform;
}

function MerchantListPage(data){
    var self = this;
    self.merchantList = ko.observableArray();
    self.keyword = ko.observable("");
    self.pager = new Pager();
    self.pager.displayNumber(10);
    self.pager.pageSize(20);
    self.getMerchants = function(start,limit,keyword){
        if(!keyword){
            keyword = self.keyword;
        }
        var postData = {
            keyword:keyword,
            start:start,
            limit:limit
        };
        $.post("server/getMerchants.jsx",postData,function(ret){
            if(ret.state == 'ok'){
                self.merchantList($.map(ret.merchants,function(mer){
                    return new Merchant(mer);
                }));
                self.pager.total(ret.total);
                self.pager.setStart(start);
            }
        },"json");
    }

    self.refresh = function(){
        self.getMerchants(0,self.pager.pageSize(), self.keyword);
    };
    self.pager.callback = self.getMerchants;
    self.edit = function(merchant){
        editSettingPage.setMerchant(merchant);
        window.location.href="#/editSetting"
    };
    self.editPayments = function(merchant){
        if(merchant.inheritPlatform){
            window.open("/OurHome/modules/payment/PaymentList.jsp?merchantId=head_merchant&columnId=col_m_payment","_blank");
        }
        else{
            window.open("/OurHome/modules/payment/PaymentList.jsp?merchantId="+ merchant.id + "&columnId=col_m_payment","_blank");
        }
    }
}
var merchantListPage = null;
$(document).ready(function(){
    merchantListPage = new MerchantListPage();
    merchantListPage.getMerchants(0,merchantListPage.pager.pageSize());
    ko.applyBindings(merchantListPage,document.getElementById("merchantListPage"));
});
