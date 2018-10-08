
/**
 * 页面搜索参数拼接与跳转，当遇到相同key值的参数，将替换原值。
 * 当加入replaceParam时，将直接替换匹配的href值
 * @param 需要加入的请求参数例如：keyword="test"
 * @param 参数的名字
 * @param 需要替换的参数
 */
var url;
function redirect(href,key,replaceParam,notRedirect){
    var curUrl=url||window.location.href;
    var hasArg=curUrl.indexOf("?");
    //判断是否已存在完全相同的参数
    if(curUrl.indexOf(href)>0){
        if(replaceParam){
            url=curUrl.replace(href, replaceParam);
        }else{
            url=curUrl;
        }
        if(!notRedirect)window.location.href=url;
        return;
    }
    var paramStartIndex=curUrl.indexOf(key);
    if(paramStartIndex!=-1){
        var paramEndIndex=curUrl.indexOf("&",paramStartIndex);
        if(paramEndIndex==-1){
            paramEndIndex=curUrl.length;
        }
        var oldParam=curUrl.substring(paramStartIndex,paramEndIndex);
        var newUrl=curUrl.replace(oldParam, href);
        url=newUrl;
        if(!notRedirect)window.location.href=newUrl;
        return;
    }
    if(hasArg>0){
        var newUrl=curUrl+"&"+href;
        url=newUrl;
        if(!notRedirect)window.location.href=newUrl;
    }else{
        var newUrl=curUrl+"?"+href;
        url=newUrl;
        if(!notRedirect)window.location.href=newUrl;
    }

}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

function jumps(val){
   var url = delQueStr(location.href,'displayStyle');

        window.location.href=url+"&displayStyle="+val;


}
//删除url参数
function delQueStr(url, ref) {
    var str = "";
    if (url.indexOf('?') != -1) {
        str = url.substr(url.indexOf('?') + 1);
    }
    else {
        return url;
    }
    var arr = "";
    var returnurl = "";
    var setparam = "";
    if (str.indexOf('&') != -1) {
        arr = str.split('&');
        for (i in arr) {
            if (arr[i].split('=')[0] != ref) {
                returnurl = returnurl + arr[i].split('=')[0] + "=" + arr[i].split('=')[1] + "&";
            }
        }
        return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1);
    }
    else {
        arr = str.split('=');
        if (arr[0] == ref) {
            return url.substr(0, url.indexOf('?'));
        }
        else {
            return url;
        }
    }
}
/*添加收藏*/
function favoriteProduct(id) {
    var params = {};
    params["objId"] = id;
    params["type"] = "product";
    $.post("ajax/favor_add_handler.jsp", params, function(msg) {
        var data = $.trim(msg);
        if (data == "none") {
            window.location.href="/login.html?redirectURL="+window.location.href;
        } else if (data == "ok") {
            alert("收藏成功!");
        } else if (data == "existed") {
            alert("此商品已收藏过!");
        } else {
            alert("系统繁忙请稍后再试！");
        }

    });
}

$(document).ready(function(){

        $(".mod_category .item").click(function(){
            $(this).toggleClass("show");
        });
        $(".price dl").mouseenter(function(){
            $("dt",$(this)).show();
        }).mouseleave(function(){
            $("dt",$(this)).hide();
        })
        $(".price .but2").click(function(){
            $(".price input").val("");
        })
        $(".price .but1").click(function(){
            redirect("lowTotalPrice="+$("#lowTotalPrice").val(),"lowTotalPrice",null,true);
            redirect("highTotalPrice="+$("#highTotalPrice").val(),"highTotalPrice",null);
        })
        $(".proList li").mouseenter(function(){
            $(".proList li").removeClass("cur");
            $(this).addClass("cur");
        }).mouseleave(function(){
                $(".proList li").removeClass("cur");
            })

})

