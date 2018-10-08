//#import pigeon.js
//#import jobs.js

var ClubService = (function (pigeon) {
    var objPrefix = "oleMemberClassSettingObj";
    var listPrefix = "oleMemberClassSettingList";

    var f = {
        addClub: function (jClub, createUserId) {
            var id = f.getNewId();
            var curTime = new Date().getTime();
            var pos = jClub.pos || 100;

            jClub.id = id;
            jClub.pos = pos;
            jClub.createTime = curTime;
            jClub.createUserId = createUserId;
            pigeon.saveObject(id, jClub);

            var listId = f.getListName();
            var key = f.getPosKey(curTime, pos);
            pigeon.addToList(listId, key, id);
            return id;
        },

        delClub: function (id, deleteUserId) {
            var jClub = f.getClub(id);
            if (!jClub) {
                return;
            }

            jClub.isDeleted = true;
            jClub.deleteUserId = deleteUserId;
            jClub.deleteTime = new Date().getTime();
            pigeon.saveObject(id, jClub);

            var pos = jClub.pos || 100;
            var key = f.getPosKey(jClub.createTime, pos);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);

            //放到删除列表
            var deletedListId = f.getDeletedListName();
            pigeon.addToList(deletedListId, key, id);

        },
        updateClub: function (jClub) {
            var id = jClub.id;
            pigeon.saveObject(id, jClub);
        },
        updatePos: function (clubId, pos) {
            var jClub = f.getClub(clubId);
            if (!jClub) {
                return;
            }
            var oldPos = jClub.pos || 100;
            var key = f.getPosKey(jClub.createTime, oldPos);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, clubId);

            pos = Number(pos);
            jClub.pos = pos;
            pigeon.saveObject(clubId, jClub);

            var newKey = f.getPosKey(jClub.createTime, pos);
            pigeon.addToList(listId, newKey, clubId);
        },
        getClub: function (id) {
            var jClub = pigeon.getObject(id);
            if(jClub.isDeleted){
                return null;
            }
            return jClub;
        },
        /**
         *
         * @param id
         * @param check : true:要验证删除状态，false:不验证删除状态
         * @returns {*}
         */
        getClubByDeleteState: function (id, check) {
            if(check){
                return f.getClub(id);
            }
            return pigeon.getObject(id);
        },

        getAllClubList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllClubListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
        },

        getPosKey: function (dateTime, pos) {
            dateTime = parseInt(dateTime / 1000);
            var key = pigeon.getComparableString(pos, 5) + "_" + pigeon.getRevertComparableString(dateTime, 11);
            return key;
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("oleMemberClassSetting_club");
            return objPrefix + "_club_" + idNum;
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {
            return listPrefix + "_club_all";
        },
        getDeletedListName: function () {
            return listPrefix + "_club_deleted";
        }
    };
    return f;
})($S);