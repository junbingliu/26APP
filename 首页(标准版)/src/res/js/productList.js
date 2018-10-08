
/**
 * 页面搜索参数拼接与跳转，当遇到相同key值的参数，将替换原值。
 * 当加入replaceParam时，将直接替换匹配的href值
 * @param 需要加入的请求参数例如：keyword="test"
 * @param 参数的名字
 * @param 需要替换的参数
 */
var url;

function readCookie(name) {
    var cookieValue = "";
    var search = name + "=";
    if (document.cookie.length > 0) {
        offset = document.cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = document.cookie.indexOf(";", offset);
            if (end == -1) end = document.cookie.length;
            cookieValue = unescape(document.cookie.substring(offset, end))
        }
    }
    return cookieValue;
}
function writeCookie(name, value, hours) {
    var expire = "";
    expire = new Date((new Date()).getTime() + 10 * 3600000);
    expire = "; expires=" + expire.toGMTString();
    document.cookie = name + "=" + escape(value) + expire + "; path=/;";
}


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
//用指定的字符串div切开str字符串后返回一个数组
function stringToArray(str, div) {
    objArr = str.split(div);
    return objArr;
}

var staticdisplay
function redraw(promo) {
    tmp = readCookie("pro_str");
    if (tmp == "") {
        staticdisplay = 1
    } else {
        staticdisplay = 0
    }
    item_arr = tmp.split("###");
    floatstr = "<form method='post' action='/compare/index.jsp?subcatid=" + readCookie("subcat") + "'  name='compare' target='_blank' style='margin:0px;'><div class='diff_items'>";
    if (item_arr.length > 0) {
        for (key in item_arr) {
            if (key) {
                tmp_info_arr = item_arr[key].split("|");
                pid = tmp_info_arr[0];
                cid = tmp_info_arr[1];
                names = tmp_info_arr[2];
                img = tmp_info_arr[3];
                price = tmp_info_arr[4];
                if (pid && names) {
                    ft = "<dl class='hadItem'><dt><img  width='50' height='50' src=\"" + img + "\"  /></dt><dd> <p class='name'><a href='#'>" + "&nbsp;" + names + "</a></p><p class='disc'><span class='price'>"+"&yen;"+price+"</span><span class='del'><a href='javascript:void(0)' onclick='del(\"" + pid + "\",\"" + cid + "\",\"" + names + "\",\"0\",\"" + img + "\",\"" + price + "\");'>删除</a></span></p></dd><input type='hidden' name='pro_id[]' value='" + pid + "'></dl>";
                    floatstr = floatstr + ft;
                }
            }
        }
        floatstr = floatstr + "</div><div class='diff_operate'><a href='javascript:void(0)'  onclick='comparecheck();' class='btn_compare_b'>对比</a><a  href='javascript:void(0);' onclick='empty();' class='del_items'>清空对比栏</a></div></form>";
        if (document.getElementById("productCompare").innerHTML != null) {
            document.getElementById("productCompare").innerHTML = floatstr;
        }
        show();
    }
}
/*添加商品对比*/
function check(subcatid, pid, names, promo, img, price) {
    add(subcatid, pid, names, promo, img,price);
}
function add(subcatid, pid, names, promo, img,price) {
//检查是否为相同的子类
    subcat_id_change(subcatid, pid, names, img)
    //读出产品串后用函数返回一个数组
    tmp = readCookie("pro_str");
//检查数组的个数（即选择产品的个数）
    tmp_arr = stringToArray(tmp, "###");
    if (tmp_arr.length < 5) {
        //看是否有相同的产品已被选择�
        if (tmp.indexOf(pid) != -1) {
            alert("（" + names + "）已经选择了！！！");
        }
        else if (tmp_arr.length > 1 && tmp.indexOf(subcatid) == -1) {
            alert("对不起，您只能选择同类产品比较！");
        }
        else {
            writeCookie("pro_str", tmp + pid + "|" + subcatid + "|" + names + "|" + img + "|"+price+"###");
            $("a[id*=compare"+pid+"]").addClass("cur");
        }
    }
    else {
        alert("对不起，您只能选择四款同类商品比较！！！");
    }

    redraw(promo);
    $("#pop_compare").attr("style","display:block; bottom:0px;");
    document.getElementById("pop_compares").innerHTML = "隐藏";
}
function del(pid, subcatid, name, promo, img,price) {
    tmp = readCookie("pro_str");
    writeCookie("pro_str", tmp.replace(pid + "|" + subcatid + "|" + name + "|" + img +"|"+price+ "###", ""));

    tmp = readCookie("pro_str");
    //如果没有diy了，自动清空subcat
    if (tmp == "" || tmp == null) {
        writeCookie("subcat", "");

    }

    $("a[id*=compare"+pid+"]").removeClass("cur");
    redraw(promo);

}
function hide() {
    obj = document.getElementById("productCompare");
    obj.style.display = 'none';
}

