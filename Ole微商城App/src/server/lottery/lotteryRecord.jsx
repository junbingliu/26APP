//#import Util.js
//#import pigeon.js
//#import jobs.js
//#import login.js
//#import user.js
//#import info.js
//#import DateUtil.js
//#import column.js
//#import card.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $lotteryEventManage:services/LotteryLogService.jsx
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx
//#import $oleH5Api:services/PosService.jsx
//#import account.js
//#import NoticeTrigger.js

/**
 * 抽奖
 */
(function () {
    var SmallCode = $.params["noSmall"]; //小票号
   // SmallCode="75413248633555418412";
    var noticeId = "notice_57000";//写死的
    var f = {//验证小票
        verificationSmall: function () {
            if (jActivity.noSmall == 0 || jActivity.noSmall=='' || jActivity.noSmall==null) {//不等1表示需要小票抽奖  等于1表示不需要小票
                if (SmallCode=='' ||SmallCode==null) {
                    H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "小票号为空");
                    return;
                }else {
                    var number = SmallCode.substr(SmallCode.length - 6, 6);//最后6位000037是流水号
                    var time = SmallCode.substr(SmallCode.length - 14, 8);//往前8位20180620是时间戳
                    var posId = SmallCode.substr(SmallCode.length - 18, 4);//往前4位P666是POS机号
                    var shopId = SmallCode.substr(0, SmallCode.length - 18);//剩下前面的是店号
                    var posInfo = PosService.getPosInfo(number, posId, shopId, time);
                    if (posInfo) {
                        var salevalue = posInfo.salevalue;//销售额
                        if (salevalue < jActivity.lotteryOrderAmount) {
                            H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "小票金额(" + salevalue + ")小于抽奖活动订单金额(" + jActivity.lotteryOrderAmount + ")");
                            return;
                        }
                        H5CommonUtil.setSuccessResult();
                        return
                    } else {
                        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "获取小票信息错误");
                        return;
                    }
                }
                return false;
            }

            //不需要小票
            return true;
        }
    };
    var result = {};
    var activityId = $.params["activityId"];//活动id
   // activityId = "lem_200004";
    var jActivity = LotteryEventManageService.get(activityId);
    try {
        var loginUserId = LoginService.getFrontendUserId();//获取当前登录用户id
       // var loginUserId = 'u_5820000';//获取当前登录用户id
        var Integral = AccountService.getUserBalance(loginUserId, "head_merchant", "shoppingIntegral");//积分
        var memberobj = UserService.getMemberInfo(loginUserId); //获取用户的真实姓名

        if (!loginUserId) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return
        }
        var jUser = UserService.getUser(loginUserId);//获取用户信息
        if (!jUser) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return
        }
        var participationConditions = jActivity.participationConditions;//活动参与条件

        //参与条件
        if (participationConditions == 2) {//vip会员
            if (!jUser.cardno) {
                H5CommonUtil.setExceptionResult("只有会员才能参与，谢谢！");
                return;
            }
        } else if (participationConditions == 3) {//积分抽奖
            if (jActivity.integral>Integral){
                H5CommonUtil.setExceptionResult("你的积分不够！");
                return;
            }
        } else if (participationConditions == 4) {//微商城订单满额
            H5CommonUtil.setExceptionResult("系统错误,请稍后再试..");
            return;
        } else if (participationConditions == 5) {//门店订单满额
            H5CommonUtil.setExceptionResult("系统错误,请稍后再试..");
            return;
        } else {
            if (!f.verificationSmall()){
                return;
            }
            var currentData = LotteryLogService.getCurrentDate();//获取当前日期
            var InfoKey = activityId + loginUserId + currentData;
            var ua = activityId + loginUserId;
            if (jActivity.lotteryDayNumber!='0' && jActivity.lotteryDayNumber!=null && jActivity.lotteryDayNumber!='' ){
                var LotteryNum = LotteryLogService.getLotteryNumber(InfoKey);//拿到用户在这个活动中的抽奖次数
                if (LotteryNum > jActivity.lotteryDayNumber) {
                    H5CommonUtil.setExceptionResult("今天抽奖次数已经用完，请明天再来");
                    return;
                }
                LotteryLogService.setLotteryNumber(ua, currentData);//添加一次抽奖次数
            }
            if (jActivity.lotteryTotalNumber!=0 && jActivity.lotteryTotalNumber!=null &&jActivity.lotteryTotalNumber!='' ) {
                var lotteryTotal = LotteryLogService.getLotteryNumber(ua);//获取总的抽奖次数
                if (lotteryTotal > jActivity.lotteryTotalNumber) {
                    H5CommonUtil.setExceptionResult("您的抽奖次数已经达到总抽奖次数，请查看你的奖品");
                    return;
                }
                LotteryLogService.setLotteryTotalNumber(activityId, loginUserId);//添加一次总抽奖次数
            }
            LotteryLogService.setLotteryTotalNumber(activityId,loginUserId);//添加一次总抽奖次数
            var listId = PrizeSettingSomService.getAwardListByActiveId(activityId);//根据活动id查询出改活动的奖项设置
            var recordList = PrizeSettingSomService.getListByName(listId, 0, -1);



            var randomNo = LotteryLogService.randomNo(1, 360);//中奖的随机数
            var beginNum = 0;
            var endNum = 0;
            var jRecord = {};
            for (var i = 0; i < recordList.length; i++) {
                if (recordList[i]){
                    beginNum=recordList[i].startingAngle;
                    endNum=recordList[i].endAngle;
                    if (randomNo > beginNum && randomNo <= endNum) {
                        var maximumNumberPrizes=recordList[i].maximumNumberPrizes;//每日最大放奖数量
                        var id=recordList[i].id;//奖项id
                        PrizeSettingSomService.setMaximumNumber(id,currentData);
                        var indexMn =id +currentData;
                        var MnTotal =  PrizeSettingSomService.getMaximumNumber(indexMn);
                        if (MnTotal<=maximumNumberPrizes) {
                            jActivity.winners = jActivity.winners+1;//中奖人数+1
                            LotteryEventManageService.update(jActivity);
                            var activityGrade=recordList[i].activityGrade;//奖项等级
                            var gradeName=recordList[i].gradeName;//奖项等级
                            var prizeName=recordList[i].prizeName;//奖品名称
                            if (recordList[i].prizeType==1) {//不是0，就是其他的赠送物品,0是实物
                                Integral = parseInt(Integral) + parseInt(recordList[i].integral);
                                jRecord.Integral=recordList[i].integral;
                                AccountService.updateUserBalance(loginUserId,"head_merchant","shoppingIntegral",Integral,"抽奖赠送","transactionType_transfer_in"); //修改积分
                            }else if (recordList[i].prizeType==2) {//vip优惠券绑定给用户
                                //TODO
                            }else if (recordList[i].prizeType==3) {//cps优惠券绑定给用户
                                var CPSCoupon = recordList[i].CPSCoupon;
                                jRecord.CPSCoupon=CPSCoupon;
                                var cpsCouponName = recordList[i].cpsCouponName;
                                jRecord.cpsCouponName=cpsCouponName;
                                var cpsResult = CardService.batchBindCards2UserByCps(CPSCoupon,loginUserId,1);//绑定优惠券给用户
                            }
                        }
                    }
                }
            }
            jRecord.activityGrade=activityGrade ||'10';
            jRecord.gradeName=gradeName ||'谢谢参与';
            if (activityGrade!=10 || jRecord.activityGrade!=10){
                var jLabel={};
                jLabel["\\[user:name\\]"] = jUser.name || jUser.nickName || "";
                jLabel["\\[user:realName\\]"] =jUser.realName || "";
                jLabel["\\[activity:title\\]"] = jActivity.eventName|'';
                jLabel["\\[awards:name\\]"] = prizeName||'';
                NoticeTriggerService.send(loginUserId, noticeId, "head_merchant", jLabel);//中奖通知
            }


            jRecord.prizeName=prizeName;
            jRecord.shopId = jActivity.shopId;//门店id
            jRecord.shopName = jActivity.shopName;//门店名称
            jRecord.eventId = jActivity.id;//活动id
            jRecord.eventName = jActivity.eventName;//活动名称
            jRecord.status = 1;//兑奖状态 1：未兑奖  2：已兑奖
            var random = LotteryLogService.getRandomCode(16);
            jRecord.userId = loginUserId;//用户id
            jRecord.verificationCode = random;//获取验证码
            jRecord.name=jUser.name || jUser.nickName || jUser.mobilPhone || jUser.loginId || jUser.realName ||''  ;//昵称
            jRecord.mobile =jUser.mobilPhone;//手机
            jRecord.address =jUser.address;//地址
            jRecord.cardno=jUser.cardno;//会员卡号
            jActivity.participants=jActivity.participants+1;//参与人数+1
            LotteryEventManageService.update(jActivity);
        }
        //----------------------------------------------------------
        var newId = LotteryLogService.add(jRecord, loginUserId);
        H5CommonUtil.setSuccessResult(jRecord);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统错误,请稍后再试..");
    }

})();