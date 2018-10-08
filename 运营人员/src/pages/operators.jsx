//#import Util.js
//#import doT.min.js
(function(){
  var template = $.getProgram(appMd5,"pages/operators.html");
  var m = $.params.m;
  var scanCode = $.getUUID();
  var pageData = {m:m,scanCode:scanCode};
  var pageFn = doT.template(template);
  out.print(pageFn(pageData));
})();
