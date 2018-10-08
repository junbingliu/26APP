//#import Util.js
//#import user.js
//#import $limitBuy:services/limitBuyService.jsx
//#import artTemplate.js


;(function(){

    var m = $.params.m;
    var productId = $.params.productId;
    // var userGroupId = $.params.userGroupId || "";   //要限购的会员组
    var userLevels = getUserLevels("c_100");//获取所有的会员组

    var allLevels = [];
    if(userLevels.subLevels) {
        getSubLevels(userLevels.subLevels, 0);
    }

    var config = LimitBuyService.getConfig(productId);
    var pageData = {m:m,productId:productId,config:config, allLevels:allLevels};
    var source = $.getProgram(appMd5,"pages/extraMain.html");
    var fn = template.compile(source);
    out.print(fn(pageData));

    /**
     * 获取用户组ID
     * @param userLevelId
     */
    function getUserLevels(userLevelId) {
        var result = UserService.getUserLevel(userLevelId);
        if (ColumnService.hasChildren(userLevelId)) {
            var children = ColumnService.getChildren(userLevelId);
            var subLevels = children.map(function (c) {
                return getUserLevels(c.id);
            });
            result.subLevels = subLevels;
        }
        else {
            result.subLevels = [];
        }
        return result;
    }

    function getSubLevels(subLevels, level) {
        var space = "";
        for (var i = 0; i < level; i++) {
            space += "--";
        }
        for (var i = 0; i < subLevels.length; i++) {
            allLevels.push({
                name: space + subLevels[i].name,
                id: subLevels[i].id
            });
            getSubLevels(subLevels[i].subLevels, level + 1);
        }

    }

})();