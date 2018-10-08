function CategoryItem(param) {
this.id = param.id;
this.name = param.name;
this.path = param.path;

};

function ProductCategorySelector(merchantId) {
var self = this;
self.merchantId = merchantId;
self.callback = null;
self.zTree;
self.currColumn;


self.closeSelectorView = function () {
$("#productCategorySelector").hide();
};

self.confirmSelect = function () {
var nodes = self.zTree.getSelectedNodes();
if (self.callback) {
self.callback(nodes);
}
self.closeSelectorView();
};

self.openSelectView = function (callback) {
self.callback = callback;
$("#productCategorySelector").show();
};

self.init = function () {
var setting = {
callback: {
onClick: zTreeOnClick = function (event, treeId, treeNode) {
self.currColumn = treeNode.id;
$("#" + event.toElement.id).css("background-color","#b3d1c1");
$("span").not("#" + event.toElement.id).css("background-color","");
}
}
};
$.post("/productCategorySelector/serverhandler/getCatalogue.jsx", {columnId: "c_10000", m:merchantId}, function (data) {
self.currColumn = data.id;
self.zTree = $.fn.zTree.init($("#productCategorySelectorTree"), setting, data);
}, "json");
}
self.init();
};
(function(configs) {

var self = {};
/*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
var productCategorySelector = window["productCategorySelector"];
if(productCategorySelector){
self.editorViewModel = productCategorySelector;
}
else{
$.get("/productCategorySelector/htmloader.jsx",function(html){
$("body").append(html);
self.editorViewModel = new ProductCategorySelector(configs.m);
ko.cleanNode(document.getElementById("productCategorySelector"));
ko.applyBindings(self.editorViewModel,document.getElementById("productCategorySelector"));
window["productCategorySelector"] = self.editorViewModel;
$("#productCategorySelector").draggable();
});
};
})({m:'!M'});
