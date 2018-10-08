$(document).ready(function(){
    $(".updateClass").on("click",function(){
        var href = $(this).data("a");
        $.layer({
            type: 2,
            shadeClose: true,
            title: false,
            closeBtn: true,
            shade: [0.8, '#000'],
            border: [0],
            offset: ['20px', ''],
            area: ['1000px', ($(window).height() - 50) + 'px'],
            iframe: {src: href}
        });
    });
});

function reloadList(){
    window.location.reload();
}