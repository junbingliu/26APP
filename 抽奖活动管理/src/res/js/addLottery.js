//奖品model
function Award(params) {
    this.id = ko.observable(params.id || "");
    this.name = ko.observable(params.name || "");
    this.cardBatches = ko.observable(params.cardBatches || "");
    this.amount = ko.observable(params.amount || 1);  //一次中奖的奖品送的数量  若为券，是送券的数量   若为积分，这值是要设送的积分值。
    this.type = ko.observable(params.type || "card");  //card:送券，point:积分，other:其它奖品，time：抽奖机会，none：无中奖,userGroup：会员组特权
    this.typeName = ko.observable(params.typeName || "未知");  //card:送券，point:积分，other:其它奖品，time：抽奖机会，none：无奖,userGroup：会员组特权
    this.description = ko.observable(params.description || "");
    this.hitPercent = ko.observable(params.hitPercent || "");  //计算中奖率的数量
    this.prizeAmount = ko.observable(params.prizeAmount || ""); //奖项总数量
    this.userGroupId = ko.observable(params.userGroupId || ""); //会员组ID
    this.imgLink = ko.observable(params.imgLink || ""); //奖品图片的连接
    this.awardLink = ko.observable(params.awardLink || ""); //奖品连接，可能是商品的连接或者配置一个活动页
}

