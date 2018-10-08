//#import byMemberGroupPage.js
//#import byRolePage.js
function RoleAssign(merchantId){
    var self = this;
    self.currentPage = ko.observable();
    self.byMemberGroupPage = new ByMemberGroupPage(merchantId);
    self.byRolesPage = new byRolesPage(merchantId);
    self.go = function(page){
        if(page=='byMemberGroups'){
            self.currentPage("byMemberGroups");
            self.byMemberGroupPage.merchantId = appModel.merchantId();
            self.byMemberGroupPage.getMemberGroups();
            self.byMemberGroupPage.getRoles();
            self.byMemberGroupPage.currentPage("byMemberGroups-list");
        }
        if(page=='byRoles'){
            self.currentPage("byRoles");
            self.byRolesPage.getRoles();
            self.byRolesPage.getUserGroups();
            self.byRolesPage.merchantId = appModel.merchantId();
            self.byRolesPage.currentPage("byRolesPage-list");
        }
    }

}