var globalSetMerchantId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record_som.jsx",
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

    $body.on('click', "#search_btn", function () {

        var keyword = inputSelect();
        if (keyword == '' && keyword == null) {
            alert("请先在输入框输入！");
        } else {
            var searchArgs = {};
            searchArgs.keyword = keyword;
        }
        searchArgs.m = merchantId;
        pagination.load(searchArgs);

    });

//============================================================================================================================================

    /**  删除按钮
     *
     * */

    $body.on('click', ".doDelete_som", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordDelete_som.jsx", postData, function (data) {
            if (data.code == "0") {
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
    $body.on('click', "#save_som", function () {
        $("#id").val("");
        $("#Sweepstakes_activity_type").val("");
        $("#Activity_name").val("");
        $("#upload_image").val("");
        $("#Starting_angle").val("");
        $("#Prize_number").val("");

        $("#End_angle").val("");
        $("#Maximum_number_prizes").val("");
        $("#Activity_grade").val("");
        $("#Award_notice").val("");
        $("#Front_end_display_information").val("");
        $("#integral").val("");
        $("#Integral_multiples").val("");
        $("#VIP_coupon").val("");
        $("#CPS_coupon").val("");
        $("#myModal_som").modal("show");

    });
    /*
        创建按钮
     */
    $body.on('click', "#create_btn_som", function () {
        var id = $("#id").val();
        var Sweepstakes_activity_type = $("#Sweepstakes_activity_type").val();
        var activityTypeName = $("#Sweepstakes_activity_type").find("option:selected").text();
        var Activity_name = $("#Activity_name").val();
        var upload_image = $("#upload_image").val();
        var Starting_angle = $("#Starting_angle").val();
        var End_angle = $("#End_angle").val();
        var Prize_number = $("#Prize_number").val();
        var Maximum_number_prizes = $("#Maximum_number_prizes").val();
        var Activity_grade = $("#Activity_grade").val();
        var gradeName = $("#Activity_grade").find("option:selected").text();
        var Award_notice = $("#Award_notice").val();
        var Front_end_display_information = $("#Front_end_display_information").val();
        var Prize_time = $("#Prize_time").val();
        var Prize_type = $("#Prize_type").val();
        var integral = $("#integral").val();
        var Integral_multiples = $("#Integral_multiples").val();
        var VIP_coupon = $("#VIP_coupon").val();
        var vipCouponName = $("#VIP_coupon").find("option:selected").text();
        var CPS_coupon = $("#CPS_coupon").val();
        var cpsCouponName = $("#CPS_coupon").find("option:selected").text();
        var postData = {};
        postData.id = id;
        postData.Sweepstakes_activity_type = Sweepstakes_activity_type;
        postData.activityTypeName = activityTypeName;
        postData.Activity_name = Activity_name;
        postData.upload_image = upload_image;
        postData.Starting_angle = Starting_angle;
        postData.End_angle = End_angle;
        postData.Prize_number = Prize_number;
        postData.Maximum_number_prizes = Maximum_number_prizes;
        postData.Activity_grade = Activity_grade;
        postData.gradeName = gradeName;
        postData.Award_notice = Award_notice;
        postData.Front_end_display_information = Front_end_display_information;
        postData.Prize_time = Prize_time;
        postData.Prize_type = Prize_type;
        postData.integral = integral;
        postData.Integral_multiples = Integral_multiples;
        postData.VIP_coupon = VIP_coupon;
        postData.vipCouponName = vipCouponName;
        postData.CPS_coupon = CPS_coupon;
        postData.cpsCouponName = cpsCouponName;
        if (!postData.Starting_angle || postData.Activity_name=='' ||  postData.End_angle==''||postData.gradeName=='') {
            alert("请先完善奖项信息！")
        } else {
            if (!postData.id) {
                $.post("tools/RecordAdd_som.jsx", postData, function (data) {
                    if (data.code == "0") {
                        $('#myModal_som').modal('hide');
                        pagination.load(null);
                    } else {
                        alert(data.msg);
                    }
                }, "json");
            } else {
                $.post("tools/RecordUpdate_som.jsx", postData, function (data) {
                    if (data.code == "0") {
                        $('#myModal_som').modal('hide');
                        /*$("#id").val("");
                        $("#title").val("");*/
                        pagination.load(null);
                    } else {
                        alert(data.msg);
                    }
                }, "json");
            }
        }

    });
    /**
     * 修改信息按钮
     */
    $body.on('click', ".doUpdate_som", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordGet_hen.jsx", postData, function (data) {
            var json = eval("(" + data + ")");
            var id = json.id;
            var Sweepstakes_activity_type = json.activityTypeId;
            var Activity_name = json.prizeName;
            var upload_image = json.uploadImage;
            var Starting_angle = json.startingAngle;
            var End_angle = json.endAngle;
            var Prize_number = json.prizeNumber;
            var Maximum_number_prizes = json.maximumNumberPrizes;
            var Activity_grade = json.activityGrade;
            var Award_notice = json.awardNotice;
            var Front_end_display_information = json.frontEndDisplayInformation;
            var Prize_time = json.prizeTime;
            var Prize_type = json.prizeType;
            var integral = json.integral;
            var Integral_multiples = json.integralMultiples;
            var VIP_coupon = json.VIPCoupon;
            var CPS_coupon = json.CPSCoupon;
            $("#id").val(id);
            $("#Sweepstakes_activity_type").val(Sweepstakes_activity_type);
            $("#Activity_name").val(Activity_name);
            /*<!--图片问题-->*/
            //$("#upload_image").val(upload_image);
            $("#Starting_angle").val(Starting_angle);
            $("#End_angle").val(End_angle);
            $("#Prize_number").val(Prize_number);
            $("#Maximum_number_prizes").val(Maximum_number_prizes);
            $("#Activity_grade").val(Activity_grade);
            $("#Award_notice").val(Award_notice);
            $("#Front_end_display_information").val(Front_end_display_information);
            $("#Prize_time").val(Prize_time);
            $("#Prize_type").val(Prize_type);
            $("#integral").val(integral);

            $("#Integral_multiples").val(Integral_multiples);
            $("#VIP_coupon").val(VIP_coupon);
            $("#CPS_coupon").val(CPS_coupon);
            $("#myModal_som").modal("show");
        });
    });
});

function inputSelect() {
    var input_select = $("#input").val();
    var option_length = $("option").length;
    var option_id = '';
    for (var i = 0; i < option_length; i++) {
        var option_value = $("option").eq(i).attr('data-value');
        if (input_select == option_value) {
            option_id = $("option").eq(i).attr('data-id');
            break;
        }
    }
    return input_select;
}