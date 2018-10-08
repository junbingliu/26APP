//#import Util.js
//#import column.js
//#import file.js

var fileId = $.params.fileId;
var spec = $.params.spec;
var ret = {};
ret.state = "ok";
ret.url = FileService.getRelatedUrl(fileId, spec);

out.print(JSON.stringify(ret));