function AddLottery() {
    var self = this;
    self.id = ko.observable();
    self.name = ko.observable(); //活动名称
    self.startTime = ko.observable(); //活动开始时间
    self.amount = ko.observable(30000); //预计总人数
    self.hitAwardCount = ko.observable(); //每天抽奖次数
    self.hitAwardIntegral = ko.observable(); //每天抽奖次数
    self.endTime = ko.observable(); //活动结束时间
    self.awards = ko.observableArray([]);    //奖品列表
    self.explains = ko.observableArray([]);  //抽奖说明
    self.explain = ko.observable();
    self.type = ko.observable("card");  //card:送券    point:积分  other:其它
    self.typeName = ko.observable();
    self.ruleType = ko.observable("ManyTimesLotteryRule"); //NormalLotteryRule 每天一次  ManyTimesLotteryRule 每天多次
    self.TypeNames = {
        card: "送券",
        point: "积分",
        other: "其它奖品",
        time: "抽奖机会",
        none: "无奖",
        userGroup: "会员组特权"
    };
    self.groupId1 = ko.observable();
    self.groupId2 = ko.observable();
    self.groupId3 = ko.observable();
    self.groupId4 = ko.observable();
    self.groupId5 = ko.observable();
    self.amount1 = ko.observable();
    self.amount2 = ko.observable();
    self.amount3 = ko.observable();
    self.amount4 = ko.observable();
    self.amount5 = ko.observable();

    self.updateName = function () {
        for (var i = 0; i < self.awards().length; i++) {
            var idNum = 1001 + i;    //1001 为自定义
            self.awards()[i].id("award_" + idNum);
        }
    };
    self.init = function (lottery) {
        if (lottery) {
            self.id(lottery.id); //活动名称
            self.name(lottery.name); //活动名称
            self.amount(lottery.amount || 3000); //预计总人数
            self.ruleType(lottery.ruleType || "NormalLotteryRule");
            self.hitAwardCount(lottery.hitAwardCount || 1);
            self.hitAwardIntegral(lottery.hitAwardIntegral || "");
            self.startTime(lottery.beginTime); //活动开始时间
            self.endTime(lottery.endTime); //活动结束时间
            self.awards.removeAll();
            for (var i = 0; i < lottery.awards.length; i++) {
                var tempAward = lottery.awards[i];
                var award = new Award(tempAward);
                var typeName = self.TypeNames[tempAward.type];
                if (!typeName) {
                    typeName = "未知";
                }
                award.typeName = typeName;
                self.awards.push(award);
                if (i == 0) {
                    self.type(tempAward.type);
                }
            }
            self.explains(lottery.explains);  //抽奖说明
            self.groupId1(lottery.groupId1 || "");
            self.groupId2(lottery.groupId2 || "");
            self.groupId3(lottery.groupId3 || "");
            self.groupId4(lottery.groupId4 || "");
            self.groupId5(lottery.groupId5 || "");
            self.amount1(lottery.amount1 || "");
            self.amount2(lottery.amount2 || "");
            self.amount3(lottery.amount3 || "");
            self.amount4(lottery.amount4 || "");
            self.amount5(lottery.amount5 || "");
        } else {
            self.id("");
            self.name(""); //活动名称
            self.amount(3000); //预计总人数
            self.hitAwardCount(1);
            self.hitAwardIntegral("");
            self.startTime(""); //活动开始时间
            self.endTime(""); //活动结束时间
            self.awards([]);    //奖品列表
            self.explains([]);  //抽奖说明
            self.groupId1("");
            self.groupId2("");
            self.groupId3("");
            self.groupId4("");
            self.groupId5("");
            self.amount1("");
            self.amount2("");
            self.amount3("");
            self.amount4("");
            self.amount5("");
        }
    };

    self.back = function () {
        $(".page").hide();
        $("#list").show();
    };

    self.isLotteryQualificationRule = ko.computed(function () {
        if(self.ruleType() == "LotteryQualificationRule"){
            return true;
        }
        return false;
    });

    self.addAward = function () {
        var total = self.amount();
        if (!total || total == 0) {
            alert("请填写预计参与人数");
            return;
        }
        var index = self.awards().length;
        if (index > 19) {
            alert("最多只能添加20个奖项");
            return;
        }
        var idNum = 1001 + index;    //1001 为自定义
        var param = {
            type: self.type(),
            id: ("award_" + idNum)
        };
        var typeName = self.TypeNames[self.type()];
        if (!typeName) {
            typeName = "未知";
        }
        param.typeName = typeName;
        var award = new Award(param);
        self.awards.push(award);
    };
    self.deleteAward = function (item) {
        self.awards.remove(item);
        self.updateName();
    };
    self.deleteExplain = function (item) {
        self.explains.remove(item);
    };

    self.addExplain = function () {
        if (self.explain()) {
            self.explains.push({content: self.explain()});
            self.explain("");
        } else {
            alert("请输入说明内容");
        }
    };

    self.checkForm = function () {
        if (!self.name()) {
            alert("抽奖名字不能空");
            return false;
        } else if (!self.startTime()) {
            alert("活动开始时间不能空");
            return false
        } else if (!self.endTime()) {
            alert("活动结束时间不能空");
            return false
        } else if (self.awards().length == 0) {
            alert("奖项不能空");
            return false
        }
        return true;
    };

    self.save = function () {
        var check = self.checkForm();
        if (!check) {
            return;
        }

        var jLottery = {};
        jLottery.id = self.id();
        jLottery.name = self.name();
        jLottery.description = self.name();
        jLottery.amount = self.amount();
        jLottery.ruleType = self.ruleType();
        jLottery.hitAwardCount = self.hitAwardCount();
        jLottery.hitAwardIntegral = self.hitAwardIntegral();
        jLottery.beginTime = new Date(self.startTime());
        jLottery.endTime = new Date(self.endTime());
        jLottery.awards = ko.mapping.toJS(self.awards);
        jLottery.explains = ko.mapping.toJS(self.explains);

        if(jLottery.ruleType == "LotteryQualificationRule"){
            jLottery.groupId1 = self.groupId1();
            jLottery.groupId2 = self.groupId2();
            jLottery.groupId3 = self.groupId3();
            jLottery.groupId4 = self.groupId4();
            jLottery.groupId5 = self.groupId5();
            jLottery.amount1 = self.amount1();
            jLottery.amount2 = self.amount2();
            jLottery.amount3 = self.amount3();
            jLottery.amount4 = self.amount4();
            jLottery.amount5 = self.amount5();
        } else {
            jLottery.groupId1 = "";
            jLottery.groupId2 = "";
            jLottery.groupId3 = "";
            jLottery.groupId4 = "";
            jLottery.groupId5 = "";
            jLottery.amount1 = "";
            jLottery.amount2 = "";
            jLottery.amount3 = "";
            jLottery.amount4 = "";
            jLottery.amount5 = "";
        }


        $.post("../server/addLottery.jsx", {merchantId: "head_merchant",lottery: JSON.stringify(jLottery)}, function (data) {
            if (data.state != "ok") {
                alert("保存失败:");
            } else {
                self.back();
                lotteryList.getLotteryList("head_merchant");
            }
        }, "json");
    }

}

var addLottery = null;
$(document).ready(function () {
    addLottery = new AddLottery();
    ko.applyBindings(addLottery, document.getElementById("addLottery"));
});

