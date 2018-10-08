//#import Util.js
//#import excel.js
//#import file.js
//#import productAttr.js
//#import product.js
//#import sku.js
//#import login.js
(function () {
    function setExcel(obj) {
        var Robj = {};
        Robj.title = [];
        Robj.data = [];
        var title = obj.sheets[0].rows[0].cells;
        var data = obj.sheets[0].rows.slice(1);
        for (var i = 0; i < title.length; i++) {
            var t = {};
            t.ref = title[i].ref
            t.value = title[i].value
            Robj.title.push(t);
        }
        for (var k = 0; k < data.length; k++) {
            var obj = {};
            obj.attr = [];
            var num = 0;
            for (var j = 0; j < data[k].cells.length; j++) {
                for (var i = 0; i < Robj.title.length; i++) {
                    try{
                        if (Robj.title[i].ref.substr(0, 1) == data[k].cells[j].ref.substr(0, 1)) {
                        if (Robj.title[i].value.indexOf("erp") != -1) {
                            obj.erp = data[k].cells[j].value;
                        }
                        else if (Robj.title[i].value.indexOf("商家ID") != -1) {
                            obj.merchantId = data[k].cells[j].value;
                        }
                        else {
                            num++
                            if (data[k].cells[j].value != null) {
                                var attr = "";
                                if (data[k].cells[j].value.indexOf(":") != -1) {
                                    attr = data[k].cells[j].value.split(":")
                                }
                                else if (data[k].cells[j].value.indexOf("：") != -1) {
                                    attr = data[k].cells[j].value.split("：");
                                }
                                else {
                                    continue;
                                }
                                obj.attr.push(attr[0] + "," + attr[1] + "," + "0");
                            }
                        }
                    }
                }catch (e){
                        continue
                    }
                }
                if (j > Robj.title.length - 1) {
                    try{
                        for (var l = 0; l < data[k].cells.length - Robj.title.length; l++) {
                            if (data[k].cells[j].value.indexOf(":") != -1) {
                                attr = data[k].cells[j].value.split(":")
                            }
                            else if (data[k].cells[j].value.indexOf("：") != -1) {
                                attr = data[k].cells[j].value.split("：");
                            }
                            else {
                                continue;
                            }
                            obj.attr.push(attr[0] + "," + attr[1] + "," + "0");
                        }
                    }catch (e){
                        continue
                    }
                }
            }
            Robj.data.push(obj);
        }
        return Robj;
    }
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            var res="未登录!";
            out.print(res);
        }
        var fileInfos = $.uploadFiles("xls,xlsx,xlsm,xlsb,xltx,xltm,xlt,xlw", 10 * 1024 * 1024);
        if (fileInfos.length > 0) {
            var response = [];
            var fileInfo = fileInfos[0];
            var fileId = fileInfo.fileId;
            var url = FileService.getInternalPath(fileId);
            var ExcelObj = Excel.parse(url);
            ExcelObj = setExcel(ExcelObj);
            for (var p = 0; p < ExcelObj.data.length; p++) {
                var obj = ExcelObj.data[p];
                var productId = SkuService.getProductIdByRealSkuId(obj.merchantId, obj.erp);
                if (productId == "null") {
                    var res = {};
                    res.state = "err";
                    res.msg = "没找到该商品的信息";
                    response.push(res);
                    continue;
                }
                var product = ProductService.getProduct(productId);
                var jProductInfo = {};
                jProductInfo.productId = productId;
                jProductInfo.name = product.name;
                jProductInfo.dynaPropertyInfo = "";
                var al = obj.attr.length - 1;
                for (var i = 0; i < obj.attr.length; i++) {
                    if (i == al) {
                        jProductInfo.dynaPropertyInfo += obj.attr[i];
                    }
                    else {
                        jProductInfo.dynaPropertyInfo += obj.attr[i] + ";";
                    }
                }
                var jConfig = {};
                var dynaAttrColumns = [];
                var columnIndex = 1;
                var dynaPropertyInfo = jProductInfo.dynaPropertyInfo.split(";");
                for (var j = 0; j < dynaPropertyInfo.length; j++) {
                    var obj2 = dynaPropertyInfo[j];
                    var arr = obj2.split(",");
                    var dynaAttrColumn = {};
                    columnIndex++;
                    dynaAttrColumn.columnIndex = columnIndex.toString();
                    dynaAttrColumn.columnName = arr[0];
                    dynaAttrColumn.valueType = "0";
                    dynaAttrColumns.push(dynaAttrColumn);
                }
                jConfig.dynaAttrColumns = dynaAttrColumns;
                jConfig.isCreateNewAsBrandNotExist = false,//是不是要创建新的品牌，默认传false
                    jConfig.commonColumns = [
                        {
                            "columnKey": "productId",//属性ID
                            "columnIndex": "0",//属性所在excel中的列索引
                            "columnName": "商品ID"//列名
                        },
                        {
                            "columnKey": "name",
                            "columnIndex": "1",
                            "columnName": "商品名称"
                        }
                    ];
                jConfig.isCheckDynaAttr = false//是否检查动态属性
                try {
                    var jResult = ProductAttrService.doUpdateProduct(obj.merchantId, userId, jProductInfo, jConfig);
                    var res = {};
                    if (jResult) {
                        res.state = "ok";
                        if (jResult.code == "0") {
                            res.msg = jResult.msg;
                        }
                        else {
                            res.state = "err";
                            res.msg = jResult.msg;
                        }
                        response.push(res);
                    }
                    else {
                        res.state = "err";
                        res.msg = "修改失败";
                    }
                } catch (e) {
                    var res = {};
                    res.state = "err";
                    res.msg = "修改异常";
                    response.push(res);
                }
            }
            out.print(JSON.stringify(response));
        }
        else {
            out.print("错误");
        }
    }
    catch (e) {
        out.print(e);
    }
})()