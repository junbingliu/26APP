$(document).ready(function () {

    $("body").on('click', "#search", function () {
        var QRCodeUrl = $("#QRCodeUrl").val();
        var QRCodeList =[];
        var htmlList = [];
        if(QRCodeUrl){
            QRCodeList= QRCodeUrl.split("|");
        }


        {/*<p style="margin: 0 auto;width: 200px; height: 84px;overflow: hidden;word-break: break-all;">'+QRCode+'</p>*/}
        if (QRCodeList && QRCodeList.length > 0) {
            for (var i = 0; i < QRCodeList.length; i++) {
                var QRCode = QRCodeList[i];
                var html = '<div class="col-xs-3 col-md-3"> <a href="javascript:;" class="thumbnail thumbnail'+i+'" style=" margin: 0 auto;width: 200px; display: block;"> </a> <textarea class="form-control" style="margin: 0 auto;width: 200px; height: 51px;">'+QRCode+'</textarea> </div>';
                htmlList.push(html);
            }

        }


        $("#QRCodeHtml").html(htmlList);

        if (QRCodeList && QRCodeList.length > 0) {
            for (var i = 0; i < QRCodeList.length; i++) {
                var QRCode = QRCodeList[i];
                $(".thumbnail" + i).qrcode({
                    render: "image",
                    size: 200,
                    text: QRCode,
                    background: "#ffffff"
                })
            }

        }

    });

});