function show() {
    obj = document.getElementById("productCompare");
    obj.style.display = '';
}
function subcat_id_change(subcat, id, name, img,price) {
    //alert("函数参数subcatid="+subcat);
    //change=false;

    tmp_subcat = readCookie("subcat");
    if (tmp_subcat == null || tmp_subcat == "") {
        //还没有选择产品呢！！！
        writeCookie("subcat", subcat);
    } else {
        writeCookie("subcat", subcat);
    }
}
function empty() {
    writeCookie("subcat", "");
    writeCookie("pro_str", "");
    $("a[id^=compare]").removeClass("cur");
    redraw();
}

function comparecheck() {
    obj = document.compare;
    mark = 0;
    for (k = 0; k < obj.elements.length; k++) {
        if (obj.elements[k].name == "pro_id[]" && obj.elements[k].value != "") {
            if (obj.elements[k].value.indexOf("undefined") != (-1)) {
                obj.elements[k].value = obj.elements[k].value.replace("undefined", "");
            }
            mark++;
        }
    }
    if (mark < 2) {
        alert('系统提示：请至少选择两款商品进行对比！！！\r\n选择方法：点击对应商品的“对比按钮”即可添加该商品到商品对比栏。 ');
        return false;
    }
    else {
        obj.submit();
    }
}
function Mtoggle(id){
    var showElementsHtml = document.getElementById(id).innerHTML;
    if (showElementsHtml == "隐藏") {
        $("#pop_compare").attr("style","display:block; bottom:-106px;")
        document.getElementById(id).innerHTML = "展开";
    } else {
        $("#pop_compare").attr("style","display:block; bottom:0px;");
        document.getElementById(id).innerHTML = "隐藏";
    }
}

/*--------------右侧品牌-------------------*/
function changeAttr(id) {
    var showElementsHtml = document.getElementById(id).innerHTML;
    if (showElementsHtml == "收起") {
        var hidecolumn = $("#search"+id).find("a:gt(10)");
        hidecolumn.hide();
        document.getElementById(id).className = "open";
        document.getElementById(id).innerHTML = "展开";
    } else {
        var hidecolumn = $("#search"+id).find("a:gt(8)");
        hidecolumn.show();
        document.getElementById(id).className = "close";
        document.getElementById(id).innerHTML = "收起";
    }
}

function changeColumn(objId, obj) {
    if (jQuery(obj).attr("class").indexOf("show")<0){
        jQuery(obj).addClass("show");
        jQuery("#" + objId).append("<span class='arrow' target-id=\"" + objId + "\"></span>");
    } else {
        jQuery(obj).removeClass("show");
        jQuery("span[target-id="+objId+"]").remove();
    }

}

$(document).ready(function(){
    var hidecolumn = $("div[id^=search]").find("a:gt(10)");
    hidecolumn.hide();



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
    $(".tabmenu .tabs li a").mouseenter(function(){
        var target = $(this).attr("tab-target");
        $(".tabmenu .tabs li a").removeClass("cur");
        $(this).addClass("cur");
        $("[tab-target]").each(function(i,ele){
            t = $(ele).attr("tab-target");
            $("div[tab-id="+t+"]").hide();
            $("#" + t).hide();
        });
        $("div[tab-id="+target+"]").show();
    })
    Ischeck();
    redraw();

})

function Ischeck(){
    var str = $("#productList> ul>li .btn_compare").map(function(i,e){
        return $(e).attr("value");
    }).get().join();
    var  tmps = readCookie("pro_str");
    var item_arr = tmps.split("###");
    if (item_arr.length > 0) {
        for (key in item_arr) {
            if (key) {
                tmp_info_arr = item_arr[key].split("|");
                pid = tmp_info_arr[0];
                if(pid){
                    if(str.indexOf(pid)!=-1){
                        $("a[id*=compare"+pid+"]").addClass("cur");
                    }}

            }
        }
    }
}

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

    $('.btn_buy').bind('click', function () {
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
        html += '<ul>';
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



