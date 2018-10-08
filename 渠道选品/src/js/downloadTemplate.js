$(document).ready(function () {
    $("#setDownLoadModal").click(function () {
        setDownloadTemplate();
    });

    function setDownloadTemplate(callback) {
        $.get("../handle/setdownLoadModal.jsx", function (res) {
            alert(res.msg);
            if (callback) {
                callback(res.url);
            }
        }, "json");
    }

    $("#download").bind("click", function () {
        var array = histories && JSON.parse(histories) || [];
        if (array.length == 0 || !histories) {
            //alert("还没有模板，请点击页面右上角的一键设置模板");
            setDownloadTemplate(function (url) {
                window.location.href = url;
            });

        } else {
            window.location.href = array[0].url +"&fileName=" + array[0].fileName;
        }
    })


});




