function User(id, loginId, nickname, realname) {
var self = this;
self.id = ko.observable(id);
self.loginId = ko.observable(loginId);
self.nickname = ko.observable(nickname);
self.realname = ko.observable(realname);
self.displayName = ko.computed(function(){
if(self.realname()){
return self.realname();
}
if(self.nickname()){
return self.nickname();
}
if(self.loginId()){
return self.loginId();
}
});

}
function UserGroup(id, name, description,merchantId) {
var self = this;
self.name = ko.observable(name);
self.description = ko.observable(description);
self.id = ko.observable(id);
self.users = ko.observableArray();
self.merchantId = merchantId;
self.show=ko.observable(true);
self.remove = function (user) {
$.post("server/userGroup/removeUser.jsx",{m:self.merchantId,u:user.id,g:self.id},function(data){
if(data.state=='ok'){
self.users.remove(user);
}
else{
alert(data.msg);
}
},"json");
}
}
/**
* Created by Administrator on 14-4-6.
*/
function GroupInfoDialog(merchantId) {

var self = this;
self.merchantId = merchantId;
self.name = ko.observable();
self.description = ko.observable();
//self.userGroupViewModel = null;
self.currentGroup = null;

self.onAddGroupOk = null;
self.doAddGroup = function () {
var name = self.name();
var description = self.description();
$.post("server/userGroup/addGroup.jsx",{n:name,d:description,m:self.merchantId},function(data){
if(data.state=='ok'){
var group = new UserGroup(data.id, name, description,self.merchantId);
if (self.onAddGroupOk) {
self.onAddGroupOk(group);
}
$('#dialogGroupInfo').modal("hide");
}
else{
alert("出错了：" + data.msg);
}
},"json");
}

self.updateGroup = function () {
var name = self.name();
var description = self.description();
$.post("server/userGroup/updateGroup.jsx",{m:self.merchantId,n:name,d:description,g:self.currentGroup.id()},function(data){
if(data.state=='ok'){
self.currentGroup.name(name);
self.currentGroup.description(description);
$('#dialogGroupInfo').modal("hide");
}
else{
alert(data.msg);
}
},"json");
}

self.ok = function () {
$('#dialogGroupInfo .groupName').blur();
$('#dialogGroupInfo .groupDescription').blur();
if (self.currentGroup != null) {
self.updateGroup();
}
else {
self.doAddGroup();
}
}

self.onGroupDialogKeyDown = function (item, event) {
if (event.which == 13) {
self.ok();
return false;
}
return true;
}
}

function AddUserDialog(merchantId) {
var self = this;
self.merchantId = merchantId;
self.loginId = ko.observable();
self.currentGroup = null;
self.addUser = function () {
$('#dialogAddUser .userLoginId').blur();
var loginId = self.loginId();
$.post("server/userGroup/addUser2Group.jsx",{m:self.merchantId,g:self.currentGroup.id(),u:loginId},function(data){
if(data.state=='ok'){
var u = data.u;
console.log(u.id);
var user = new User(u.id, loginId, u.nickName, u.realName);
self.currentGroup.users.push(user);
$('#dialogAddUser').modal("hide");
}
else{
alert(data.msg);
}
},"json");
}
self.onKeyDown = function (data, event) {
if (event.which == 13) {
self.addUser();
return false;
}
else {
return true;
}
}
}

