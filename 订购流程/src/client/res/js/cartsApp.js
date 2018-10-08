//app.js
var cartsPage = null;
$(document).on("koInit",function(){
var elem = document.getElementById("cartsPage");
if(elem){
cartsPage = new Carts();
ko.applyBindings(cartsPage,document.getElementById("cartsPage"));
cartsPage.setBuyerUserId(backBuyerId);
cartsPage.loadCarts();
}
});



var sammyApp = $.sammy(function() {
this.get("#/carts", function (context) {
$(".page").hide();
window.scrollTo(0, 0);
if(cartsPage){
cartsPage.loadCarts();
cartsPage.getUser();
$("#cartsPage").fadeIn();
}

});

this.get("#/orderForm/:cartId/:buyerId",function(context){
$(".page").hide();
var cartId = this.params["cartId"];
var buyerId = this.params["buyerId"];
//        orderFormPage.currentPage("orderFormMain");
//        orderFormPage.loadOrderForm(cartId,buyerId);
//$("#orderFormPage").fadeIn();
window.location.href="orderForm.jsx?cartId="+cartId+"&buyerId="+buyerId;
});

this.get("#/consignee/:buyerId",function(context){
$(".page").hide();
window.scrollTo(0, 0);
var buyerId = this.params["buyerId"];
$("#consigneePage").slideDown();
consignee.buyerId = buyerId;
consignee.getConsigneeList();
});

this.get("#/delivery",function(context){
$(".page").hide();
$("#deliveryChooserPage").fadeIn();
});

this.get("#/selectUser",function(context){
userSelector.single(true);
userSelector.openSelectView(function(selectedUsers){
var buyerUserId = selectedUsers[0].id;
cartsPage.setBuyerUserId(buyerUserId);
$.post(AppConfig.url+"server/setCurrentBuyer.jsx",{buyerId:buyerUserId},function(ret){
if(ret.state=='ok'){
layer.alert("当前用户设置为了，"+selectedUsers[0].loginId+"(" + buyerUserId + ")");
}
},"JSON");
});
});

this.get("#/invoice",function(context){
$(".page").hide();
$("#invoicePage").fadeIn();
});

this.get("#/orderFormPayment",function(context){
$(".page").hide();
$("#orderFormPaymentChooser").fadeIn();
});

});

$(document).ready(function(){
sammyApp.run("#/carts");
$("#selectProducts").click(function(){BuyFlowUtils.selectProducts();});

var opts = {
lines: 12, // The number of lines to draw
length: 7, // The length of each line
width: 5, // The line thickness
radius: 10, // The radius of the inner circle
corners: 1, // Corner roundness (0..1)
rotate: 0, // The rotation offset
direction: 1, // 1: clockwise, -1: counterclockwise
color: '#000', // #rgb or #rrggbb or array of colors
speed: 1, // Rounds per second
trail: 100, // Afterglow percentage
shadow: true, // Whether to render a shadow
hwaccel: false, // Whether to use hardware acceleration
className: 'spinner', // The CSS class to assign to the spinner
zIndex: 2e9, // The z-index (defaults to 2000000000)
top: '50%', // Top position relative to parent
left: '50%' // Left position relative to parent
};
var target = document.getElementById('spinholder');
var spinner = new Spinner(opts);

$(document).ajaxStart(function () {
spinner.spin(target);
});
$(document).ajaxComplete(function () {
spinner.stop();
});

});
