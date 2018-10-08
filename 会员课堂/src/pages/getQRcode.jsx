//#import Util.js
//#import DateUtil.js
//#import login.js
//#import user.js
//#import @server/qrcode.jsx
(function () {
    var ret={};
    var encodeData=$.params["encodeData"];
    // var user = LoginService.getFrontendUser();//获取当前用户信息
    var loginId = LoginService.getFrontendUserId();//获取用户ID
    var BackEndloginId = LoginService.getBackEndLoginUserId();//获取用户ID
    ret.loginId=loginId;
    ret.BackEndloginId=BackEndloginId;
    // out.print("<br>loginId============>"+loginId);
    // out.print("<br>BackEndloginId============>"+BackEndloginId);
    // if(!loginId||loginId==""||loginId==undefined||loginId==null){
    //     out.print("请先登录");
    //     return;
    // }
    //todo:用户签到，修改状态
    // out.print("<br>encodeData》"+encodeData);

    if(!encodeData){
        // out.print("缺少参数encodeData，该参数加密为base64的二维码。");
        return;
    }
    encodeData=decodeURI(encodeData);
    if(encodeData&&encodeData!=""&&encodeData!=undefined&&encodeData!=null){
        ret.encodeData=encodeData;
    }
    // out.print("<br>encodeData》"+encodeData);
    var typeNumber = 10;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(encodeData);
    qr.make();
    var qrCodeDataURL=qr.createDataURL();
    var qrcodeImg="<img src="+qrCodeDataURL+" />";
    ret.qrcodeImg=qrcodeImg;
    ret.qrCodeDataURL=qrCodeDataURL;
    // out.print("<br>加密前文字："+encodeData);
    // out.print("<br>返回二维码图片："+qrcodeImg);
    // out.print("<br>返回二维码图片URL："+qrCodeDataURL);
    out.print(JSON.stringify(ret));
})();