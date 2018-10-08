//#import pigeon.js
//#import jobs.js
//#import Util.js
//#import Info.js
//#import column.js
//#import search.js
//#import $articleCommentLike:services/commentQuery.jsx
//#import $articleCommentLike:services/likeQuery.jsx
var commentLikeService = (function (pigeon) {
    var prefix = "acl_management2";//ID前缀，在meta.json里定义
    var commentList = prefix + "comment_list2";//列表名称
    var likeList = prefix + "like_list2";//点赞列表名称
    var f = {
        /**
         * 构造数据
         * @param param
         * @returns {f}
         */
        aclData: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id || "";
            self.articleId = f.trim(data.articleId);//文章Id
            self.articleTitle = InfoService.getInfo(data.articleId).title;//文章标题
            self.loginId = data.loginId || ""; //评论人ID
            self.commentData = data.commentData || "";//评论内容;
            self.commentType = data.commentType || "1"; //是否审核 0通过 1不通过
            self.commentImage = data.commentImage || ""; //评论图片
            self.approverId = data.approverId; //审核人Id
            self.approvalTime = data.approvalTime; //审核时间
            self.replyComment = data.replyComment; //评论回复
            self.replyTime = data.replyTime;//评论回复时间
            self.likes = data.likes; //评论点赞数
            self.likeLogin = data.likeLogin; //评论点赞人
            self.isImage = "1";
            self.createTime = data.createTime;
            if (self.commentImage != "") {
                self.isImage = "0";
            }
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            return self;
        },
        /**
         * 增加对象，保存数据
         * @param param
         * @returns {*}
         */
        saveObj: function (param) {
            pigeon.saveObject(param.id, param);
            return true;
        },
        /**
         * 添加文章评论
         * @param param
         * @returns {Array}
         */
        addComment: function (param) {
            param = f.aclData(param);//构造数据
            // var searchParams = {
            //     loginId: param.loginId,
            //     articleId: param.articleId
            // };
            // var searchArgs = {
            //     fetchCount: 10,
            //     fromPath: 1
            // };
            // var qValues = commentQuery.getQuery(searchParams);
            // var queryArgs = {
            //     mode: 'adv',
            //     q: qValues
            // };
            // searchArgs.sortFields = [{
            //     field: "createTime",
            //     type: "LONG",
            //     reverse: true
            // }];
            // searchArgs.queryArgs = JSON.stringify(queryArgs);
            // var result = SearchService.search(searchArgs);
            // var totalRecords = result.searchResult.getTotal();
            // //var ids = result.searchResult.getLists();
            // if (totalRecords > 0) {
            //     return "haveOne";
            // }
            if (!param.id) {
                param.id = prefix + "_" + pigeon.getId(prefix);//获取ID
                var key = pigeon.getRevertComparableString(param.createTime, 13);
                pigeon.addToList(commentList, key, param.id);//加入到列表中
            }
            pigeon.saveObject(param.id, param);//保存对象
            f.buildIndex(param.id);//建索引
            return param.id;
        },
        /**
         * 添加点赞
         * @param param
         * @returns {Array}
         */
        addLike: function (param) { //文章点赞
            var articleId = param.articleId;
            var articleLikeId = prefix + "_like" + articleId;
            var like = f.getById(articleLikeId);
            var loginData = {};
            loginData.loginId = param.loginId;
            var now = new Date();
            loginData.createTime = now.getTime();
            var logins = [];
            if (!like) {
                var articleTitle = InfoService.getInfo(articleId).title;
                logins.push(loginData);
                like = {
                    id: articleLikeId, likes: 1,
                    articleTitle: articleTitle,
                    articleId: articleId,
                    logins: logins,
                    type: "likeNum"
                };
                pigeon.saveObject(articleLikeId, like);//记录点赞数
                var key = pigeon.getRevertComparableString(now.getTime(), 13);
                pigeon.addToList(likeList, key, like.id);//加入到列表中
                f.likeBuildIndex(like.id);//建索引
            } else {
                //记录点赞数
                like.likes = Number(like.likes) + 1;
                if (!like.logins) {
                    like.logins = [];
                }
                like.logins.push(loginData);
                pigeon.saveObject(articleLikeId, like);
                f.likeBuildIndex(like.id);//建索引
            }
            return like.likes;
        },
        /**
         * 添加收藏
         * @param param
         * @returns {Array}
         */
        addCollection: function (param) {
            //后台容易取当前文章有哪些人收藏
            var loginData = {};
            var articleData = {};
            var articleList = [];
            var now = new Date();
            var articleId = param.articleId;
            var loginId = param.loginId;
            var articleFileImage = param.articleFileImage;
            var articleFileName = param.articleFileName;
            var articleType = param.articleType;
            loginData.loginId = loginId;
            loginData.createTime = now.getTime();
            if (articleId) {
                var collectionId = prefix + "_collection_" + articleId;
                var collection = f.getById(collectionId);
                articleData.articleId = articleId;
                articleData.createTime = now.getTime();
                articleData.articleType = articleType;
                articleList.push(articleData);
                if (!collection) {
                    var articleTitle = InfoService.getInfo(articleId).title;
                    var logins = [];
                    logins.push(loginData);
                    collection = {
                        id: collectionId,
                        collections: 1,
                        articleTitle: articleTitle,
                        articleId: articleId,
                        logins: logins,
                        type: "collectionNum"
                    };
                    pigeon.saveObject(collectionId, collection);
                    var key = pigeon.getRevertComparableString(now.getTime(), 13);
                    pigeon.addToList(likeList, key, collection.id);//加入到列表中
                    f.likeBuildIndex(collection.id);//建索引
                } else {
                    //记录收藏数
                    collection.collections = Number(collection.collections) + 1;
                    if (!collection.logins) {
                        collection.logins = [];
                    }
                    var head = "0";
                    if (collection.logins != []) {
                        //循环遍历是否有重复收藏
                        for (var v = 0; v < collection.logins.length; v++) {
                            if (collection.logins[v].loginId == loginId) {
                                head = "1";
                                break;
                            }
                        }
                    }
                    if (head == "0") {
                        collection.logins.push(loginData);
                        pigeon.saveObject(collectionId, collection);
                        f.likeBuildIndex(collection.id);//建索引
                    }
                }
            }
            var collectionTypeId = prefix + "_collection_" + loginId;
            var obj = f.getById(collectionTypeId);
            var articleBasisList = [];
            if (!obj) {
                obj = {
                    //一个对象一个收藏夹
                    list: [{
                        articleFileImage: articleFileImage,
                        articleFileName: articleFileName,
                        articleList: articleList,
                        createTime: now.getTime()
                    }],
                    //基础数组
                    articleBasisList: articleBasisList
                };
            } else {
                var isHave = "0";//有没有这个文件夹
                for (var w = 0; w < obj.list.length; w++) {
                    if (obj.list[w].articleFileName == articleFileName) {
                        if (!obj.list[w].articleList) {
                            obj.list[w].articleList = [];
                        }
                        obj.list[w].articleList.push(articleData);
                        isHave = "1";
                        break;
                    }
                }
                if (isHave == "0") {
                    var b = {
                        articleFileImage: articleFileImage,
                        articleFileName: articleFileName,
                        articleList: articleList,
                        createTime: now.getTime()
                    };
                    obj.list.push(b);
                }
            }

            if (obj.articleBasisList != []) {
                articleBasisList = obj.articleBasisList;
            }
            //存入文章基础数组
            var isBasis = "0";
            if (articleId) {
                //此循环是为了保证数组里没有重复的元素
                for (var q = 0; q < articleBasisList.length; q++) {
                    if (articleBasisList[q] == articleId) {
                        isBasis = "1";
                    }
                }
                if (isBasis == "0") {
                    obj.articleBasisList.push(articleId);
                }
            }
            pigeon.saveObject(collectionTypeId, obj);

            if (articleId) {
                return collection.collections;
            } else {
                return true;
            }
        },
        /**
         * 根据ID获取对象
         * @param id
         * @returns {*}
         */
        getById: function (id) {
            var p = pigeon.getObject(id);
            if (!p) {
                return null;
            } else {
                return p;
            }
        },
        /**
         * 获取list
         * @param start 从多少开始
         * @param limit 取多少条
         * @returns {*}
         */
        list: function (start, limit) {
            return pigeon.getListObjects(commentList, start, limit);
        },
        listName: function (oneList, start, limit) {
            return pigeon.getListObjects(oneList, start, limit);
        },
        /**
         * 获取list总数量
         * @returns {*}
         */
        listCount: function (oneList) {
            var oneList1 = "";
            if (!oneList) {
                oneList1 = commentList;
            } else {
                oneList1 = oneList;
            }
            return pigeon.getListSize(oneList1);
        },
        /**
         * 修改对象
         * @param id
         * @param param
         * @returns {boolean}
         */
        update: function (id, param) {
            var obj = f.aclData(param);
            pigeon.saveObject(id, obj);
            f.buildIndex(id);
            return true;
        },
        updateLike: function (id, param) {
            pigeon.saveObject(id, obj);
            f.likeBuildIndex(id);
            return true;
        },
        /**
         * 删除对象
         * @param id
         * @returns {boolean}
         */
        deleteArrayOne: function (arry, one, type) {
            for (var i = 0; i < arry.length; i++) {
                var login = arry[i];
                if (type == "1") {
                    if (login.loginId == one) {
                        arry.splice(i, 1);
                        break;
                    }
                }
                if (type == "2") {
                    if (login.articleId == one) {
                        arry.splice(i, 1);
                        break;
                    }
                }
                if (type == "3") {
                    if (login.articleFileName == one) {
                        arry.splice(i, 1);
                        break;
                    }
                }
            }
            return arry;
        },
        delete: function (id) {
            var obj = f.getById(id);
            if (obj) {
                var key = pigeon.getRevertComparableString(obj.createTime, 13);
                pigeon.deleteFromList(commentList, key, id);
                pigeon.saveObject(id, null);
                f.buildIndex(id);
                return true;
            }
            return false;
        },
        deleteInfo:function (id) {

            pigeon.saveObject(id, null);
        },
        deleteLike: function (param) {
            var likeId = prefix + "_like" + param.articleId;
            var like = f.getById(likeId);
            if (like.logins && like.logins.length > 0) {
                like.likes = Number(like.likes) - 1;
                like.logins = f.deleteArrayOne(like.logins, param.loginId, "1");
                pigeon.saveObject(like.id, like);
                f.likeBuildIndex(like.id);
            }
            return like.likes;
        },
        deleteCollection: function (param) {
            var articleId = param.articleId;
            var loginId = param.loginId;
            var collectionId = prefix + "_collection_" + articleId;
            var collection = f.getById(collectionId);

            if (collection.logins && collection.logins.length > 0) {
                //从一个人总删除某文章的收藏
                var collectionTypeId = prefix + "_collection_" + loginId;
                var obj = f.getById(collectionTypeId);
                for (var t = 0; t < obj.list.length; t++) {
                    var articleList = obj.list[t].articleList;
                    obj.list[t].articleList = f.deleteArrayOne(articleList, articleId, "2");
                }
                for (var d = 0; d < obj.articleBasisList.length; d++) {
                    if (obj.articleBasisList[d] == articleId) {
                        //从一个文章收藏者中删除某个人
                        collection.collections = Number(collection.collections) - 1;
                        collection.logins = f.deleteArrayOne(collection.logins, loginId, "1");

                        obj.articleBasisList.splice(d, 1);
                        pigeon.saveObject(collection.id, collection);
                        f.likeBuildIndex(collection.id);
                        break;
                    }

                }
                pigeon.saveObject(collectionTypeId, obj);
                return collection.collections;
            }
            return false;
        },
        deleteFile: function (param) {
            var loginId = param.loginId;
            var articleFileName = param.articleFileName;
            var articleList = [];
            var collectionTypeId = prefix + "_collection_" + loginId;
            var obj = f.getById(collectionTypeId);
            for (var g = 0; g < obj.list.length; g++) {
                if (obj.list[g].articleFileName == articleFileName) {
                    articleList = obj.list[g].articleList;
                    var length = obj.list.length;
                    obj.list.splice(g, 1);
                    if(length == obj.list.length){
                        obj.list.splice(g+1, 1);
                    }
                    break;
                }
            }

            if(articleList.length > 0){
            for (var u = 0; u < articleList.length; u++) {
                if(articleList[u] != {}){
                var articleId = articleList[u].articleId;
                var abl = obj.articleBasisList;
                for (var e = 0; e < abl.length; e++) {
                    if (abl[e] == articleId) {
                        var collectionId = prefix + "_collection_" + articleId;
                        var collection = f.getById(collectionId);
                        collection.collections = Number(collection.collections) - 1;
                        collection.logins = f.deleteArrayOne(collection.logins, loginId, "1");
                        obj.articleBasisList.splice(e, 1);
                        pigeon.saveObject(collection.id, collection);
                        f.likeBuildIndex(collection.id);
                        break;
                    }
                }
                }
            }
            }
            pigeon.saveObject(collectionTypeId, obj);
            return true;
        },
        updateFileM: function (param) {
            var loginId = param.loginId;
            var articleFileName = param.articleFileName;
            var articleFileImage = param.articleFileImage;
            var newFileName = param.newFileName;
            var collectionTypeId = prefix + "_collection_" + loginId;
            var obj = f.getById(collectionTypeId);
            for (var g = 0; g < obj.list.length; g++) {
                if (obj.list[g].articleFileName == articleFileName) {
                    if (newFileName) {
                        obj.list[g].articleFileName = newFileName;
                    }
                    if (articleFileImage != {}) {
                        obj.list[g].articleFileImage = articleFileImage;
                    }
                    break;
                }
            }
            pigeon.saveObject(collectionTypeId, obj);
            return true;
        },
        /**
         * 重建索引
         * @param ids
         */
        buildIndex: function (ids) {
            var jobPageId = "services/commentBuildIndex.jsx";
            JobsService.runNow("articleCommentLike", jobPageId, {ids: ids});
        },
        likeBuildIndex: function (ids) {
            var jobPageId = "services/likeBuildIndex.jsx";
            JobsService.runNow("articleCommentLike", jobPageId, {ids: ids});
        },
        trim: function (str) {
            if (!str) {
                return '';
            }
            return str.trim();
        }
    };
    return f;
})($S);