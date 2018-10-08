//#import pigeon.js
//#import jobs.js
//#import search.js
//#import user.js
var CombiProductService = (function (pigeon) {
    var prefix = "combiProduct_";
    var combiPartPrefix = "combiPart";

    function Option(data) {
        this.productId = data.productId;
        this.merchantId = data.merchantId;
        this.percentage = data.percentage;
        this.marketPrice = data.marketPrice;
        this.unitPrice = data.unitPrice;
        this.priceType = data.priceType;
        this.price = data.price;
        this.num = data.num;
        this.skuIds = data.skuIds || [];
        this.isDefault = data.isDefault;
    }

    function Part(data) {
        this.name = data.name;
        if (data.options) {
            this.options = data.options.map(function (option) {
                return new Option(option);
            });
        } else {
            this.options = [];
        }
        if (!data.partId) {
            this.partId = combiPartPrefix + "_" + pigeon.getId(combiPartPrefix);
        } else {
            this.partId = data.partId;
        }

        this.tag = data.tag;
    }

    function CombiProduct(data) {
        this.id = data.id || "";
        this.title = data.title || "";
        this.seriesCode = data.seriesCode || "";
        this.seriesDiffName = data.seriesDiffName || "";
        if (data.parts) {
            this.parts = data.parts.map(function (part) {
                return new Part(part);
            });
        }
        else {
            this.parts = [];
        }
        this.columnIds = data.columnIds || "";
        this.fileIds = data.fileIds || [];
        this.price = data.price || "";
        this.priceRecs = data.priceRecs || [];
        this.pcHtml = data.pcHtml || "";
        this.padHtml = data.padHtml || "";
        this.phoneHtml = data.phoneHtml || "";

        this.ownerUserId = data.ownerUserId || "unknown";
        this.certified = data.certified || "F";  //是否已经审核
        this.certifiedTime = data.certifiedTime;  //审核时间
        this.published = data.published || "F"; //是否已经上架
        this.publishedTime = data.publishedTime;//上架时间
        this.lastModifiedTime = data.lastModifiedTime;
        this.createTime = data.createTime || "unknown";
        this.deleted = data.deleted || "F";
        this.extended = data.extended;
        this.merchantId = data.merchantId;
        this.seriesInfoAbout = data.seriesInfoAbout;
        this.aboutFangXing = data.aboutFangXing;
        this.sales = data.sales;
        this.fixedPrice = data.fixedPrice;
        this.equalTradingPrice = data.equalTradingPrice;
        this.sampleRoom = data.sampleRoom;
        this.version = data.version || "";
    }


    var f = {
        addCombiProduct: function (data) {
            var combiProduct = new CombiProduct(data);
            combiProduct.id = prefix + pigeon.getId("combiProduct");
            var now = (new Date()).getTime();
            combiProduct.createTime = now;
            combiProduct.lastModifiedTime = now;
            combiProduct.deleted = "F";
            pigeon.saveObject(combiProduct.id, combiProduct);
            var key = pigeon.getRevertComparableString(now, 13);
            pigeon.addToList(prefix + "all", key, combiProduct.id);

            //开始建立索引
            f.buildIndex(combiProduct.id);
            //索引结束
            return combiProduct.id;
        },
        addAboutFangXing: function (name, userId) {
            var listId = prefix + "_aboutFangXingInfos_all";
            var id = prefix + "_about_" + pigeon.getId(prefix + "aboutFangXingInfos");
            var now = (new Date()).getTime();
            var data = {
                id: id,
                name: name,
                userId: userId,
                createTime: now
            };
            pigeon.saveObject(id, data);
            var key = pigeon.getRevertComparableString("_aboutFangXingInfos", 10);
            pigeon.addToList(listId, key, id);
        },
        addRoomID: function (name) {
            var now = (new Date()).getTime();
            var id = "room_" + pigeon.getId(prefix + "roomId");
            var data = {
                id: id,
                name: name,
                createTime: now
            };
            pigeon.saveObject(id, data);
            var listlogid = prefix + "_CombiProductRomIdLists";
            var logNum = "_CombiProductRomIdLists";
            var key = pigeon.getRevertComparableString(logNum, 10);
            pigeon.addToList(listlogid, key, id);
        },
        getRoomId: function (rootId) {
            return pigeon.getObject(rootId);
        },
        //更新分类
        updateRoomId: function (catId, categoryName) {
            var cat = f.getCategory(catId);
            if (!cat) {
                return;
            }
            cat.name = categoryName;
            pigeon.saveObject(catId, cat);
        },
        getRoomIds: function (start, number) {
            var roomIdlogid = prefix + "_CombiProductRomIdLists";
            var contents = pigeon.getListObjects(roomIdlogid, start, number);
            return contents;
        },
        getAboutFangXing: function (id) {
            return pigeon.getObject(id);
        },
        getAboutFangXings: function (start, end) {
            var listId = prefix + "_aboutFangXingInfos_all";
            return pigeon.getListObjects(listId, start, end);
        },
        updateAboutFangXing: function (id, name, userId) {
            var newAbiutFangXing = f.getAboutFangXing(id);
            var now = (new Date()).getTime();
            newAbiutFangXing.oldName = newAbiutFangXing.name;
            newAbiutFangXing.name = name;
            newAbiutFangXing.lastModifiedTime = now;
            newAbiutFangXing.lastModifiedUserId = userId;
            pigeon.saveObject(newAbiutFangXing.id, newAbiutFangXing);
        },
        delectAboutFangXing: function (id) {
            var listId = prefix + "_aboutFangXingInfos_all";
            var logNum = "_aboutFangXingInfos_all";
            var key = pigeon.getRevertComparableString(logNum, 10);
            pigeon.deleteFromList(listId, key, id);
        },
        getCombiProduct: function (productId) {
            return pigeon.getObject(productId);
        },
        updateCombiProduct: function (data) {
            var combiProduct = new CombiProduct(data);
            //combiProduct.id = prefix + pigeon.getId("combiProduct");
            var now = (new Date()).getTime();
            combiProduct.lastModifiedTime = now;
            pigeon.saveObject(combiProduct.id, combiProduct);
            //开始建立索引
            f.buildIndex(combiProduct.id);
            //索引结束
        },
        deleteCombiProduct: function (productId) {
            var combiProduct = f.getCombiProduct(productId);
            if (combiProduct) {
                var key = pigeon.getRevertComparableString(combiProduct.createTime, 13);
                pigeon.deleteFromList(prefix + "all", key, productId);
                combiProduct.deleted = true;
                f.updateCombiProduct(combiProduct);
                //SearchService.index([null],[productId],"combiProductsMgt");
            } else {
                var now = new Date().getTime();
                f.buildIndex(productId);
            }
        },
        getAllCombiProducts: function (start, limit) {
            var listId = prefix + "all";
            return pigeon.getListObjects(listId, start, limit);
        },
        getCombiProducts: function (ids) {
            var contents = pigeon.getContents(ids);
            var result = [];
            for (var i = 0; i < ids.length; i++) {
                var content = contents[i];
                if (!content || content == null || content == "null") {
                    result.push(new CombiProduct({id: ids[i]}));
                }
                else {
                    var combiProduct = new CombiProduct(JSON.parse(content));
                    if (!combiProduct) {
                        combiProduct = new CombiProduct({id: ids[i]});
                    }
                    result.push(combiProduct);
                }
            }
            return result;
        },
        getPrice: function (combiProduct, userId) {
            var priceRecs = combiProduct.priceRecs;

            var userGroups = UserService.getUserGroups(userId);
            var now = new Date().getTime();
            //判断特价中指定用户的
            for (var i = 0; i < priceRecs.length; i++) {
                var priceRec = priceRecs[i];
                if (priceRec.isSpecial && (now > priceRec.beginTime && now < priceRec.endTime)) {
                    //判断时间
                    if (priceRec.entityType == "entitytype_user" && priceRec.entityId == userId) {
                        return priceRec;
                    }
                }
            }

            for (var i = 0; i < priceRecs.length; i++) {
                var priceRec = priceRecs[i];
                if (!priceRec.isSpecial) {
                    //判断时间
                    if (priceRec.entityType == "entitytype_user" && priceRec.entityId == userId) {
                        return priceRec;
                    }
                }
            }

            var validPriceRecs = [];
            for (var i = 0; i < priceRecs.length; i++) {
                var priceRec = priceRecs[i];
                if (priceRec.isSpecial && (now > priceRec.beginTime && now < priceRec.endTime)) {
                    if (priceRec.entityType == 'entitytype_usergroup') {
                        if (userGroups[priceRec.entityId]) {
                            validPriceRecs.push(priceRec);
                        }
                    }
                }
            }

            for (var i = 0; i < priceRecs.length; i++) {
                var priceRec = priceRecs[i];
                if (!priceRec.isSpecial) {
                    if (priceRec.entityType == 'entitytype_usergroup') {
                        if (userGroups[priceRec.entityId]) {
                            validPriceRecs.push(priceRec);
                        }
                    }
                }
            }

            //从validPriceRecs中选出最低价
            var minRec = null;
            priceRecs.forEach(function (priceRec) {
                if (!minRec) {
                    minRec = priceRec;
                }
                else {
                    if (Number(priceRec.price) < Number(minRec.price)) {
                        minRec = priceRec;
                    }
                }
            });
            return minRec;
        },

        distributePrice: function (combiProduct, priceRec) {
            var productItems = combiProduct.productItems;
            var originTotal = 0;
            productItems.forEach(function (productItem) {
                originTotal += productItem.price * productItem.num;
            });
            var ratio = priceRec.price / originTotal;
            var total = 0;
            productItems.forEach(function (productItem) {
                productItem.unitPrice = (productItem.price * ratio).toFixed(2);
                productItem.totalPrice = productItem.unitPrice * productItem.num;
                total += Number(productItem.totalPrice);
            });
            combiProduct.totalPrice = total;
        },
        buildIndex: function (id) {
            if (!id) {
                return;
            }
            var when = (new Date()).getTime();
            JobsService.submitTask("combiProductsMgt", "jobs/indexCombiProductJob.jsx", {id: id}, when);
        },
        getSalesKey: function (productId) {
            return productId + "_sales";
        },
        getSales: function (key) {
            var sales = 0;
            try {
                sales = pigeon.getAtom(key);
            } catch (error) {
            }
            return sales;
        },
        setSales: function (key, amount) {
            pigeon.setAtom(key, amount);
        },
        getPigeon: function () {
            return pigeon;
        }
    };
    return f;
})($S);