//#import Util.js
//#import excel.js
//#import sku.js
//#import brand.js
//#import product.js
//#import DateUtil.js
//#import DynaAttrUtil.js
//#import doT.min.js

(function () {
    var m = $.params["m"] || $.getDefaultMerchantId();
    var merchantId = $.params["merchantId"];
    var res = {state: "error"};

    if (!merchantId) {
        res.msg = "merchantId不能为空";
        out.print(JSON.stringify(res));
        return
    }
    var index = 0;
    var titles = [
        {"index": index++, "columnWidth": "22", "title": "商品货号/款号", "field": "productNumber"},
        {"index": index++, "columnWidth": "12", "title": "商品编码", "field": "skuId"},
        {"index": index++, "columnWidth": "12", "title": "条形码", "field": "barcode"},
        {"index": index++, "columnWidth": "30", "title": "商品名称", "field": "name"},
        {"index": index++, "columnWidth": "12", "title": "商品描述", "field": "content"},
        {"index": index++, "columnWidth": "12", "title": "商品主分类", "field": "columnName"},
        //{"index": index++, "columnWidth": "12", "title": "商品营销分类", "field": "columnName2"},       //????
        {"index": index++, "columnWidth": "12", "title": "商品品牌", "field": "brandName"},
        {"index": index++, "columnWidth": "12", "title": "单位", "field": "sellUnitName"},
        {"index": index++, "columnWidth": "12", "title": "可卖数", "field": "SellableCount"},
        {"index": index++, "columnWidth": "12", "title": "重量（KG）", "field": "weight"},
        {"index": index++, "columnWidth": "12", "title": "体积（ML/cm³）", "field": "volume"},
        {"index": index++, "columnWidth": "12", "title": "长（cm）", "field": "length"},
        {"index": index++, "columnWidth": "12", "title": "宽（cm）", "field": "wide"},
        {"index": index++, "columnWidth": "12", "title": "高（cm）", "field": "high"},
        {"index": index++, "columnWidth": "12", "title": "市场价", "field": "marketPrice"},
        {"index": index++, "columnWidth": "12", "title": "最低安全售价", "field": "securitySellPrice"},
        {"index": index++, "columnWidth": "12", "title": "售价", "field": "utilPrice"},
        {"index": index++, "columnWidth": "12", "title": "标签", "field": "tag"},
        {"index": index++, "columnWidth": "12", "title": "卖点", "field": "sellingPoint"},
        {"index": index++, "columnWidth": "12", "title": "seo标题", "field": "seo_title"},
        {"index": index++, "columnWidth": "12", "title": "seo关键字", "field": "seo_keywords"},
        {"index": index++, "columnWidth": "12", "title": "seo描述", "field": "seo_description"},
        {"index": index++, "columnWidth": "12", "title": "仓库属性", "field": "warehouseType"}
    ];

    //动态属性
    var extendAttrs = "型号,功率,价格,档位,颜色,是否折叠,挂钩,电源线长度,产地,额定电压,额定功率,毛重,包装尺寸,面板材质,控制方式,预约功能,防水功能,净重,产品尺寸,包装尺寸,内胆数量,内胆材质,实用功能,定时功能,预约功能,保温功能,防干烧自动断电,加热方式,液晶显示,电机材质,风雷模式,风力档位,定时范围,摇头方式,送风原理,光触媒,负离子,导风轮,跌倒自停,升降固定,网箍固定,扇叶片,扇叶片数,扇叶直径,对壳材料,缺水提示,防干燥,档位,蒸汽持续时间,水箱容量,发热器材质,导气管材质,支挂杆材质,适合挂烫的衣服,工艺,材质,是否带盖,适合火源,水箱容积,额定加湿量,噪声,操作方式,加湿方式,缺水断电保护,注水口位置,出雾口数量,负离子功能,其他功能,睡眠模式,自动运转功能,净烟功能,定时模式,耗电量,滤网使用寿命,空气湿度指示,空气质量只是,是否多层滤网,负离子功能,适合面积,过滤方式,滤芯,日处理水量（升）,水压范围,温度范围,水质要求,滤芯使用寿命提示,过滤层级,出水模式,反冲洗模式,是否可自行安装,蒸汽功能,童锁功能,微博功率,门锁类型,供电方式,刀头,充电时长,替换刀头型号,刀头水洗,全身水洗,机身材料,电源线存储装置,防滑胶脚,速度调节选择,刀头数量,果渣储藏罐容量,电机转速（转/分）,产品尺寸（长*宽*高)mm,包装尺寸（长*宽*高)mm,额定电压（V）,额定功率（W）";
    extendAttrs = extendAttrs.split(",");
    for (var i = 0; i < extendAttrs.length; i++) {
        var extAttr = extendAttrs[i];
        titles.push({
            "index": index++,
            "columnWidth": "12",
            "title": extAttr,
            "field": extAttr
        })
    }

    var excelContext = [];
    var productIds = ProductService.getProductIds("c_10000", merchantId, 0, -1);
    for (var i = 0; i < productIds.length; i++) {
        var productId = productIds[i];
        var product = ProductService.getProduct(productId);
        var headSku = ProductService.getHeadSku(productId);//默认sku;
        var column = ProductService.getColumn(product.columnId);//分类
        //var multiColumn = ProductService.getMultiColumnIds(productId);//营销分类
        var brand = BrandService.getBrand(product.brandColumnId);//品牌
        //if (multiColumn.length > 0) {
        //    for (var j = 0; j < multiColumn.length; j++) {
        //        var obj = multiColumn[j];
        //        out.print(JSON.stringify(ProductService.getColumn(obj)))
        //    }
        //    return
        //}
        var excelObj = {};

        excelObj.productNumber = product.productNumber || "";   //货号;
        excelObj.skuId = headSku.skuId || "";       //默认sku外部Id;
        excelObj.barcode = headSku.barcode || "";   //默认sku条形码;
        excelObj.name = product.name || "";         //商品名
        excelObj.content = product.content || "";   //商品描述
        excelObj.columnName = column ? column.name || "" : "";    //分类名称
        excelObj.columnName2 = "";      //商品营销分类
        excelObj.brandName = brand ? brand.name || "" : "";     //品牌
        excelObj.sellUnitName = product.sellUnitName || "";     //单位
        excelObj.SellableCount = ProductService.getSellableCount(productId, headSku.id);//可卖数
        excelObj.weight = product.weight || "";   //重量
        excelObj.volume = product.volume || "";   //体积
        excelObj.length = product.length || "";   //长
        excelObj.wide = product.wide || "";   //宽
        excelObj.high = product.high || "";   //高
        excelObj.marketPrice = ProductService.getMarketPrice(product) || "";//市场价
        excelObj.securitySellPrice = getSecuritySellPrice(product);      //最低安全售价
        excelObj.utilPrice = ProductService.getRealPayPrice(product.createUserId, product.merchantId, productId, headSku.id) / 100;//售价
        excelObj.tag = product.tag || "";                   //标签
        excelObj.sellingPoint = product.sellingPoint || ""; //卖点
        excelObj.seo_title = product.seo_title;             //seo标题
        excelObj.seo_keywords = product.seo_keywords;       //seo关键字
        excelObj.seo_description = product.seo_description; //seo描述
        excelObj.warehouseType = product.warehouseType || "";   //仓库属性
        if (excelObj.warehouseType == "01") {
            excelObj.warehouseType = "干货"
        } else if (excelObj.warehouseType == "02") {
            excelObj.warehouseType = "生鲜"
        }

        var attrs = getAttrs(product);
        for (var j = 0; j < extendAttrs.length; j++) {
            var extAttrName = extendAttrs[j];
            excelObj[extAttrName] = "";
            for (var k = 0; k < attrs.length; k++) {
                var attrObj = attrs[k];
                if (extAttrName == attrObj.name) {
                    excelObj[extAttrName] = attrObj.value || "";
                    break;  //找到则推退出
                }
            }

        }
        excelContext.push(excelObj);
    }

    if (excelContext.length > 0) {
        var export_file_type = "checkProductAttrsList";
        var fileName = "HRT_" + merchantId + " " + DateUtil.getLongDate((new Date()).getTime());
        var result = Excel.createExcelList(m, fileName, export_file_type, titles, excelContext);
        if (result == "ok") {
            //res.state = "ok";
            //res.msg = "导出成功！可在日志中查看";
            var histories = Excel.getExcelList4History(m, export_file_type, "10");
            var pageData = {histories: histories};
            var template =
                "{{~it.histories:value:index}}" +
                "{{=value.fileName}} -> " +
                "<a href='{{=value.url}}' target='_blank'>下载</a><br>" +
                "{{~}}";
            var pageFn = doT.template(template);
            out.print(pageFn(pageData));

        } else {
            res.state = "error";
            res.msg = "导出失败！";
            out.print(JSON.stringify(res))
        }

    } else {
        res.msg = "没有任何数据导出";
        out.print(JSON.stringify(res))
    }


    ////////function/////
    function getSecuritySellPrice(product) {
        var price = product.price;
        if (!price) {
            return null;
        }
        for (k in price.values) {
            var skuValues = price.values[k];
            var key = ProductService.getPriceValueKey("entitytype_other", "entity_securitySellPrice");
            var prices = skuValues[key];
            //在多个prices中找到我们想要的
            if (prices) {
                for (var i = 0; i < prices.length; i++) {
                    var p = prices[i];
                    if (p.payable == 'N' && p.moneyTypeId == 'moneytype_RMB') {
                        return p.unitPrice / 100;
                    }
                }
            }
        }
        return "";
    }//最低安全售价
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
                    attr.value = dynaAttrs[key].value;
                    attrs.push(attr);
                }
            }
        }
        return attrs;
    }
})();