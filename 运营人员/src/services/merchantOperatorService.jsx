//#import pigeon.js
//#import Util.js
var MerchantOperatorService = (function(pigeon){
    var prefix = "merchantOperator_";
    var f = {
        addOperator:function(merId,userId){
            var m2opId = prefix + "m2op_" + merId;
            var op2mId = prefix + "op2mid_" + userId;
            var m2op = pigeon.getObject(m2opId);
            if(!m2op){
                m2op = {
                    id : m2opId,
                    merId:merId,
                    ops:[userId]
                }
            }
            else{
                if(m2op.ops.indexOf(userId)<0){
                    m2op.ops.push(userId);
                }
            }
            pigeon.saveObject(m2opId,m2op);
            op2m = pigeon.getObject(op2mId);
            if(!op2m){
                op2m = {
                    id:op2mId,
                    userId:userId,
                    merIds:[merId]
                }
            }
            else{
                if(op2m.merIds.indexOf(merId)<0){
                    op2m.merIds.push(merId);
                }
            }
            pigeon.saveObject(op2mId,op2m);
        },
        removeOperator:function(merId,userId){
            var m2opId = prefix + "m2op_" + merId;
            var op2mId = prefix + "op2mid_" + userId;
            var m2op = pigeon.getObject(m2opId);
            var op2m = pigeon.getObject(op2mId);
            if(m2op){
                var idx = m2op.ops.indexOf(userId);
                if(idx>-1){
                    m2op.ops.splice(idx,1);
                }
            }
            if(op2m){
                var idx = op2m.merIds.indexOf(merId);
                if(idx>-1){
                    op2m.merIds.splice(idx,1);
                }
            }
            pigeon.saveObject(m2opId,m2op);
            pigeon.saveObject(op2mId,op2m);
        },
        getMerIdsOfUser:function(userId){
            var op2mId = prefix + "op2mid_" + userId;
            var op2m = pigeon.getObject(op2mId);
            if(op2m){
                return op2m.merIds;
            }
            else{
                return []
            }
        },
        getOpsOfMerchant:function(merId){
            var m2opId = prefix + "m2op_" + merId;
            var m2op = pigeon.getObject(m2opId);
            if(m2op){
                return m2op.ops;
            }
            return [];
        }
    }
    return f;
})($S);