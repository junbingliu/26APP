//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js

var m = $.params.m;
var mapping = AppEditorService.getMapping(m);
out.print(mapping);