/**
* Created by Administrator on 14-4-6.
*/
function UserGroupListViewModel(merchantId) {
var self = this;
self.merchantId = merchantId;
self.groupCount = 1;
self.userGroups = ko.observableArray([]);
self.searchKeyWord = ko.observable();

self.groupInfoDialog = new GroupInfoDialog(merchantId);
self.userDialog = new AddUserDialog(merchantId);

ko.applyBindings(self.groupInfoDialog,document.getElementById("dialogGroupInfo"));
ko.applyBindings(self.userDialog,document.getElementById("dialogAddUser"));

self.editing = ko.observable(false);
self.beginEdit = function(){
self.editing(true);
},
self.endEdit = function(){
self.editing(false);
},

self.loadUserGroups = function(){
$.post("server/userGroup/listGroups.jsx",{m:self.merchantId},function(data){
if(data.state=='ok'){
var g = data.groups;
var groups = [];
for(var i=0; i<data.groups.length;i++){
var  g = data.groups[i];
var userGroup = new UserGroup(g.id, g.name, g.description,self.merchantId);
groups.push(userGroup);
for(var j=0; j< g.users.length; j++){
var u = g.users[j];
var user = new User(u.id, u.loginId, u.nickName, u.realName);
userGroup.users.push(user);
}
}
self.userGroups(groups);
}
},"json");
}

self.addGroupDialog = function () {
self.groupInfoDialog.name("");
self.groupInfoDialog.description("");
self.groupInfoDialog.currentGroup = null;
self.groupInfoDialog.merchantId = self.merchantId;
self.groupInfoDialog.onAddGroupOk = function(userGroup){
self.userGroups.push(userGroup);
};
$('#dialogGroupInfo').modal({show: true});
}

self.updateGroupDialog = function (userGroup) {
self.groupInfoDialog.name(userGroup.name());
self.groupInfoDialog.description(userGroup.description());
self.groupInfoDialog.userGroupViewModel = self;
self.groupInfoDialog.merchantId = self.merchantId;
self.groupInfoDialog.currentGroup = userGroup;
$('#dialogGroupInfo').modal({show: true});
}

self.addUserDialog = function (userGroup) {
self.userDialog.currentGroup = userGroup;
self.userDialog.merchantId = self.merchantId;
$('#dialogAddUser').modal("show");
}
self.deleteGroup = function(userGroup){
$.post("server/userGroup/deleteGroup.jsx",{m:self.merchantId,g:userGroup.id},function(data){
if(data.state=='ok'){
self.userGroups.remove(userGroup);
}
else{
alert(data.msg);
}
},"json");
}
self.search=function(){
for(var i=0;i<self.userGroups().length;i++){
//用户组名字
var name=self.userGroups()[i].name()
var searchKeyWord= self.searchKeyWord()
if(!searchKeyWord){
self.userGroups()[i].show(true);
}else{
if((name&&name.indexOf(searchKeyWord)>-1)){
self.userGroups()[i].show(true);
}else{
self.userGroups()[i].show(false);
}
}
}

}
}

var userGroupList = null;
$(document).ready(function(){
userGroupList = new UserGroupListViewModel(merchantId);
ko.applyBindings(userGroupList,document.getElementById("userGroupList"));
});

