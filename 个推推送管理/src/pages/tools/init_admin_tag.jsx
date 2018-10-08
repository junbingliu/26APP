//#import Util.js
//#import $ewjEKD:services/UserAdminService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    //这个jsx是初始化所有拣货员和配送员，给他们设置tag，用于发送消息
    var userAdminList = UserAdminService.getAllUserAdminList(0, -1);
    var successCount = 0;
    for (var i = 0; i < userAdminList.length; i++) {
        var jUser = userAdminList[i];
        if (!jUser || !jUser.clientId) {
            continue;
        }

        var result = GetuiExchangeUtil.setTag(jUser);
        out.print(jUser.id + "," + jUser.userName + ",对接结果:" + JSON.stringify(result) + ",<br>");

    }
    out.print("成功数量 ：" + successCount);
})();