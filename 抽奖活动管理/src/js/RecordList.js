var globalSetMerchantId;
var pagination=null;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
     pagination = new $.IsoneAjaxPagination(initconfig);
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

    //============================================================================================================================================
    /*
        删除操作
     */
    $body.on('click', ".doDelete", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordDelete.jsx", postData, function (data) {
            if (data.code == "0") {
                alert(data.msg);
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");
    });

    /**
     * 新增
     */
    $body.on('click', "#save", function () {
        $("#id").val("");
        $("#Sweepstakes_activity_type").val("");
        $("#Event_name").val("");
        $("#Winning_probability").val("");
        $("#startDate").val("");
        $("#endDate").val("");
        $("#type_of_activity").val("");
        $("#Province").val("");
        $("#City").val("");
        $("#Village").val("");
        $("#No_small_lottery_draw").val("");
        $("#Participation_conditions").val("");
        $("#Lottery_credit").val("");
        $("#Lottery_order_amount").val("");
        $("#Theme").val("");
        $("#Background").val("");
        $("#Turntable").val("");
        $("#Pointer").val("");
        $("#Shopping").val("");
        $("#Go_shopping_url").val("");
        $("#Activity_Rules").val("");
        $("#Winning_Record").val("");
        $("input[name='payMethod_1']:checked").val("");
        $("#Lottery_jackpot_credit").val("");
        $("#Lottery_daily_numberr").val("");
        $("#Lottery_total_number").val("");
        $("#Share_title").val("");
        $("#Share_introduction").val("");
        $("#Share_link").val("");
        $("#Share_pictures").val("");
        $("#myModal").modal("show");
    });




    /*
        保存按钮
     */
    $body.on('click', "#save_btn", function () {
        var eventName  = $("#Event_name").val();
        var shopName = $("#shopName").val();
        var shopId = $("#Village").val();
        var activityType = $("#type_of_activity").val();

        if (eventName && shopName && shopId!=-1 && activityType){
            $("#at_from").submit();
            alert("添加成功");
            $('#myModal').modal('hide');
        }else {
            alert("必填信息不能空白！");
        }
    });

    /**
     * 修改信息按钮
     */
    $body.on('click', ".doUpdate", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/RecordGet.jsx", postData, function (data) {
            // $("#update_da").html(data);
            var json = eval("(" + data + ")");
            var id = json.id;
            var Sweepstakes_activity_type = json.sweepstakesActivityTypeId;
            var Event_name = json.eventName;
            var Winning_probability = json.winningProbability;
            var startDate = json.startDate;
            var endDate = json.endDate;
            var type_of_activity = json.activityType;
            var Province = json.province;
            var City = json.city;
            var Village = json.shopId;
            var shopName = json.shopName;
            var No_small_lottery_draw = json.noSmall;
            var Participation_conditions = json.participationConditions;
            var Lottery_credit = json.integral;
            var Lottery_order_amount = json.lotteryOrderAmount;
            var Theme = json.themeImage;
            var Background = json.backgroundImage;
            var Turntable = json.turntableImage;
            var Pointer = json.pointerImage;
            var Shopping = json.goShopping;
            var Go_shopping_url = json.goshoppingUrl;
            var Activity_Rules = json.activityRules;
            var Winning_Record = json.winningRecord;
            var restrictedPoints = json.restrictedPoints;
            var Lottery_jackpot_credit = json.lotteryIntegral;
            var Lottery_daily_number = json.lotteryDayNumber;
            var Lottery_total_number = json.lotteryTotalNumber;
            var prizeInstructions = json.prizeInstructions;
            var prizeSetting = json.prizeSetting;
            var Share_title = json.shareTitle;
            var Share_introduction = json.shareIntroduction;
            var Share_link = json.shareUrl;
            var Share_pictures = json.shareImage;
            $("#id").val(id);
            $("#Sweepstakes_activity_type").val(Sweepstakes_activity_type);
            $("#Event_name").val(Event_name);
            $("#Winning_probability").val(Winning_probability);
            $("#startDate").val(startDate);
            $("#endDate").val(endDate);
            $("#type_of_activity").val(type_of_activity);
            $("#Province").val(Province);

            var parenId = $("#Province").val();
            if (parenId != "" || parenId != '') {
                $.post("city_list.jsx", {parenId: parenId}, function (data) {
                    $("#City").empty();
                    var xqo = eval('(' + data + ')');
                    for (var i in xqo) {
                        var id = xqo[i].id;
                        var name = xqo[i].name;
                        var opt = "<option value='" + id + "'>" + name + "</option>";
                        $("#City").append(opt);
                        if ((xqo[i]).id == City) {
                            $("#City").val(City);
                        }
                    }
                });
            }
            var provincecode = $("#Province").val();
            var citycode = $("#City").val();
            $.post("/oleMobileApi/server/member/getShopInfo.jsx", {
                provincecode: provincecode,
                citycode: citycode
            }, function (data) {
                $("#Village").empty();
                var xqo = eval('(' + data + ')');
                var json = xqo.data;
                for (i = 0; i < json.length; i++) {
                    var id = json[i].id;
                    var name = json[i].shopname;
                    var opt = "<option value='" + id + "'>" + name + "</option>";
                    $("#Village").append(opt);
                    if (id == Village) {
                        $("#Village").val(Village);
                    }
                }
            });
            if (No_small_lottery_draw==1){
                $("#No_small_lottery_draw").attr("checked",true);//打勾
            }
          //  $("input[name='No_small_lottery_draw']:checked").val(No_small_lottery_draw);
            $("#Participation_conditions").val(Participation_conditions);
            $("#Lottery_credit").val(Lottery_credit);
            $("#Lottery_order_amount").val(Lottery_order_amount);
            $("#themeImg").attr("src", Theme);
            $("#backgroundImg").attr("src", Background);
            $("#turntableImg").attr("src", Turntable);
            $("#pointerImg").attr("src", Pointer);
            $("#shoppingImg").attr("src", Shopping);
            $("#Go_shopping_url").val(Go_shopping_url);
            $("#rulesImg").attr("src", Activity_Rules);
            $("#recordImg").attr("src", Winning_Record);
            $("#restrictedPoints").val(restrictedPoints);
            $("#Lottery_jackpot_credit").val(Lottery_jackpot_credit);
            $("#Lottery_daily_number").val(Lottery_daily_number);
            $("#Lottery_total_number").val(Lottery_total_number);
            $('#prizeInstructions').summernote('code',prizeInstructions);
            $('#prizeSetting').summernote('code',prizeSetting);
            $("#Share_title").val(Share_title);
            $("#Share_introduction").val(Share_introduction);
            $("#Share_link").val(Share_link);
            $("#shareImg").attr("src", Share_pictures);
            $("#myModal").modal("show");
        });
    });



    /*
    * 三级联动 ---市
    * */

    $("#Province").bind("change", function () {
        var opt = "<option value='-1'>--请选择--</option>";
        var parenId = $("#Province").val();
        $.post("city_list.jsx", {parenId: parenId}, function (data) {
            $("#City").empty();
            var xqo = eval('(' + data + ')');
            for (var i in xqo) {
                var id = xqo[i].id;
                var name = xqo[i].name;
                $("#City").append(opt);
                opt = "<option value='" + id + "'>" + name + "</option>";
                $("#City").append(opt);
            }
        });
    });

    /*
    * 三级联动 ---门店
    * */


    $("#City").bind("change", function () {
        var opt = "<option value='-1'>--请选择--</option>";
        var provincecode = $("#Province").val();
        var citycode = $("#City").val();
        $.post("/oleMobileApi/server/member/getShopInfo.jsx", {
            provincecode: provincecode,
            citycode: citycode
        }, function (data) {
            $("#Village").empty();
            var xqo = eval('(' + data + ')');
            var json = xqo.data;
            for (i = 0; i < json.length; i++) {
                var id = json[i].id;
                var name = json[i].shopname;
                $("#Village").append(opt);
                opt = "<option value='" + id + "'>" + name + "</option>";
                $("#Village").append(opt);
            }

        });
    });

    $("#Village").bind("change", function () {
        var shopName = $("#Village").find("option:selected").text();
        $("#shopName").val(shopName);
    });

    $("#Sweepstakes_activity_type").bind("change", function () {
        var eventName = $("#Sweepstakes_activity_type").find("option:selected").text();
        $("#eventName").val(eventName);
    });



});
