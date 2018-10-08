//#import pigeon.js
//#import Util.js

var PriceUtil = (function (pigeon) {
    var f = {
        toFixed: function (num, dec) {
            return +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
        },
        isNumber: function (str) {
            try {
                var number = Number(str);
                if (isNaN(number)) {
                    return false;
                }
                return true;
            } catch (error) {
            }
            return false;
        },
        trim: function (str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };
    return f;
})($S);