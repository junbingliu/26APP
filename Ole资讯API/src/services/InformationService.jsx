//#import pigeon.js
//#import Util.js
//#import column.js
//#import DateUtil.js
//#import product.js
//#import inventory.js
//#import sysArgument.js
//#import login.js
//#import file.js
//#import search.js
//#import user.js
//#import Info.js

var InformationAPI = new JavaImporter(
    Packages.net.xinshi.isone.commons,
    Packages.net.xinshi.isone.modules.commend,
    Packages.org.json,
    Packages.net.xinshi.isone.base,
    Packages.net.xinshi.isone.lucene,
    Packages.net.xinshi.discovery.search.client.query,
    Packages.net.xinshi.isone.modules.info,
    Packages.net.xinshi.isone.modules,
    Packages.net.xinshi.isone.lucene.search.info,
    Packages.net.xinshi.isone.modules.product,
    Packages.java.util
);

/**
 * 咨询栏目服务类
 */
var InformationService = (function (pigeon) {

    var fun = {};
    var prefix = "information_browse_"; // 保存文章浏览数量key的前缀

    /**
     * 根据主栏目ID查询子栏目信息
     * @param pid 主栏目ID
     * @return Array 数组元素为JSON对象
     */
    fun.getChildInfoByPID = function (pid) {
        $.log("\n\n ole column id = " + pid + "\n\n");
        var list = ColumnService.getChildren(pid);
        return list.map(function (child) {
            $.log("\n\n\n child info = " + child + "\n\n");
            if (ColumnService.hasChildren(child["id"])) {
                $.log("\n\n\n childId = " + child["id"] + "\n\n");
                child["hasChild"] = true;
                child["childColumn"] = ColumnService.getChildren(child["id"]);
            } else {
                child["hasChild"] = false;
            }
            return child;
        });
    };

    /**
     * 栏目信息查询
     * @param searchParams 查询参数对象
     * @param userId 登录用户ID
     * @return Object 数组元素为JSON对象
     */
    fun.searchInformation = function (searchParams, userId) {

        var columnId = searchParams["columnId"] || ""; // 栏目ID
        var merchantId = searchParams["merchantId"] || "head_merchant"; // 商家ID
        var start = searchParams["from"] || 0; // 查询开始位置
        var limit = searchParams["limit"] || 10; // 页面数量
        var title = searchParams["title"]; // 文章标题
        var imageSize = searchParams["imageSize"]; // 图片大小
        var channel = searchParams["channel"]; //渠道
        $.log("\n\n searchParams 2222222222222 = " + JSON.stringify(searchParams) + "\n\n");

        // TODO 此参数对象可添加其他一些查询参数: 如创建时间, 创建人, 审核状态, 目前只提供了文章标题搜索
        var params = {
            // "certifyState": "1", // 审核状态, 0: 未审核, 1: 审核通过, 2: 审核不通过 // 不再通过审核状态进行筛选, 直接通过上架下架筛选数据
            "publishState": "1", // 上下架状态: 1 上架, 0 下架
            "title": title, // 文章标题
            "channel": channel, // 发布渠道app,h5
            "path": columnId, // 咨询栏目ID
            "initialRecord": start || 0, // 查询开始位置
            "fetchCount": limit || 10 // 分页量
        };

        $.log("\n\n search params111111111 = " + JSON.stringify(params) + "\n\n");

        var searchParamJavaBean = $.getBean("net.xinshi.isone.lucene.search.info.InfoSearchArgs", params);

        // 排序
        var sortFields = [];
        var reverse = true;
        if (InformationAPI.InfoUtil.isVirtualColumn(params.path)) {
            reverse = false;
        }
        if (title) {
            sortFields.push(new InformationAPI.SortField("title_text", InformationAPI.SortField.Type.STRING, false));
        }
        var orderKey = InformationAPI.InfoUtil.getSortPosKey(merchantId, columnId); // 排序字段
        sortFields.push(new InformationAPI.SortField(orderKey, InformationAPI.SortField.Type.LONG, false));
        sortFields.push(new InformationAPI.SortField(InformationAPI.InfoSearchFields.Numeric.LASTMODIFYTIME, InformationAPI.SortField.Type.STRING_VAL, true));
        searchParamJavaBean.setSortFields(sortFields);

        // $.log( "\n\n\n information search params = " + JSON.stringify($.java2Javascript(searchParamJavaBean)) + " \n\n\n");

        // 通过搜索引擎查询索引ID
        var searchResults = InformationAPI.IsoneFulltextSearchEngine.searchServices.search(searchParamJavaBean);
        var ids = searchResults.getLists();
        var rowCount = searchResults.getTotal(); // 条目总数
        var infoList = InformationAPI.IsoneModulesEngine.infoService.getListDataByIds(ids, false);
        InformationAPI.IsoneModulesEngine.productService.setNoVersions(ids, infoList);

        var list = [];
        for (var i = 0, len = infoList.size(); i < len; i++) {
            var tempInfo = JSON.parse(infoList.get(i).toString());

            // TODO 这里添加栏目其他字段
            var info = {
                "id": tempInfo["objId"], // 资讯ID
                "columnId": tempInfo["columnId"], // 资讯所属栏目ID
                "title": tempInfo["title"], // 资讯标题
                "author": tempInfo["author"], // 资讯作者
                "source": tempInfo["source"], // 资讯来源
                "createTime": tempInfo["createTime"] ? DateUtil.getLongDate(parseInt(tempInfo["createTime"])) : "", // 创建时间
                // "content": tempInfo["content"], // 资讯内容
                "descriptions": tempInfo["preface"], // 资讯内容简介, 使用 SEO优化 -> 关键字字段
                "favoriteCount": tempInfo["favoriteCount"], // 收藏数量
                "likeCount": tempInfo["likeCount"], // 收藏数量
                "browseCount": tempInfo["browseCount"], // 收藏数量
                "coverImg": getImgURL(tempInfo["bannerImageFileId"]), // 杂志封面
                "shareImg": getImgURL(tempInfo["appShareImageFileId"]) // 分享图片
            };

            var otherInfo = fun.getOtherInfo(tempInfo["objId"], userId);
            list.push($.copy(info, otherInfo));
        }
        return {
            "list": list,
            "total": rowCount
        };
    };

    /**
     * 获取推荐文章信息
     * @param infoId
     */
    var getRecommendInfo = function (infoId) {
        var recommendInfo = []; // 推荐文章数组

        var isList = InformationAPI.IsoneModulesEngine.commendService.getList(merchantId, infoId, InformationAPI.ICommendService.COMMEND_TYPE_INFO);
        var lst = isList.getRange(0, -1);
        var lists = InformationAPI.IsoneModulesEngine.commendService.getListData(lst, true);
        var objIds = new InformationAPI.Vector();

        // $.log("\n\n\n recommend ids length = " + lists.size() + "\n\n\n");

        for (var i = 0, len = lists.size(); i < len; i++) {
            var jRecommend = lists.get(i);
            if (jRecommend === null) {
                continue;
            }
            objIds.add(jRecommend.optString("objId"));
        }
        var objResultList = InformationAPI.IsoneModulesEngine.infoService.getListDataByIds(objIds, true);

        $.log("\n\n\n recommend ids length = " + objResultList.size() + "\n\n\n");

        for (var i = 0, len = objResultList.size(); i < len; i++) {
            var jInfo = objResultList.get(i);
            var tempInfo = JSON.parse(jInfo.toString());
            // $.log("\n\n\n recommend info = " + JSON.stringify(tempInfo) + "\n\n\n");
            // var isCanPublish = InformationAPI.InfoUtil.isCanPublish(tempInfo.objId, jInfo);
            // if (isCanPublish) {
            recommendInfo.push({
                "id": tempInfo["objId"], // 资讯ID
                "columnId": tempInfo["columnId"], // 资讯所属栏目ID
                "title": tempInfo["title"], // 资讯标题
                "coverImg": getImgURL(tempInfo["bannerImageFileId"]), // 杂志封面
                "shareImg": getImgURL(tempInfo["appShareImageFileId"]), // 分享图片
                "descriptions": tempInfo["preface"] // 资讯前言字段
            });
            // }
        }

        // $.log("\n\n\n recommend array info = " + JSON.stringify(recommendInfo) + "\n\n\n");

        return recommendInfo;
    };

    /**
     * 获取文章的其他信息: 点赞数量(likeCount), 收藏数量(favoriteCount), 用户是否收藏(whetherFavorite), 浏览数量(browseCount),
     * @param id 文章
     * @param userId 登录用户ID
     */
    fun.getOtherInfo = function (id, userId) {
        var collectInfo = pigeon.getObject("acl_management2_collection_" + id) || {}; // 收藏信息
        var likeInfo = pigeon.getObject("acl_management2_like" + id) || {}; // 点赞信息
        var resultObject = {
            "likeCount": likeInfo["likes"] || 0, // 点赞数量
            "favoriteCount": collectInfo["collections"] || 0, // 收藏数量
            "browseCount": fun.getBrowseCountById(id) // 浏览数量
        };

        var whetherFavorite = false; // 用户是否收藏
        var whetherLike = false; // 用户是否点赞

        if (userId) {
            if (collectInfo && collectInfo["logins"]) {
                collectInfo["logins"].forEach(function (info) {
                    if (info && info["loginId"] && info["loginId"] === userId) {
                        whetherFavorite = true;
                        return true;
                    }
                })
            }

            if (likeInfo && likeInfo["logins"]) {
                likeInfo["logins"].forEach(function (info) {
                    if (info && info["loginId"] && info["loginId"] === userId) {
                        whetherLike = true;
                        return true;
                    }
                });
            }
        }
        resultObject["whetherFavorite"] = whetherFavorite; // 用户是否收藏, 未登录用户全部返回false
        resultObject["whetherLike"] = whetherLike; // 用户是否点赞, 未登录用户全部返回false

        return resultObject;
    };

    /**
     * 获取图片外网路径
     * @param fileId 文章ID
     */
    var getImgURL = function (fileId) {
        if (!fileId) return "";
        return FileService.getFullPath(fileId);
    };

    /**
     * 根据文章ID获取文章的评论信息: 评论总数量, 前5条评论
     * @param id
     */
    var getCommentInfo = function (id) {

        // 构建搜索条件
        var searchArgs = {
            fetchCount: 5,
            fromPath: 0,
            // 排序字段
            sortFields: [
                {
                    field: "createTime",
                    type: "LONG",
                    reverse: true
                }],
            // 查询参数
            queryArgs: JSON.stringify({
                mode: 'adv',
                q: [
                    // 文章ID
                    {n: 'articleId', v: id, type: 'text', op: "and"},

                    // 评论状态: 0 表示审核通过
                    {n: 'commentType', v: 0, type: 'text', op: "and"}
                ]
            })
        };

        // 通过搜索引擎获取搜索结果
        var result = SearchService.search(searchArgs) || {
            searchResult: {
                getTotal: function () {
                    return 0;
                }
            }
        };
        var commentCount = result.searchResult.getTotal();
        return {
            "commentCount": commentCount
        };
    };

    /**
     * 获取文章浏览数量ID
     * @param id 文章ID
     */
    var getBrowseCountInfoKey = function (id) {
        return prefix + id;
    };

    /**
     * 保存文章浏览数量
     * @param id 文章ID
     */
    var setBrowseCountById = function (id) {
        var key = getBrowseCountInfoKey(id);
        var browseInfo = pigeon.getObject(key) || {};
        var count = browseInfo["count"] || 0;
        // 删除用户阅读数, 开启阅读可以重复累计
        // var userId = LoginService.getFrontendUserId() || "-9999"; // 未登录用户分配虚拟的-9999作为id
        // if (!browseInfo[userId]) { // 将登录用户ID保存在在线浏览对象的属性中, 用来判断是否重复浏览, 重复浏览只算一次
        //     browseInfo[userId] = 1;
        //     ++count;
        // }
        browseInfo["count"] = ++count;
        pigeon.saveObject(key, browseInfo)
    };

    /**
     * 获取文章浏览数量
     * @param id 文章ID
     */
    fun.getBrowseCountById = function (id) {
        var info = pigeon.getObject(getBrowseCountInfoKey(id)) || {};
        $.log("\n\n get browse info " + JSON.stringify(info) + "\n\n");
        return parseInt(info["count"] || 1);
    };

    /**
     * 通过文章ID查询文章关联的商品列表
     * @param id
     * @return Array 商品列表数组
     */
    var getProductInfoListByInformationId = function (id) {
        var merchantId = "head_merchant"; // 商家ID
        var isList = InformationAPI.IsoneModulesEngine.commendService.getList(merchantId, id, InformationAPI.ICommendService.COMMEND_TYPE_PRODUCT);
        if (parseInt(isList.getSize()) > 0) {
            var lst = isList.getRange(0, -1);
            var lists = InformationAPI.IsoneModulesEngine.commendService.getListData(lst, true);
            var productInfoList = [];
            for (var i = 0, len = lists.size(); i < len; i++) {
                var productId = JSON.parse(lists.get(i))["objId"];
                $.log("\n\n proudctId = " + productId + " \n\n\n");
                if (productId) {
                    var productInfo = ProductService.getProduct(productId); // 查询商品信息
                    var skuId = ProductService.getHeadSku(productId)["id"]; // 查询商品SKU
                    $.log("\n\n\n skuId => " + skuId);
                    var isCanBeBuy = ProductService.isCanBeBuy(productInfo);//检查商品是否可购买
                    if (!isCanBeBuy) {
                        continue;
                    }
                    var memberPrice = 0; // 会员价格
                    var priceList = ProductService.getMemberPriceBySkuId(productInfo, skuId);//根据SKUID获取会员价
                    if (priceList && priceList.unitPrice) {
                        memberPrice = (priceList.unitPrice / 100).toFixed(2);
                    } else {
                        memberPrice = ProductService.getMemberPrice(productInfo);
                    }

                    var marketPrice = 0; // 市场价格
                    priceList = ProductService.getMemberPriceBySkuId(productInfo, skuId);//根据SKUID获取市场价
                    if (priceList && priceList.unitPrice) {
                        marketPrice = (priceList.unitPrice / 100).toFixed(2);
                    } else {
                        marketPrice = ProductService.getMarketPrice(productInfo);
                    }

                    var spec = "90X90"; // 图片规格
                    var productItem = {
                        "productId": productId,
                        "name": productInfo.name,
                        "sellingPoint": productInfo.sellingPoint, // 产品特色
                        "image": ProductService.getProductLogo(productInfo, spec, ""),
                        "memberPrice": Number(memberPrice).toFixed(2), // 会员价
                        "marketPrice": Number(marketPrice).toFixed(2), // 市场价
                        "sellAbleCount": InventoryService.getProductSellableCount(productInfo) // 可卖数
                    };
                    $.log("\n\n productInfo = " + productItem);
                    productInfoList.push(productItem);
                }
            }
            return productInfoList;
        }
        return [];
    };


    /**
     * 获取资讯详细信息
     * @param id 资讯ID
     * @param userId 登录用户ID
     * @param type 详情类型, "TEXT": 表示获取文本类型, "IMG": 表示获取图片内容
     * @param imageSize 头图大小
     * @return {*} json对象
     */
    fun.getInfoDetails = function (id, userId, type, imageSize) {
        var informationDetailInfo = InfoService.getInfo(id);
        if (informationDetailInfo) {
            informationDetailInfo = {
                "id": informationDetailInfo["objId"], // 资讯ID
                "title": informationDetailInfo["title"], // 资讯Title
                "source": informationDetailInfo["source"], // 资讯来源
                "author": informationDetailInfo["author"], // 资讯作者
                "createTime": informationDetailInfo["createTime"] ? DateUtil.getLongDate(informationDetailInfo["createTime"]) : "", // 资讯创建时间
                "content": type === "IMG" ? "" : informationDetailInfo["content"], // 资讯内容
                "imgContent": type === "IMG" ? fun.regExpImgUrl(informationDetailInfo["content"]) : "", // 新增图片内容, 提取资讯内容中的img标签的src内容
                "coverImg": getImgURL(informationDetailInfo["bannerImageFileId"]), // 封面图片
                "headImage": FileService.getRelatedUrl(informationDetailInfo["headImageFileId"], imageSize || "750X1034"),//文章头图
                "shareInfo": {
                    "shareImg": (getImgURL(informationDetailInfo["appShareImageFileId"]) || getImgURL(informationDetailInfo["bannerImageFileId"])) || "", // 分享图片
                    "shareTitle": (informationDetailInfo["shareTitle"] || informationDetailInfo["title"]) || "",
                    "shareDescription": informationDetailInfo["shareDescription"] || "" // 分享描述
                }
            };
            if (informationDetailInfo.headImage.indexOf("imgundefined") > -1) {
                informationDetailInfo.headImage = "";
            }
            $.copy(informationDetailInfo, fun.getOtherInfo(informationDetailInfo["id"], userId));
            setBrowseCountById(informationDetailInfo["id"]); // 保存文章浏览数量, 浏览数自动+1
        } else {
            throw "ID = " + id + ", 没有数据";
        }

        // 查询评论关联的商品信息
        informationDetailInfo["productInfoList"] = getProductInfoListByInformationId(id);
        $.copy(informationDetailInfo, getCommentInfo(id)); // 获取评论信息
        informationDetailInfo["recommendInfoList"] = getRecommendInfo(id); // 推荐信息
        return informationDetailInfo;
    };

    var merchantId = "head_merchant"; // 商家ID
    var columnId = "col_sysargument"; // 系统参数栏目
    var keyId = "OLE_INFO_COLUMN_ID"; // OLE咨询栏目总ID

    /**
     * 根据ID后去咨询设置信息
     * @return object json对象
     */
    fun.getInformationSetting = function () {
        return SysArgumentService.getSysArgumentStringValue(merchantId, columnId, keyId);
    };

    /**
     * 保存咨询设置信息
     * @param infoColumnId OLE咨询栏目ID
     * @return {*}
     */
    fun.saveInformationSetting = function (infoColumnId) {
        SysArgumentService.setSysArgumentStringValue(merchantId, columnId, keyId, infoColumnId);
    };

    /**
     * 获取OLE咨询栏目总ID
     * @return {*}
     */
    fun.getInfoColumnId = function () {
        var informationSetting = fun.getInformationSetting();
        $.log("\n\n information setting = " + informationSetting + "\n\n");
        return informationSetting;
    };

    /**
     * 删除
     * @param id
     */
    fun.delete = function (id) {
        var o = pigeon.getObject(id);
        if (o) {
            pigeon.saveObject(id, null);
            if (o.createTime) {
                var key = pigeon.getRevertComparableString(o.createTime, 13);
            }
        }
    };

    /**
     * 正则截取富文本中图片的src的内容
     * @param content
     * @return Array 数组中对象包含: type, base64, url.
     * type: 图片类型, HTTP, BASE64
     * base64: 当 type === BASE64 时, 使用此字段记录 base64 的内容
     * url: 当 type === HTTP 时, 使用此字段记录 url 地址
     */
    fun.regExpImgUrl = function (content) {
        if (!content) return [{
            "base64": "",
            "type": "",
            "url": ""
        }];

        //匹配图片（g表示匹配所有结果i表示区分大小写）
        var imgReg = /<img.*?(?:>|\/>)/gi;

        //匹配src属性
        var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

        var imgArray = content.match(imgReg);
        var srcArray = [];
        if (imgArray && imgArray.length > 0) {
            srcArray = imgArray.map(function (img) {
                var src = img.match(srcReg)[1] || "";
                var ifHttp = src.indexOf("http") > -1;
                var base64Index = ";base64,";
                var beginIndex = !ifHttp ? src.indexOf(base64Index) + base64Index.length : 0;
                var base64Content = !ifHttp ? src.slice(beginIndex) : "";
                // console.log(base64Content)
                // console.log("\n")
                // console.log("hello")
                return {
                    url: ifHttp ? src : "",
                    base64: base64Content,
                    type: ifHttp ? "HTTP" : "BASE64"
                }
            })
        }
        return srcArray;
    };


    return fun;
})($S);
