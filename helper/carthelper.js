var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  addtocart: (proid, userid) => {
    objprod = {
      product: objectID(proid),
      quantity: 1,
      time: new Date().getTime()
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({
          user: objectID(userid),
        });
      if (userCart) {
        let productexist = userCart.products.findIndex(
          (products) => products.product == proid
        );
        if (productexist == -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                user: objectID(userid),
              },
              {
                $push: {
                  products: objprod,
                },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          resolve();
        }
      } else {
        let cartobj = {
          user: objectID(userid),
          products: [objprod],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartobj)
          .then(() => {
            resolve();
          });
      }
    });
  },
  viewcart: (userid) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectID(userid) });
      if (user) {
        let userCart = await db
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
                count: "$products.quantity",
                insertionTime: "$products.time",
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
                count: 1,
                insertionTime: 1,
                products: { $arrayElemAt: ["$cartItems", 0] },
              },
            },
            {
              $addFields: {
                price: {
                  $toInt: ["$products.offerprice"],
                },
              },
            },
            {
              $project: {
                count: 1,
                insertionTime: 1,
                products: 1,
                total: {
                  $sum: {
                    $multiply: ["$count", "$price"],
                  },
                },
              },
            },
            {
              $sort: {
                insertionTime: -1,
              },
            },
          ])
          .toArray();
        // console.log(userCart)
        resolve(userCart);
      } else {
        resolve([]);
      }
    });
  },
  deleteitem: (userid, prodid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            user: objectID(userid),
          },
          {
            $pull: {
              products: { product: objectID(prodid) },
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  exists: (userid, proid) => {
    var data = {};
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectID(userid) });
      if (cart) {
        let productexist = cart.products.findIndex(
          (products) => products.product == proid
        );
        if (productexist == -1) {
          data.exists = false;
          resolve(data);
        } else {
          data.exists = true;
          resolve(data);
        }
      } else {
        data.exists = false;
        resolve(data);
      }
    });
  },

  changequantity: (item) => {
    count = parseInt(item.count);
    item.quantity = parseInt(item.quantity);

    return new Promise((resolve, reject) => {
      if (item.count == -1 && item.quantity == 1) {
        // db.get()
        //   .collection(collection.CART_COLLECTION)
        //   .updateOne(
        //     { _id: objectID(item.cart) },
        //     {
        //       $pull: { products: { product: objectID(item.product) } },
        //     }
        //   )
        //   .then(() => {
        //     resolve({ removeproduct: true });
            resolve()
          // });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectID(item.cart),
              "products.product": objectID(item.product),
            },
            {
              $inc: { "products.$.quantity": count },
            }
          )
          .then(() => {
            resolve(true);
          });
      }
    });
  },
};
