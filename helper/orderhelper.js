var db = require("../config/connection");
var collection = require("../config/collection");
const { PRODUCT_COLLECTION } = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  findcart: (uid) => {
    return new Promise(async (resolve, reject) => {
      let usercart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              user: objectID(uid),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "products.product",
              foreignField: "_id",
              as: "cartItem",
            },
          },
          {
            $project: {
              product: "$products.product",
              quantity: "$products.quantity",
              productItems: {
                $arrayElemAt: ["$cartItem", 0],
              },
            },
          },
          {
            $addFields: {
              price: {
                $toInt: ["$productItems.offerprice"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              quantity: 1,
              product: 1,
              price: 1,
              name: "$productItems.product",
              Total: {
                $sum: {
                  $multiply: ["$quantity", "$price"],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(usercart);
    });
  },
  createOrder: (order, product) => {
    return new Promise(async (resolve, reject) => {
      product.forEach((Element) => {
        Element.status = "Order Placed";
      });
      order.PaymentStatus = order.Payment === "COD" ? "Success" : "Pending";
      orderDetails = {
        user: objectID(order.userid),
        Name: order.name,
        Mobile: order.number,
        email: order.email,
        products: product,
        ToatalAmount: order.total,
        payment: order.Payment,
        paymentStatus: order.PaymentStatus,
        DeliveryAddress: {
          address: order.Address,
          city: order.city,
          pin: order.zip,
        },
        orderDate:
          new Date().getDate() +
          "-" +
          (new Date().getMonth() + 1) +
          "-" +
          new Date().getFullYear(),
        orderTime: new Date().getHours() + ":" + new Date().getMinutes(),
        time: new Date().getTime(),
      };
      db.get()
      .collection(collection.ORDER_COLLECTION)
      .insertOne(orderDetails)
      .then(async(Id) => {
        user = {
          _id: objectID(),
          Name: order.name,
          Mobile: order.number,
          email: order.email,
          address: order.Address,
          city: order.city,
          pin: order.zip,
          time: new Date().getTime(),
        };
      let AdddressExist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          _id: objectID(order.userid),
          Address: {
            $elemMatch: {
              Name: order.name,
              Mobile: order.number,
              email: order.email,
              address: order.Address,
              city: order.city,
              pin: order.zip,
            },
          },
        });
      if (AdddressExist) {
        resolve(Id);
      } else {

            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                {
                  _id: objectID(order.userid),
                },
                {
                  $push: {
                    Address: user,
                  },
                }
              )
              .then(() => {
                resolve(Id);
              });
            }
          });
    });
  },
  removeCart: (userid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({
          user: objectID(userid),
        })
        .then(() => {
          resolve();
        });
    });
  },
  vieworder: (userId) => {
    return new Promise(async (resolve, reject) => {
      order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              user: objectID(userId),
            },
          },
          {
            $unwind: "$products",
          },
 
          {
            $project: {
              Name: 1,
              Mobile: 1,
              payment: 1,
              DeliveryAddress: 1,
              product: "$products.product",
              status: "$products.status",
              quantity: "$products.quantity",
              productTotal: "$products.Total",
              TotalAmount: 1,
              orderDate: 1,
              orderTime: 1,
              time: 1,
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              Name: 1,
              Mobile: 1,
              payment: 1,
              product: 1,
              status: 1,
              quantity: 1,
              DeliveryAddress: 1,
              productTotal: 1,
              TotalAmount: 1,
              orderDate: 1,
              orderTime: 1,
              time: 1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
          {
            $sort: {
              time: -1,
            },
          },
        ])
        .toArray();
      resolve(order);
    });
  },
 
  adminorderlist: () => {
    return new Promise(async (resolve, reject) => {
      order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {},
          },
          {
            $project: {
              user: 1,
              Name: 1,
              Mobile: 1,
              email: 1,
              payment: 1,
              orderDate: 1,
              orderTime: 1,
              paymentStatus: 1,
              ToatalAmount: 1,
              time: 1,
            },
          },
          {
            $sort: {
              time: -1,
            },
          },
        ])
        .toArray();
      resolve(order);
    });
  },
  total: (userid) => {
    return new Promise(async (resolve, reject) => {
      amount = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              user: objectID(userid),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              product: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              quantity: 1,
              product: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
          {
            $addFields: {
              price: {
                $toInt: ["$product.offerprice"],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", "$price"],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(amount[0]);
    });
  },
  findAddress: (userid, addresid) => {
    return new Promise(async (resolve, reject) => {
      Address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectID(userid),
            },
          },
          {
            $unwind: "$Address",
          },
          {
            $match: {
              "Address._id": objectID(addresid),
            },
          },
          {
            $project: {
              Name: "$Address.Name",
              Mobile: "$Address.Mobile",
              email: "$Address.email",
              address: "$Address.address",
              city: "$Address.city",
              pin: "$Address.pin",
            },
          },
        ])
        .toArray();
      resolve(Address[0]);
    });
  },
  adminvieworderitems: (id) => {
    return new Promise(async (resolve, reject) => {
      singleItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectID(id),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              user: 1,
              product: "$products.product",
              status: "$products.status",
              quantity: "$products.quantity",
              productTotal: "$products.Total",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            $project: {
              user: 1,
              product: 1,
              status: 1,
              quantity: 1,
              productTotal: 1,
              products: {
                $arrayElemAt: ["$cartItems", 0],
              },
            },
          },
        ])
        .toArray();
      resolve(singleItems);
    });
  },
  setStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: objectID(orderId),
          },
          {
            $set: {
              paymentStatus: "Success",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  cancelOrder: (orderId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId), "products.product": objectID(proId) },
          {
            $set: {
              "products.$.status": "Order Cancelled",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  changeStatus: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: objectID(details.order),
            "products.product": objectID(details.product),
          },
          {
            $set: {
              "products.$.status": details.action,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  setCoupon: (userId, couponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectID(userId) },
          {
            $push: { coupons: objectID(couponId) },
          }
        )
        .then(() => {
          resolve;
        });
    });
  },
  return: (orderId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectID(orderId), "products.product": objectID(proId) },
          {
            $set: {
              "products.$.status": "Requested Return",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  refundMoney: (details) => {
    return new Promise(async (resolve, reject) => {
      let price = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { _id: objectID(details.order) } },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.product": objectID(details.product),
            },
          },
          {
            $project: {
              _id: 0,
              Total: "$products.Total",
            },
          },
        ])
        .toArray();
      resolve(price[0].Total);
    });
  },
  findProduct: (orderId, productId) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { _id: objectID(orderId) } },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.product": objectID(productId),
            },
          },
          {
            $project: {
              _id: 0,
              Total: "$products.Total",
              payment: 1,
            },
          },
        ])
        .toArray();
      resolve(product);
    });
  },
  deleteOrder:(orderId)=>{
    console.log(orderId);
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:objectID(orderId)}).then(()=>{
        resolve()
      })
    })
  }
};
