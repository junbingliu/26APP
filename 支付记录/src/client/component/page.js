function Pager(){
    var self = this;
    self.total = ko.observable();
    self.pageSize = ko.observable(50);
    self.currentPage = ko.observable();
    self.callback = null;
    self.displayNumber = ko.observable(10);
    self.totalPages = ko.computed(function(){
        return Math.ceil(self.total() / self.pageSize());
    });
    self.pages = ko.computed(function(){
        var ret = [];
        var totalPages = self.totalPages();
        console.log("totalPages = " + totalPages + "\n")
        if(self.currentPage()>0) {
            ret.push({
                pageName: "上一页",
                pageIdx: self.currentPage() - 1,
                isCurrent:false
            });
        }


        var fromPage = self.currentPage() -  self.displayNumber()/2;
        if(fromPage<0){
            fromPage = 0;
        }

        var lastPage = fromPage + self.displayNumber();
        if(lastPage > totalPages){
            lastPage = totalPages;
        }

        for(var i=fromPage;i<lastPage;i++){
            var isCurrent = (i==self.currentPage());
            ret.push({
                pageName:"" + (i+1),
                pageIdx:i,
                isCurrent:isCurrent
            });
        }

        if(self.currentPage()<self.totalPages()-1){
            ret.push({
                pageName:"下一页",
                pageIdx:self.currentPage()+1,
                isCurrent:false
            });
        }

        console.log(ret);
        return ret;
    });
    self.setStart = function(start){
        var curPage = start / self.pageSize();
        self.currentPage(curPage);
    }
    self.onPage =function(page){
        if(self.callback){
            var start = page.pageIdx * self.pageSize();
            var limit = self.pageSize();
            self.callback(start,limit);
        }
    }
}