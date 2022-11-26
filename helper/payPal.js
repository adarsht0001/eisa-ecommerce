var paypal = require("paypal-rest-sdk");
const collection = require("../config/collection");
var db = require("../config/connection");

var objectID = require("mongodb").ObjectId;

require('dotenv').config()

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:process.env.payPal_client_id,
  client_secret:process.env.payPal_client_secret,
});

module.exports = {
  OrderItems:(orderId)=>{
    return new Promise(async(resolve, reject) => {
      let OrderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:{
            _id:orderId
          }
        },{
          $unwind:'$products'
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "products.product",
            foreignField: "_id",
            as: "orderitem",
          },
        },
        {
          $project: {
            proid: "$products.product",
            orderlist: {
              $arrayElemAt: ["$orderitem", 0],
            },
            quantity: "$products.quantity",
          },
        },
        {
          $project: {
            _id:0,
            name: "$orderlist.product",
            total: "$orderlist.offerprice",
            quantity: 1,
          },
        },
        {
          $addFields: {
            price: {
              $toInt: ["$total"],
            },
          },
        },
        {
          $project: {
            name: "$name",
            sku: "item",
            price: {
              $round: [
                {
                  $multiply: ["$price", 0.012],
                },
                0,
              ],
            },
            currency: "USD",
            quantity: "$quantity",
          },
        }
      ]).toArray()
      console.log(OrderItems);
      resolve(OrderItems)
    })
  },

  createorder: (items, total) => {
    return new Promise((resolve, reject) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/verifyPaypal",
          cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
          {
            item_list: {
              items: items,
            },
            amount: {
              currency: "USD",
              total: total,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          resolve(payment);
        }
      });
    });
  },
  verify: (payerId, paymentId, total) => {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: total,
            },
          },
        ],
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            resolve();
          }
        }
      );
    });
  },
};
