$(function(){
    var Total = parseInt($("#Total").val());
    var url=location.href;
    String.prototype.getQueryString = function(name)
    {
        var reg = new RegExp("(^|&|\\?)"+ name +"=([^&]*)(&|$)"), r;
        if (r=this.match(reg)) return unescape(r[2]);
        return null;
    };
    var currentPage = location.search.getQueryString("appraisePage");
    page(Total,10,currentPage,url);
    goPage(Total,10,currentPage,url);
    if(isNaN(currentPage)||currentPage==null){
        $("#inputPage").val(1)
    } else{
        $("#inputPage").val(currentPage);
    }


});
function changeURLPar(url, ref, value){
    var str = "";
    if (url.indexOf('?') != -1)
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


function goPage(totalRecord,pageSize,currentPage,url){
    var pageNum = parseInt((totalRecord + pageSize - 1) / pageSize);
    $(".goToPage").click(function(){
        var page= parseInt($("#inputPage").val());
        var set = (page-1)*pageSize;
        if(page==currentPage||page>pageNum||isNaN(page)){
            return;
        }
        location.href = changeURLPar(url,'appraisePage',page);

    })
}
function page(totalRecord, pageSize,currentpage,url) {
    var pageNum = parseInt((totalRecord + pageSize - 1) / pageSize);
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
                html[i] = '<li><a id="href_' + i + '" class="p everyPage" href="'+changeURLPar(url,'appraisePage',i+1)+'">' + (i + 1) + '</a></li>';
            }

        }
        var nextPage = '<li><a id="nextPage" title="下一页" class="downPage" href="'+changeURLPar(url,'appraisePage',currentpage+1)+'"></a></li>';
        var prePage = '<li><a id="prePage" title="上一页" class="upPage" href="'+changeURLPar(url,'appraisePage',currentpage-1)+'"></a></li>';
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