//#import Util.js

(function () {

    var api = new JavaImporter(
        Packages.net.xinshi.isone.functions.CommonFunctions,
        Packages.org.json
    );

    var imgString = api.CommonFunctions.getPicListSizeImages("", "attr_10000", "100X10", "/upload/nopic_120.gif");
    $.log("imgString"+imgString);
})();