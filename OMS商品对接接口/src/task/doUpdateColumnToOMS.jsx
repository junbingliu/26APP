//#import Util.js
//#import product.js
//#import column.js
//#import underscore.js
//#import esb.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbOrder:services/OmsESBUtil.jsx
;
(function () {

    var logContent = "";
    var logType = "omsEsb_column";
    var serviceId = "2E150000000002";//商品目录对接接口
    try {
        var jColumn = ColumnService.getColumnByState(columnId, false);
        if (!jColumn) {
            return;
        }

        var columnType = jColumn.columntype;
        if (columnType != "coltype_standardProduct") {
            //只对接商品主分类
            return;
        }

        if (!action) {
            return;
        }

        if(action == "Delete" && !jColumn.isDeleted){
            return;
        }
        if(action == "Delete"){
            action = "Delete";
        }else if(action == "Create"){
            action = "Create";
        }else {
            action = "Modify";
        }

        var categorys = [];
        var jSmallColumn = {};
        jSmallColumn.categoryid = jColumn.id;
        jSmallColumn.parentid = jColumn.parentId;
        jSmallColumn.description = jColumn.name;
        jSmallColumn.action = action;
        categorys.push(jSmallColumn);

        var sn = EsbService.getSerialNumber();
        var mac = "";
        var requestData = {
            categorys:categorys
        };
        var omsEsb_url = EsbUtilService.getOMSEsbUrl();//获取OMS对接地址

        requestData = JSON.stringify(requestData);
        var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
        //$.log("............................xmlData=" + xmlData);

        var jResult = EsbService.soapPost(omsEsb_url,xmlData);
        if (!jResult) {
            logContent = "商品分类ID为【" + columnId + "】接口对接失败，失败原因：数据返回格式异常";
            OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
            return;
        }

        var jEsbResponse = EsbService.getEsbResponse(jResult);
        if (!jEsbResponse) {
            logContent = "商品分类ID为【" + columnId + "】接口对接失败，失败原因：RESPONSE数据返回格式异常";
            OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
            return;
        }
        var returnCode = jEsbResponse.RETURN_CODE;
        var returnDesc = jEsbResponse.RETURN_DESC;
        var returnData = jEsbResponse.RETURN_DATA;
        if (returnCode == "S000A000") {
            //对接成功，什么都不做
            //logContent = "商品ID为【" + productId + "】接口对接成功，返回代码：" + JSON.stringify(jEsbResponse);
            //OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
            return;
        }

        logContent = "商品分类ID为【" + columnId + "】接口对接失败，失败原因：" + JSON.stringify(jEsbResponse);
        OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
    } catch (e) {
        logContent = "商品分类ID为【" + columnId + "】接口对接失败，失败原因：" + e;
        OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
    }

})();
