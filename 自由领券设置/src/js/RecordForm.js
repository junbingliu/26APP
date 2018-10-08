
$(document).ready(function () {

    var $body = $("body");
    $body.on('click', "#saveUpdateBtn", function () {
        var $importDataForm=$("#importDataForm");
        $importDataForm.submit();
        window.location.href="RecordList.jsx?m=" + merchantId +"&t=all";
    });

});


