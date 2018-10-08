/* Created by Qianglong Mo 2015 */

$(function(){
    $(".datePicker").on("focus",function(){
        var selfObj = $(this);
        var targetId = selfObj.attr("targetId");
        var targetObj = $("#" + targetId);
        WdatePicker({
            dateFmt:'yyyy-MM-dd',onpicking:function(dp){
                var dateTimeStr = dp.cal.getNewDateStr();
                if(targetId == "beginTime"){
                    dateTimeStr += " 00:00:00";
                }else{
                    dateTimeStr += " 23:59:59";
                }
                //
                //var date = new Date(Date.parse(dateTimeStr))
                targetObj.val(dateTimeStr);
            },onclearing:function(){
                targetObj.val("");
            }
        });
    });

    $("#searchRecordBtn").on("click",function(){
        var beginTime = $("#beginTime").val();
        var endTime = $("#endTime").val();
        if(beginTime && endTime){
            var bt = new Date(Date.parse(beginTime.replace(/-/g,   "/")));
            var et = new Date(Date.parse(endTime.replace(/-/g,   "/")));
            if(bt.getTime() > et.getTime()){
                alert("查询开始时间不能大于结束时间。")
                return;
            }
        }
        document.getElementById("searchJifenForm").submit();

    });


});