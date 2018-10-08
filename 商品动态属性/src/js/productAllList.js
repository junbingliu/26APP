$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "loadProduct.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var merchantId = $("#merchantId").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});
    $("#search").bind("click",function(){
        var keyword=$("#keyword").val();
        if($("#endDate").val()!=""){
            var endCreateTime=$("#endDate").val()+" "+$("#endTime").val();
        }
        if($("#beginDate").val()!=""){
            var beginCreateTime=$("#beginDate").val()+" "+$("#beginTime").val();
        }
        //console.log({endCreateTime:endCreateTime,beginCreateTime:beginCreateTime})
        pagination.load({m: merchantId,keyword:keyword,endCreateTime:endCreateTime,beginCreateTime:beginCreateTime});
    })
    $("input.date").datepicker({
        changeYear: false
    });

});