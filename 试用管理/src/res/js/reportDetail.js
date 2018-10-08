$(document).ready(function () {
    $("#saveContent").click(function () {
        var id = $(this).attr("data-a");
        var oneSentence = $("#oneSentence").val();
        var moodWords = $("#moodWords").val();
        var feelingWords = $("#feelingWords").val();
        var compareWords = $("#compareWords").val();
        var freeWords = $("#freeWords").val();
        var imageIndex = $(".imageIndex");
        var fileIdList = $(".imageContent");
        var arry = [];
        var indexJson =  {};
            for(var g =0; g < imageIndex.length; g++){
                var index = Number(imageIndex[g].value);
                if(indexJson[index] != undefined){
                    bootbox.alert("数字重复了");
                    return;
                }
                indexJson[index] = index;
                arry[index] = fileIdList[g].src;
            }
        var data = {
            id:id,
            oneSentence:oneSentence,
            moodWords:moodWords,
            feelingWords:feelingWords,
            compareWords:compareWords,
            freeWords:freeWords,
            fileIdList:arry.join(","),
            m:m
        };
        $.post("../handler/updateReport.jsx",data,function (res) {
            if(res.param == "ok"){
                bootbox.alert("保存成功");
            }
        },"json")
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
                history.go(0);
            }
        },"json")
    })
});