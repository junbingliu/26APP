//#import Util.js
//#import sku.js
//#import product.js
//#import DateUtil.js
//#import DynaAttrUtil.js
(function () {
    var res={};
    var productId= $.params.productId;
    if(!productId){
        res.state="err";
        res.msg="请输入productId";
        out.print(JSON.stringify(res));
    }
    function getAttrs(jProduct) {
        var columnId = jProduct.columnId;
        var jTemplate = DynaAttrService.getCompleteAttrTemplateByColumnId(columnId);
        if(!jTemplate || !jTemplate.groups){
            return [];
        }
        var attrs=[];
        var jAttrs=[];
        for(var k=0; k<jTemplate.groups.length; k++){
            var obj=jTemplate.groups[k];
            var attrGroups=obj.attrs;
            for (var i = 0; i < attrGroups.length; i++) {
                var attrGroup = attrGroups[i];
                var jAttr={};
                jAttr.id=attrGroup.id;
                jAttr.name=attrGroup.name;
                jAttrs.push(jAttr);
            }
        }
        var dynaAttrs = jProduct.DynaAttrs;
        for(var i=0; i<jAttrs.length; i++){
            var jAttr=jAttrs[i];
            for (var key in dynaAttrs) {
               if(key==jAttr.id){
                  var attr=jAttr;
                   attr.value=dynaAttrs[key].value;
                   attrs.push(attr);
               }
            }
        }
        return attrs;
    }
    var product = ProductService.getProduct(productId);
    if(!product){
        res.state="err";
        res.msg="找不到该商品";
        out.print(JSON.stringify(res));
    }
    var attrs = getAttrs(product);
    res.productName=product.name;
    res.state="ok";
    res.attrs=attrs;
    out.print(JSON.stringify(res));

})()