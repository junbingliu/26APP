function AppEditor(m,appId,pageId,renderEngine){
var self = this;
self.m = m;
self.appId = appId;
self.pageId = pageId;
self.renderEngine = renderEngine;
self.setCurrentPage = function(pageId){
$(".page").hide();
$("#" + pageId).show();
};

self.modal = function(pageId,show){
if(!show){
$(".page").hide();
}
$("#" + pageId).show();
};
$("body").on("click",".form_datetime",{},function(event) {
$(this).datetimepicker({
format: 'yyyy/mm/dd hh:ii:ss',
language: 'zh-CN',
weekStart: 1,
todayBtn: 1,
autoclose: 1,
todayHighlight: 1,
startView: 2,
forceParse: 0,
showMeridian: 1,
minuteStep: 5
});
})


self.initPage = function($root,$configs){
var style = ['style="',"-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)';",
"filter: alpha(opacity=50);",
"opacity: .5;",
"position:absolute;",
"width:4000;",
"height:4000;",
"z-index:99999;",
"top:0;",
"left:0;",
"background-color:green;",
"cursor:pointer;",
'"'
].join("");

$($root).append("<div id='mask' class='mask' " +style + " ></div>");
$("#mask",$root).hide();

(function HtmlEditor(e, configs) {
var self = {};
self.clicking = false;
$("[data-type='html']", e).attr("contenteditable", "true");
$("[data-type='html']", e).ckeditor({ allowedContent: true });

$("[data-type='html']", e).on("click", function () {
var bgcolor = $(this).attr("oldBgColor");
$(this).css("background-color", bgcolor);
});

var mask = $("#mask", e);
$("[data-type='html']", e).mouseenter(function () {
if (self.clicking ) {
self.clicking = false;
return;
}
var offset = $(this).offset();
var height = $(this).attr("data-height");
if (!height) {
height = $(this).height();
}
var width = $(this).attr("data-width");
if (!width) {
width = $(this).width();
}

mask.css({left: offset.left, top: offset.top, width: width, height: height});
mask.show();
var currentElem = $(this);
mask.off("click");
mask.click(function(){
self.clicking  = true;
mask.hide();
currentElem.click();
mask.off("click");
});
});
mask.mouseleave(function () {
mask.hide();
mask.off("click");
});

$("[data-type='html']", e).on("blur", function () {
var dataId = $(this).attr("data-id");
var subType = $(this).attr("subType");
var html = $(this).html();
var param = {
appId: configs.appId,
pageId: configs.pageId,
m:configs.m,
subType:subType
};
param["dataId"] = dataId;
param["dataValue"] = html;
param['type'] = 'html';
param["dataType"] = "string"; //还可以是string

$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
}
}, "json");
});

})($root, $configs);

function UploadImgEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.currColumn=null;
self.iframeUrl=ko.observable();
self.dataId = null;

self.closeUploadImgEditor = function(){
self.photoGalleryEditor.getPageData(1);
$("#UploadImgEditor").hide();

};
self.showUploadImgEditor = function(){
self.photoGalleryEditor=window["photoGallery"];
self.currColumn=self.photoGalleryEditor.currColumn;
var host = window.location.host
self.iframeUrl("http://"+host+"/OurHome/modules/filemanager/ImageUploadForm.jsp?imgColumnId="+self.currColumn+"&columnId=col_image&merchantId="+self.merchantId+"");
$("#UploadImgEditor").show();
$("#UploadImgEditor").draggable({ handle: ".modal-header" });
};
};
(function UploadImg(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var uploadImgEditor = window["uploadImgEditor"];
if(uploadImgEditor){
self.editorViewModel = uploadImgEditor;
}
else{
self.editorViewModel = new UploadImgEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("UploadImgEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("UploadImgEditor"));
window["uploadImgEditor"] = self.editorViewModel;
};

})($root, $configs);
function ImgItem(param) {
this.id = ko.observable(param.id);
this.fileId = ko.observable(param.fileId);
this.imgUrl = ko.observable(param.showImageUrl||param.imgUrl);
this.selected = ko.observable(false);
this.linkTo = ko.observable(param.linkTo||"");
this.description=ko.observable(param.description||"");
if (param.name && param.name.length > 12) {
param.name = param.name.substring(0, 12);
}
this.name = ko.observable(param.fileName);
this.openInNewPage=ko.observable(param.openInNewPage||"_blank");
this.startDate=ko.observable(param.startDate);
this.endDate=ko.observable(param.endDate);
};
function PhotoGalleryEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.searchKeyWord=ko.observable();
self.selectedItem=null; /**单选状态下用于记录前一次选中图片**/
self.selectedImg=ko.observable(); /**当前操作选中的图片--单选状态下用到**/
self.selectedItems=ko.observableArray([]);/**当前操作选中的图片,作临时存储--多选状态下用到**/
self.selectedImgList=ko.observableArray([]);/**当前操作选中的图片--多选状态下用到**/
self.isSearch=false;
self.currColumn=null;
self.displayLoading=ko.observable(false);
self.imgList=ko.observableArray([]);
self.pageSize=24;/**每页显示的条数**/
self.currPage=ko.observable(1);/**当前页码**/
self.pageCount=ko.observable();/**总页数**/
self.multiSelect=ko.observable(false);/**用于开启多选功能**/
self.init=function(){
self.uploadImgEditor=window["uploadImgEditor"];
};
self.init();
self.openSelectImgView = function(multiSelect){
self.multiSelect(multiSelect);
for(var i=0;i<self.selectedItems().length;i++){
self.selectedItems()[i].selected(false);
};
self.selectedItems.removeAll();/**清空选择内容**/
if(self.selectedItem){
self.selectedItem.selected(false);
self.selectedItem=null;/**清空选择内容**/
}

$("#PhotoGallery").show();
};
self.selectAll=function(){
var flag=false;
if(self.selectedItems().length==self.imgList().length){
flag=true;
}
for(var i=0;i<self.imgList().length;i++){
var item=self.imgList()[i];
if(flag){
item.selected(false);
self.selectedItems.removeAll();
console.log(self.selectedItems().length);
}else{
item.selected(true);
self.selectedItems.push(item);
}

}
};
self.getImgList=function(param){
$.ajax({
type: "POST",
url: "/OurHome/modules/filemanager/ImageSortList.jsp",
dataType:"JSON",
data: param,
beforeSend:function(){
self.displayLoading(true);
},
success: function(data){
self.displayLoading(false);
var items = $.map(data.records, function (itemData) {
return new ImgItem(itemData);
});
self.imgList(items);
var length=Math.ceil(data.total/self.pageSize);
self.pageCount(length);
},
complete:function(){
self.displayLoading(false);
}
});
};
self.getPageData=function(pageNum){
var start=(pageNum-1)*self.pageSize;
self.currPage(pageNum);
var param={limit:self.pageSize,imgColId:self.currColumn,merchantId:self.merchantId,isSearch:self.isSearch,start:start,keyword:self.searchKeyWord()};
self.getImgList(param);
};
self.nextPage=function(){
if(self.currPage()==self.pageCount()){
return;
}
self.getPageData(Number(self.currPage())+1)
};
self.toPage=function(){
if(self.currPage()<1){
self.currPage(1);
}else if(self.currPage()>self.pageCount()){
self.currPage(self.pageCount());
};
self.getPageData(self.currPage())
};
self.prePage=function(){
if(self.currPage()==1){
return;
}
self.getPageData(Number(self.currPage())-1)
};
self.selectImg=function(item){
if(self.multiSelect()){
if(item.selected()){
item.selected(false);
self.selectedItems.remove(item);
}
else{
item.selected(true);
self.selectedItems.push(item);
};
}else{
if (self.selectedItem) {
self.selectedItem.selected(false);
};
item.selected(true);
self.selectedItem = item;
}
};
self.cloneItem = function(item){
var jitem = ko.mapping.toJS(item);
return new ImgItem(jitem);
};

self.confirmSelect = function () {
if(self.multiSelect()){
if(self.selectedItems()&&self.selectedItems().length>0){
for(var i=0;i<self.selectedItems().length;i++){
var item=self.selectedItems()[i];
var newItem= self.cloneItem(item);
self.selectedImgList.push(newItem);
};

};

}else{
if(self.selectedItem){
self.selectedImg(self.selectedItem.imgUrl());
self.selectedItem.selected(false);
};
};
self.closeSelectImg();

};

self.search=function(){
self.isSearch=true;
self.getPageData(1);
};
self.closeSelectImg = function(){
$("#PhotoGallery").hide();

};
self.init=function(){
var setting = {
callback: {
onClick: zTreeOnClick=function(event, treeId, treeNode) {
self.currColumn=treeNode.id;
self.isSearch=false;
self.getPageData(1);
}
}
};
$.post("client/editors/photoGallery/serverhandler/getColumn.jsx",{m:self.merchantId},function (data) {
self.currColumn=data.id;
self.getPageData(1);
$.fn.zTree.init($("#imgFileTree"),setting,data);
}, "json");
}
self.init();
}

(function PhotoGallery(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var photoGallery = window["photoGallery"];
if(photoGallery){
self.editorViewModel = photoGallery;
}
else{
self.editorViewModel = new PhotoGalleryEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("PhotoGallery"));
ko.applyBindings(self.editorViewModel,document.getElementById("PhotoGallery"));
window["photoGallery"] = self.editorViewModel;
};
$("#PhotoGallery").draggable({ handle: ".modal-header" });

})($root, $configs);
function Item(data, parent) {
var self = this;
self.url = ko.observable(data.url);
self.name = ko.observable(data.name);
self.columnId = ko.observable(data.columnId);
self.html = ko.observable(data.html);
self.custom=ko.observable(data.custom||"false");
self.sameLine = ko.observable(data.sameLine || false);
self.currentLevel = data.level;
self.parent = parent;
self.selected = ko.observable(false);
self.children = ko.observableArray();
self.icon = ko.observable(data.icon);
if (data.children) {
for (var i = 0; i < data.children.length; i++) {
var child = data.children[i];
if(child) {
child.level = data.level + 1;
var childItem = new Item(child, self);
self.children.push(childItem);
}
}
}
};
function SelectCategoriesDialog(merchantId) {
var self = this;
self.merchantId = merchantId;
self.categories = ko.observableArray();
self.selectedCategories = ko.observableArray();

self.openDialog = function (parentItem) {
self.parentItem = parentItem;
$('#fancyCategory_selectCategories').modal("show");
$.post("/productCategoryApp/pages/handler/productColumns.jsx", {m: self.merchantId, id: self.parentItem.columnId()}, function (data) {
if (data.state == 'ok') {
var c = $.map(data.records, function (item) {
return new Item({name: item.name, columnId: item.id, level: self.parentItem.currentLevel + 1,custom:item.custom}, self.parentItem);
});

self.categories(c);
}
;
}, "json");
};

self.ok = function () {
console.log(self.selectedCategories());

self.parentItem.children(self.selectedCategories().concat(self.parentItem.children()));
$('#fancyCategory_selectCategories').modal("hide");
}
};

