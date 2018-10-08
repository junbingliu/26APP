$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_products.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var productId = $.trim($("#productId").val());
    var channel = $.trim($("#channel").val());
    var publishState = $.trim($("#publishState").val());
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId,channel:channel});
    $("#search").bind("click", function () {
        search();
    });

    $("#search2").bind("click", function () {
        search();
    });

    $('#keyword').keydown(function (e) {
        if (e.keyCode == 13) {
            search();
            return false;
        }
    });
    var search = function () {
        var productId = $.trim($("#productId").val());
        var beginTime = $.trim($("#beginTime").val());
        var endTime = $.trim($("#endTime").val());
        var keyword = $.trim($("#keyword").val());
        var channel = $.trim($("#channel").val());
        var publishState = $.trim($("#publishState").val());
        var searchArgs = {};
        //上下架状态
        if (publishState != "") {
            searchArgs.publishState = publishState;
        }
       //开始时间
        if (beginTime != "") {
            searchArgs.beginTime = beginTime;
        }
        //截止时间
        if (endTime != "") {
            searchArgs.endTime = endTime;
        }
        //关键字
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        //渠道
        if (channel != "") {
            searchArgs.channel = channel;
        }
        if (productId != "") {
            searchArgs.productId = productId;
        }
        searchArgs.m = merchantId;
        pagination.load(searchArgs);
    };


    $('#putawayAll').click(function () {
        var isChecked = $("input[type='checkbox']").is(':checked');
       if(!isChecked){
           alert("请勾选所需要上架的商品！");

       }
        var postDate = {};
        var chk_value =[];//定义一个数组
        $('input[name="subcheck"]:checked').each(function(){//遍历每一个名字为interest的复选框，其中选中的执行函数
            chk_value.push($(this).val());//将选中的值添加到数组chk_value中
        });
        var str = "";
        for(var i = 0;i < chk_value.length;i++){
            str += "," +chk_value[i];
        }
        postDate.productIds = str;
        $.post("../handle/putwayAll_handler.jsx", postDate, function (ret) {
            if(ret.state == "ok"){
                alert(ret.msg);
                search();
            }else{
                alert("上架失败！错误信息为："+ret.msg);
            }
        }, "json");
        // alert(chk_value.length);
    });
    $('#soldOutAll').click(function () {
        var isChecked = $("input[type='checkbox']").is(':checked');
        if(!isChecked){
            alert("请勾选所需要下架的商品！");

        }
        var postDate = {};
        var chk_value =[];//定义一个数组
        $('input[name="subcheck"]:checked').each(function(){//遍历每一个名字为interest的复选框，其中选中的执行函数
            chk_value.push($(this).val());//将选中的值添加到数组chk_value中
        });
        var str = "";
        for(var i = 0;i < chk_value.length;i++){
            str += "," +chk_value[i];
        }
        postDate.productIds = str;
        $.post("../handle/soldOutAll_handler.jsx", postDate, function (ret) {
            if(ret.state == "ok"){
                alert(ret.msg);
                search();
            }else{
                alert("下架失败！错误信息为："+ret.msg);
            }
        }, "json");
    });
    //绑定全选的事件
    $("body").on("click", "#checkboxAll", function () {

        $("input[name='subcheck']:checkbox").prop("checked", $(this).is(':checked'));
    });

    //绑定单个复选框的事件
    $("body").on("click", 'input[name="subcheck"]', function () {
        var $chk = $("[name = subcheck]:checkbox");
        $("#checkboxAll").prop("checked", $chk.length == $chk.filter(":checked").length);
    });

    //上架
    $("body").on("click", ".putaway", function () {
        var postDate = {};
        postDate.m = merchantId;
        postDate.productId = $(this).data("a");
        $.post("../handle/putway_handler.jsx", postDate, function (ret) {
           if(ret.state == "ok"){
               alert("上架成功！");
               window.location.reload();
           }else{
               alert("上架失败！错误信息为："+ret.msg);
           }
        }, "json");

    });
    //下架
    $("body").on("click", ".soldOut", function () {
        var postDate = {};
        postDate.m = merchantId;
        postDate.productId = $(this).data("a");
        $.post("../handle/soldOut_handler.jsx", postDate, function (ret) {
            if(ret.state == "ok"){
                alert("下架成功！");
                window.location.reload();
            }else{
                alert("下架失败！错误信息为："+ret.msg);
            }
        }, "json");

    });

    $("body").on("click", "#upload_file_smt", function () {
        $(this).button('loading');
        var productId = $.trim($("#productId").val());
        var beginTime = $.trim($("#beginTime").val());
        var endTime = $.trim($("#endTime").val());
        var keyword = $.trim($("#keyword").val());
        var channel = $.trim($("#channel").val());
        var publishState = $.trim($("#publishState").val());
        var keyword = $("#keyword").val();
        var export_fileName = $("#export_fileName").val();
        var postData = {
            export_fileName: export_fileName,
            productId: productId,
            beginTime: beginTime,
            endTime: endTime,
            channel: channel,
            publishState: publishState,
            keyword: keyword,
            m: merchantId
        };
        $.post("../handle/export_product.jsx", postData, function (data) {
            if (data.state == "ok") {
                bootbox.alert(data.msg + "　您可以在【导出历史】中查看并下载。");
            } else {
                bootbox.alert(data.msg);
            }
            $('#upload_file_smt').button('reset');
        }, "json");
    });

    $("#excelListHistory").bind("click", function () {
        $.ajax({
                url: "../handle/getHistory_product.jsx?m=" + merchantId,
                type: "post",
                dataType: "json",
                success: function (data) {
                    var divShow = $("#excelListHistoryDiv tbody");
                    divShow.html("");
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        html += '<tr>'
                            + '<td>' + data[i].fileName + '</td>'
                            + '<td><a href=' + data[i].url + '>下载</a></td>'
                            + '</tr>'
                    }
                    divShow.append(html);
                }
            }
        );
    });

    //显示隐藏高级搜索
    $("#advancedSearch").click(function(){
        if($("#show").css("display")=="none"){
            // alert($("#advancedSearch").html());
            $("#show").show();
            $("#advancedSearch").html("取消高级搜索")
        }else{
            $("#show").hide();
            $("#advancedSearch").html("高级搜索")
        }
    });



});