var Role = function(id,name,description,creatorMerchantId){
var self = this;
self.id = ko.observable(id);
self.name = ko.observable(name);
self.description = ko.observable(description);
self.creatorMerchantId = ko.observable(creatorMerchantId);
}
var RolesPage = function(merchantId,roleModel){
var self = this;
self.merchantId = merchantId;
self.importedRoles = ko.mapping.fromJS([]);
self.privateRoles = ko.mapping.fromJS([]);
self.searchKeyWord = ko.observable();

self.getRoles = function(){
$.post("server/roles/getRoles.jsx",{m:self.merchantId},function(data){
if(data.state=='ok'){
self.privateRoles.removeAll();
ko.mapping.fromJS(data.privateRoles,self.privateRoles);
//                ko.mapping.fromJS(data.importedRoles,self.importedRoles);
}
},"json");
}
self.delete = function(role){
$.post("server/roles/deleteRole.jsx",{m:self.merchantId,roleId:role.id},function(data){
if(data.state=='ok') {
self.privateRoles.remove(role);
}
},"json")
}
self.search=function(){
for(var i=0;i<self.privateRoles().length;i++){
var name=self.privateRoles()[i].name()
var id=self.privateRoles()[i].id()
var description=self.privateRoles()[i].description()
var searchKeyWord= self.searchKeyWord()
if(!searchKeyWord){
self.privateRoles()[i].show(true);
}else{
if((name&&name.indexOf(searchKeyWord)>-1)||id.indexOf(searchKeyWord)>-1||(description&&description.indexOf(searchKeyWord)>-1)){
self.privateRoles()[i].show(true);
}else{
self.privateRoles()[i].show(false);
}
}
}
}
self.edit = function(role){
roleFormPage.merchantId = self.merchantId;
roleFormPage.setRole(role);
window.location.href = "#/" + self.merchantId + "/role/edit";

}
self.remove = function(role){
bootbox.confirm("确定要删除吗?", function(result) {
if(result){
self.delete(role);
}
});

}
self.add = function(){
window.location.href = "#/" + self.merchantId + "/role/add";
}
}
var rolesPage = null;
$(document).ready(function(){
rolesPage = new RolesPage(merchantId);
ko.applyBindings(rolesPage,document.getElementById("listRoles"));
});
function RoleFormPage(merchantId, roleModel) {
var self = this;
self.merchantId = merchantId;
self.roleModel = roleModel;
self.mode = ko.observable();
self.roleId = ko.observable();

self.name = ko.observable();
self.description = ko.observable();
self.selectedApps = ko.observableArray([]);
self.apps = ko.mapping.fromJS([])
self.initialized = false;

self.returnList = function () {
window.location.href = "#/" + self.merchantId + "/role/list"
}

self.getApps = function () {
$.post("server/roles/getAppsWithActionGroups.jsx", {m: self.merchantId}, function (data) {
ko.mapping.fromJS(data.apps, self.apps);
for (var i = 0; i < self.apps().length; i++) {
var app = self.apps()[i];
for (var j = 0; j < app.actionGroups().length; j++) {
var actionGroup = app.actionGroups()[j];
actionGroup.app = app;
}
}
}, "json");
self.initialized = true;
}


self.getActionGroupById = function (actionGroupId) {
for (var i = 0; i < self.apps().length; i++) {
var app = self.apps()[i];
for (var j = 0; j < app.actionGroups().length; j++) {
var actionGroup = app.actionGroups()[j];
if (actionGroup.id() == actionGroupId) {
return actionGroup;
}
}
}
return null;
}
self.add = function (actionGroup) {
//search selectedApps
for (var i = 0; i < self.selectedApps().length; i++) {
var selApp = self.selectedApps()[i];
if (selApp.id() == actionGroup.app.id()) {
//判断是否已经存在
var found = false;
for (var j = 0; j < selApp.actionGroups().length; j++) {
var a = selApp.actionGroups()[j];
if (a.id() == actionGroup.id()) {
found = true;
break;
}
}
if (!found) {
selApp.actionGroups.push(actionGroup);
}
return;
}
}
var selApp = {
id: ko.observable(actionGroup.app.id()),
name: ko.observable(actionGroup.app.name()),
actionGroups: ko.observableArray([actionGroup])
}
self.selectedApps.push(selApp);
if (actionGroup.app.name().indexOf("已分配") == -1) {
actionGroup.app.name(actionGroup.app.name() + "(已分配)");
}
};
self.refreshState = function () {
for (var i = 0; i < self.apps().length; i++) {
var app = self.apps()[i];
app.name(app.name().replace("(已分配)", ''));
for (var k = 0; k < self.selectedApps().length; k++) {
var selectApp = self.selectedApps()[k];
if (selectApp.id() == app.id() && app.name().indexOf("已分配") == -1) {
app.name(app.name() + "(已分配)");
break;
}
}
}
};
self.delete = function (actionGroup) {
for (var i = 0; i < self.selectedApps().length; i++) {
var selApp = self.selectedApps()[i];
if (selApp.id() == actionGroup.app.id()) {
selApp.actionGroups.remove(actionGroup);
if (selApp.actionGroups().length == 0) {
self.selectedApps.remove(selApp);
}
self.refreshState();
return;
}
}
}
self.save = function () {
var data = {m: self.merchantId, roleId: self.roleId(), description: self.description(), name: self.name()}
var actionGroupIds = [];
for (var i = 0; i < self.selectedApps().length; i++) {
var app = self.selectedApps()[i];
for (var j = 0; j < app.actionGroups().length; j++) {
var actionGroup = app.actionGroups()[j];
actionGroupIds.push(actionGroup.id());
}
}
data.actionGroupIds = JSON.stringify(actionGroupIds);

$.post("server/roles/saveRole.jsx", data, function (data) {
if (data.state == 'ok') {
bootbox.alert("保存成功！", function () {
self.returnList();
});
}
else {
bootbox.alert("出错了！" + data.msg);
}
}, "json");
}

self.getSelectedApps = function () {
self.selectedApps([]);
if (self.roleId) {
$.post("server/roles/getRoleActionGroups.jsx", {m: self.merchantId, roleId: self.roleId}, function (data) {
if (data.state == 'ok') {
var groupIds = data.groupIds;
$.map(groupIds, function (groupId) {
var actionGroup = self.getActionGroupById(groupId);
if (actionGroup) {
self.add(actionGroup);
}
})
self.refreshState();
}
}, "json");
}
}
self.setRole = function (role) {
if (role != null) {
self.name(role.name());
self.roleId(role.id());
self.description(role.description());
self.getSelectedApps();
}
else {
self.roleId("");
self.name("");
self.description("");
self.getSelectedApps();

}
}

};

