/**
 * Created by joho on 2016/8/5.
 */

$(document).ready(function () {
    var cutTime = (new Date()).getTime();

    //导出

    $("#export").click(function () {
        var array = [];
        $("input[name='oneTask']:checkbox").each(function () {
            if ($(this)[0].checked) {
                array.push($(this).val());
            }
        });
        var themeIds = JSON.stringify(array);
        bootbox.setLocale("zh_CN");
        bootbox.confirm("确定导出商品列表?", function (result) {
            if (result) {
                $.get("../serverHandler/export_list.jsx?m=" + m + "&themeIds=" + themeIds, function (res) {
                    if (res.param == "ok") {
                        bootbox.alert(res.msg);
                    } else {
                        bootbox.alert("导出失败");
                    }
                }, "json")
            }
        });
    });

    //end
    $("#getHistory1").click(function(){
        $.get("../serverHandler/getHistory.jsx?m="+m,function(res){
            var html= "";
            for(var b = 0; b < res.histories.length; b++){
                var oneData = res.histories[b];
                    html +=  '<tr>'
                        +'<td>'+oneData.fileName+'</td>'
                        +'<td>'+(new Date(Number(oneData.createTime))).toLocaleString()+'</td>'
                        +'<td><a href='+oneData.url+'>下载</a></td>'
                        +'</tr>';
                }
            $("#historyList").html(html);
        },"json")
    });

    $("#addTj").on("click", function () {
        var parms = {
                theme: $.trim($("#theme").val()),
                beginTime: $.trim($("#addBeginTime").val()),
                endTime: $.trim($("#addEndTime").val()),
                marketing: $.trim($("#marketing").val()),
                choose: $.trim($("#choose").val()),
                m: m
            },
            addBeginTime = parseInt(new Date(parms.beginTime).getTime()),
            addEndTime = parseInt(new Date(parms.endTime).getTime());

        function addTheme() {
            $.post("hander/addTheme.jsx?m=head_merchant", parms, function (ret) {
                if (ret.msg == "ok") {
                    alert(ret.result);
                    window.location.reload();
                } else {
                    $("#themes").html(ret.result);
                }
            }, "json");
        }

        if ($.trim($("#theme").val()) != "" && addBeginTime < addEndTime && cutTime < addBeginTime && $.trim($("#marketing").val()) != "" && $.trim($("#choose").val()) != "") {
            addTheme()
        } else {
            if (($("#theme").val()) == "" || $.trim($("#marketing").val()) == "" || $.trim($("#choose").val()) == "") {
                alert("所有信息均需填写！");
            }
            if (addBeginTime > addEndTime) {
                alert("结束时间早于开始时间");
            }
            if (cutTime > addBeginTime) {
                alert("开始时间早于当前时间");
            }
        }

    });

    $("#xgTj").on("click", function () {
        var xgparms = {
                xgId: $("#id").val(),
                theme: $.trim($("#xgTheme").val()),
                beginTime: $.trim($("#xgBeginTime").val()),
                endTime: $.trim($("#xgeEndTime").val()),
                marketing: $.trim($("#xgMarketing").val()),
                choose: $.trim($("#xgChoose").val()),
                userName:$.trim($("#UName").val())
            },
            xgBeginTime = parseInt(new Date(xgparms.beginTime).getTime()),
            xgEndTime = parseInt(new Date(xgparms.endTime).getTime());
        if ($.trim($("#xgTheme").val()) != "" && $.trim($("#xgMarketing").val()) != "" && $.trim($("#xgChoose").val()) != "" && cutTime < xgBeginTime && xgEndTime > xgBeginTime) {
            $.post("hander/modifyTheme.jsx?m=head_merchant", xgparms, function (ret) {
                if (ret.msg == "ok") {
                    alert(ret.result);
                    window.location.reload();
                } else {
                    alert(ret.result);
                }
            }, "json");
        } else {
            if ($.trim($("#xgTheme").val()) == "" || $.trim($("#xgMarketing").val()) == "" || $.trim($("#xgChoose").val()) == "") {
                alert("所有信息均需填写！");
            }
            if (xgBeginTime > xgEndTime) {
                alert("开始时间早于当前时间");
            }
            if (cutTime > xgBeginTime) {
                alert("结束时间早于开始时间");
            }
        }

    });

});
function modify(t) {
    $.post("hander/modifyTheme.jsx?m=head_merchant", {id: $(t).attr("modify")}, function (ret) {
        if (ret.msg == "ok") {
            $("#id").val(ret.result.id);
            $("#UName").val(ret.result.userName);
            $("#xgTheme").val(ret.result.theme);
            $("#xgBeginTime").val(ret.result.beginTime);
            $("#xgeEndTime").val(ret.result.endTime);
            $("#xgMarketing").val(ret.result.marketing);
            $("#xgChoose").val(ret.result.choose);
        } else {
            $("#themes").html(ret.result);
        }
    }, "JSON");
}
function del(t) {
    if (confirm("确定要删除数据吗？")) {
        $.post("hander/deleteTheme.jsx?m=head_merchant", {id: $(t).attr("delete")}, function (ret) {
            if (ret.msg == "ok") {
                alert(ret.result);
                window.location.reload();
            } else {
                $("#themes").html(ret.result);
            }
        }, "JSON");
    }
}
function linked(t) {
    var id = $(t).attr("id");
    window.location.href = "Details.jsx?m=" + m + "&id=" + id;
}