var skuSelector;
var skuLayer;
$(document).ready(function () {
    var initconfigs = {
        getAttrsUrl: "/appMarket/appEditor/getProductAttrs.jsp",
        completeUrl: "/shopping/handle/cart_add_handler.jsp",
        attr_container: ".attrBox",
        loadAfterEvent: {
            fireEvent: function () {
                doLoadAfterEvent();
            }
        },
        completeAfterEvent: {
            fireEvent: function () {
                layer.close(skuLayer);
            }
        }
    };
    skuSelector = new $.SkuSelector(initconfigs);

    $('.addtocart').bind('click', function () {
        var $this = $(this);
        var productId = $this.attr("productId");
        var config = {productId:productId};
        skuSelector.load(config);
    });

    function doLoadAfterEvent() {
        if (!skuSelector) {
            return;
        }
        var html = '<div style="margin: 5px;">';
        html += '<div class="attrBox"><div class="frame">';
        html += '<ul><li class="choose ver"><span>数量：</span><div class="num"><a id="decrease" style="padding: 0px;border: 0px" href="javascript:void(0);"></a><input type="text" name="num" id="num" value="1"><a id="add" style="padding: 0px;border: 0px" class="add" data-bind="click:decrease" href="javascript:void(0);"></a><div></li>';
        for (var i = 0; i < skuSelector.attrs.length; i++) {
            var attr = skuSelector.attrs[i];
            html += '<li class="choose ver">';
            html += '<span>' + attr.name + '：</span>';
            html += '<div>';
            if (attr.values) {
                for (var j = 0; j < attr.values.length; j++) {
                    var value = attr.values[j];
                    html += '<a href="javascript:;" class="doClickValue" attrId="' + attr.id + '" valueId="' + value.id + '">' + value.name + '<i></i></a>';
                }
            }
            html += '</div>';
            html += '</li>';
        }
        html += '</ul></div>';
        html += '<div class="tips"></div>';
        html += '<div class="btns"><a href="javascript:void(0)" class="btn_01 doSelectSkuBtn">确认</a></div>';
        html += '</div></div>';

        skuLayer = $.layer({
            type: 1,
            title: "请选择规格",
            shade: [0.3 , '#000' , true],
            area: ['430px', '260px'],
            page: {
                html: html,
                ok: function () {
                }
            }
        });
    }

});
function InventoryAttr(inventoryAttr){
    var self = this;
    self.name = (inventoryAttr.name);
    self.type = (inventoryAttr.type);
    self.id = (inventoryAttr.id);
    self.userOperation = (inventoryAttr.userOperation);
    self.skuSelectListener = null;

    var validStandardValues = [];
    $.each(inventoryAttr.standardValues,function(idx,sv){
        if(sv.isValid){
            validStandardValues.push(new StandardValue(sv));
        }
    });

    self.standardValues = (validStandardValues);
    self.getSelectedValue = function(){
        for(var i=0; i<self.standardValues().length; i++){
            var sv = self.standardValues()[i];
            if(sv.selected()){
                return sv.id();
            }
        }
        return null;
    }

        $.each(self.standardValues(),function(idx,sv){
            if(sv.isValid){
                result.push(sv);
            }
        });
        return result;

}

function getInventoryAttr(attrId){
    for(var i=0; i<self.inventoryAttrs().length; i++){
        var attr = self.inventoryAttrs()[i];
        if(attr.id()==attrId){
            return attr;
        }
    }
    return null;
}
function selectedSkuId(skus){
    if(skus.length==1){
        return skus[0].id;
    }
    for(var i=0; i<skus.length; i++){
        var sku = skus[i];
        if(!sku.attrs || sku.isHead()){
            continue;
        }
        var isMatch = true;
        for(k in sku.attrs){
            var attrId = k;
            var attrValue = sku.attrs[k];
            var inventoryAttr = getInventoryAttr(attrId);
            if(!inventoryAttr){
                isMatch = false;
                break;
            }
            if(!inventoryAttr.getSelectedValue() ||  inventoryAttr.getSelectedValue()!=attrValue){
                isMatch = false;
                break;
            }
        }
        if(isMatch){
            return sku.id();
        }
    }
    return null;
};

