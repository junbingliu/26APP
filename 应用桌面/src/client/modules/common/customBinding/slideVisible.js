/**
 * Created with IntelliJ IDEA.
 * User: mac
 * Date: 13-7-10
 * Time: 下午10:20
 * To change this template use File | Settings | File Templates.
 */


/*global ko: false */
/*global $: false */
ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor,allBindingsAccessor, viewModel, bindingContext) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        var pageNum = viewModel.pageNum();
        var prePage = viewModel.desktop.prePage;
        var prePageNum = 0;
        if(prePage){
            prePageNum = prePage.pageNum();
        }
        var nextPageNum = 0;
        var nextPage =  viewModel.desktop.nextPage;
        if(nextPage){
            nextPageNum = nextPage.pageNum();
        }
        var visible = ko.utils.unwrapObservable(value);

        if(visible){
            //需要显示的页面
            if(pageNum > prePageNum){
                //向左slide
                $(element).show();
                $(element).css("left",screen.width);
                $(element).animate({
                    left:0
                },200,function(){
                    viewModel.desktop.curPage(viewModel);
                });
            }
            else{
                //向右slide
                $(element).show();
                $(element).css("left",-screen.width);
                $(element).animate({
                    left:0
                },200,function(){
                    viewModel.desktop.curPage(viewModel);
                });
            }
        }
        else{
            if(pageNum>nextPageNum){
                //向右
                $(element).animate({
                    "left":screen.width
                },200,function(){
                    $(element).hide();
                })
            }
            else{
                //向左
                $(element).animate({
                    "left":-screen.width
                },200,function(){
                    $(element).hide();
                })
            }
        }
    }
};