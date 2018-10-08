jQuery(function() {
    $(window).scroll(function(){
        if ($(window).scrollTop()>150){
           $(".floatBar").show();
        } else{
            $(".floatBar").hide();
        }
    });

    $(".tabmenu,.tabs").each(function (index,domEle) {
        $("[tab-target]",$(domEle)).click(function(){
            $("[tab-target]",$(domEle)).removeClass("cur");
            $(this).addClass("cur");
            var t;
            var target = $(this).attr("tab-target");
            $("[tab-target]",$(domEle)).each(function(i,ele){
                t = $(ele).attr("tab-target");
                $("div[tab-id="+t+"]").hide();
                $("#" + t).hide();
            });
            /*然后再显示出来*/
            $("div[tab-id="+target+"]").show();
            $(".consult_form").hide();
        });
        /*只显示cur Tab对应的内容*/
        $("[tab-target]",$(domEle)).each(function(i,ele){
            var t = $(ele).attr("tab-target");
            var isCur = $(ele).hasClass("cur");
            if(!isCur){
                $("div[tab-id="+t+"]").hide();
            }
            else{
                $("div[tab-id="+t+"]").show();
            }
            $(".consult_form").hide();
        });
    });
    $(".Spic .next").click(function(){
        var target=$(this).parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        if((imgCount+Number(offset))>4) {
            target.css("left", (offset - 1) * 108 + "px");
            offset = offset - 1;
            target.attr({offset: offset});
        }
    })
    $(".Spic .prev").click(function(){
        var target=$(this).parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        offset = Number(offset) + 1;
        if((offset)<1) {
            target.css("left", offset * 108 + "px");
            target.attr({offset: offset});
        }
    })
    $(".lookpage .look_next").click(function(){
        var target=$(this).parent().parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        if((imgCount+Number(offset))>3) {
            target.css("top", (offset - 1) * 190 + "px");
            offset = offset - 1;
            target.attr({offset: offset});
        }
    })
    $(".lookpage .look_prev").click(function(){
        var target=$(this).parent().parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        offset = Number(offset) + 1;
        if((offset)<1) {
            target.css("top", offset * 190 + "px");
            target.attr({offset: offset});
        }
    })

    $(".Spic>div>ul>li").mousemove(function () {
        var imgB = $(this).children().children("img").attr("data-src");
        $(this).addClass("cur");
        $(this).siblings().removeClass("cur");
        $("#midImgLink").attr("src", imgB).parent().attr("href", imgB);
    });
    $(".mod_category .item").click(function(){
        $(this).toggleClass("show");
    });

    var options = {
        zoomWidth: 350,
        zoomHeight: 350,
        lens: true,
        xOffset: 10,
        yOffset: 0,
        position: "right",
        title: false
    }
    $(".jqzoom").jqzoom(options);

    /* 到货通知*/
    $("#btnNotification").click(function () {
        loadAddNotice(getQueryString("id"),getQueryString("merchantId"));
    });
    /*end到货通知*/

        $(".pinLun_detail_textareal").keyup(function () {
            var maxLength = 300;
            var countStr = $(this).val().length;
            var addAffter = maxLength - countStr;
            var showCount = addAffter;
            if (countStr >= 300) {
                showCount = "0";
                $("#counts").css({"color":"#FF6600"});
    } else {
        $("#counts").css({"color":"#999999"});
    }
    $("#counts").html(showCount);
    });
    var options = {beforeSubmit:checknotnull, success:checkcomment};
    jQuery("#deliverform").ajaxForm(options);

    chStarleve(5,'img5');//选择5个星星


});


function chStarleve(Value, form) {
    var img1Val = $("#img1Val").attr("src");
    var img2Val = $("#img2Val").attr("src");
    for (var i = 1; i <= Value; i++) {
        document.getElementById("img" + i).src = img1Val;
    }
    for (var i = 0; i < 5 - Value; i++) {
        document.getElementById("img" + (5 - i)).src = img2Val;
    }

    document.getElementById("star").value = Value;
}


