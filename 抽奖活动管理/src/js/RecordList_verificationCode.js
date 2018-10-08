var globalSetMerchantId;
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record_verificationCode.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId, id: id});

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


    //============================================================================================================================================


    $body.on('click', "#generateCode_btn", function () {
        $('#myModal_vfCode').modal('show');
    });


    /*
        生成验证码
     */
    $body.on('click', "#generate_btn", function () {
        var number =  $("#vfNumber").val();
        $.post("tools/RecordAdd_Code.jsx",{number:number,id:id}, function (data) {
            if (data.code == "0") {
                $('#myModal_vfCode').modal('hide');
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");
    });

});
