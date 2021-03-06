//orderFormPage.js
var orderFormPage = null;
$(document).on("koInit",function(){
orderFormPage = new OrderForm();
ko.applyBindings(orderFormPage,document.getElementById("orderFormPage"));
orderFormPage.loadOrderForm(cartId,buyerId);
});
$(document).ready(function(){
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
