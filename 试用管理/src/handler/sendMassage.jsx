//#import Util.js
//#import NoticeTrigger.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 推送消息
 */
(function () {
    var activeId = $.params.id;
    if(!activeId){
        var label = {
            "messageSubType":"tryUse",
            "messagePageType":"tryUse",
            "\\[activity:id\\]":"",
            "\\[activity:title\\]":"",
            "\\[activity:introduction\\]":""
        };
        var status =  NoticeTriggerService.send("u_public", "notice_56900", "head_merchant", label);
        out.print(JSON.stringify({status:status}));
        return;
    }
    activeId = activeId.split(",");
    for(var i = 0; i < activeId.length; i++){
        var obj = tryOutManageServices.getById(activeId[i]);
        var label = {
            "messageSubType":"tryUse",
            "messagePageType":"tryUse",
            "\\[activity:id\\]":activeId[i],
            "\\[activity:title\\]":obj.title,
            "\\[activity:description\\]":obj.description
        };
        if(obj){
        var status =  NoticeTriggerService.send("u_public", "notice_56500", "head_merchant", label);
        }
    }
    out.print(JSON.stringify({status:status}));
})();