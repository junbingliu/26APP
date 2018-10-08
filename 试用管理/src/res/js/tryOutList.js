$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_manageList.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var searchArgs = {};
    searchArgs.m = m;
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load(searchArgs);
   function search() {
       var num = $("#numbering").val();
       var title = $("#title").val();
       searchArgs.num = num;
       searchArgs.title = title;
       searchArgs.m = m;
       pagination.load(searchArgs);
   }
   $("#search").bind("click",function () {
       search();
   });
    $("#sendList").bind("click",function () {
        $.post("../handler/sendMassage.jsx",function (res) {
            if(res.status == 0){
                bootbox.alert("发送成功");
            }
        },"json");
    });
    $(".sendMassage").live("click",function () {
        var obj = document.getElementsByName("vehicle");
        var check_val = [];
        for(var k in obj){
            if(obj[k].checked)
                check_val.push(obj[k].value);
        }
        var string = "";
        if(check_val.length > 1){
            for(var g = 0; g < check_val.length; g++){
                string += check_val[g]+",";
            }
        }else{
            string = check_val[0];
        }
        var data = {
            id : string,
            m:m
        };
        $.post("../handler/sendMassage.jsx",data,function (res) {
            if(res.status == 0){
                bootbox.alert("发送成功");
            }
        },"json");
    });

});