function ItemDialog() {
var self = this;
self.name = ko.observable();
self.url = ko.observable();
self.columnId = ko.observable();
self.icon = ko.observable();
self.custom=ko.observable("false");
self.sameLine = ko.observable("false");
self.openDialog = function (parentItem, currentItem) {
self.parentItem = parentItem;
self.currentItem = currentItem;
if (currentItem) {
self.name(currentItem.name());
self.url(currentItem.url());
self.columnId(currentItem.columnId());
self.icon(currentItem.icon());
self.custom(currentItem.custom());
self.sameLine (currentItem.sameLine());
}
console.log("sameLine=" + self.sameLine());
$('#fancyCategory_addItem').modal("show");
};
self.ok = function () {
if (self.currentItem) {
self.currentItem.name(self.name());
self.currentItem.url(self.url());
self.currentItem.columnId(self.columnId());
self.currentItem.icon(self.icon());
self.currentItem.custom(self.custom());
self.currentItem.sameLine(self.sameLine());
}
else {
var item = new Item({name: self.name(), columnId: self.columnId(), level: self.parentItem.currentLevel + 1, url: self.url(),custom:self.custom(),sameLine:self.sameLine()}, self.parentItem);
var children = self.parentItem.children();
children.push(item);
self.parentItem.children(children);
}

$('#fancyCategory_addItem').modal("hide");
}
};

function FancyCategoryEditor(appId, pageId, merchantId, pageData, appEditor) {
var self = this;
self.rootItem = new Item({url: "/", columnId: "c_10000", level: 0}, null);
self.levelCurrentItems = ko.observableArray();
self.levelCurrentItems.push(self.rootItem);
self.pageData = pageData;
self.appEditor = appEditor;

self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.dataId = null;
self.subType = null;
self.categoriesDialog = new SelectCategoriesDialog(merchantId);
self.itemDialog = new ItemDialog();
self.returnMainFrame = function () {
self.appEditor.setCurrentPage("mainFrame");
self.appEditor.refresh();
};

self.selectCategoriesDialog = function (parentItem) {
self.categoriesDialog.openDialog(parentItem);
};

self.addItemDialog = function (parentItem) {
self.itemDialog.openDialog(parentItem);
};

self.select = function (item) {
var currentLevel = item.currentLevel;

for (var j = 0; j < item.parent.children().length; j++) {
var cItem = item.parent.children()[j];
cItem.selected(false);
}
var newCurrentItems = self.levelCurrentItems().slice(0, currentLevel);
self.levelCurrentItems(newCurrentItems);
self.levelCurrentItems.push(item);
item.selected(true);
for (var k = 0; k < item.children().length; k++) {
var kitem = item.children()[k];
if (kitem.selected()) {
self.select(kitem);
kitem.parent = item;
}
;
}
;
};
self.deleteItem = function (item) {
bootbox.confirm("确定删除吗？", function (result) {
if (result) {
var currentLevel = item.currentLevel;
item.parent.children.remove(item);
var newCurrentItems = self.levelCurrentItems().slice(0, currentLevel);
self.levelCurrentItems(newCurrentItems);
}
;
});
};
self.editItem = function (item) {
self.itemDialog.openDialog(item.parent, item);
};
self.setDataId = function (dataId) {
self.dataId = dataId;
var data = self.appEditor.getPageDataProperty(dataId);
if (!data) {
self.rootItem = new Item({url: "/", columnId: "c_10000", level: 0}, null);
}
else {
data.level = 0;
self.rootItem = new Item(data, null);
}
self.levelCurrentItems.removeAll();
self.levelCurrentItems.push(self.rootItem);
};

self.save = function () {
var mapping = {
'ignore': ["propertyToIgnore", "parent"]
};
var data = ko.mapping.toJS(self.rootItem, mapping);

var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};


param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'fancyCategories';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
}
else {
bootbox.alert("数据保存成功！");
//从服务器上重新加载数据，因为可能数据发生了变化
self.appEditor.setPageDataProperty(self.dataId, data);
self.appEditor.loadPageData(self.dataId);
};
}, "json");
};


};
(function FancyCategories(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var fancyCategoryEditor = window["fancyCategoryEditor"];
if(fancyCategoryEditor){
self.editorViewModel = fancyCategoryEditor;
}
else{
self.editorViewModel = new FancyCategoryEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("fancyCategoriesEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("fancyCategoriesEditor"));
window["fancyCategoryEditor"] = self.editorViewModel;
}


self.clicking = false;
$(".item .sortLayer", e).hide();
console.log("FancyCategory init...");
$("[data-type='fcat']", e).each(function (index,domEle) {
var mode=$(domEle).attr("data-mode");

if(mode!='simple'){
var signElem =  $("#fancyCategories_sign > div").clone();

var mask = $("#mask", e).clone();
signElem.appendTo($(domEle)).mouseenter(function (){
var height = $(domEle).height();
var width =  $(domEle).width();
mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
mask.show();
mask.off("click");
}).mouseleave(function(){
mask.remove();
}).click(function(){
self.clicking = true;
mask.hide();
var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
self.editorViewModel.setDataId(dataId);
var subType = $(domEle).attr("dataSubType");
self.editorViewModel.sunType = subType;
configs.appEditor.setCurrentPage("fancyCategoriesEditor");
});
}
else{
$(domEle).mouseenter(function(){
var height = $(domEle).height();
var width =  $(domEle).width();
var offset = $(domEle).offset();
var mask = $("#mask", e);
mask.css({left: offset.left, top: offset.top, width: width, height: height}).appendTo($(domEle));
mask.show();
mask.off("click");
mask.click(function(){
self.clicking = true;
mask.hide();
var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
self.editorViewModel.setDataId(dataId);
var subType = $(domEle).attr("dataSubType");
self.editorViewModel.sunType = subType;
configs.appEditor.setCurrentPage("fancyCategoriesEditor");
});
}).mouseleave(function(){
$("#mask", e).hide();
});

}

});
/*fancy category begin*/
$(".item > .sortLayer",e).hide();
$(".item",e).mouseenter(function(){
$(".sortLayer",this).fadeIn(300);
$(this).addClass("itemCur");
}).mouseleave(function(e){
if(e.relatedTarget.id=="mask"){
return;
}
$(".sortLayer",this).hide();
});
//万家菜单弹出

function sidebar(){
var sidebar = $('.sideGoodCategories',e),
sidebarHd = sidebar.find('.sideGoodCategoriesHd'),
sidebarBd = sidebar.find('.sideGoodCategoriesBd'),
bdTimer = null,
menu = $('.sideGoodCategoriesMenu',e),
detail = $('.sideGoodCategoriesDetail',e),
menuItems = menu.find('li'),
detailItems = detail.find('.item'),
menuTimer = null,
detailTimer = null,
isSelected = false;
sidebarHd.hover(function (){
sidebarBd.show();
}, function (){
bdTimer = setTimeout(function (){
sidebarBd.hide();
}, 200);
});

sidebarBd.mouseenter(function(){
sidebarBd.show();
clearTimeout(bdTimer);
}).mouseleave(function(evt){
if(evt.relatedTarget.id=="mask"){
return;
}
bdTimer = setTimeout(function (){
//                sidebarBd.hide();
detail.hide();
detailItems.hide();
$('.sideGoodCategoriesMenu .list li',e).removeClass('active');
clearTimeout(detailTimer);
isSelected = false;
}, 200);
});

menuItems.hover(function (){
var that = $(this);

if (isSelected == false){
if (that.index() != -1) {
clearTimeout(detailTimer);
detail.show();

menuItems.removeClass('active');
that.addClass('active');

detailItems.hide();
detailItems.eq(that.index()).show();
isSelected = true;
}
} else {
if (that.index() != -1) {
clearTimeout(detailTimer);
detail.show();

detailTimer = setTimeout(function (){
menuItems.removeClass('active');
that.addClass('active');

detailItems.hide();
detailItems.eq(that.index()).show();
}, 200)
}
isSelected = true;
}

}, function (){

});

detailItems.hover(function (){
clearTimeout(detailTimer);
}, function (){

});

}
sidebar();



})($root, $configs);



function ImageEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.imgSize = ko.observable();
self.selectedImg=ko.observable();
self.init=function(){
self.photoGalleryEditor=window["photoGallery"];
self.photoGalleryEditor.spec=self.spec;
self.selectedImg=self.photoGalleryEditor.selectedImg;
};
self.init();
self.closeImageEditor = function(){
$("#ImageEditor").hide();
};
self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
if(self.selectedImg()){
if(self.spec=="undefined"||!self.spec){
self.spec=null;
}
self.selectedImg(self.appEditor.getImgSize(self.selectedImg(),self.spec));
};
var data={imgUrl:self.selectedImg()};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'image';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,data);
self.closeImageEditor();
self.appEditor.refresh();
}, "json");
};
};
(function Image(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var imageEditor = window["imageEditor"];
if(imageEditor){
self.editorViewModel = imageEditor;
}
else{
self.editorViewModel = new ImageEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("ImageEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("ImageEditor"));
window["imageEditor"] = self.editorViewModel;
};

self.clicking = false;
$("[data-type='image']", e).mouseenter(function (evt) {
if(self.clicking){
self.clicking = false;
return;
}
var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var targetObj = $(evt.currentTarget);
targetObj.hide();
var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
var imgSize = currentElem.attr("imgSize");
if(imgSize){
self.editorViewModel.imgSize(imgSize);
}else{
self.editorViewModel.imgSize("");
}
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
self.editorViewModel.selectedImg(data.imgUrl);
}else{
self.editorViewModel.selectedImg("");
}
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec=spec;
$("#ImageEditor").show();
$("#ImageEditor").draggable({ handle: ".modal-header" });
targetObj.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();
});


})($root, $configs);



function ImgLinkEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.imgSize = ko.observable();
self.linkTo=ko.observable();
self.description=ko.observable();
self.selectedImg=ko.observable();
//    self.startDate=ko.observable();
//    self.endDate=ko.observable();
self.openInNewPage = ko.observable("_blank");
self.init=function(){
self.openInNewPage("_blank");
self.photoGalleryEditor=window["photoGallery"];
self.photoGalleryEditor.spec=self.spec;
self.selectedImg=self.photoGalleryEditor.selectedImg;
};
self.init();
self.closeImgLinkEditor = function(){
$("#ImgLinkEditor").hide();
};
self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
if(self.selectedImg()){
if(self.spec=="undefined"||!self.spec){
self.spec=null;
}
self.selectedImg(self.appEditor.getImgSize(self.selectedImg(),self.spec));
};
var data={imgUrl:self.selectedImg(),imgLinkTo:self.linkTo(),openInNewPage:self.openInNewPage(),description:self.description()};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'imgLink';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,data);
self.closeImgLinkEditor();
self.appEditor.refresh();
}, "json");
};
};
(function ImgLink(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var imgLinkEditor = window["imgLinkEditor"];
if(imgLinkEditor){
self.editorViewModel = imgLinkEditor;
}
else{
self.editorViewModel = new ImgLinkEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("ImgLinkEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("ImgLinkEditor"));
window["imgLinkEditor"] = self.editorViewModel;
};
var mask = $("#mask", e);

self.clicking = false;
$("[data-type='imgLink']", e).mouseenter(function (evt) {
if(self.clicking){
self.clicking = false;
return;
}
var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();
var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
var imgSize = currentElem.attr("imgSize");
if(imgSize){
self.editorViewModel.imgSize(imgSize);
}else{
self.editorViewModel.imgSize("");
}
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
self.editorViewModel.linkTo(data.imgLinkTo);
self.editorViewModel.selectedImg(data.imgUrl);
self.editorViewModel.description(data.description);
//                self.editorViewModel.startDate(data.startDate);
//                self.editorViewModel.endDate(data.endDate);
}else{
self.editorViewModel.linkTo("");
self.editorViewModel.selectedImg("");
self.editorViewModel.description("");
//                self.editorViewModel.startDate("");
//                self.editorViewModel.startDate("");
//                self.editorViewModel.endDate("");
}
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec=spec;
$("#ImgLinkEditor").show();
$("#ImgLinkEditor").draggable({ handle: ".modal-header" });
mask.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();
});

})($root, $configs);

function ImgLinkListEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.attrs=ko.observable();
self.imgSize = ko.observable();
self.selectedImgList=ko.observableArray([]);
self.showTime=ko.observable(true);
self.isMakeRecordId = false;
self.init=function(){
self.photoGalleryEditor=window["photoGallery"];
self.selectedImgList=self.photoGalleryEditor.selectedImgList;
};
self.init();

self.closeImgLinkListEditor = function(){
$("#ImgLinkListEditor").hide();
};
self.delete = function (item) {
self.selectedImgList.remove(item);
}
self.up=function(item){
var index=self.selectedImgList.indexOf(item);
if(index==0){return};
var array=self.selectedImgList();
var temp=array[index-1];
array[index-1]=array[index];
array[index]=temp;
self.selectedImgList(array);
};
self.down=function(item){
var index=self.selectedImgList.indexOf(item);
if(index==self.selectedImgList().length-1){return};
var array=self.selectedImgList();
var temp=array[index+1];
array[index+1]=array[index];
array[index]=temp;
self.selectedImgList(array);
};
self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
if(self.selectedImgList()&&self.selectedImgList().length>0){
for(var i=0;i<self.selectedImgList().length;i++){
var item=self.selectedImgList()[i];
if(self.spec=="undefined"||!self.spec){
self.spec=null;
}
item.imgUrl(self.appEditor.getImgSize(item.imgUrl(),self.spec));
};
};


if(self.isMakeRecordId){
function randomNum(){
var num = "";
for(var r=0;r<6;r++){
num += Math.floor(Math.random() * 10);
}
return num + "";
}
var list = self.selectedImgList();
if(list.length > 0){
list.forEach(function(item){
var id = item.recordId;
if(!id){
item.recordId = randomNum();
}
});
}
}

var data = ko.mapping.toJS(self.selectedImgList);
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'imgLinkList';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeImgLinkListEditor();
self.appEditor.refresh();
}, "json");
};
};
(function ImgLinkList(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var imgLinkListEditor = window["imgLinkListEditor"];
if(imgLinkListEditor){
self.editorViewModel = imgLinkListEditor;
}
else{
self.editorViewModel = new ImgLinkListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("ImgLinkListEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("ImgLinkListEditor"));
window["imgLinkListEditor"] = self.editorViewModel;
};

self.clicking = false;
$("[data-type='imgLinkList']", e).mouseenter(function (evt) {
if(self.clicking){
self.clicking = false;
return;
}

var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();
var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
var showTime = currentElem.attr("showTime");
var imgSize = currentElem.attr("imgSize");
var data=configs.appEditor.getPageDataProperty(dataId);
var begienDate=new Date().getTime();
if(imgSize){
self.editorViewModel.imgSize(imgSize);
}else{
self.editorViewModel.imgSize("");
}

if(data){
var items = $.map(data, function (itemData) {
var item=new ImgItem(itemData);
return item;
});
self.editorViewModel.selectedImgList(items);
}else{
self.editorViewModel.selectedImgList([]);
}
var endDate=new Date().getTime();
console.log("耗时:"+(endDate-begienDate));
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec=spec;
if(!showTime||showTime=="false"){
self.editorViewModel.showTime(false);
}else{
self.editorViewModel.showTime(true);
}
var isMakeId = currentElem.attr("data-make-id");
if(isMakeId && isMakeId == "true"){
self.editorViewModel.isMakeRecordId = true;
}
$("#ImgLinkListEditor").show();
$("#ImgLinkListEditor").draggable({ handle: ".modal-header" });
mask.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();
});


})($root, $configs);
function TextItem(param){
this.content = ko.observable(param.content||"");
this.linkTo = ko.observable(param.linkTo||"");
this.openInNewPage=ko.observable(param.openInNewPage||"_blank");
this.recordId = param.recordId||"";
}
function TextLinkListEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.textLinkList=ko.observableArray([]);
self.isMakeRecordId = false;
self.addItem=function(){
var newItem=new TextItem({});
self.textLinkList.push(newItem);
};
self.init=function(){
self.textLinkList.removeAll();
self.addItem();
};
self.init();
self.closeTextLinkListEditor = function(){
$("#TextLinkListEditor").hide();
};
self.delete = function (item) {
self.textLinkList.remove(item);
};
self.up=function(item){
var index=self.textLinkList.indexOf(item);
if(index==0){return};
var array=self.textLinkList();
var temp=array[index-1];
array[index-1]=array[index];
array[index]=temp;
self.textLinkList(array);
};
self.down=function(item){
var index=self.textLinkList.indexOf(item);
if(index==self.textLinkList().length-1){return};
var array=self.textLinkList();
var temp=array[index+1];
array[index+1]=array[index];
array[index]=temp;
self.textLinkList(array);
};
self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};

if(self.isMakeRecordId){
function randomNum(){
var num = "";
for(var r=0;r<6;r++){
num += Math.floor(Math.random() * 10);
}
return num + "";
}
var list = self.textLinkList();
if(list.length > 0){
list.forEach(function(item){
var id = item.recordId;
if(!id){
item.recordId = randomNum();
}
});
}
}

var data = ko.mapping.toJS(self.textLinkList);
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'textLinkList';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeTextLinkListEditor();
self.appEditor.refresh();
}, "json");
};
};
(function TextLinkList(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var textLinkListEditor = window["textLinkListEditor"];
if(textLinkListEditor){
self.editorViewModel = textLinkListEditor;
}
else{
self.editorViewModel = new TextLinkListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("TextLinkListEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("TextLinkListEditor"));
window["textLinkListEditor"] = self.editorViewModel;
};

self.clicking = false;
$("[data-type='textLinkList']", e).mouseenter(function (evt) {
if(self.clicking){
self.clicking = false;
return;
}

var currentElem = $(this);
configs.appEditor.maskMake(currentElem,e,[{event:"click",fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();
var dataId = currentElem.attr("data-id");
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
var items = $.map(data, function (itemData) {
return new TextItem(itemData);
});
self.editorViewModel.textLinkList(items);
}else{
self.editorViewModel.init();
}
self.editorViewModel.dataId = dataId;
var isMakeId = currentElem.attr("data-make-id");
if(isMakeId && isMakeId == "true"){
self.editorViewModel.isMakeRecordId = true;
}
$("#TextLinkListEditor").show();
$("#TextLinkListEditor").draggable({ handle: ".modal-header" });
mask.off("click");
}}]);
evt.stopPropagation();
});

})($root, $configs);

function TextLinkEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.content = ko.observable("");
self.linkTo = ko.observable("");
self.openInNewPage = ko.observable("_blank");

self.init=function(){
self.content("");
self.linkTo("");
self.openInNewPage("_blank");
};
self.init();
self.closeTextLinkEditor = function(){
$("#TextLinkEditor").hide();
};

self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
var data = {content:self.content(),linkTo:self.linkTo(),openInNewPage:self.openInNewPage()};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'textLink';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeTextLinkEditor();
self.appEditor.refresh();
}, "json");
};
};
(function TextLink(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var textLinkEditor = window["textLinkEditor"];
if(textLinkEditor){
self.editorViewModel = textLinkEditor;
}
else{
self.editorViewModel = new TextLinkEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("TextLinkEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("TextLinkEditor"));
window["textLinkEditor"] = self.editorViewModel;
};

self.clicking = false;
$("[data-type='textLink']", e).mouseenter(function (evt) {
if(self.clicking){
self.clicking = false;
return;
}
var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();
var dataId = currentElem.attr("data-id");
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
self.editorViewModel.linkTo(data.linkTo);
self.editorViewModel.content(data.content);
self.editorViewModel.openInNewPage(data.openInNewPage||"_blank");
}else{
self.editorViewModel.init();
}
self.editorViewModel.dataId = dataId;
$("#TextLinkEditor").show();
$("#TextLinkEditor").draggable({ handle: ".modal-header" });
mask.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();
});


})($root, $configs);

function DateTimeEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.startDate = ko.observable("");
self.endDate = ko.observable("");

