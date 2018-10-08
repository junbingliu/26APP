//#import Util.js
//#import login.js
//#import user.js
//#import jobs.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {
    var result = {
        RETURN_CODE: "S0A00000",//成功【S0A00000】，失败【S0A00001】
        RETURN_DESC: ""
    };
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }
        var merchantId = $.params.m || "";
        var pushTarget_value = $.params.pushTarget_value || "";
        var toTriggerState_value = $.params.toTriggerState_value || "";
        var pushServer_value = $.params.pushServer_value || "";
        var pushContentSetUp_value = $.params.pushContentSetUp_value || "";
        var pushStatement_value = $.params.pushStatement_value || "";
        var pushContent_value = $.params.pushContent_value || "";
        if (pushTarget_value == "" || !pushTarget_value || pushTarget_value == undefined || pushTarget_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送对象";
            out.print(JSON.stringify(result));
            return;
        }
        if (toTriggerState_value == "" || !toTriggerState_value || toTriggerState_value == undefined || toTriggerState_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择触发状态";
            out.print(JSON.stringify(result));
            return;
        }
        if (pushServer_value == "" || !pushServer_value || pushServer_value == undefined || pushServer_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送渠道";
            out.print(JSON.stringify(result));
            return;
        }
        if (pushContentSetUp_value == "" || !pushContentSetUp_value || pushContentSetUp_value == undefined || pushContentSetUp_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送内容选择";
            out.print(JSON.stringify(result));
            return;
        }
        if (pushStatement_value == "" || !pushStatement_value || pushStatement_value == undefined || pushStatement_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送状态";
            out.print(JSON.stringify(result));
            return;
        }
        if (pushContent_value == "" || !pushContent_value || pushContent_value == undefined || pushContent_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先填写推送内容";
            out.print(JSON.stringify(result));
            return;
        }
        var jNew = {//组装数据
            pushTarget_value: pushTarget_value,
            toTriggerState_value: toTriggerState_value,
            pushServer_value: pushServer_value,
            pushContentSetUp_value: pushContentSetUp_value,
            pushStatement_value: pushStatement_value,
            pushContent_value: pushContent_value,
            createMerchantId: merchantId
        };
        jNew.loginUserId = loginUserId;
        jNew.merchantId = merchantId;
        // if (!label) {
        //     result.code = "102"
        //     result.msg = "参数为空！"
        //     // $.log("\n\n\n\n orderListName== \n\n\n\n"+JSON.stringify(orderListName)+"\n\n\n\n orderListName== \n\n\n\n");
        //     out.print(JSON.stringify(result));
        //     return;
        // }
        // //获取所有的订单标签的名称出来，逐个检验
        // var oldStart = 0;
        // var oldLimit = labelService.getAllNewListSize();
        // var orderListName = labelService.getAllNewList(oldStart, oldLimit);
        // for (var i = 0; i < orderListName.length; i++) {
        //     var old = orderListName[i].label
        //     if (label == old) {
        //         result.code = "103"
        //         result.msg = "该订单标签已存在！"
        //         out.print(JSON.stringify(result));
        //         return;
        //     }
        // }
        // jNew.label = label;
        // // jNew.content = $.params.content;  //描述
        var newId = PushManagementService.addPushOperationRecord(jNew);
        if (newId && newId != "" && newId != undefined && newId != null) {
            result.RETURN_CODE = "S0A00000";
            result.RETURN_DESC = "新增成功";
            out.print(JSON.stringify(result));
            return;
        } else {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "新增失败";
            out.print(JSON.stringify(result));
            return;
        }
    } catch (e) {
        result.RETURN_CODE = "S0A00001";
        result.RETURN_DESC = "操作出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    }
})();

