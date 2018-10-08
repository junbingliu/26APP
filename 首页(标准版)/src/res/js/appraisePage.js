var url;
var currentPage;
var pageNum;
$(function(){
    getApprais(1);
});

function goPage(currentPage,url){
    $(".goToPage").click(function(){
        var page= parseInt($("#inputPage").val());
        if(page==currentPage||page>pageNum||isNaN(page)){
            return;
        }
        location.href = changeURLPar(url,'page',page);

    })
}
function showPage(pageSize,currentpage) {
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
                html[i] = '<li><a id="href_' + i + '" class="p everyPage"  onclick="getApprais('+(i+1)+')" href="javascript:void(0)">' + (i + 1) + '</a></li>';
            }

        }
        var nextPage = '<li><a id="nextPage" title="下一页" class="downPage" onclick="getApprais('+(currentpage+1)+')" href="javascript:void(0)"></a></li>';
        var prePage = '<li><a id="prePage" title="上一页" class="upPage" onclick="getApprais('+(currentpage-1)+')" href="javascript:void(0)"></a></li>';
        var button = '<li>&nbsp;&nbsp;到第&nbsp;<input value="1" id="inputPage">&nbsp;页</li>' +
            '<li><a class="goToPage" href="javascript:;" ></a></li>';
        if (currentpage == 1) {
            prePage = '<li><a id="prePage" title="目前已是第一页" class="upPage"></a></li>';
        }
        if (currentpage >= pageNum) {
            nextPage = '<li><a id="nextPage" title="目前已是最后一页" class="downPage"></a></li>';
        }
        list = prePage + getPage(currentpage,html,10,pageNum) + nextPage;
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
function getApprais(page){
    var postData ={appraisePage:page,id:productId};
    $.post("/" + rappId +"/serverHandler/getAppraisList.jsx",postData,function(data){
        data = eval("("+data+")");
        var items =[];
        var img ="upload/user_none_100.gif";
        if(data.recordList) {
            $.each(data.recordList, function (i, item) {
                if (item.createUserLogo == "" || item.createUserLogo == null || item.createUserLogo == '') {

                    item.createUserLogo = img;

                }
                item.totalStar = (Number(item.totalStar) * 20);
                items.push(item);
            });
        }
        var data = {
            appraiseItems:items

        };
        var tpl = $("#layerTemplate").html();
        var html = juicer(tpl, data);
        $("#layer").html(html);
    })
    $("#inputPage").val(page);
    var Total = parseInt($("#Total").val());
    url=location.href;
    pageNum = parseInt((Total + 5 - 1) / 5);
    currentPage = $("#inputPage").val();
    showPage(Total,currentPage);
    goPage(currentPage,url);
    if(isNaN(currentPage)||currentPage==null){
        $("#inputPage").val(1);

    } else{
        $("#inputPage").val(currentPage);

    }
}