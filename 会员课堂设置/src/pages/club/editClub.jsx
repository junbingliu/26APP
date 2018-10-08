//#import doT.min.js
//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/ClubService.jsx

(function () {
    try {

        var pageData = ClubService.getClub($.params.id);

        var template = $.getProgram(appMd5, "pages/club/editClub.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e)
    }
})();






