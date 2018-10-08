
function deleteProduct1(self) {
    bootbox.confirm("是否删除", function (result) {
        if(result){
            var data = {
                id:self.getAttribute("data-a"),
                m:m
            };
            $.post("../handler/deleteProduct.jsx",data,function (res) {
                if(res.state == "ok"){
                    bootbox.alert("成功删除");
                    history.go(0);
                }
            },"json")
        }

    })
}

