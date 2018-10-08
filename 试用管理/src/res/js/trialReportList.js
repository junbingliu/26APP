$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_trialReportList.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    var activeId = $("#activeId").val();
    console.log("activeId = " + activeId);
    pagination.load({m:m,activeId: activeId});
    var data = {
        activeId: activeId,
        m: m
    };
    //获取商品列表
    $.post("../handler/getProductList.jsx", data, function (res) {
        var objSelect = document.getElementById("selectL");
        for (var i = 0; i < res.productList.length; i++) {
            objSelect.options.add(new Option(res.productList[i].name, res.productList[i].id));//这个id是productId
            // console.log("id = "+res.productList[i].id+"   ");
        }
    }, "json");


    $("#search").bind("click", function () {
        var productId = $("#selectL option:selected").val();
        var examineStatus = $("#state option:selected").val();
        var searchArgs = {};
        searchArgs.productId = productId;
        searchArgs.activeId = activeId;
        searchArgs.examineStatus = examineStatus;

        console.log("searchArgs = " + JSON.stringify(searchArgs));
        pagination.load(searchArgs);
    });

    $("#export").bind("click",function(){
        var productId = $("#selectL option:selected").val();
        var examineStatus = $("#state option:selected").val();
        var exportName = $("#exportName").val();
        var activeId = $("#activeId").val();
        var data = {
            productId:productId,
            examineStatus:examineStatus,
            activityId:activeId,
            exportName:exportName,
            m:m
        };
        $.post("../handler/export_TrialReport.jsx",data,function (res) {
            if(res.param == "ok"){
                bootbox.alert(res.msg);
            }
        },"json");
    });

    function down(name) {
        $.get("../handler/getHistory.jsx?m="+m+"&listName="+name,function(res){
            var html= "";
            for(var b = 0; b < res.histories.length; b++){
                var oneData = res.histories[b];
                html +=  '<tr>'
                    +'<td>'+oneData.fileName+'</td>'
                    +'<td>'+(new Date(Number(oneData.createTime))).toLocaleString()+'</td>'
                    +'<td><a href='+oneData.url+ '&fileName='+oneData.fileName+
                    '>下载</a></td>'+
                    +'</tr>';
            }
            $("#historyList").html(html);
        },"json")
    }
    $("#getHistory").bind("click",function(){
        var name = "Trail_Report_List_Excel";
        down(name);
    });
    
    $(".pass").live("click",function () {
        var id = $(this).attr("data-a");
        $("#examineId").val(id);
        $("#isPass").val("1");
    });
    $(".reject").live("click",function () {
        var id = $(this).attr("data-a");
        $("#examineId").val(id);
        $("#isPass").val("-1");
    });
    $("#update").bind("click",function () {
        var id = $("#examineId").val();
        var option = $("#isPass").val();
        var examineReason = $("#examineReason").val();
        if(option == "-1"){
            if(examineReason == ""){
                bootbox.alert("审核不通过要写备注");
                return;
            }
        }
        $.post("../handler/examinOne.jsx",{id:id,option:option,examineReason:examineReason,m:m},function (res) {
            if(res.param == "ok"){
                bootbox.alert("审核成功");
                var activeId = $("#activeId").val();
                pagination.load({m:m,activeId: activeId});
            }
        },"json")
    })
});