/**
 * Created by joho on 2016/8/9.
 */
function ListProductsPage(){
    var self = this,
        currentPage=1;
    self.list = ko.observableArray([]);
    self.currentPage = ko.observable("");
    self.totalPages = ko.observableArray([]);
    self.totalPage = ko.observable("");
    self.istotal = ko.observable("");
    self.cutPage = ko.observable("");
    self.totalRecords = ko.observable("");
    self.isOk = ko.observable(false);
    self.isok = ko.observable(false);
    // self.buildIndex = function () {
    //     $.get("hander/newBuildIndex.jsx?m="+m,function (res) {
    //         if(res.data == "ok"){
    //             alert("重建索引成功");
    //         }
    //     },"json");
    // }
    self.serch = function(){
        if($.trim($("#sBegin").val())&&$.trim($("#sEnd").val())){
            posts();
        }else if($.trim($("#sBegin").val())==""&&$.trim($("#sEnd").val())==""){
            posts();
        }else{
            alert("需要同时输入开始和结束时间");
        }
    };

    var posts=function(){
        var params={
            keyword: $.trim($("#keyword").val()),
            beginTime: $.trim($("#sBegin").val()),
            endTime: $.trim($("#sEnd").val()),
            userName: $.trim($("#userName").val()),
            classify: $.trim($('#classify option:selected').val()),
            m:m,
            currentPage:currentPage
        };

        $.post("hander/getList.jsx?m=head_merchant",params,function(data){
            if(data&&data.list){
               /* for (var i = 0; i < data.list.length; i++) {
                    !data.list[i] && data.list.splice(i,1);
                }*/
                self.list(data.list);
                self.currentPage(data.pageParams.currentPage);
                self.totalPage(data.pageParams.totalPages);
                self.totalRecords(data.pageParams.totalRecords);
                pages(data.pageParams.totalPages,data.pageParams.currentPage);
            }else {
                self.list([]);
            }
        },"JSON");

        };
    posts();
    //分页
    var pages=function(totalPages,currentPage){
        var max= 5,
            pageArr = new Array(),
            page = new Array();
        page[0]=totalPages;
        currentPage=parseInt(currentPage);
        totalPages = parseInt(totalPages);
        if(currentPage>=max){
            self.isOk(true);
            if(currentPage>=(totalPages-2)){
                self.isok(false);
            }else{
                self.isok(true);
            }
            max=currentPage+2>totalPages?max-(currentPage+2-totalPages):max;
            for(var i=0;i< max;i++){
                var index=currentPage-2+i;
                pageArr[i]=index;
            }
        }else{
            self.isOk(false);
            if(totalPages>=max){
                self.isok(true);
            }else{
                self.isok(false);
            }
            max = totalPages>max?max:totalPages;
            for(var i=0;i< max;i++){
                pageArr[i]=i+1;
            }
        }
        self.istotal(page);
        self.totalPages(pageArr);
        self.currentPage(currentPage);
    };

    self.previous=function(){
        currentPage=$.ko.currentPage();
        currentPage--;
        if(currentPage<1){
            currentPage=1;
        }else{
            posts();
        }
    };

    self.setPage=function(){
        currentPage = this;
        posts();
    };

    self.next=function(){
            currentPage=$.ko.currentPage();
            currentPage++;
        if(currentPage<=$.ko.totalPage()){
            posts();
        }
    };
    //end分页
}
var listProductsPage = null;
$(function(){
    listProductsPage = new ListProductsPage();
    $.ko = listProductsPage;
    ko.applyBindings(listProductsPage,document.getElementById("themes"));
});