self.init=function(){
self.startDate("");
self.endDate("");
};
self.init();
self.closeDateTimeEditor = function(){
$("#DateTimeEditor").hide();
};

self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
var data = {startDate:self.startDate(),endDate:self.endDate()};

param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'dateTime';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeDateTimeEditor();
self.appEditor.refresh();
}, "json");
};
};
(function DateTime(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var dateTimeEditor = window["dateTimeEditor"];
if(dateTimeEditor){
self.editorViewModel = dateTimeEditor;
}
else{
self.editorViewModel = new DateTimeEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("DateTimeEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("DateTimeEditor"));
window["dateTimeEditor"] = self.editorViewModel;
};
var mask = $("#mask", e);

self.clicking = false;
$("[data-type='dateTime']", e).mouseenter(function () {
if(self.clicking){
self.clicking = false;
return;
}
var offset = $(this).offset();
var height = $(this).attr("data-height");
if (!height) {
height = $(this).height();
}
var width =  $(this).attr("data-width");
if(!width){
width = $(this).width();
}

var currentElem = $(this);

mask.css({left: offset.left, top: offset.top, width: width, height: height});
mask.show();
mask.off("click");
mask.click(function(e){
self.clicking = true;
mask.hide();
var dataId = currentElem.attr("data-id");
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
self.editorViewModel.startDate(data.startDate);
self.editorViewModel.endDate(data.endDate);
}else{
self.editorViewModel.init();
}
self.editorViewModel.dataId = dataId;
$("#DateTimeEditor").show();
$("#DateTimeEditor").draggable({ handle: ".modal-header" });

mask.off("click");
});
});
mask.mouseleave(function () {
mask.hide();
mask.off("click");
});

})($root, $configs);
function ProductItem(param) {
this.id = ko.observable(param.id);
this.imgUrl = ko.observable(param.logo || param.imgUrl);
this.selected = ko.observable(false);

this.name = ko.observable(param.name);
this.merchantName = ko.observable(param.merchantName);
this.salesAmount = ko.observable(param.salesAmount);
this.sellingPoint = ko.observable(param.sellingPoint);
this.sellableCount = ko.observable(param.sellableCount || "");
this.weight = ko.observable(param.weight);
this.memberPrice = ko.observable(param.memberPriceFormat || param.memberPrice);
this.memberPriceString = ko.computed(function () {
if (param.memberPriceFormat || param.memberPrice) {
return "￥" + (param.memberPriceFormat || param.memberPrice);
} else {
return "暂无价格";
}

}, this);
this.marketPrice = ko.observable(param.marketPriceFormat || param.marketPrice);
this.marketPriceString = ko.computed(function () {
if (param.marketPriceFormat || param.marketPrice) {
return "￥" + (param.marketPriceFormat || param.marketPrice);
} else {
return "暂无价格";
}

}, this);
var self = this;
self.isCheck = ko.observable(false);
self.shortIndex = ko.observable(param.shortIndex || 0);
self.shortIndex.subscribe(function () {
var val = self.shortIndex();
if (typeof val !== "number") {
if (isNaN(val)) {
return
} else {
self.shortIndex(Number(val))
}
}
var products = productGroupEditor.products();
products = products.sort(function (a, b) {
return a.shortIndex() - b.shortIndex()
});
productGroupEditor.products(products);
});
}

function ProductGroupEditor(appId, pageId, merchantId, pageData, appEditor) {
var self = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.searchKeyWord = ko.observable();
self.currColumn = null;
self.displayLoading = ko.observable(false);
self.selectedItem = ko.observableArray([]);
/**当前操作选中的商品**/
self.products = ko.observableArray([]);
/**上次保存的商品列表**/
self.productList = ko.observableArray([]);
/**目录下的商品**/
self.pageSize = 8;
/**每页显示的条数**/
self.currPage = ko.observable(1);
/**当前页码**/
self.pageCount = ko.observable();
/**总页数**/
self.editing = ko.observable(false);
self.isUpdate = ko.observable(false);
self.isSpecialPrice = ko.observable(false);//是否只显示特价商品,值为Y和N
self.isPublic = ko.observable(false);//是否显示上架商品,值为1和0
self.lowTotalPrice = ko.observable();//价格搜索最低价
self.highTotalPrice = ko.observable();//价格搜索最高价
self.updateItem = null;
self.productType = ko.observable("normal");
/*商品类型，有普通商品:normal,积分换购商品:integral,预售商品:preSale*/
self.extraParam = ko.observable({});
/*搜索商品时可以加一些扩展参数,如：是否预售isPreSale:Y,是否积分换购商品isIntegralBuy:Y*/
self.isUploading = ko.observable(false);
self.isKeepProducts = ko.observable(false);/*保留当前商品列表*/
self.isInProductCheck = ko.observable(true);/*跳过已存在的商品*/

self.beginEdit = function () {
self.editing(true);
};
self.endEdit = function () {
self.editing(false);
};
self.updateProduct = function (item) {
self.openSelectProductView();
self.isUpdate(true);
self.updateItem = item;

};
self.specialPriceChange = function () {

};

/**根据目录获取商品列表**/
self.getProductList = function (param) {
//        self.selectedItem.removeAll();/**清空选择内容**/
$.ajax({
type: "POST",
url: "/widgets/productSelector/productList.jsp",
dataType: "JSON",
data: param,
beforeSend: function () {
self.displayLoading(true);
},
success: function (data) {
self.displayLoading(false);
var items = $.map(data.records, function (itemData) {
return new ProductItem(itemData);
});
self.productList(items);
var length = Math.ceil(data.total / self.pageSize);
self.pageCount(length);
self.replaceObj(items, self.selectedItem());
},
complete: function () {
self.displayLoading(false);
}
});
};

/**
* 由于重新获取数据的时候创建了新的对象，需要通过该方法替换旧的对象，实现选中状态
* @param productList
* @param selectedItem
* @returns {Array}
*/
self.replaceObj = function (productList, selectedItem) {
for (var i = 0; i < selectedItem.length; i++) {
var oldProduct = selectedItem[i];
for (var j = 0; j < productList.length; j++) {
var newProduct = productList[j];
if (oldProduct.id() == newProduct.id()) {
newProduct.selected(true);
selectedItem[i] = newProduct;
}
}
}
};

self.delete = function (item) {
self.products.remove(item);
};

self.closeProductGroupView = function () {
$("#ProductGroupEditor").hide();

};
self.openSelectProductView = function () {
self.selectedItem.removeAll();
/**清空选择内容**/
self.getPageData(1);
$("#ProductSelect").show();
};

self.closeSelectProductView = function () {
$("#ProductSelect").hide();
};

self.cloneItem = function (item) {
var jitem = ko.mapping.toJS(item);
return new ProductItem(jitem);
};

self.confirmSelect = function () {
if (self.selectedItem() && self.selectedItem().length > 0) {
if (self.isUpdate()) {
var selectedItem = self.cloneItem(self.selectedItem()[0]);
if (self.isSelected(selectedItem)) {
bootbox.alert("'"+selectedItem.name()+"'商品已被选择，不能重复选择!");
return;
}
selectedItem.shortIndex(self.updateItem.shortIndex());//将修改前的索引放到修改后的商品信息里
self.products.replace(self.updateItem, selectedItem);
self.isUpdate(false);
} else {
self.selectedItem().forEach(function (item) {
if (self.isSelected(item)) {
return;
}
self.products.push(self.cloneItem(item));
var products = self.products;
products = products.sort(function (a, b) {
return a.shortIndex() - b.shortIndex()
});
self.products(products);
});
}
}
self.closeSelectProductView();
};

self.isSelected = function (item) {
if (!item) {
return false;
}
var isFound = false;
self.products().forEach(function (product) {
if (product.id() == item.id()) {
isFound =  true;
}
});
return isFound;
};

self.selectProduct = function (item) {
if (item.selected()) {
item.selected(false);
self.selectedItem.remove(item);
}
else {
item.selected(true);
self.selectedItem.push(item);
}
};

self.up = function (item) {
var index = self.products.indexOf(item);
if (index == 0) {
return
}
var array = self.products();
var temp = array[index - 1].shortIndex();
array[index].shortIndex(temp - 1);
//array[index-1]=array[index];
//array[index]=temp;
self.products(array);

};
self.down = function (item) {
var index = self.products.indexOf(item);
if (index == self.products().length - 1) {
return
}
var array = self.products();
var temp = array[index + 1].shortIndex();
array[index].shortIndex(temp + 1);
//array[index+1]=array[index];
//array[index]=temp;
self.products(array);


};
self.check = function (item) {
if (item.isCheck()) {
item.isCheck(false)
} else {
item.isCheck(true)
}
};
self.checkAll = function () {
var products = self.products();
for (var i = 0; i < products.length; i++) {
products[i].isCheck(true)
}
};
self.deleteProduct = function () {
var products = self.products();
for (var i = 0; i < products.length; i++) {
if (products[i].isCheck()) {
self.products.remove(products[i]);
i--;
}
}
};
self.uploadExcel = function () {
$("#uploadExcelHtml").modal();
};
self.editSort = function (item) {

};

self.saveDataToDB = function () {
var data = ko.mapping.toJS(self.products);
for (var i = 0; i < data.length; i++) {
var imgUrl = data[i].imgUrl;
imgUrl = self.appEditor.getImgSize(imgUrl, self.spec);
data[i].imgUrl = imgUrl;
data[i].spec = self.spec;
}
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'productGroup';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
}
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (data) {
if (data.state == "ok") {
self.appEditor.setPageDataProperty(self.dataId, JSON.parse(param["dataValue"]));
self.closeProductGroupView();
self.closeSelectProductView();
self.appEditor.refresh()
} else {
bootbox.alert("服务器错误，数据没有保存！");
}
}, "json");
};

self.getPageData = function (pageNum) {
var start = (pageNum - 1) * self.pageSize;
self.currPage(pageNum);
var param = {
limit: self.pageSize,
oriColumnId: self.currColumn,
merchantId: self.merchantId,
isSearchIndex: true,
start: start,
title: self.searchKeyWord(),
publishState: self.isPublic() ? 0 : 1,
isSpecialPrice: self.isSpecialPrice(),
lowTotalPrice: self.lowTotalPrice(),
highTotalPrice: self.highTotalPrice()
};
param.productType = self.productType();
if (self.extraParam()) {
for (var k in self.extraParam()) {
param[k] = self.extraParam()[k];
}
}
self.getProductList(param);
};
self.nextPage = function () {
if (self.currPage() == self.pageCount()) {
return;
}
self.getPageData(Number(self.currPage()) + 1)
};
self.toPage = function () {
if (self.currPage() < 1) {
self.currPage(1);
} else if (self.currPage() > self.pageCount()) {
self.currPage(self.pageCount());
}
self.getPageData(self.currPage())
};