var roleFormPage = null;
$(document).ready(function () {
roleFormPage = new RoleFormPage(merchantId);
roleFormPage.getApps();//立即初始化
ko.applyBindings(roleFormPage, document.getElementById("addRolePage"));
});

function AssignByMemberGroupPage(merchantId) {
var self = this;
self.merchantId = merchantId;
self.memberGroups = ko.observableArray([]);
self.currentPage = ko.observable("byMemberGroups-list");
self.roles = ko.mapping.fromJS([]);
self.selectedRoles = ko.observableArray();
self.currentMemberGroup = null;
self.searchKeyWord = ko.observable();
self.editing = ko.observable(false);

function UserGroup(id, name, description,merchantId,roles) {
var self = this;
self.name = ko.observable(name);
self.description = ko.observable(description);
self.id = ko.observable(id);
self.roles = ko.mapping.fromJS(roles);
self.merchantId = merchantId;
self.show=ko.observable(true);
self.remove = function (role) {
var roleId=role.id();
$.post("server/roleAssign/removeRolesFromMemberGroup.jsx",{m:self.merchantId,g:self.id(),roleId:roleId},function(data){
if(data.state=='ok'){
self.roles.remove(role);
}
},"json");
}
}
self.beginEdit = function(){
self.editing(true);
},
self.endEdit = function(){
self.editing(false);
},
self.getMemberGroups = function () {
$.post("server/roleAssign/getUserGroups.jsx", {m: self.merchantId}, function (data) {
if (data.state == 'ok') {
var groups = [];
for(var i=0; i<data.groups.length;i++){
var  g = data.groups[i];
var userGroup = new UserGroup(g.id, g.name, g.description,self.merchantId, g.roles);
groups.push(userGroup);
}
self.memberGroups(groups);
}

}, "json");
},
self.getRoles = function () {
$.post("server/roleAssign/getRoles.jsx", {m: self.merchantId}, function (data) {
if (data.state == 'ok') {
ko.mapping.fromJS(data.roles, self.roles);
}
}, "json");
}
self.selectRoles = function (memberGroup) {
self.currentMemberGroup = memberGroup;
dialogSelectRoles.onOk = function(roles){
self.add(roles);
};
dialogSelectRoles.merchantId = self.merchantId;
dialogSelectRoles.getRoles();
dialogSelectRoles.showDialog();

}
self.add = function (roles) {
var selectedRoles = [];
var roleIds = [];
for (var i = 0; i < roles.length; i++) {
var role = roles[i];
if (role.selected()) {
selectedRoles.push(role);
roleIds.push(role.id());
}
}
$.post("server/roleAssign/addRolesToMemberGroup.jsx",{m:self.merchantId,g:self.currentMemberGroup.id(),roleIds:roleIds.join(",")},function(data){
if(data.state=='ok'){
self.currentMemberGroup.roles(selectedRoles);
$("#selectRolesDialog").modal("hide");
}
},"json");
}
self.search=function(){
for(var i=0;i<self.memberGroups().length;i++){
var name=self.memberGroups()[i].name()
var id=self.memberGroups()[i].id()
var searchKeyWord= self.searchKeyWord()
if(!searchKeyWord){
self.memberGroups()[i].show(true);
}else{
if((name&&name.indexOf(searchKeyWord)>-1)||id.indexOf(searchKeyWord)>-1){
self.memberGroups()[i].show(true);
}else{
self.memberGroups()[i].show(false);
}
}

}

}
}

