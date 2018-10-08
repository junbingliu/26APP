/**
 * Created with IntelliJ IDEA.
 * User: zsl
 * Date: 12-6-18
 * Time: 下午10:05
 * To change this template use File | Settings | File Templates.
 */

(function ($) {
    "use strict"; // jshint ;_;

    var IsonePagination = function (configs) {
        var selector = configs.selector || ".pagination";
        var pageArgName = configs.pageArgName || "page";
        this.elem = $(selector);
        var $that = this;

        var isDisplayHomePage = false;
        var _enableToPage = false; //是否显示跳转到页面，默认显示
        var _recordType = this.elem.attr("recordType");//分页对象,如：商品，团购，信息等
        var _totalPages = parseInt(this.elem.attr("totalPages"));//总页数
        var _currentPage = parseInt(this.elem.attr("currentPage")); //当前页
        var _totalRecords = parseInt(this.elem.attr("totalRecords")); //总数量
        var _displayNum = 6; //一次显示页数
        var _pageLimit = 10; //一页显示数量

        if (this.elem.attr("displayNum")) {
            _displayNum = parseInt(this.elem.attr("displayNum"));
        }
        if (this.elem.attr("pageLimit")) {
            _pageLimit = parseInt(this.elem.attr("pageLimit"));
        }
        if (this.elem.attr("enableToPage") && this.elem.attr("enableToPage") == "false") {
            _enableToPage = true;
        }

        this.getCleanUrl = function () {
            var fullUrl = document.location.href;

            var reg = new RegExp(pageArgName+"=([^&?]*)", "g");
            var tempPage = ((fullUrl.match(reg)) ? (fullUrl.match(reg)[0]) : null);
            if (tempPage != null) {
                return fullUrl.replace(tempPage, "");
            }
            return fullUrl;
        };
        var cleanUrl = this.getCleanUrl();

        this.getCompleteUrl = function (reqUrl, page) {
            if (reqUrl.indexOf("?") > 0) {
                var urlLength = reqUrl.length;
                if (reqUrl.lastIndexOf("?") == (urlLength - 1) || reqUrl.lastIndexOf("&") == (urlLength - 1)) {
                    return reqUrl + pageArgName+"=" + page;
                }
                return reqUrl + "&"+pageArgName+"=" + page;
            } else {
                return reqUrl + "?"+pageArgName+"=" + page;
            }
        };

        var re = "";

        //re += "<ul>";
        if (_currentPage > 1) {
            if (isDisplayHomePage) {
                re += "<li><a href='" + this.getCompleteUrl(cleanUrl, 1) + "'>首页</a></li>";
            }
        }
        if (_currentPage > 1) {
            re += "<li><a href='" + this.getCompleteUrl(cleanUrl, _currentPage - 1) +
                "'>上一页</a></li>";
        } else {
            re += "<li class='disabled'><a title='目前已是第一页'>上一页</a></li>";
        }
        //re += "</ul>";

        //re += "&nbsp;<ul>";
        //计算显示的页
        if (_displayNum == 0) {
            re += "<li class='active'><a href='#'>" + _currentPage + "</a>/" + _totalPages + "</li>";
        } else {
            var pagecenter = _displayNum / 2 - 1;
            var pagebet = _displayNum / 2 + 1;
            var beginPage = 1;
            var endPage = 1;

            if (_currentPage < pagebet) {
                beginPage = 1;
            } else {
                beginPage = _currentPage - pagecenter;
            }

            if (_currentPage + pagecenter > _totalPages) {
                endPage = _totalPages;
            } else {
                endPage = _currentPage + pagecenter;
            }

            if (_currentPage + pagecenter < _displayNum) {
                endPage = _displayNum;
            }

            if (endPage - _currentPage < pagecenter) {
                beginPage = _totalPages - (_displayNum - 1);
                if (beginPage != 1) {
                    beginPage += 1;
                }
            }

            if (beginPage <= 0) {
                beginPage = 1;
            }

            if (endPage > _totalPages) {
                endPage = _totalPages;
            }

            if (_currentPage >= pagebet && beginPage != 1) {
                re += "<li><a href='" + this.getCompleteUrl(cleanUrl, 1) +
                    "'>1</a></li>";
                if (_currentPage != pagebet) {
                    re += "<li class='disabled'><a href='#'>...</a></li>";
                }
            }

            for (var i = beginPage; i <= endPage; i++) {
                var item = "";
                if (i != _currentPage) {
                    item = "<li><a href='" + this.getCompleteUrl(cleanUrl, i) +
                        "'>" + i +
                        "</a></li>";
                } else {
                    item = "<li class='active'><a href='#'>" + i +
                        "</a></li>";
                }
                re += item;
            }
        }
        //re += "</ul>";

        //re += "&nbsp;<ul>";
        if (_currentPage < _totalPages) {
            re += "<li><a href='" + this.getCompleteUrl(cleanUrl, _currentPage + 1) +
                "'>下一页</a></li>";
        } else {
            re += "<li class='disabled'><a title='目前已是最后一页'>下一页</a></li>";
        }
        //re += "</ul>";

        //re += "&nbsp;<ul>";

        if (_enableToPage) {
            re += "<li class='disabled'><a href='#'>第</a></li>";
            re += "<li><input type='text' class='input toPage'></li>";
            re += "<li class='disabled'><a href='#'>页</a></li>";
            re += "<li><a href='javascript:void(0);' class='toPage_submit'>确定</a></li>";
        }
        //re += "</ul>";

        //re += "&nbsp;<ul>";

        if (_totalRecords == 0) {
            re += "<li class='disabled'><a href='#'>共 " + _totalRecords;
            if (_recordType != null && _recordType.length > 0) {
                re += " 个" + _recordType;
            }
            re += "</a></li>";
        } else {
            var start = (_currentPage - 1) * _pageLimit + 1;
            var last;
            if (start + _pageLimit > _totalRecords) {
                last = _totalRecords;
            } else {
                last = start + _pageLimit - 1;
            }
            re += "<li class='disabled'><a href='#'>显示 " + start + " - " + last + " / 共 " + _totalRecords
            if (_recordType != null && _recordType.length > 0) {
                re += " 个" + _recordType;
            }
            re += "</a></li>";
        }
        //re += "</ul>";

        this.elem.append(re);

        $(".toPage_submit", $that.elem).click(function () {
            var toPage = $(".toPage", $that.elem);
            if (!toPage) {
                alert("请输入要跳转到的页面!");
                return;
            }
            var toPageValue = toPage.val();
            if($.trim(toPageValue) == ""){
                alert("请输入要跳转到的页面!");
                return;
            }
            var reg = new RegExp("^[0-9]*$");
            if (!reg.test(toPageValue)) {
                alert("要跳转到的页面必须为数字!");
                return;
            }
            if (toPageValue > _totalPages) {
                alert("最大跳转页数为：" + _totalPages + "，请重新输入!");
                return;
            }
            window.location.href = $that.getCompleteUrl(cleanUrl, toPage.val());
        });

    };
    $.IsonePagination = IsonePagination;

})(window.jQuery);