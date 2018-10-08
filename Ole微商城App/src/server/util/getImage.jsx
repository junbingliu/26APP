//#import Util.js
//#import HttpUtil.js

(function () {
    var url = $.params['url'];
    if (!url) {
        out.print("请输入url");
        return;
    }
    var is = Packages.net.xinshi.isone.base.IsoneBaseEngine.fileService.getInputStream(url);//使用Url.openConnection用文件流读取

    var string = new Packages.java.lang.String("test");
    var bytes = string.getBytes();
    var bos = new Packages.java.io.ByteArrayOutputStream(bytes.length);
    var size = 0;
    while ((size = is.read(bytes)) != -1) {
        bos.write(bytes, 0, size);//写入到bos里
    }
    is.close();
    bos.close();

    response.reset();
    response.setContentType("image/jpg"); //设置返回的文件类型
    response.setCharacterEncoding("UTF-8");
    var os = response.getOutputStream();  // 写出流信息
    os.write(bos.toByteArray());
    os.flush();
    os.close();
})();