self.prePage = function () {
if (self.currPage() == 1) {
return;
}
self.getPageData(Number(self.currPage()) - 1)
};
self.search = function () {
self.getPageData(1);
};
self.init = function () {
var setting = {
callback: {
onClick: zTreeOnClick = function (event, treeId, treeNode) {
self.currColumn = treeNode.id;
self.searchKeyWord("");
self.getPageData(1);
}
}
};
$.post("client/editors/productGroup/serverhandler/getCatalogue.jsx", {
columnId: "c_10000",
m: self.merchantId
}, function (data) {
self.currColumn = data.id;
$.fn.zTree.init($("#treeDemo"), setting, data);
}, "json");
};
self.init();

self.uploadText = ko.observable("上传");
self.doUpload = function(){
if(self.isUploading()){
bootbox.alert("文件正在上传，请稍候");
return;
}
var file = $("#file").val();
if(!file){
bootbox.alert("请选择要上传的文件");
return;
}
self.uploadText("正在上传，请稍候...");
self.isUploading(true);
$("#uploadExcelForm").ajaxSubmit({
dataType: "json",
beforeSubmit: function(){
$("#uploadExcelHtml").modal("hide");
$("#uploadExcelOkHtml").modal();
},
error:function(err){
self.uploadText("上传");
self.isUploading(false);
$("#uploadExcelOkHtml").modal("hide");
bootbox.alert(err.responseText);
},
success: function(res) {
self.uploadText("上传");
self.isUploading(false);
$("#uploadExcelHtml").modal("hide");
$("#uploadExcelOkHtml").modal("hide");
if(res.state != "ok"){
bootbox.alert(res.msg);
}else{
if(!self.isKeepProducts()){
self.products([])
}
var isInProduct = self.isInProductCheck() && self.products().length > 0;
for (var i = 0; i < res.products.length; i++) {
var item = res.products[i];

if(isInProduct){
var productsIds =
$.map(self.products(), function (item) {
return item.id();
});
if($.inArray(item.id,productsIds) == -1){
self.products().push(new ProductItem(item))
}
} else {
self.products().push(new ProductItem(item))
}
}
var  products = self.products();
products = products.sort(function(a, b){
return a.shortIndex() - b.shortIndex()
});
self.products(products);
var msg = "<div class='model'><hr/><h4>状态列表</h4>"+
"<table class='table table-condensed'><thead>"+
"<tr><td>#</td><td>SKU编码</td><td>商家</td><td>商品名称</td><td>信息</td></tr></thead><tbody>{{~it.list:value:index}}"+
"<tr class='{{=value.state == 'ok' ? 'success' : 'danger'}}'>"+
"<td>{{=index+1}}</td>"+
"<td>{{=value.skuId}}</td>"+
"<td>{{=value.merchantId}}</td>"+
"<td>{{=value.productName}}</td>"+
"<td>{{=value.msg}}</td>"+
"</tr>"+
"{{~}}"+
"</tbody>"+
"</table>"+
"</div>";
var interText = doT.template(msg);
bootbox.alert({
message:  interText({
successLength: res.log.successLength,
errorLength: res.log.errorLength,
list: res.log.list
})
});
}
}
});
return false;
};
}
(function ProductGroup(e, configs) {

var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var productGroupEditor = window["productGroupEditor"];
if(productGroupEditor){
self.editorViewModel = productGroupEditor;
}
else{
self.editorViewModel = new ProductGroupEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("ProductGroupEditorModel"));
ko.applyBindings(self.editorViewModel,document.getElementById("ProductGroupEditorModel"));
window["productGroupEditor"] = self.editorViewModel;
}

self.clicking = false;
$("[data-type='productGroup']", e).mouseenter(function (evt) {

if(self.clicking){
self.clicking = false;
return;
}

var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();

/*商品类型，有普通商品:normal,积分换购商品:integral,预售商品:preSale*/
var productType = currentElem.attr("product-type");
if(!productType){
productType = "normal";
}
/*搜索商品时可以加一些扩展参数,如：是否预售isPreSale:Y,是否积分换购商品isIntegralBuy:Y*/
var extraParam =currentElem.attr("extraParam");
if(!extraParam){
extraParam = {};
}else{
try {
extraParam = JSON.parse(extraParam+"");
} catch (e) {
console.log(e);
extraParam = {};
}
}

var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec = spec;
self.editorViewModel.productType(productType);
self.editorViewModel.extraParam(extraParam);
if(configs.pageData){
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
var products = $.map(data, function (itemData) {
return new ProductItem(itemData);
});
products = products.sort(function(a, b){
return a.shortIndex() - b.shortIndex()
});
self.editorViewModel.products(products);
}else{
self.editorViewModel.products([]);
}
}
configs.appEditor.modal("ProductGroupEditor","true");
$("#ProductGroupEditor").draggable({ handle: ".modal-header" });
$("#ProductSelect").draggable({ handle: ".modal-header" });
mask.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();
});

$('.dropdown-menu').click(function(e) {
e.stopPropagation();
});

})($root, $configs);
function GroupOnItem(param) {
this.id = ko.observable(param.id);
this.productId = ko.observable(param.productId);
this.imgUrl = ko.observable(param.imgUrl);
this.selected = ko.observable(false);
this.title = ko.observable(param.title);
this.price=ko.observable(param.price);
this.count=ko.observable(param.count||0);
this.discount=ko.computed(function() {
return (param.price/param.marketPrice*10).toFixed(1);
}, this);
this.marketPrice=ko.observable(param.marketPrice);
this.marketPriceString= ko.computed(function() {
return "￥" + parseFloat(param.marketPrice/100).toFixed(2)
}, this);
this.priceString = ko.computed(function() {
return "￥" + parseFloat(param.price/100).toFixed(2)
}, this);
this.buyTime = ko.observable(param.buyTime);
this.startDate = ko.observable(param.startDate);
this.endDate = ko.observable(param.endDate);
this.sellingPoint = ko.observable(param.sellingPoint);
};

function GroupOnListEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.selectedItem=ko.observableArray([]);/**当前操作选中的商品**/
self.products=ko.observableArray([]);/**上次保存的商品列表**/
self.pageSize=8;/**每页显示的条数**/
self.currPageData=ko.observableArray([]);/**当前页面的数据**/
self.currPage=ko.observable(1);/**当前页码**/
self.pageCount=ko.observable();/**总页数**/
self.editing = ko.observable(false);
self.searchKeyWord=ko.observable();
self.state=ko.observable("current");
self.beginEdit = function(){
self.editing(true);
};
self.endEdit = function(){
self.editing(false);
};

/**根据目录获取商品列表**/
self.getProductList=function(offset,callback){
self.selectedItem.removeAll();/**清空选择内容**/
$.post("client/editors/groupOnList/serverhandler/getGroupOnList.jsx",{m:self.merchantId,offset:offset,count:self.pageSize,keyword:self.searchKeyWord(),state:self.state()}, function (data) {
var items = $.map(data.products, function (itemData) {
return new GroupOnItem(itemData);
});
var length=Math.ceil(data.total/self.pageSize);
self.pageCount(length);
if(callback){
callback(items);
}
}, "json");
};
self.delete = function (item) {
self.products.remove(item);
};
self.up=function(item){
var index=self.products.indexOf(item);
if(index==0){return};
var array=self.products();
var temp=array[index-1];
array[index-1]=array[index];
array[index]=temp;
self.products(array);
};
self.down=function(item){
var index=self.products.indexOf(item);
if(index==self.products().length-1){return};
var array=self.products();
var temp=array[index+1];
array[index+1]=array[index];
array[index]=temp;
self.products(array);
};

self.search=function(){
if(self.searchKeyWord()){
self.state("search");
}else{
self.state("");
}
self.getPageData(1);
};
self.openSelectProductView = function(){
self.selectedItem.removeAll();/**清空选择内容**/
self.getPageData(1);
$("#GroupOnSelect").show();
};

self.closeSelectProductView = function(){
$("#GroupOnSelect").hide();
};
self.closeGroupOnListEditorView = function(){
$("#GroupOnListEditor").hide();
};

self.selectProduct=function(item){
if(item.selected()){
item.selected(false);
self.selectedItem.remove(item);
}
else{
item.selected(true);
self.selectedItem.push(item);
};
};
self.cloneItem = function(item){
var jitem = ko.mapping.toJS(item);
return new GroupOnItem(jitem);
};
self.confirmSelect = function () {
if (self.selectedItem() && self.selectedItem().length > 0) {
self.selectedItem().forEach(function(item){
item.selected(false);
self.products.push(self.cloneItem(item));
});
};
self.closeSelectProductView();
};
self.saveDataToDB=function(){
var data = ko.mapping.toJS(self.products);
for(var i=0;i< data.length;i++){
var imgUrl=data[i].imgUrl;
imgUrl=self.appEditor.getImgSize(imgUrl,self.spec);
data[i].imgUrl=imgUrl;
}
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'groupOnList';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (data) {
if(data.state=="ok"){
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeSelectProductView();
self.closeGroupOnListEditorView();
self.appEditor.refresh();
}else{
bootbox.alert("服务器错误，数据没有保存！");
};
}, "json");
}
self.getPageData=function(pageNum){
self.currPage(pageNum);
var offset=(pageNum-1)*self.pageSize;
var callback=function(items){
self.currPageData(items);
}
self.getProductList(offset,callback);

};
self.nextPage=function(){
if(self.currPage()==self.pageCount()){
return;
}
self.getPageData(Number(self.currPage())+1)
};
self.toPage=function(){
if(self.currPage()<1){
self.currPage(1);
}else if(self.currPage()>self.pageCount()){
self.currPage(self.pageCount());
};
self.getPageData(self.currPage())
};

