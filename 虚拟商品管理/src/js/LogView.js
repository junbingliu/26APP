$(document).ready(function () {
    var $dataPanel = $("#dataPanel");
    $($dataPanel).on('click', ".importLog", function() {
        var logId = $(this).attr("data-a");
        var $refreshLogDetail = $("#refreshLogDetail");
        $refreshLogDetail.attr("data-a", logId);
        $refreshLogDetail.show();
        $(".importLog").removeClass("active");
        $(this).addClass("active");
        loadImportLog(logId);
    });

    $($dataPanel).on('click', "#refreshLogDetail", function() {
        var logId = $(this).attr("data-a");
        loadImportLog(logId);
    });

    if(logId && logId != ""){
        loadImportLog(logId);
    }
});

function loadImportLog(logId) {
    var postData = {};
    postData.m = merchantId;
    postData.logId = logId;
    $.ajax({
            url: "LoadLog.jsx",
            type: "post",
            data: postData,
            dataType: 'html',
            success: function (data) {
                var divShow = $("#importLogDetail");
                divShow.html("");
                divShow.append(data);
            }
        }
    );
}



