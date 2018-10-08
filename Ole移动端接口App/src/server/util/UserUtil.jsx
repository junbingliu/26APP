var UserUtil = {
    isOleMember: function (jUser) {
        if (!jUser) {
            return false;
        }
        var channel = jUser.channel;//channel是个json对象，记录这个会员属于哪个渠道来的，如Ole，欢乐购，万像城==
        if (!channel) {
            return false;
        }
        var isFound = false;
        for (var key in channel) {
            if (key == "ole") {
                isFound = true;
                break;
            }
        }
        return isFound;
    },
    addToOleMember: function (jUser) {
        if (!jUser) {
            return null;
        }
        var channel = jUser.channel || {};
        var obj = {
            name: "ole",
            addTime: new Date().getTime()
        };
        channel.ole = obj;
        jUser.channel = channel;
    }
};