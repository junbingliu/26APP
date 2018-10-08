//#import Util.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx

/**
 * OLE咨询频道: 栏目获取
 * @author fuxiao9
 * @date 2017-07-10
 * @email fuxiao9@crv.com.cn
 */
;(function () {
    try {
        // OLE咨询专栏ID
        var columnId = InformationService.getInfoColumnId();
        Preconditions.checkArgument(columnId, "未设置专栏ID");
        
        // 获取栏目服务类
        var list = InformationService.getChildInfoByPID(columnId) || []; // 获取OLE咨询栏目总分类, 在App初始页面中设置
        $.log("\n\n\n ole information column length = " + list.length + "\n\n\n");
        var columnList = list.map(function (column) {
            var child = [];
            if (column["hasChild"]) {
                child = column["childColumn"].map(function (c) {
                    return {
                        "id": c["id"], // 咨询栏目ID
                        "name": c["name"], // 咨询栏目名称
                        // "description": html2Escape(c["description"] || ""), // 咨询栏目描述
                        "description": "",
                        "images": InformationService.regExpImgUrl(c["description"] || "") // 图片
                    }
                })
            }
            return {
                "id": column["id"], // 咨询栏目ID
                "name": column["name"], // 咨询栏目名称
                "childColumn": child,
                // "description": html2Escape(column["description"] || ""), // 咨询栏目描述
                "description": "", // 咨询栏目描述
                "images": InformationService.regExpImgUrl(column["description"] || "") // 图片
            }
        });
        ResponseUtil.success({
            "columnList": columnList
        });
    } catch (e) {
        ResponseUtil.error(e.message)
    }
})();

/**
 * HTML标签转为转意符
 * @param sHtml
 * @return {void|string|XML|*}
 */
function html2Escape(sHtml) {
    return sHtml.replace(/[<>&"]/g, function (c) {
        return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
    });
}