self.prePage=function(){
if(self.currPage()==1){
return;
}
self.getPageData(Number(self.currPage())-1)
};


};
(function GroupOnList(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var groupOnListEditor = window["groupOnListEditor"];
if(groupOnListEditor){
self.editorViewModel = groupOnListEditor;
}
else{
self.editorViewModel = new GroupOnListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("GroupOnListEditorModel"));
ko.applyBindings(self.editorViewModel,document.getElementById("GroupOnListEditorModel"));
window["groupOnListEditor"] = self.editorViewModel;
}
var mask = $("#mask", e);
self.clicking = false;
$("[data-type='groupOnList']", e).mouseenter(function () {

if(self.clicking){
self.clicking = false;
return;
}
var offset = $(this).offset();
var height = $(this).attr("data-height");
if (!height) {
height = $(this).height();
}
var width =  $(this).attr("data-width");
if(!width){
width = $(this).width();
}

var currentElem = $(this);

mask.css({left: offset.left, top: offset.top, width: width, height: height});
mask.show();
mask.off("click");
mask.click(function(e){
self.clicking = true;
mask.hide();
var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec = spec;
if(configs.pageData){
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
var items = $.map(data, function (itemData) {
return new GroupOnItem(itemData);
});
self.editorViewModel.products(items);
}else{
self.editorViewModel.products([]);
}
}
configs.appEditor.modal("GroupOnListEditor","true");
$("#GroupOnListEditor").draggable({ handle: ".modal-header" });
$("#GroupOnSelect").draggable({ handle: ".modal-header" });
mask.off("click");
});
});
mask.mouseleave(function () {
mask.hide();
mask.off("click");
});

})($root, $configs);
function PanicBuyItem(param) {
this.id = ko.observable(param.id);
this.productId = ko.observable(param.productId);
this.imgUrl = ko.observable(param.imgUrl);
this.selected = ko.observable(false);
this.title = ko.observable(param.title);
this.price=ko.observable(param.price);
this.count=ko.observable(param.count);
this.marketPrice=ko.observable(param.marketPrice);
this.marketPriceString= ko.computed(function() {
return "￥" + parseFloat(param.marketPrice/100).toFixed(2)
}, this);
this.priceString = ko.computed(function() {
return "￥" + parseFloat(param.price/100).toFixed(2)
}, this);
this.buyTime = ko.observable(param.buyTime);
this.endDate = ko.observable(param.endDate);
this.startDate = ko.observable(param.startDate);
};

function PanicBuyListEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.spec = null;
self.selectedItem=ko.observableArray([]);/**当前操作选中的商品**/
self.products=ko.observableArray([]);/**上次保存的商品列表**/
self.pageSize=8;/**每页显示的条数**/
self.currPageData=ko.observableArray([]);/**当前页面的数据**/
self.currPage=ko.observable(1);/**当前页码**/
self.pageCount=ko.observable();/**总页数**/
self.editing = ko.observable(false);
self.searchKeyWord=ko.observable();
self.state=ko.observable("current");
self.beginEdit = function(){
self.editing(true);
};
self.endEdit = function(){
self.editing(false);
};

/**根据目录获取商品列表**/
self.getProductList=function(offset,callback){
self.selectedItem.removeAll();/**清空选择内容**/
$.post("client/editors/panicBuyList/serverhandler/getPanicBuyList.jsx",{m:self.merchantId,offset:offset,count:self.pageSize,keyword:self.searchKeyWord(),state:self.state()}, function (data) {

var items = $.map(data.products, function (itemData) {
return new PanicBuyItem(itemData);
});
var length=Math.ceil(data.total/self.pageSize);
self.pageCount(length);
if(callback){
callback(items);
}
}, "json");
};
self.delete = function (item) {
self.products.remove(item);
};
self.up=function(item){
var index=self.products.indexOf(item);
if(index==0){return};
var array=self.products();
var temp=array[index-1];
array[index-1]=array[index];
array[index]=temp;
self.products(array);
};
self.down=function(item){
var index=self.products.indexOf(item);
if(index==self.products().length-1){return};
var array=self.products();
var temp=array[index+1];
array[index+1]=array[index];
array[index]=temp;
self.products(array);
};

self.search=function(){
if(self.searchKeyWord()){
self.state("search");
}else{
self.state("");
}
self.getPageData(1);
};

self.openSelectProductView = function(){
self.getPageData(1);
self.selectedItem.removeAll();/**清空选择内容**/
$("#PanicBuySelect").show();
};

self.closeSelectProductView = function(){
$("#PanicBuySelect").hide();
};
self.closePanicBuyListEditorView = function(){
$("#PanicBuyListEditor").hide();
};

self.selectProduct=function(item){
if(item.selected()){
item.selected(false);
self.selectedItem.remove(item);
}
else{
item.selected(true);
self.selectedItem.push(item);
};
};
self.cloneItem = function(item){
var jitem = ko.mapping.toJS(item);
return new PanicBuyItem(jitem);
};
self.confirmSelect = function () {
if (self.selectedItem() && self.selectedItem().length > 0) {
self.selectedItem().forEach(function(item){
item.selected(false);
self.products.push(self.cloneItem(item));
});
};
self.closeSelectProductView();
};

self.saveDataToDB=function(){
var data = ko.mapping.toJS(self.products);
for(var i=0;i< data.length;i++){
var imgUrl=data[i].imgUrl;
imgUrl=self.appEditor.getImgSize(imgUrl,self.spec);
data[i].imgUrl=imgUrl;
}
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'panicBuyList';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (data) {
if(data.state=="ok"){
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.appEditor.refresh();
self.closeSelectProductView();
self.closePanicBuyListEditorView();
}else{
bootbox.alert("服务器错误，数据没有保存！");
};
}, "json");
}
self.getPageData=function(pageNum){
self.currPage(pageNum);
var offset=(pageNum-1)*self.pageSize;
var callback=function(items){
self.currPageData(items);
}
self.getProductList(offset,callback);
};
self.toPage=function(){
if(self.currPage()<1){
self.currPage(1);
}else if(self.currPage()>self.pageCount()){
self.currPage(self.pageCount());
};
self.getPageData(self.currPage())
};

self.nextPage=function(){
if(self.currPage()==self.pageCount()){
return;
}
self.getPageData(Number(self.currPage())+1);
};
self.prePage=function(){
if(self.currPage()==1){
return;
}
self.getPageData(Number(self.currPage())-1);
};

};
(function PanicBuyList(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var panicBuyListEditor = window["panicBuyListEditor"];
if(panicBuyListEditor){
self.editorViewModel = panicBuyListEditor;
}
else{
self.editorViewModel = new PanicBuyListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("PanicBuyListEditorModel"));
ko.applyBindings(self.editorViewModel,document.getElementById("PanicBuyListEditorModel"));
window["panicBuyListEditor"] = self.editorViewModel;
}
var mask = $("#mask", e);
self.clicking = false;
$("[data-type='panicBuyList']", e).mouseenter(function () {

if(self.clicking){
self.clicking = false;
return;
}
var offset = $(this).offset();
var height = $(this).attr("data-height");
if (!height) {
height = $(this).height();
}
var width =  $(this).attr("data-width");
if(!width){
width = $(this).width();
}

var currentElem = $(this);

mask.css({left: offset.left, top: offset.top, width: width, height: height});
mask.show();
mask.off("click");
mask.click(function(e){
self.clicking = true;
mask.hide();
var dataId = currentElem.attr("data-id");
var spec = currentElem.attr("data-spec");
self.editorViewModel.dataId = dataId;
self.editorViewModel.spec = spec;
if(configs.pageData){
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
var items = $.map(data, function (itemData) {
return new PanicBuyItem(itemData);
});
self.editorViewModel.products(items);
}
else{
self.editorViewModel.products([]);
}
}
configs.appEditor.modal("PanicBuyListEditor","true");
$("#PanicBuyListEditor").draggable({ handle: ".modal-header" });
$("#PanicBuySelect").draggable({ handle: ".modal-header" });
mask.off("click");
});
});
mask.mouseleave(function () {
mask.hide();
mask.off("click");
});

})($root, $configs);
function TabsEditor(appId,pageId,merchantId,pageData,appEditor){
var self = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.sourceCode = ko.observable();
self.subType = null;

self.returnMainFrame = function(){
self.appEditor.setCurrentPage("mainFrame");

};
self.save = function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};

param["dataId"] = self.dataId;
param["dataValue"] = self.sourceCode();
param['type'] = 'Tabs';
param["dataType"] = "string"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
}
else {
bootbox.alert("数据保存成功！");
//从服务器上重新加载数据，因为可能数据发生了变化
self.appEditor.setPageDataProperty(self.dataId, self.sourceCode());
self.appEditor.updateView();
self.returnMainFrame();
};
}, "json");
};
} ;
(function Tabs(e, configs) {
var self = {};
var tabsEditor = window["tabsEditor"];
if (tabsEditor) {
self.editorViewModel = tabsEditor;
}
else {
self.editorViewModel = new TabsEditor(configs.appId, configs.pageId, configs.m, configs.pageData, configs.appEditor);
ko.cleanNode(document.getElementById("TabsEditor"));
ko.applyBindings(self.editorViewModel, document.getElementById("TabsEditor"));
window["tabsEditor"] = self.editorViewModel;
}

$("[data-type='tabs']", e).each(function (index, domEle) {
var signElem = $("#fancyCategories_sign > div").clone();
var dataPosition = $(domEle).attr("data-position");
if(dataPosition=="relative"){
$(domEle).css("position", "relative");
}
var mask = $("#mask", e).clone();
var source = $(domEle).html();
var dataId = $(domEle).attr("data-id");
$("[tab-target]", $(domEle)).mouseenter(function () {
$("[tab-target]", $(domEle)).removeClass("cur");
$(this).addClass("cur");
/*将tab-target对应的内容隐藏*/
var target = $(this).attr("tab-target");
$("[tab-target]", $(domEle)).each(function (i, ele) {
var t = $(ele).attr("tab-target");
$("#" + t, e).hide();
});
/*然后再显示出来*/
$("#" + target, e).show();
});
/*只显示cur Tab对应的内容*/
$("[tab-target]", $(domEle)).each(function (i, ele) {
var t = $(ele).attr("tab-target");
var isCur = $(ele).hasClass("cur");
if (!isCur) {
$("#" + t, e).hide();
}
else {
$("#" + t, e).show();
}

});
signElem.appendTo($(domEle)).mouseenter(function () {
var height = $(domEle).height();
var width = $(domEle).width();
mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
mask.show();
mask.off("click");
}).mouseleave(function () {
mask.remove();
}).click(function () {
self.editorViewModel.dataId = dataId;
var subType = $(domEle).attr("dataSubType");
self.editorViewModel.sunType = subType;
mask.remove();
self.editorViewModel.sourceCode(source);
configs.appEditor.modal("TabsEditor", true);
});

});
})($root, $configs);
function TabItem(param){
this.content = ko.observable(param.content||"");
this.linkTo = ko.observable(param.linkTo||"");
this.openInNewPage=ko.observable(param.openInNewPage||"_blank");
this.recordId = param.recordId||"";
}
function TabsPlusEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.tabList=ko.observableArray([]);
self.isMakeRecordId = false;
self.addItem=function(){
var newItem=new TabItem({});
self.tabList.push(newItem);
};
self.init=function(){
self.tabList.removeAll();
self.addItem();
};
self.init();
self.closeTabsPlusEditor = function(){
$("#TabsPlusEditor").hide();
};
self.delete = function (item) {
self.tabList.remove(item);
};
self.up=function(item){
var index=self.tabList.indexOf(item);
if(index==0){return};
var array=self.tabList();
var temp=array[index-1];
array[index-1]=array[index];
array[index]=temp;
self.tabList(array);
};
self.down=function(item){
var index=self.tabList.indexOf(item);
if(index==self.tabList().length-1){return};
var array=self.tabList();
var temp=array[index+1];
array[index+1]=array[index];
array[index]=temp;
self.tabList(array);
};
self.saveDataToDB=function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};

