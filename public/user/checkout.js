$("#form1").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/checkout",
    method: "post",
    data: $("#form1").serialize(),
    success: (response) => {
      if (response.codSucess) {
        location.href = "/ordersucess";
      } else if (response.unkonwn) {
        razorPayment(response);
      } else if (response.walletSucess) {
        location.href = "/ordersucess";
      } else if (response.walletPaymentFail) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You Dont Have Enough Balance to Make Purchase!",
        });
      } else {
        location.href = response.href;
      }
    },
  });
});

function razorPayment(order) {
  var options = {
    key: "rzp_test_RBXk7a46MUf0HS", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Eiser",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: order.user.name,
      email: order.user.email,
      contact: order.user.mobile,
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
    modal: {
      ondismiss: function () {
        $.ajax({
          url: "/onfailure",
          data: {
            orderid: order,
          },
          method: "delete",
          success: (response) => {
            if (response.status) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Paymnet Cancelled",
                buttons:false,
                timer: 1500,
              }).then(()=>{
                location.reload()
              })
            }
          },
        });
      },
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (response) {
    rzp1.close()
  });
  rzp1.open();
}

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/ordersucess";
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    },
  });
}
