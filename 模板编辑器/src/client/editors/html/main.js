(function HtmlEditor(e, configs) {
    var self = {};
    self.clicking = false;
    $("[data-type='html']", e).attr("contenteditable", "true");
    $("[data-type='html']", e).ckeditor({ allowedContent: true });

    $("[data-type='html']", e).on("click", function () {
        var bgcolor = $(this).attr("oldBgColor");
        $(this).css("background-color", bgcolor);
    });

    var mask = $("#mask", e);
    $("[data-type='html']", e).mouseenter(function () {
        if (self.clicking ) {
            self.clicking = false;
            return;
        }
        var offset = $(this).offset();
        var height = $(this).attr("data-height");
        if (!height) {
            height = $(this).height();
        }
        var width = $(this).attr("data-width");
        if (!width) {
            width = $(this).width();
        }

        mask.css({left: offset.left, top: offset.top, width: width, height: height});
        mask.show();
        var currentElem = $(this);
        mask.off("click");
        mask.click(function(){
            self.clicking  = true;
            mask.hide();
            currentElem.click();
            mask.off("click");
        });
    });
    mask.mouseleave(function () {
        mask.hide();
        mask.off("click");
    });

    $("[data-type='html']", e).on("blur", function () {
        var dataId = $(this).attr("data-id");
        var subType = $(this).attr("subType");
        var html = $(this).html();
        var param = {
            appId: configs.appId,
            pageId: configs.pageId,
            m:configs.m,
            subType:subType
        };
        param["dataId"] = dataId;
        param["dataValue"] = html;
        param['type'] = 'html';
        param["dataType"] = "string"; //还可以是string

        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            }
        }, "json");
    });

})($root, $configs);