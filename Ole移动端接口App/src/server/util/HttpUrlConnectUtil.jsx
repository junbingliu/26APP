//#import Util.js

var HttpUrlConnectUtil = function () {
    var selfApi = new JavaImporter(
        Packages.java.io,
        Packages.java.net,
        Packages.java.lang.String
    );
    var f = {
        post: function (url, param) {
            var inStream = null;
            var result = "";
            try {
                var realUrl = new selfApi.URL(url);
                // 打开和URL之间的连接
                var conn = realUrl.openConnection();
                // 设置通用的请求属性
                conn.setRequestProperty("accept", "*/*");
                conn.setRequestProperty("connection", "Keep-Alive");
                conn.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
                conn.setRequestMethod("POST");
                // 发送POST请求必须设置如下两行
                conn.setDoOutput(true);
                conn.setDoInput(true);
                var out = new selfApi.DataOutputStream(conn.getOutputStream());
                out.writeBytes(param);//输出请求参数
                out.flush();
                out.close();
                // 定义BufferedReader输入流来读取URL的响应
                inStream = new selfApi.BufferedReader(new selfApi.InputStreamReader(conn.getInputStream(), "utf-8"));
                var line;
                while ((line = inStream.readLine()) != null) {
                    result += line;
                }
            } catch (e) {
                $.log(e);
            } finally {//使用finally块来关闭输出流、输入流
                try {

                    if (inStream != null) {
                        inStream.close();
                    }
                } catch (ex) {
                    $.log(e);
                }
            }
            return result;
        },
        postJson: function (url, json) {
            if (!url || !json) {
                return null;
            }
            var param = "";
            for (var key in json) {
                if (param) {
                    param += "&" + key + "=" + json[key];
                } else {
                    param += key + "=" + json[key];
                }
            }
            return f.post(url, param);
        }

    };
    return f;
}();