//#import Util.js
//#import login.js
//#import merchant.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {
    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }
        // var label = $.params.label;
        // // var content = $.params.content;
        // if (!label) {
        //     result.code = "102"
        //     result.msg = "标签名称不能为空！"
        //     out.print(JSON.stringify(result));
        //     return;
        // }
        var id = $.params.id;
        var merchantId = $.params.m || "";
        var jNew = PushManagementService.getNew(id);
        if (!jNew || jNew == "" || jNew == undefined || jNew == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "不存在对应的数据";
            out.print(JSON.stringify(result));
            return;
        }
        PushManagementService.pigeonLock(id);
        var pushTarget_value = $.params.pushTarget_value || "";
        var toTriggerState_value = $.params.toTriggerState_value || "";
        var pushServer_value = $.params.pushServer_value || "";
        var pushContentSetUp_value = $.params.pushContentSetUp_value || "";
        var pushStatement_value = $.params.pushStatement_value || "";
        var pushContent_value = $.params.pushContent_value || "";
        var needToUpdate = false;
        if (pushTarget_value == "" || !pushTarget_value || pushTarget_value == undefined || pushTarget_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送对象";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.pushTarget_value === pushTarget_value) {

            } else {
                jNew.pushTarget_value = pushTarget_value;
                needToUpdate = true
            }
        }
        if (toTriggerState_value == "" || !toTriggerState_value || toTriggerState_value == undefined || toTriggerState_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择触发状态";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.toTriggerState_value === toTriggerState_value) {

            } else {
                jNew.toTriggerState_value = toTriggerState_value;
                needToUpdate = true
            }
        }
        if (pushServer_value == "" || !pushServer_value || pushServer_value == undefined || pushServer_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送渠道";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.pushServer_value === pushServer_value) {

            } else {
                jNew.pushServer_value = pushServer_value;
                needToUpdate = true
            }
        }
        if (pushContentSetUp_value == "" || !pushContentSetUp_value || pushContentSetUp_value == undefined || pushContentSetUp_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送内容选择";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.pushContentSetUp_value === pushContentSetUp_value) {

            } else {
                jNew.pushContentSetUp_value = pushContentSetUp_value;
                needToUpdate = true
            }
        }
        if (pushStatement_value == "" || !pushStatement_value || pushStatement_value == undefined || pushStatement_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先选择推送状态";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.pushStatement_value === pushStatement_value) {

            } else {
                jNew.pushStatement_value = pushStatement_value;
                needToUpdate = true
            }
        }
        if (pushContent_value == "" || !pushContent_value || pushContent_value == undefined || pushContent_value == null) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "请先填写推送内容";
            out.print(JSON.stringify(result));
            return;
        } else {
            if (jNew.pushContent_value === pushContent_value) {

            } else {
                jNew.pushContent_value = pushContent_value;
                needToUpdate = true
            }
        }
        if (!needToUpdate) {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "内容没有变更，不做更新。";
            out.print(JSON.stringify(result));
            return;
        }
        jNew.loginUserId = loginUserId;
        jNew.merchantId = merchantId;
        var ret = PushManagementService.updatePushOperationRecord(jNew);
        if (ret.RETURN_CODE && ret.RETURN_CODE == "S0A00000") {
            result.RETURN_CODE = "S0A00000";
            result.RETURN_DESC = "修改成功！";
        } else {
            result.RETURN_CODE = "S0A00001";
            result.RETURN_DESC = "修改失败！";
        }
        out.print(JSON.stringify(result));
        return;
    } catch (e) {
        result.RETURN_CODE = "S0A00001";
        result.RETURN_DESC = "操作出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    } finally {
        PushManagementService.pigeonUnLock(id);
    }
})();

