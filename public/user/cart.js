function quantity(cartid, proid, count) {
  let quantity = parseInt(document.getElementById(proid).value);
  $.ajax({
    url: "/changequantity",
    data: {
      cart: cartid,
      product: proid,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeproduct) {
        swal({
          title: "Product Removed",
          icon: "success",
          button: "OK",
        }).then(() => {
          $("#CartItems").load(window.location.href + " #CartItems");
        });
      } else {
        $("#CartItems").load(window.location.href + " #CartItems");
      }
    },
  });
}

function removebtn(id) {
  swal("Are you sure?", {
    dangerMode: true,
    buttons: true,
  }).then((value) => {
    if (value) {
      location.href = "/delete/" + id;
    }
  });
}

function coupon() {
  let coupon = document.getElementById("couponCode").value;
  $.ajax({
    url: "/applyCoupon",
    data: { name: coupon },
    method: "post",
    success: (response) => {
      if (response.status) {
        let total = document.getElementById("total").innerHTML;
        if (total > response.data.MinAmount) {
          document.getElementById("apply").disabled = true;
          document.getElementById("couponCode").readOnly = true;
          var discounted = Math.round((total * response.data.Percentage) / 100);
          if (discounted > response.data.upTo) {
            document.getElementById("total").innerHTML =
              total - response.data.upTo;
            const single = document.querySelectorAll(".stotal");
            let singlediscount = response.data.upTo / single.length;
            for (i = 0; i < single.length; i++) {
              let stotal = single[i].innerHTML;
              single[i].innerHTML = stotal - singlediscount;
            }
            const sideTotal = document.querySelectorAll(".sideTotal");
            for (i = 0; i < sideTotal.length; i++) {
              let stotal = sideTotal[i].innerHTML;
              sideTotal[i].innerHTML = stotal - singlediscount;
            }
            const product = document.querySelectorAll(".productname");
            let name = [];
            let price = [];
            for (i = 0; i < single.length; i++) {
              let stotal = single[i].innerHTML;
              price[i] = stotal;
            }
            for (i = 0; i < product.length; i++) {
              pro = product[i].innerHTML;
              name[i] = pro;
            }
            $.ajax({
              url: "/assigncoupon",
              data: {
                total: document.getElementById("total").innerHTML,
                price,
                name,
                response: response.data._id,
              },
              method: "post",
              success: (response) => {
                swal("Congrats!", "Coupon Have Been Applied", "success");
              }
              
            });
          } else {
            document.getElementById("total").innerHTML =
              total - Math.round((total * response.data.Percentage) / 100);
            const single = document.querySelectorAll(".stotal");

            for (i = 0; i < single.length; i++) {
              let stotal = single[i].innerHTML;
              single[i].innerHTML =
                stotal - Math.round((stotal * response.data.Percentage) / 100);
            }
            const sideTotal = document.querySelectorAll(".sideTotal");

            for (i = 0; i < sideTotal.length; i++) {
              let stotal = sideTotal[i].innerHTML;
              sideTotal[i].innerHTML =
                stotal - Math.round((stotal * response.data.Percentage) / 100);
            }
            const product = document.querySelectorAll(".productname");
            let name = [];
            let price = [];
            for (i = 0; i < single.length; i++) {
              let stotal = single[i].innerHTML;
              price[i] = stotal;
            }

            for (i = 0; i < product.length; i++) {
              pro = product[i].innerHTML;
              name[i] = pro;
            }
            $.ajax({
              url: "/assigncoupon",
              data: {
                total: document.getElementById("total").innerHTML,
                price,
                name,
                response: response.data._id,
              },
              method: "post",
              success: (response) => {
                swal("Congrats!", "Coupon Have Been Applied", "success");
              },
            });
          }
        } else {
          swal({
            title: "Coupon Not Applicable",
            text: `Min Amount Should be ` + response.data.MinAmount,
            icon: "error",
          });
        }
      } else {
        swal({
          title: response.message + "!",
          icon: "error",
        });
      }
    },
  });
}

function clearcoup() {
  document.getElementById("apply").disabled = false;
  document.getElementById("couponCode").readOnly = false;
  $("#CartItems").load(window.location.href + " #CartItems");
}