var assignByMemberGroupPage = null;
$(document).ready(function(){
assignByMemberGroupPage = new AssignByMemberGroupPage(merchantId);
ko.applyBindings(assignByMemberGroupPage,document.getElementById("assignByUserGroupPage"));
});
/**
* Created by Administrator on 14-4-8.
*/
function DialogSelectRoles(){
var self = this;
self.merchantId = null;
self.roles = ko.mapping.fromJS([]);
self.selectedRoles = ko.observableArray();
self.onOk = null;
self.getRoles = function () {
$.post("server/roleAssign/getRoles.jsx", {m: self.merchantId}, function (data) {
if (data.state == 'ok') {
ko.mapping.fromJS(data.roles, self.roles);
}
}, "json");
};
self.showDialog = function(){
$.map(self.roles(), function (role) {
role.selected(false);
});
$("#SelectRolesDialog").modal("show");
};
self.ok = function(){
if(self.onOk){
self.onOk(self.roles());
}
$("#SelectRolesDialog").modal("hide");
}
}
var dialogSelectRoles = null;
$(document).ready(function(){
dialogSelectRoles = new DialogSelectRoles();
dialogSelectRoles.getRoles();
ko.applyBindings(dialogSelectRoles,document.getElementById("SelectRolesDialog"));
});

var sammyApp = $.sammy(function(){
this.get("#/:merchantId/userGroup/list",function(context){
$(".page").hide();
userGroupList.merchantId = this.params['merchantId'];
$("#userGroupList").fadeIn();
$("#navPanel li").removeClass("active");
$("#tabUserGroup").addClass("active");
userGroupList.loadUserGroups();
});
this.get("#/:merchantId/role/list",function(context){
$(".page").hide();
rolesPage.merchantId = this.params['merchantId'];
$("#listRoles").fadeIn();
$("#navPanel li").removeClass("active");
$("#tabRole").addClass("active");
rolesPage.getRoles();
});
this.get("#/:merchantId/role/add",function(context){
$(".page").hide();
roleFormPage.merchantId = this.params['merchantId'];
roleFormPage.setRole(null);
$("#addRolePage").fadeIn();
$("#navPanel li").removeClass("active");
$("#tabRole").addClass("active");

});
this.get("#/:merchantId/role/edit",function(context){
$(".page").hide();
roleFormPage.merchantId = this.params['merchantId'];
$("#addRolePage").fadeIn();
$("#navPanel li").removeClass("active");
$("#tabRole").addClass("active");

});
this.get("#/:merchantId/roleAssign/byMemberGroup",function(context){
$(".page").hide();
assignByMemberGroupPage.merchantId = this.params['merchantId'];
$("#assignByUserGroupPage").fadeIn();
$("#navPanel li").removeClass("active");
$("#tabRoleDispatch").addClass("active");
assignByMemberGroupPage.getMemberGroups();

});

});

$(document).ready(function(){
bootbox.setDefaults({locale:"zh_CN"})
sammyApp.run();
});
