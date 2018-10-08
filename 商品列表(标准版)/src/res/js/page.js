var url;
var currentPage;
var pageNum;
$(function(){
    var Total = parseInt($("#Total").val());
    url=location.href;
    pageNum = parseInt((Total + 12 - 1) / 10);
    String.prototype.getQueryString = function(name)
    {
        var reg = new RegExp("(^|&|\\?)"+ name +"=([^&]*)(&|$)"), r;
        if (r=this.match(reg)) return unescape(r[2]);
        return null;
    };
    currentPage = location.search.getQueryString("page");
    page(Total,currentPage,url);
    goPage(currentPage,url);
    if(isNaN(currentPage)||currentPage==null){
        $("#inputPage").val(1);
        $("#starLV").html(1);
    } else{
        $("#inputPage").val(currentPage);
        $("#starLV").html(currentPage);
    }


});
function changeURLPar(url, ref, value){
    var str = "";
    if (url!=null&&url.indexOf('?') != -1)
        str = url.substr(url.indexOf('?') + 1);
    else
        return url + "?" + ref + "=" + value;
    var returnurl = "";
    var setparam = "";
    var arr;
    var modify = "0";

    if (str.indexOf('&') != -1) {
        arr = str.split('&');

        for (i in arr) {
            if (arr[i].split('=')[0] == ref) {
                setparam = value;
                modify = "1";
            }
            else {
                setparam = arr[i].split('=')[1];
            }
            returnurl = returnurl + arr[i].split('=')[0] + "=" + setparam + "&";
        }

        returnurl = returnurl.substr(0, returnurl.length - 1);

        if (modify == "0")
            if (returnurl == str)
                returnurl = returnurl + "&" + ref + "=" + value;
    }
    else {
        if (str.indexOf('=') != -1) {
            arr = str.split('=');

            if (arr[0] == ref) {
                setparam = value;
                modify = "1";
            }
            else {
                setparam = arr[1];
            }
            returnurl = arr[0] + "=" + setparam;
            if (modify == "0")
                if (returnurl == str)
                    returnurl = returnurl + "&" + ref + "=" + value;
        }
        else
            returnurl = ref + "=" + value;
    }
    return url.substr(0, url.indexOf('?')) + "?" + returnurl;
}


function goPage(currentPage,url){
    $(".goToPage").click(function(){
        var page= parseInt($("#inputPage").val());
        if(page==currentPage||page>pageNum||isNaN(page)){
            return;
        }
        location.href = changeURLPar(url,'page',page);

    })
}
function page(pageSize,currentpage,url) {
    if (currentpage == null || currentpage == "" || currentpage == 0||isNaN(currentpage)) {
        currentpage = 1;
    }
    currentpage = parseInt(currentpage);
    if(currentpage<=pageNum) {
        var html = {};
        var next = 0;
        var list = "";
        for (var i = 0; i < pageNum; i++) {
            next = i * pageSize;
            if(currentpage==(i+1)){
                html[i] = '<li><a id="href_' + i + '" class="p nowPage">' + (i + 1) + '</a></li>';
            }else{
                html[i] = '<li><a id="href_' + i + '" class="p everyPage" href="'+changeURLPar(url,'page',i+1)+'">' + (i + 1) + '</a></li>';
            }

        }
        var nextPage = '<li><a id="nextPage" title="下一页" class="downPage" href="'+changeURLPar(url,'page',currentpage+1)+'"></a></li>';
        var prePage = '<li><a id="prePage" title="上一页" class="upPage" href="'+changeURLPar(url,'page',currentpage-1)+'"></a></li>';
        var button = '<li>&nbsp;&nbsp;到第&nbsp;<input value="1" id="inputPage">&nbsp;页</li>' +
            '<li><a class="goToPage" href="javascript:;" ></a></li>';
        if (currentpage == 1) {
            prePage = '<li><a id="prePage" title="目前已是第一页" class="upPage"></a></li>';
        }
        if (currentpage >= pageNum) {
            nextPage = '<li><a id="nextPage" title="目前已是最后一页" class="downPage"></a></li>';
        }
        list = prePage + getPage(currentpage,html,10,pageNum) + nextPage+button;
        if(pageNum>0){
            $("#pageList").html(list);
        }
    }
}
function nextPage() {
    if (currentPage == null || currentPage == "" || currentPage == 0||isNaN(currentPage)) {
        currentPage = 1;
    }
    currentPage = parseInt(currentPage);
    if(currentPage<pageNum-1){
        location.href = changeURLPar(url,'page',currentPage+1);
    }else{

    }
}
function prePage() {
    if (currentPage == null || currentPage == "" || currentPage == 0||isNaN(currentPage)) {
        currentPage = 1;
    }
    currentPage = parseInt(currentPage);
    if(currentPage!=1){
        location.href = changeURLPar(url,'page',currentPage-1);
    }else{
    }
}
function getPage(cur, data, count, dataList) {
    var html = "";
    var start;
    var end;
    var empty = '<li>...&nbsp;</li>';
    if(cur<6){
        cur=1;
        start = (cur-1) * count;
        end = cur * count;
    }else{
        start = cur-5;
        end = cur+4;
        if(end>=dataList){
            end=dataList;
            start = end-9;
        }

    }
    if (end > dataList) {
        end = dataList;
    }
    for (var i = start; i < end; i++) {
        html += data[i];
    }
    if(cur>=6){
        html=data[0]+empty+html;
    }
    return html;
}