if(self.isMakeRecordId){
function randomNum(){
var num = "";
for(var r=0;r<6;r++){
num += Math.floor(Math.random() * 10);
}
return num + "";
}
var list = self.tabList();
if(list.length > 0){
list.forEach(function(item){
var id = item.recordId;
if(!id){
item.recordId = randomNum();
}
});
}
}

var data = ko.mapping.toJS(self.tabList);
param["dataId"] = self.dataId;
param["dataValue"] = JSON.stringify(data);
param['type'] = 'tabsPlus';
param["dataType"] = "jsonArray"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
};
self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
self.closeTabsPlusEditor();
self.appEditor.refresh();
}, "json");
};
};
(function TabsPlus(e, configs) {
var self = {};
var tabsEditor = window["tabsPlusEditor"];
if (tabsEditor) {
self.editorViewModel = tabsEditor;
}
else {
self.editorViewModel = new TabsPlusEditor(configs.appId, configs.pageId, configs.m, configs.pageData, configs.appEditor);
ko.cleanNode(document.getElementById("TabsPlusEditor"));
ko.applyBindings(self.editorViewModel, document.getElementById("TabsPlusEditor"));
window["tabsPlusEditor"] = self.editorViewModel;
}

$("[data-type='tabsPlus']", e).each(function (index, domEle) {
var signElem = $("#fancyCategories_sign > div").clone();
var dataPosition = $(domEle).attr("data-position");
if(dataPosition=="relative"){
$(domEle).css("position", "relative");
}
var mask = $("#mask", e).clone();
var source = $(domEle).html();
var dataId = $(domEle).attr("data-id");
$("[tab-target]", $(domEle)).mouseenter(function () {
$("[tab-target]", $(domEle)).removeClass("cur");
$(this).addClass("cur");
/*将tab-target对应的内容隐藏*/
var target = $(this).attr("tab-target");
$("[tab-target]", $(domEle)).each(function (i, ele) {
var t = $(ele).attr("tab-target");
$("#" + t, e).hide();
});
/*然后再显示出来*/
$("#" + target, e).show();
});
/*只显示cur Tab对应的内容*/
$("[tab-target]", $(domEle)).each(function (i, ele) {
var t = $(ele).attr("tab-target");
var isCur = $(ele).hasClass("cur");
if (!isCur) {
$("#" + t, e).hide();
}
else {
$("#" + t, e).show();
}

});
signElem.appendTo($(domEle)).mouseenter(function () {
var height = $(domEle).height();
var width = $(domEle).width();
mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
mask.show();
mask.off("click");
}).mouseleave(function () {
mask.remove();
}).click(function () {
var data=configs.appEditor.getPageDataProperty(dataId);
if(data){
var items = $.map(data, function (itemData) {
return new TabItem(itemData);
});
self.editorViewModel.tabList(items);
}else{
self.editorViewModel.init();
}
self.editorViewModel.dataId = dataId;

var isMakeRecordId = true;
var isMakeId = $(domEle).attr("data-make-id");
if(isMakeId && isMakeId == "false"){
isMakeRecordId = false;
}
self.editorViewModel.isMakeRecordId = isMakeRecordId;


mask.remove();

configs.appEditor.modal("TabsPlusEditor", true);
});

});
})($root, $configs);
function SourceEditor(appId,pageId,merchantId,pageData,appEditor){
var self = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.source = ko.observable();
self.subType = null;

self.returnMainFrame = function(){
self.appEditor.setCurrentPage("mainFrame");

};
self.save = function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = self.dataId;
param["dataValue"] = self.source();
param['type'] = 'htmlSource';
param["dataType"] = "string"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
}
else {
bootbox.alert("数据保存成功！");
self.appEditor.setPageDataProperty(self.dataId, self.source());
self.appEditor.updateView();
self.returnMainFrame();
};
}, "json");
};
} ;
(function HtmlSource(e,configs) {
var self = {};
var sourceEditor = window["sourceEditor"];
if(sourceEditor){
self.editorViewModel = sourceEditor;
}
else{
self.editorViewModel = new SourceEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("SourceEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("SourceEditor"));
window["sourceEditor"] =self.editorViewModel;
}

$("[data-type='htmlSource']", e).mouseenter(function (evt) {

var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);
mask.hide();
var source = currentElem.html();
var dataId = currentElem.attr("data-id");
var subType = currentElem.attr("dataSubType");
self.editorViewModel.dataId=dataId;
self.editorViewModel.sunType = subType;
self.editorViewModel.source(source);
configs.appEditor.modal("SourceEditor",true);
mask.off("click");
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();


});


})($root, $configs);
function TextEditor(appId,pageId,merchantId,pageData,appEditor){
var self = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.text = ko.observable();
self.subType = null;

self.returnMainFrame = function(){
self.appEditor.setCurrentPage("mainFrame");

};
self.save = function(){
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = self.dataId;
param["dataValue"] = self.text();
param['type'] = 'text';
param["dataType"] = "string"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
}
else {
bootbox.alert("数据保存成功！");
self.appEditor.setPageDataProperty(self.dataId, self.text());
self.appEditor.updateView();
self.returnMainFrame();
};
}, "json");
};
} ;
(function Text(e,configs) {
var self = {};
var textEditor = window["textEditor"];
if(textEditor){
self.editorViewModel = textEditor;
}
else{
self.editorViewModel = new TextEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("TextEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("TextEditor"));
window["textEditor"] =self.editorViewModel;
}

$("[data-type='text']", e).mouseenter(function (evt) {
var currentElem = $(this);
var eventList = [{
event:"click",
fn:function(evt){
self.clicking = true;
var mask = $(evt.currentTarget);

var dataId = currentElem.attr("data-id");
var subType = currentElem.attr("dataSubType");
self.editorViewModel.dataId=dataId;
self.editorViewModel.sunType = subType;
mask.hide();
mask.off("click");

var source = "";
var sourceType = currentElem.attr("data-source-type") || "1";
if(sourceType == "1"){
source = currentElem.text().trim();
}else if(sourceType = "2"){
source = configs.pageData[dataId];
}

self.editorViewModel.text(source);
configs.appEditor.modal("TextEditor",true);
}
}];
configs.appEditor.maskMake(currentElem,e,eventList);
evt.stopPropagation();

});

})($root, $configs);
function BuildingItem(param){
var self=this;
self.id=ko.observable(param.id);
self.name=ko.observable(param.name);
self.address=ko.observable(param.address);
self.selected = ko.observable(false);
self.floors=ko.observableArray(param.floors);
};
function FloorItem(param){
var self=this;
self.id=ko.observable(param.id);
self.name=ko.observable(param.name);
self.selected = ko.observable(false);
self.imgLink=ko.observableArray(param.imgLink);
};
function MapEditor(appId,pageId,merchantId,pageData,appEditor){
var self  = this;
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
self.pageData = pageData;
self.appEditor = appEditor;
self.dataId = null;
self.buildings=ko.observableArray([]);
self.buildingDialog = new BuildingDialog(self.buildings);
self.floors=ko.observableArray([]);
self.floorDialog=new FloorDialog(self.floors);
self.showFloorEditor=ko.observable(false);
self.selectBuilding=function(item){
self.select(self.buildings,item);
self.showFloorEditor(true);
}
self.selectFloor=function(item){
self.select(self.floors,item);
}
self.select = function (items,item) {
for(var i=0;i<items().length;i++){
items()[i].selected(false);
}
item.selected(true);
};
self.deleteBuildingItem=function(item){
self.buildings.remove(item);
};
self.editBuildingItem=function(item){
self.buildingDialog.openDialog(item);
};
self.deleteFloorItem=function(item){
self.floors.remove(item);
};
self.editFloorItem=function(item){
self.floorDialog.openDialog(item);
};
self.returnMainFrame = function () {
self.appEditor.setCurrentPage("mainFrame");
self.appEditor.refresh();
};
};
function BuildingDialog(buildings) {
var self = this;
self.id = ko.observable(0);
self.name = ko.observable("");
self.address = ko.observable("");
self.openDialog = function (currentItem) {
self.currentItem = currentItem;
if (currentItem.id) {
self.name(currentItem.name());
self.address(currentItem.address());
self.id(currentItem.id());
}else{
self.init();
}
$('#building_addItem').modal("show");
};
self.init=function(){
self.name("");
self.address("");
}
self.ok = function () {
if(self.currentItem.id){
self.currentItem.id(self.id());
self.currentItem.name(self.name());
self.currentItem.address(self.address());
}else{
var buildingData={id:self.id()+1,name:self.name(),address:self.address()};
var buildingItem=new BuildingItem(buildingData);
buildings.push(buildingItem);
}
$('#building_addItem').modal("hide");

}
};
function FloorDialog(floors) {
var self = this;
self.id = ko.observable(0);
self.name = ko.observable("");
self.imgLink = ko.observable("");
self.openDialog = function (currentItem) {
self.currentItem = currentItem;
if (currentItem.id) {
self.id(currentItem.id());
self.name(currentItem.name());
}else{
self.init();
}
$('#floor_addItem').modal("show");
};
self.init=function(){
self.name("");
}
self.ok = function () {
if(self.currentItem.id){
self.currentItem.id(self.id());
self.currentItem.name(self.name());
}else{
var floorData={id:self.id()+1,name:self.name(),imgLink:self.imgLink};
var floorItem=new FloorItem(floorData);
floors.push(floorItem);
}
$('#floor_addItem').modal("hide");

}
};
(function Map(e, configs) {
var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var mapEditor = window["mapEditor"];
if(mapEditor){
self.editorViewModel = mapEditor;
}
else{
self.editorViewModel = new MapEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("MapEditor"));
ko.applyBindings(self.editorViewModel,document.getElementById("MapEditor"));
window["mapEditor"] = self.editorViewModel;
};
self.clicking = false;
$("[data-type='map']", e).each(function (index,domEle) {
var signElem =  $("#fancyCategories_sign > div").clone();
var mask = $("#mask", e).clone();
signElem.appendTo($(domEle)).mouseenter(function (){
var height = $(domEle).height();
var width =  $(domEle).width();
mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
mask.show();
mask.off("click");
}).mouseleave(function(){
mask.remove();
}).click(function(){
self.clicking = true;
mask.hide();
var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
self.editorViewModel.dataId=dataId;
configs.appEditor.setCurrentPage("MapEditor");
});
});

})($root, $configs);
function PageConfigEditor(appId, pageId, merchantId, pageData, appEditor) {
function Item(key,value,type) {
this.key = ko.observable(key);
this.name = ko.observable(value.name);
this.value = ko.observable(value.value);
this.type = ko.observable(type);
};

var self = this;
self.configs = ko.observableArray();
self.appId = appId;
self.pageId = pageId;
self.merchantId = merchantId;
if(pageData.config){
_.each(pageData.config,function(value,key,list){
var specName = ("config." + key)
var dataSpec = _.find(pageData["_all"],function(spec){
return (spec.id==specName);
});
if(dataSpec){
var item = new Item(key,value,dataSpec.type);
console.log("key=" + key + ",value=" + value);
self.configs.push(item);
};
});
}else{
}
console.log("configs.length=" + self.configs().length);


self.save = function () {
var data = {};
_.each(self.configs(),function(item){
var value={};
value.name=item.name();
value.value=item.value();
data[item.key()] = value;
});
var param = {
appId: self.appId,
pageId: self.pageId,
m: self.merchantId
};
param["dataId"] = "config";
param["dataValue"] = JSON.stringify(data);
param['type'] = 'pageConfig';
param["dataType"] = "json"; //还可以是string
if (self.subType) {
param["subType"] = self.subType;
};
$.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
if (ret.state != 'ok') {
bootbox.alert("服务器错误，数据没有保存！");
$("#pageConfigEditor").modal("hide");
}
else {
bootbox.alert("数据保存成功！");
pageData.config = data;
$("#pageConfigEditor").modal("hide");
appEditor.refresh();
};
}, "json");
};


};
(function PageConfig(e, configs) {
var self = {};
//console.log("1.pageConfig init...");
var pageConfigEditor = window["pageConfigEditorModel"];
if(pageConfigEditor){
self.pageConfigEditor = pageConfigEditor;
}
else{
self.pageConfigEditor = new PageConfigEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
ko.cleanNode(document.getElementById("pageConfigEditor"));
ko.applyBindings(self.pageConfigEditor,document.getElementById("pageConfigEditor"));
window["pageConfigEditorModel"] = self.pageConfigEditor;
};
console.log("2.pageConfig init...");
$("#editPageConfig").click(function(){$("#pageConfigEditor").modal("show");});

})($root, $configs);

};