function checknotnull() {
    var theForm = document.getElementById("deliverform");
    var str = Trim(theForm.comment.value);
    if (str == "") {
        $("#errorRemarkDiv").html("请填写评论内容！");
        theForm.comment.focus();
        return false;
    }
    if (str.length > 300) {
        $("#errorRemarkDiv").html("评论内容不能超过300字");
        theForm.comment.focus();
        return false;
    }
    if (theForm.ValidateCode.value == "") {
        $("#errorRemarkDiv").html("请输入验证码！");
        theForm.ValidateCode.focus();
        return false;
    }

}
function refreshValidateCode(id) {
    document.getElementById(id).src = "/ValidateCode?dumy=" + Math.random();
}
function Trim(str) { //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

function checkcomment(data) {
    data = Trim(data);
    var results = JSON.parse(data);
    if (results.state == 'ok') {
        alert("评论成功， 请耐心等待管理员的审核！");
        addRemarkHide();
        window.parent.frames["advice"].location.reload();
        window.parent.frames["comments"].location.reload();
    }
    else {
        if(results.state == 'noLogin'){
            alert("请先登陆！");
            addRemarkHide();
            checkLogin('${productId}', '', '', 'appraise', '');
        }
        alert(results.msg);
        addRemarkHide();
    }
}
function addRemarkHide() {
    document.getElementById("addRemarkLayer").style.display = "none";
}
function jumpDiv(){

    $("div[tab-id=productMessage]").show();
    $("a[tab-target=productMessage]").addClass("cur");
    $("div[tab-id=productInfo]").hide();
    $("a[tab-target=productInfo]").removeClass("cur");
    $("div[tab-id=productAppraise]").hide();
    $("a[tab-target=productAppraise]").removeClass("cur");

}
 function changeMessage(id){
     var showElementsHtml = document.getElementById(id).innerHTML;
     if (showElementsHtml == "收起") {
         document.getElementById(id).className = "open";
         document.getElementById(id).innerHTML = "展开";
     } else {

         document.getElementById(id).className = "close";
         document.getElementById(id).innerHTML = "收起";
     }
     $("#"+id).parent().next().toggle();
 }

function loadAddNotice(pid,mid) {
    var params = new Object();
    params["pid"] = pid;
    params["mid"] = mid;
    loginUrl="/login.html";
    jQuery("#arrivalNoticeLayer").load("/product/includeAddarrivalNotice.jsp", params, function () {
        document.getElementById("arrivalNoticeLayer").style.left = "35%";
        document.getElementById("arrivalNoticeLayer").style.top = "65%";
        document.getElementById("arrivalNoticeLayer").style.display = "block";
    });
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function favoriteProduct() {
    var params = {};
    params["objId"] = getQueryString("id");
    params["type"] = "product";
    $.post("ajax/favor_add_handler.jsp", params, function(msg) {
        var data = $.trim(msg);
        if (data == "none") {
            window.location.href = "/login.html?redirectURL="+ location.href;
        } else if (data == "ok") {
            alert("收藏成功!");
        } else if (data == "existed") {
            alert("此商品已收藏过!");
        } else {
            alert("系统繁忙请稍后再试！");
        }

    });
}

function showConsult(){
    $(".consult_form").show();
}

function checkMessage(){
    $("#addMessage").submit();
}
function addLoginFormResult() {
    var referrer = document.referrer;
    var result = resultIfram.document.body.innerHTML;

    data = $.trim(result);
    if (data) {
        if (data == "notLogin") {
            window.location.href = "/login.html?redirectURL="+location.href;
            return;
        }
        if (data == 1) {
            alert("商品咨询类型参数为空或者类型不存在");
            refreshValidateCode();
            return;
        }
        if (data == 2) {
            alert("咨询的商品不存在");
            refreshValidateCode();
            return;
        }
        if (data == 3) {
          alert("请输入验证码");
            refreshValidateCode();
            return;
        }
        if (data == 4) {
            alert("验证码错误");
            refreshValidateCode();
            return;
        }
        if (data == 5) {
            alert("提交成功");
            refreshValidateCode();
            window.location.href = window.location.href;
            return;
        }
        if (data == 6) {
            alert("请输入咨询内容");
            return;
        }
        else{
            alert("系统出错，请稍后再试");
            return;
        }

    }
}


function showComment(i, type, pid) {
    if ($("#userId").val() == "undefined") {
        window.location.href = "/login.html?redirectURL="+location.href;
    } else {

        if (type == "c") {
            jQuery("#addRemarkLayer").show();
            center('#addRemarkLayer');
        }
    }
}

function center(i) {
    var _scrollHeight = $(document).scrollTop(),//获取当前窗口距离页面顶部高度
        _windowHeight = $(window).height(),//获取当前窗口高度
        _windowWidth = $(window).width(),//获取当前窗口宽度
        _popupHeight = $(i).height(),//获取弹出层高度
        _popupWeight = $(i).width();//获取弹出层宽度
    _posiTop = (_windowHeight - _popupHeight) / 2;
    _posiTop2 = (_windowHeight - _popupHeight) / 2 - _scrollHeight;
    _posiLeft = (_windowWidth - _popupWeight) / 2;
    $(i).css({"left": _posiLeft + "px", "top": _posiTop + "px", "display": "block", "position": "fixed", "z-index": "30003"});
    var isIE = !!window.ActiveXObject;
    var isIE6 = isIE && !window.XMLHttpRequest;
    if (isIE) {
        if (isIE6) {
            $(i).css({"left": _posiLeft + "px", "display": "block", "position": "absolute", "bottom": "0"});
            $("html, body").animate({ scrollTop: 0 }, 120);
        }
    }

}