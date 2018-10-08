function InvoiceChooser(){
    var self = this;
    self.invoiceList = ko.observableArray();
    self.selectedInvoiceId =ko.observable();
    self.currentInvoice = ko.observable();
    self.editFormVisible = ko.observable(false);
    self.invoiceType = ko.observable();
    self.buyerId = null;
    self.callback = null;

    self.selectedInvoiceId.subscribe(function(newValue){
        if(newValue=='newInvoice'){
            self.newInvoice();
        }
        else if(newValue=='none'){
            self.setCurrentInvoice(new Invoice({id:'none',title:'无需发票'}));
        }
        else {
            $.each(self.invoiceList(), function (index, elem) {
                if (elem.id() == newValue) {
                    self.setCurrentInvoice(elem);
                }
            });
        }
    });


    self.getInvoiceList = function (){
        var postData = {buyerId:self.buyerId};
        $.post(AppConfig.url+AppConfig.getInvoiceListUrl,postData,function(ret){
            if(ret.state!='ok'){
                layer.alert("出错了:" + ret.msg);
                return;
            }
            self.invoiceList($.map(ret.list,function(invoice){
                return new Invoice(invoice);
            }));
        },"json");
    };

    self.getSelectedInvoice = function(){
        var result = null;
        $.each(self.invoiceList(),function(idx,invoice){
            if(invoice.id()==self.selectedInvoiceId()){
                result = invoice;
            }
        });
        return result;
    };

    self.select = function(invoice){
        self.selectedInvoiceId(invoice.id());
    };

    self.newInvoice = function(){
        _.delay(function(){
            var newInvoice = new Invoice({invoiceTitle:" "});
            self.setCurrentInvoice(newInvoice);
            self.editFormVisible(true);
        });

    };


    self.editInvoice = function(invoice){
        if(!self.editFormVisible()){
            self.editFormVisible(true);
        }
        self.select(invoice);
        self.setCurrentInvoice(invoice);
    };
    self.setCurrentInvoice = function(invoice){
        self.currentInvoice(invoice);
    };
    self.deleteInvoice = function(invoice){
        self.invoiceList.remove(invoice);
        $.post(AppConfig.url+AppConfig.deleteInvoiceUrl,{buyerId:self.buyerId,id:invoice.id()},function(ret){
            if(ret.state!='ok'){
                layer.alert("出错了。");
            }

        },"JSON")
    };
    self.deleteSelected = function(){
        self.invoiceList.remove(function(invoice) {
            return invoice.id() == self.selectedInvoiceId();
        });
        $.post(AppConfig.url+AppConfig.deleteInvoiceUrl,{buyerId:self.buyerId,id:self.selectedInvoiceId()},function(ret){
            if(ret.state!='ok'){
                confirmDialog.show("出错了！");
            }
            self.selectedInvoiceId("none")
        },"JSON")
    };

    self.confirmSelection = function(){
        var invoice = self.getSelectedInvoice();
        if(!invoice){
            layer.alert("请先选择一个发票选项。");
            return;
        }
        var postData = {
            buyerId:self.buyerId,
            invoiceId:invoice.id()
        };

        $.post(AppConfig.url+AppConfig.setDefaultInvoiceUrl,postData,function(ret){
            if(ret.state=='ok'){
                if(self.callback){
                    self.callback(invoice);
                }
            }
        },"json");
    };

    self.saveData = function(){
        var invoice = self.currentInvoice();
        if(!invoice.invoiceTitle() || invoice.invoiceTitle().length==0){
            confirmDialog.show("请输入发票抬头。");
            return;
        }

        if(invoice.invoiceTitle().length > 50){
            confirmDialog.show("发票抬头不能超过50个字。");
            return;
        }

        var postData = {
            buyerId:self.buyerId,
            id:invoice.id(),
            invoiceTitle:invoice.invoiceTitle(),
            invoiceContent:invoice.invoiceContent(),
            invoiceTypeKey:invoice.invoiceTypeKey(),
            invoicePostAddress:invoice.invoicePostAddress()
        };

        $.post(AppConfig.url+AppConfig.saveInvoiceUrl,postData,function(ret){
            if(ret.state=='ok'){
                if(self.callback){
                    self.editFormVisible(false);
                    self.callback();
                }
                else{
                    self.getInvoiceList();
                    self.hideEditForm();
                }
            }
            else{
                layer.alert("保存错误："+ret.msg);
            }
        },"json");
    };
    self.cancelEdit = function(){
        self.editFormVisible(false);
        self.getInvoiceList();
    }
}