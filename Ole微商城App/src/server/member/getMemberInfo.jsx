//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import column.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 个人资料接口,包含线下会员资料和线上个人基本资料
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();

    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return;
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return;
    }

    if (jUser.birthday) {
        try {
            jUser.birthday = DateUtil.getShortDate(jUser.birthday);//出生日期
        } catch (e) {
            jUser.birthday = "";
        }
    } else {
        jUser.birthday = "";//出生日期
    }
    if (jUser.gender == "0") {
        jUser.gender = "男";
    } else if (jUser.gender == "1") {
        jUser.gender = "女";
    } else {
        jUser.gender = "保密";
    }
    var hotty = {
        '001': '健康养生',
        '002': '美容护理',
        '003': '品酒',
        '004': '插花',
        '005': '公益',
        '006': '摄影',
        '007': '音乐',
        '008': '户外运动',
        '009': '美食',
        '010': '艺术',
        '011': '亲子',
        '012': '理财'
    };
    if (jUser.hotty) {
        var array = jUser.hotty.split(",");
        var strArray = [];
        array.forEach(function (value, index, array) {
            if (hotty[value]) {
                strArray.push(hotty[value]);
            } else {
                strArray.push(value);
            }
        });
        jUser.hotty = strArray.join(",");
    }
    var data = {
        userId: jUser.id,//会员id
        logo: jUser.logo || "",//头像
        nickname: jUser.nickname || jUser.loginId || jUser.mobilPhone,//昵称
        cardNo: jUser.cardno || "",//会员卡号
        sex: jUser.gender || "",//性别
        mobile: jUser.mobilPhone,//手机
        email: jUser.email || "",//邮箱
        hotty: jUser.hotty || "",//个人爱好
        birthday: jUser.birthday,//出生日期
        identityNumber: jUser.identityNumber || "",//身份证号
        memberId: jUser.memberid || ""//会员id
    };

    try {
        if (jUser.memberid && jUser.cardno) {
            var memberobj = UserService.getMemberInfo(loginUserId);
            var status = memberobj.status;
            if (status == "0") {
                var memberInfo = memberobj.data;
                data.userName = memberInfo.guestname;//真实姓名
                data.cardNo = memberInfo.currcardno || memberInfo.cardno || data.cardNo;//当前卡号
                data.mobile = memberInfo.mobile;//手机
                data.city = memberInfo.city;//市
                data.points = memberInfo.points;//积分
                data.crtflag = memberInfo.crtflag == "1" ? "是" : "否";//是否激活华润通
                var memberLevel = memberInfo.level_en;//0,1,2,3
                var b2cLevel = "common";
                var levelStr = "普通会员";
                if (memberLevel == "1") {
                    b2cLevel = "hrtv1";
                    levelStr = "畅享会员";
                } else if (memberLevel == "2") {
                    levelStr = "优享会员";
                    b2cLevel = "hrtv2";
                } else if (memberLevel == "3") {
                    levelStr = "尊享会员";
                    b2cLevel = "hrtv3";
                }
                if (memberInfo.crtflag == "0") {
                    b2cLevel = "ole";
                    levelStr = "普通会员";
                }
                data.level = levelStr;//会员等级
                if (data.city && data.city.indexOf("c_region") == 0) {
                    var jCity = ColumnService.getColumn(data.city);
                    data.city = jCity && jCity.name || "";
                }
                if (jUser.memberLevel != b2cLevel) {
                    jUser.memberLevel = b2cLevel;
                    UserService.updateUser(jUser, "u_0");
                }
            }
        }
    } catch (e) {
        $.log("...............getMemberInfo.jsx 获取线下会员资料失败:" + e);
    }
    H5CommonUtil.setSuccessResult(data);
})();