function activeEdit() {
    var own = this;
    own.title = ko.observable("");
    own.beginTime = ko.observable("");
    own.endTime = ko.observable("");
    own.introduction = ko.observable("");
    own.description =  ko.observable("");//活动说明
    own.headImage = ko.observable("");
    self.stateList = ko.observableArray([
        { name: "已发布", id: "1" },
        { name: "已下架", id: "2" }
    ]);
    own.state = ko.observable("2");
    own.getInfo = function () {
        var data = {
            activeId:$("#activeId").val(),
            m:m
        };
        if(data.activeId){
            $.post("../handler/getInfo.jsx",data,function (res) {
                own.title(res.title);
                own.state(res.state);
                own.beginTime(res.beginTime);
                own.endTime(res.endTime);
                own.introduction (res.introduction);
                own.description(res.description);
                own.headImage(res.headImage);
            },"json")
        }
    };
    own.getInfo();
    own.saveActive = function () {
        var data = {
            id:$("#activeId").val(),
            title:own.title(),
            beginTime:own.beginTime(),
            endTime:own.endTime(),
            headImage:own.headImage(),
            introduction:own.introduction(),
            description:own.description(),
            state :own.state(),
            m:m
        };
        bootbox.confirm("是否保存", function (result) {
            if (result) {
                $.post("../handler/addActive.jsx",data,function (res) {
                    if(res.state == "ok"){
                        bootbox.alert("保存成功");
                        history.go(0);
                    }
                },"json");
            }
        });
    };

    own.activeImage = function () {
        photoGallery.openSelectImgView(function (selectedItems) {
            own.headImage(selectedItems.imgUrl());
        })
    };
}
    var activeEditPage = null;
$(document).ready(function () {
    activeEditPage = new activeEdit();
    ko.applyBindings(activeEditPage, document.getElementById("reportEdit"));
});