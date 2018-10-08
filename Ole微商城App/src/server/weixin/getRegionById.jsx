//#import Util.js
//#import login.js
//#import region.js
//#import address.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
(function () {
    var ret = {
        code: 'E1B040001',
        msg: ""
    };
    var loginUserId = LoginService.getFrontendUserId();

    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return;
    }
    var id = $.params.id;
    if(!id){
        ret.msg="id_error";
        out.print(JSON.stringify(ret));
        return;
    }
    var address = AddressService.getAddressById(loginUserId, id);
    ret.code = "S0A00000";
    ret.msg = "获取成功";
    ret.data = address;
    out.print(JSON.stringify(ret));
})();

