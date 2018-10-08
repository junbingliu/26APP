/**
 * @return {boolean}
 */
function IdentityCodeValid(code) {
    var pass= true;

    if(code.length != 18){
        return false;
    }

    //18位身份证需要验证最后一位校验位
    if(code.length == 18){
        code = code.split('');
        //∑(ai×Wi)(mod 11)
        //加权因子
        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
        //校验位
        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
        var sum = 0;
        var ai = 0;
        var wi = 0;
        for (var i = 0; i < 17; i++) {
            ai = code[i];
            wi = factor[i];
            sum += ai * wi;
        }
        if(parity[sum % 11] != code[17]){
            pass =false;
        }
    }
    return pass;
}