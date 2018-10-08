$(document).ready(function () {
    var currentUrl = window.location.href;
    $('#navbar').find('li').each(function (item) {
        var $this = $(this);
        var href = $this.data('a');
        if (currentUrl.indexOf(href) > 0) {
            $this.addClass("active");
        }
    });

    $("#addApi").on("click", function () {
        document.getElementById("addForm").reset();
        $("#id").val("");
        $("#myModal").modal("show");
    });
    function frameLoaded() {
        var resultFrame = document.getElementById("resultFrame");
        var result = $("#resultFrame").contents().find("body").html();
        if (result) {
            result = JSON.parse(result);
            if (result.state == "ok") {
                var msg = result.msg || "保存成功";
                bootbox.alert(msg, function () {
                    if (window.loadData) {
                        window.loadData();
                    } else {
                        window.location.reload();
                    }
                });
                $("#myModal").modal("hide");
            } else {
                bootbox.alert(result.msg, function () {
                });
            }
        }
    }

    $("#submitBtn").click(function () {
        var apiId = $("#apiId").val();
        var apiName = $("#apiName").val();
        var apiUrl = $("#apiUrl").val();
        if (!apiId) {
            bootbox.alert("请填写APIID");
        }
        if (!apiName) {
            bootbox.alert("请填写API名称");
        }
        if (!apiUrl) {
            bootbox.alert("请填写API调用地址");
        }
        $("#addForm").submit();
    });

    $("#setArgs").on("click", function () {
        document.getElementById("addForm3").reset();
        $("#myModal3").modal("show");
    });

    function frameLoaded3() {
        var resultFrame = document.getElementById("resultFrame3");
        var result = $("#resultFrame3").contents().find("body").html();
        if (result) {
            result = JSON.parse(result);
            if (result.state == "ok") {
                bootbox.alert("保存成功", function () {
                    window.location.reload();
                });
                $("#myModal3").modal("hide");
            } else {
                bootbox.alert(result.msg, function () {
                });
            }
        }
    }

    $("#submitBtn3").click(function () {
        $("#addForm3").submit();
    });

    $("#addApiToken").on("click", function () {
        document.getElementById("apiTokenAddForm").reset();
        $("#apiTokenId").val("");
        $("#apiTokenModal").modal("show");
    });

    function frameLoaded4() {
        var resultFrame = document.getElementById("resultFrame4");
        var result = $("#resultFrame4").contents().find("body").html();
        if (result) {
            result = JSON.parse(result);
            if (result.state == "ok") {
                bootbox.alert("保存成功", function () {
                    window.location.reload();
                });
                $("#apiTokenModal").modal("hide");
            } else {
                bootbox.alert(result.msg, function () {
                });
            }
        }
    }

    $("#apiTokenSubmitBtn").click(function () {
        $("#apiTokenAddForm").submit();
    });

    $(".gen").click(function () {
        var str = '';
        var array = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        for (var i = 0; i < 32; i++) {
            str += array[parseInt(Math.random() * 32)];
        }
        $(this).parent().prev("input").val(str.toUpperCase());
    });

});