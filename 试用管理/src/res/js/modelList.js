$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_reportModel.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load();
    $("#search").live("click",function () {
        pagination.load({columnIds:$("#columnId").val(),m:m});
    })
});
function newModel() {
    var self = this;
    self.columnIds = ko.observable("");
    self.statement1 = ko.observable("#一句话试用总结#");
    self.statement2 = ko.observable("收到时的心情");
    self.statement3 = ko.observable("");
    self.statement4 = ko.observable("和你用过的商品相比较");
    self.statement5 = ko.observable("自由发言...");
    $(".edit").live("click",function () {
        var id = $(this).attr("data-a");
        $("#modelId").val(id);
        $.post("../handler/getModel.jsx",{id:id,m:m},function (res) {
            self.columnIds(res.columnIds);
            self.statement1(res.statement1);
            self.statement2(res.statement2);
            self.statement3(res.statement3);
            self.statement4(res.statement4);
            self.statement5(res.statement5);
        },"json")
    });
    $(".deleteOne").live("click",function () {
        var id = $(this).attr("data-a");
        $.post("../handler/deleteModel.jsx",{id:id,m:m},function (res) {
            if(res.status == "ok"){
                bootbox.alert("删除成功");
                history.go(0);
            }
        },"json")
    });
    self.addModel = function () {
        var data= {
            id:$("#modelId").val(),
            columnIds: self.columnIds(),
            statement1 : self.statement1(),
            statement2 : self.statement2(),
            statement3: self.statement3(),
            statement4:self.statement4(),
            statement5:self.statement5(),
            m:m
        };
        if(!data.columnIds){
            bootbox.alert("商品分类id不能为空");
            return;
        }
        bootbox.confirm("是否保存", function (result) {
            if (result) {
                $.post("../handler/addReportModel.jsx",data,function (res) {
                    if(res.status == "ok"){
                        bootbox.alert("保存成功");
                        history.go(0);
                    }
                    if(res.status = "no"){
                        bootbox.alert("保存失败,有与其他模板相同的商品类别或者是商品类别不存在");
                    }
                },"json");
            }
        });
    }
}
var newModelPage = null;
$(document).ready(function () {
    newModelPage = new newModel();
    ko.applyBindings(newModelPage, document.getElementById("newModel"));
});