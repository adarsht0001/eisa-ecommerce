function addtoWhislist(id) {
    $.ajax({
        url: '/addtoWhislist',
        data: {
            product: id
        },
        method: 'post',
        success: (reponse) => {
            $("#products").load(window.location.href + " #products");
            $("#productsbotm").load(window.location.href + " #productsbotm");
        }
    })
}