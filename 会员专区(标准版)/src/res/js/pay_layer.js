/**
 * Created by mk on 2015-03-16.
 */


function _goTo(value,orderId,payInterfaceId){
    if(value == undefined || value == null || value == ""){
        alert("系统异常，请联系管理员！");
        return false;
    }

    var url = "/ucenter/to_pay.html?id="+ orderId;
    var valSplit = value.split(":");
    if(valSplit.length == 2){
        var paymentId = valSplit[0];
        var bankCode = valSplit[1];
        if(paymentId == ""){
            alert("系统异常，请联系管理员！");
            return false;
        }
        url += "&paymentId=" + paymentId;
        if(bankCode != ""){
            url += "&bankCode=" + bankCode;
        }
    }else if(valSplit.length == 1){
        var paymentId = valSplit[0];
        if(paymentId == ""){
            alert("系统异常，请联系管理员！");
            return false;
        }
        url += "&paymentId=" + paymentId;
    }
    window.open(url);
}