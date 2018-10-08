$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_informationList.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    var searchArgs = {};
    var merchantId = $("#merchantId").val();
    searchArgs.m = merchantId;
    $("#search").bind("click", function () {
        search();
    });

    $("#query").bind("click", function () {
        search();
    });
    pagination.load(searchArgs);

    function search() {
        var articleId = $("#articleId").val();
        var firstChannel = $("#firstChannel").val();
        var channel = $("#channel").val();
        var state = $("#state").val();
        var beginTime = $("#beginTime").val();
        var endTime = $("#endTime").val();
        var keyWord = $("#keyWord").val();
        searchArgs.keyWord = keyWord;
        searchArgs.articleId = articleId;
        searchArgs.firstChannel = firstChannel;
        searchArgs.channel = channel;
        searchArgs.state = state;
        searchArgs.beginTime = beginTime;
        searchArgs.endTime = endTime;
        pagination.load(searchArgs);
    }

    //显示隐藏高级搜索
    var $body = $("body");
    $("#quxiao").bind("click", function () {
        $(".searchView").toggle();
    });
    $("#seniorSearch").click(function () {
        $(".searchView").toggle();
    });


    //全选
    $body.on("click", "#checkAll", function () {
        //获取编号前面的复选框
        var checkAllEle = document.getElementById("checkAll");
        //对编号前面复选框的状态进行判断
        if (checkAllEle.checked == true) {
            //获取下面所有的复选框
            var checkOnes = document.getElementsByName("checkOne");

            //对获取的所有复选框进行遍历
            for (var i = 0; i < checkOnes.length; i++) {
                //拿到每一个复选框，并将其状态置为选中
                checkOnes[i].checked = true;
            }
        } else {
            //获取下面所有的复选框
            var checkOnes = document.getElementsByName("checkOne");
            //对获取的所有复选框进行遍历
            for (var i = 0; i < checkOnes.length; i++) {
                //拿到每一个复选框，并将其状态置为未选中
                checkOnes[i].checked = false;
            }
        }
    });
    $body.on("click", ".checkone", function () {
        var checkAllEle = document.getElementById("checkAll");
        var checkOnes = document.getElementsByName("checkOne");
        var sum = 0;
        //对获取的所有复选框进行遍历
        for (var i = 0; i < checkOnes.length; i++) {
            if (checkOnes[i].checked == true) {
                sum++;
            }
        }
        if (sum == checkOnes.length) {
            checkAllEle.checked = true;
        }
        else {
            checkAllEle.checked = false;
        }
    });

    //批量上架
    $("#up").click(function () {
        //创建ids
        var ids = [];
        //获取所有单选框
        var checkOnes = document.getElementsByName("checkOne");
        for (var i = 0; i < checkOnes.length; i++) {
            //拿到每一个复选框，并将其状态置为选中
            if (checkOnes[i].checked == true) {
                var id = $(".checkone").eq(i).attr("data-a");
                ids.push(id);
            }
        }
        if (ids.length > 0) {
            var postData = {
                ids: ids.join(","),
                pubState: 1
            };
            $.post("uploadPubState_handler.jsx", postData, function (result) {
                if (result.code == "ok") {
                    alert(result.msg);
                    search();
                } else {
                    alert(result.msg);
                    search();
                }
            }, "json");
        }
    });

    //批量下架
    $("#down").click(function () {
        //创建ids
        var ids = [];
        //获取所有单选框
        var checkOnes = document.getElementsByName("checkOne");
        for (var i = 0; i < checkOnes.length; i++) {
            //拿到每一个复选框，并将其状态置为选中
            if (checkOnes[i].checked == true) {
                var id = $(".checkone").eq(i).attr("data-a");
                ids.push(id);
            }
        }
        if (ids.length > 0) {
            var postData = {
                ids: ids.join(","),
                pubState: 0
            };
            $.post("uploadPubState_handler.jsx", postData, function (result) {
                if (result.code == "ok") {
                    alert(result.msg);
                    search();
                } else {
                    alert(result.msg);
                    search();
                }
            }, "json");
        }
    });

    //批量删除
    $("#del").click(function () {
        if (!confirm("确认要删除吗")) {
            return;
        }
        //创建ids
        var ids = [];
        //获取所有单选框
        var checkOnes = document.getElementsByName("checkOne");
        for (var i = 0; i < checkOnes.length; i++) {
            //拿到每一个复选框，并将其状态置为选中
            if (checkOnes[i].checked == true) {
                var id = $(".checkone").eq(i).attr("data-a");
                ids.push(id);
            }
        }
        if (ids.length > 0) {
            var postData = {
                ids: ids.join(","),
                type: "del",
                pubState: 0
            };
            $.post("uploadPubState_handler.jsx", postData, function (result) {
                if (result.code == "ok") {
                    alert(result.msg);
                    search();
                } else {
                    alert(result.msg);
                    search();
                }
            }, "json");
        }
    });

    //更改优先级
    $body.on("click", ".updatePos", function () {
        var td = $(this).parent().prev();
        var txt = td.text();
        var input = $("<input style='width: 60px' type='text' value='" + txt + "'>");
        td.html(input);
        input.click(function () {
            return false;
        });
        //获取焦点
        input.trigger("focus");
        //获取id
        var objId = $(this).attr("data-a");
        //文本框失去焦点后提交内容，重新变为文本
        input.blur(function () {
            var newtxt = $(this).val();

            if (newtxt.replace(/^[0-9]+([.]{1}[0-9]+){0,1}$/, '')) {
                alert("只能输入数字");
                return;
            }
            newtxt = Math.round(newtxt);
            if (newtxt != "" && newtxt != txt) {
                if (!confirm("确认要修改吗？")) {
                    $(this).html(txt);
                    td.html(txt);
                    return;
                }
                //更新到本地后台对应的消息
                var postData = {
                    pos: newtxt,
                    objId: objId
                };
                $.post("uploadPos_handler.jsx", postData, function (result) {
                    if (result.code == "0") {
                        alert(result.msg);
                        search();
                    } else {
                        alert(result.msg);
                        search();
                    }
                }, "json");
                td.html(newtxt);
            } else {
                $(this).html(txt);
                td.html(txt);
            }
        })
    });

});