var freeGetCardId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});

    var $body = $("body");

    $body.on('click', "#updateStateBtn", function () {
        var postData = {};
        postData.m = merchantId;
        postData.id = globalIdCardId;
        postData.state = recordState;

        $.post("RecordUpdateState.jsx", postData, function (data) {
            if(data.code == "0"){
                $('#doUpdateStateModal').modal('hide');
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");

    });

    $body.on('click', "#cancelStateBtn", function () {
        $('#doUpdateStateModal').modal('hide');
    });

    $body.on('click', "#doDelete", function () {
        var $this = $(this);
        freeGetCardId = $this.attr("data-a");
        var postData={};
        postData.m = merchantId;
        postData.id = freeGetCardId;
        $.post("RecordDelState.jsx", postData, function (data) {
            console.log(data.msg);
            pagination.load({m: merchantId});
        }, "json");
    });



    $body.on('click', "#doUpdateState", function () {
        var $this=$(this);
        $("#inputtitle").val($this.parent().siblings(".recordTitle").text());
        $("#inputduration").val($this.parent().siblings(".recordDuration").text());
        $("#inputmoney").val($this.parent().siblings(".recordMoney").text());
        $("#inputid").val($this.parent().siblings(".recordId").text());
        $("#inputcoupon").val($this.parent().siblings(".recordCoupon").text());
        $("#inputcomment").val($this.parent().siblings(".recordComment").text());
        $("#inputactivityId").val($this.parent().siblings(".recordActivityId").text());
        $("#inputcardBatchId").val($this.parent().siblings(".recordCardBatchId").text());
        $('#myModal').modal('show');
    });

    $body.on('click', "#savemodify", function () {
        var postData={};
        postData.id=$("#inputid").val();
        postData.title=$("#inputtitle").val();
        postData.duration=$("#inputduration").val();
        postData.money=$("#inputmoney").val();
        postData.coupon=$("#inputcoupon").val();
        postData.comment=$("#inputcomment").val();
        postData.activityId=$("#inputactivityId").val();
        postData.cardBatchId=$("#inputcardBatchId").val();
        $.post("RecordUpdateState.jsx", postData, function (data) {
            if(data.code=="0"){
                $('#myModal').modal('hide');
                pagination.load({m: merchantId});
            }else{
                console.log(data.msg);
            }
        }, "json");
    });
});
