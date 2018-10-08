function ReadCertificate(oc) {
    var self = this;
    var cardReader;
    self.oc = oc;
    self.cardNo = ko.observable();
    self.sexL = ko.observable();
    self.nameL = ko.observable();
    self.police = ko.observable();
    self.nationL = ko.observable();
    self.bornL = ko.observable();
    self.activityL = ko.observable();
    self.address = ko.observable();
    self.isInit = false;

    self.readCard = function () {
        cardReader = document.getElementById("CardReader1");
        if(!cardReader){
            if ($.layer) {
                layer.alert("身份证读取控件加载失败，请联系管理员!");
             } else {
                confirmDialog.show("身份证读取控件加载失败，请联系管理员!", function () {});
             }
        }
        if (false == self.isInit) {
            //设置端口号，1表示串口1，2表示串口2，依此类推；1001表示USB。0表示自动选择
            cardReader.setPortNum(0);
            self.isInit = true;
        }
        //使用重复读卡功能
        cardReader.Flag = 0;

        //读卡
        var rst = cardReader.ReadCard();
        //获取各项信息
        if (0x90 == rst) {
            self.sexL(cardReader.SexL());
            self.cardNo(cardReader.CardNo());
            self.nameL(cardReader.NameL());
            self.police(cardReader.Police());
            self.nationL(cardReader.NationL());
            self.address(cardReader.Address());
            self.activityL(cardReader.ActivityL());
            self.bornL(cardReader.BornL());
            if(self.oc){
                self.oc.receiveUserName(self.nameL());
                self.oc.certificate(self.cardNo());
                self.oc.saveUserName();
            }
        }else{
            self.sexL("");
            self.cardNo("");
            self.nameL("");
            self.police("");
            self.nationL("");
            self.address("");
            self.activityL("");
            self.bornL("");
            self.getState();
        }
    };
    self.getState = function(){
        if(!cardReader){
            cardReader = document.getElementById("CardReader1");
        }
        cardReader.GetState()
    }
}