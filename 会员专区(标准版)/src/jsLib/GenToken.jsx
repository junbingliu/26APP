var GenTokenApi =  new JavaImporter(
    Packages.org.json,
    Packages.net.xinshi.isone.modules,
    Packages.net.xinshi.isone.base,
    Packages.java.util,
    Packages.java.security,
    Packages.net.xinshi.isone.commons,
    Packages.org.apache.commons.codec.digest
);

var GenToken = {
    /**
     * 生产token并保存在session
     * @param sessionName
     * @returns {string}
     */
    get:function(sessionName){
        var token = GenTokenApi.IsoneBaseEngine.sessionService.getSessionValue(sessionName,request);
        if(token == null || token == ""){
            token = GenTokenApi.DigestUtils.md5Hex(new GenTokenApi.SecureRandom().nextInt() + "");
            GenTokenApi.IsoneBaseEngine.sessionService.addSessionValue(sessionName,token,request,response);
        }
        return token + "";
    },
    /**
     * 在session中删除指定token值
     * @param sessionName
     */
    remove:function(sessionName){
        GenTokenApi.IsoneBaseEngine.sessionService.removeSessionValue(sessionName,request);
    }
};
