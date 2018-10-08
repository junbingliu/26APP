//#import Util.js
//#import excel.js
//#import file.js
//#import sku.js
//#import product.js
//#import DateUtil.js
//#import DynaAttrUtil.js
(function () {
    function setExcel(obj) {
        var Robj = {};
        Robj.title = [];
        Robj.data = [];
        var title = obj.sheets[0].rows[0].cells;
        var data = obj.sheets[0].rows.slice(1);
        for (var i = 0; i < title.length; i++) {
            var t = {};
            t.ref = title[i].ref;
            t.value = title[i].value;
            if (!t.value) {
                continue;
            }
            Robj.title.push(t);
        }
        for (var k = 0; k < data.length; k++) {
            var obj = {};
            obj.attr = [];
            var num = 0;
            obj.merchantId = data[k].cells[0].value;
            obj.erp = data[k].cells[1].value;
            for (var j = 2; j < data[k].cells.length; j++) {
                if (data[k].cells[j].value) {
                    obj.attr.push(data[k].cells[j].value)
                }

                //for (var i = 2; i < Robj.title.length; i++) {

                    //if (Robj.title[i].ref.substr(0, 1) == data[k].cells[j].ref.substr(0, 1)) {
                    //    //包含erp或者等于商品编码
                    //    //if (Robj.title[i].value.indexOf("erp") != -1 || Robj.title[i].value == "商品编码") {
                    //    //    obj.erp = data[k].cells[j].value;
                    //    //} else if (Robj.title[i].value.indexOf("商家ID") != -1) {
                    //    //    obj.merchantId = data[k].cells[j].value;
                    //    //} else {
                    //        num++
                    //        //if (data[k].cells[j].value != null) {
                    //            obj.attr.push(data[k].cells[j].value)
                    //        //}
                    //
                    //    //}
                    //
                    //
                    //}
                //}
                //if (j > Robj.title.length - 1) {
                //    for (var l = 0; l < data[k].cells.length - Robj.title.length; l++) {
                //        num++;
                //        obj.attr.push(data[k].cells[j].value);
                //    }
                //}
            }
            if(obj.merchantId){
                Robj.data.push(obj);
            }
        }
        return Robj;
    }

    function getAttrs(jProduct) {
        var columnId = jProduct.columnId;
        var jTemplate = DynaAttrService.getCompleteAttrTemplateByColumnId(columnId);
        var attrs = [];
        var jAttrs = [];
        for (var k = 0; k < jTemplate.groups.length; k++) {
            var obj = jTemplate.groups[k];
            var attrGroups = obj.attrs;
            for (var i = 0; i < attrGroups.length; i++) {
                var attrGroup = attrGroups[i];
                var jAttr = {};
                jAttr.id = attrGroup.id;
                jAttr.name = attrGroup.name;
                jAttrs.push(jAttr);
            }
        }
        var dynaAttrs = jProduct.DynaAttrs;
        for (var i = 0; i < jAttrs.length; i++) {
            var jAttr = jAttrs[i];
            for (var key in dynaAttrs) {
                if (key == jAttr.id) {
                    var attr = jAttr;
                    attr.value = dynaAttrs[key].value || dynaAttrs[key].valueId;
                    attrs.push(attr);
                }
            }
        }
        return attrs;
    }

    try {
        var m = $.params["m"];
        if (!m) {
            m = $.getDefaultMerchantId();
        }
        var fileName = $.params.fileName || "";
        var fileInfos = $.uploadFiles("xls,xlsx,xlsm,xlsb,xltx,xltm,xlt,xlw", 10 * 1024 * 1024);
        if (fileInfos.length > 0) {
            var fileInfo = fileInfos[0];
            var fileId = fileInfo.fileId;
            var url = FileService.getInternalPath(fileId);
            var ExcelObj = Excel.parse(url);

            ExcelObj = setExcel(ExcelObj);
            //out.print(JSON.stringify(ExcelObj))
            //return
            var productIds = [];
            var outList = [];
            var titleMess = [];
            for (var i = 0; i < ExcelObj.data.length; i++) {
                var obj = ExcelObj.data[i];

                $.override(titleMess, obj.attr);    //extend
                //for (var j = 0; j < obj.attr.length; j++) {
                ////    var nu = 0;
                ////    for (var k = 0; k < titleMess.length; k++) {
                ////        if (titleMess[k] != obj.attr[j]) {
                ////            nu++
                ////        }
                ////    }
                ////    if (nu == titleMess.length) {
                //        titleMess.push(obj.attr[j]);
                ////    }
                //}

                var productId = SkuService.getProductIdByRealSkuId(obj.merchantId, obj.erp);

                if (productId == "null") {
                    continue;
                }
                else {
                    var mess = {};
                    mess.productId = productId;
                    mess.erp = obj.erp;
                    mess.merchantId = obj.merchantId;
                    mess.attr = obj.attr;
                    productIds.push(mess)
                }
            }
            //var productId=SkuService.getProductIdByRealSkuId("m_520000","2064429");
            var index = 0;
            var titles = [
                {"index": index++, "columnWidth": "22", "title": "商家ID", "field": "merchantId"},
                {"index": index++, "columnWidth": "30", "title": "商品erp编码", "field": "erp"},
                {"index": index++, "columnWidth": "22", "title": "条形码", "field": "barcode"},
                {"index": index++, "columnWidth": "40", "title": "商品名", "field": "name"}
            ];
            $.log("....................titleMess:"+JSON.stringify(titleMess));
            for (var i = 0; i < titleMess.length; i++) {
                var title = {"index": index++, "columnWidth": "30", "title": titleMess[i], "field": titleMess[i]};
                titles.push(title);
            }
            for (var o = 0; o < productIds.length; o++) {
                var obj = productIds[o];
                var product = ProductService.getProduct(obj.productId);
                obj.name = product.name;
                obj.skuId = ProductService.getSkus(obj.productId)[0].id;
                var sku = SkuService.getSkuById(obj.productId, obj.skuId);
                if (sku) {
                    obj.barcode = sku.barcode;//条形码
                }
                var attrs = getAttrs(product);
                obj.attrs = attrs;
                for (var i = 0; i < obj.attr.length; i++) {
                    for (var p = 0; p < obj.attrs.length; p++) {
                        if (obj.attrs[p].name == obj.attr[i]) {
                            var attrValue = attrs[p].value;
                            if (attrValue && attrValue.indexOf("sv_") > -1) {
                                var standValue = DynaAttrService.getStandardValueByValueId(attrValue);
                                obj[attrs[p].name] = standValue && standValue.name || "";
                            } else {
                                obj[attrs[p].name] = attrs[p].value;
                            }
                        }
                    }
                    if(!obj[obj.attr[i]]){
                        obj[obj.attr[i]] = ""
                    }
                }
                delete obj.attr;
                delete obj.attrs;

                outList.push(obj);
            }
            //out.print(JSON.stringify({titles:titles,outList:outList,titleMess:titleMess}))
            //return
            var export_file_type = "checkProductAttrsList";
            var s = Excel.createExcelList(m, fileName, export_file_type, titles, outList);
            var result = {};
            if (s == "ok") {
                result.state = "ok";
                result.msg = "导出成功！可在日志中查看";
            } else {
                result.state = "error";
                result.msg = "导出失败！";
            }

            out.print(JSON.stringify(result));
        }
        else {
            out.print("错误");
        }
    }
    catch (e) {
        out.print(e);
    }
})();