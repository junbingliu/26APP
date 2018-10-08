var globalSetMerchantId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record_hen.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});

    var $body = $("body");
    var $record_list = $("#record_list");
    $record_list.on('click', ".doUpdateState", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");

        $('#doUpdateStateModal').modal('show');
    });

    $body.on('click', "#cancelStateBtn", function () {
        $('#doUpdateStateModal').modal('hide');
    });

    $body.on('click', "#search", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        searchArgs.m = merchantId;
        pagination.load(searchArgs);
    });
    //============================================================================================================================================

      /**  删除按钮
       *
       * */

    $body.on('click', ".doDelete_hen", function () {
        var $this=$(this);
        globalSetMerchantId=$this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordDelete_hen.jsx", postData, function (data) {
            if(data.code == "0"){
                alert(data.msg);
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");
    });

    /**
     * 新增按钮
     */
    $body.on('click', "#save_hen", function () {
        $("#id").val("");
        $("#title").val("");
        $("#myModal_hen").modal("show");

    });
    /*
        保存按钮
     */
    $body.on('click', "#save_btn_hen", function () {
        var id =$("#id").val();
        var title = $("#title").val();
        var postData = {};
        postData.id=id;
        postData.title = title;
        if (!postData.id){
            $.post("tools/RecordAdd_hen.jsx",postData,function (data) {
                if(data.code == "0"){
                    $('#myModal_hen').modal('hide');
                    pagination.load(null);
                } else {
                    alert(data.msg);
                }
            }, "json");
        }else {
            $.post("tools/RecordUpdate_hen.jsx",postData,function (data) {
                if(data.code == "0"){
                    $('#myModal_hen').modal('hide');
                    $("#id").val("");
                    $("#title").val("");
                    pagination.load(null);
                } else {
                    alert(data.msg);
                }
            }, "json");
        }

    });
    /**
     * 修改信息按钮
     */
    $body.on('click', ".doUpdate_hen", function () {
        var $this=$(this);
        globalSetMerchantId=$this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordGet_hen.jsx",postData,function (data) {
            var json =eval("("+data+")");
            $("#id").val(json.id);
            $("#title").val(json.title);
            $("#myModal_hen").modal("show");
        });
    });

});