self.doOpenPage = function(html){

//
var ifrm = document.getElementById('mainFrame');
ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
//先保存scrollTop
var oldScrollTop = $(ifrm).scrollTop();
ifrm.document.open();
ifrm.document.write('');
ifrm.document.close();
$("body",ifrm.document).html(html);
self.initPage($("body",ifrm.document),{appId:self.appId,pageId:self.pageId, m:self.m,pageData:self.pageData,appEditor:self});
console.log("scrolling to : " + oldScrollTop);
$(ifrm).scrollTop(oldScrollTop);
};

self.loadDesignHtml = function(){
var designUrl = "/" + self.appId + "/" + self.design + "m=" + self.m + "&pageId=" + self.pageId;
$.get(designUrl,function(html){
self.doOpenPage(html);
});
};
self.loadPageData = function(dataId){
if(!dataId){
$.get("handlers/getPageData.jsx?m=" + self.m + "&rappId=" + self.appId +"&pageId=" + self.pageId ,function(ret){
if(ret.state=='ok'){
self.pageData = ret.pageData;
self.updateView();
}
},"json");
}
else{
$.get("handlers/getPageData.jsx?m=" + self.m + "&rappId=" + self.appId +"&pageId=" + self.pageId+"&dataId=" + dataId ,function(ret){
if(ret.state=='ok'){
var newData = self.getPageDataProperty(dataId,ret.data);
self.setPageDataProperty(dataId,newData);
self.updateView();
}
},"json");
}
};
self.loadPageDataAndTemplate = function(){
$.get("handlers/getTemplate.jsx?m=" + self.m + "&rappId=" + self.appId +"&pageId=" + self.pageId + "&templateId=" + self.page.template,function(ret){
if(ret.state=='ok'){
self.template = ret.template;
self.loadPageData();
}
},"json");
};
self.openPage = function(){
$.get("handlers/getPageInfo.jsx?m=" + self.m + "&rappId=" + self.appId +"&pageId=" + self.pageId,function(ret){
if(ret.state=='ok'){
self.page = ret.page;
self.loadPageDataAndTemplate();
}
},"json");
};
self.refresh = function(){
//self.loadDesignHtml();
self.updateView();
};
self.updateView = function(){

if(self.renderEngine=="artTemplate"){

var render = template.compile(self.template);

}else{
var render= doT.template(self.template);
}
var html = render(self.pageData);
self.doOpenPage(html);
};
self.setPageDataProperty = function (expr,value,pageData){
var parts = expr.split(/[\.:]/);
if(!pageData){
var d = self.pageData;
}
else{
var d = pageData;
}
for(var i=0; i<parts.length-1; i++){
var part = parts[i];
var c = d[part];
if(!c){
c = {};
d[part] = c;
};
d = c;
};
var lastPart = parts[parts.length-1];
d[lastPart] = value;
};

self.getPageDataProperty = function (expr,pageData){
var parts = expr.split(/[\.:]/);
if(!pageData){
var d = self.pageData;
}
else{
var d = pageData;
}
for(var i=0; i<parts.length-1; i++){
var part = parts[i];
var c = d[part];
if(!c){
c = {};
d[part] = c;
};
d = c;
};
var lastPart = parts[parts.length-1];
return d[lastPart];
};
self.getImgSize=function(imgUrl,size){
if(!imgUrl){
return;
}
var index=imgUrl.lastIndexOf("_");
var indexDot=imgUrl.lastIndexOf(".");
if(!size||size=="undefined"){
if(index>0){
imgUrl=imgUrl.substring(0,index)+imgUrl.substring(indexDot);
}
}else{
if(index>0){
imgUrl=imgUrl.substring(0,index+1)+size+imgUrl.substring(indexDot);
}else{
imgUrl=imgUrl.substring(0,indexDot)+"_"+size+imgUrl.substring(indexDot);
}
}
return imgUrl;
};



//==========新增一个可选的mask实现
self.maskMake = function(target,rootEle,eventList){
var backupTargetCss = function(){
var backCss = target.data("backCss");
if(backCss){
return;
}
backCss = {position:target.css("position"),zIndex:target.css("z-index")};
target.data("backCss",backCss);
}
var returnTargetCss = function(ele){
var backCss = ele.data("backCss");
if(backCss){
ele.css(backCss);
ele.data("backCss","");
}
}


var maskType = target.attr("mask-type") || "1";
var maskObj = $("#mask",rootEle);
var maskTarget = maskObj.data("targetEle");
if(maskTarget && maskTarget.length > 0){
if(maskTarget == target){
return;
}
returnTargetCss(maskTarget);
maskObj.data("targetEle","");
}


var offset = target.offset();
var height = target.attr("data-height") || target.outerHeight();
var width = target.attr("data-width") || target.outerWidth();
if(maskType == "1"){
maskObj.css({opacity:"0.5",backgroundColor:"green",cursor:"pointer",border:"none"});
maskObj.css({left: offset.left, top: offset.top, width: width, height: height});
$(".toolBar",maskObj).hide();
}else if(maskType == "2"){

var toolBarHtml = '<div class="toolBar" style="position:absolute;top:0;left:0;width:100%;height:26px;line-height:26px;background-color: rgba( 0, 128, 0,0.7);cursor:pointer;">';
toolBarHtml += '<a href="javascript:;" class="editData" style="color: #000;font-size: 12px;margin-left: 10px;">编辑</a>';

var toolBarOjb = $(".toolBar",maskObj);
if(toolBarOjb.length == 0){
maskObj.append(toolBarHtml);
toolBarOjb = $(".toolBar",maskObj);
}
toolBarOjb.show();
maskObj.css({left: offset.left - 5, top: offset.top - 26, width: width, height: height + 26,opacity:"1",background:"none",border:"5px solid rgba( 0, 128, 0,0.7)",borderTop:"none",zIndex:"1",cursor:"default"});



//maskObj.data("targetEle","");

backupTargetCss();
target.css({position:"relative",zIndex:"10"});
maskObj.data("targetEle",target);
target.off("click");
target.on("click",function(evt){

maskObj.click();

evt.preventDefault();
return false;
});
}

maskObj.off("click");
maskObj.show()

maskObj.on("mouseleave",function(evt){
maskObj.hide();
maskObj.off("click");
if(maskType == "2"){

var maskTargetEle = maskObj.data("targetEle");
if(maskTargetEle && maskTargetEle.length > 0){
returnTargetCss(maskTargetEle);
maskObj.data("targetEle","");
}

//returnTargetCss($(evt.target));
}
});

if(eventList && eventList.length > 0){
var hasBind = [];
$.each(eventList,function(index,data){
var selector = data["selector"];
var key = data["event"];
if(selector){
key += "_" + selector;
}
if (hasBind.indexOf(key) > -1){
return true;
}
if(selector){
maskObj.on(data["event"],".toolBar " + data["selector"],data["fn"]);
}else{
maskObj.on(data["event"],data["fn"]);
}

hasBind.push(key);
});
}


}
//==============end


};










