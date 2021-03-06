//#import Util.js
//#import pigeon.js

var YunruanArgService = (function (pigeon) {
    var prefix = "yunruanInterfaceObj";

    var f = {
        saveArgs: function (jArgs) {
            var id = f.getArgsId();
            jArgs.id = id;

            pigeon.saveObject(id, jArgs);
        },
        getArgs: function () {
            var id = f.getArgsId();
            return pigeon.getObject(id);
        },
        getArgsId: function () {
            return prefix + "_Args_100";
        },
        getArgValueByKey: function (valueKey) {
            var jArgs = f.getArgs();
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        }
    };
    return f;
})($S);