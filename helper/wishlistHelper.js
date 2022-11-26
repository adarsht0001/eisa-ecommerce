var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  addtowishlist: (userId, productId) => {
    let wishItem = {
      product: objectID(productId),
      Time: new Date(),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectID(userId) });
      console.log(userWishlist);
      if (userWishlist) {
        let productExist = userWishlist.products.findIndex(
          (products) => products.product == productId
        );
        if (productExist == -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectID(userId) },
              { $push: { products: wishItem } }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectID(userId) },
              {
                $pull: { products: { product: objectID(productId) } },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        let whislist = {
          user: objectID(userId),
          products: [wishItem],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(whislist)
          .then(() => {
            resolve();
          });
      }
    });
  },
  getwishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectID(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.product",
              foreignField: "_id",
              as: "Product",
            },
          },
          {
            $project: {
              _id: 0,
              user: 1,
              time: "$products.Time",
              products: { $arrayElemAt: ["$Product", 0] },
            },
          },
          {
            $sort: { time: -1 },
          },
        ])
        .toArray();
      resolve(wishlist);
    });
  },
  deleteWishlist: (userId, proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { user: objectID(userId) },
          {
            $pull: { products: { product: objectID(proid) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  checkWishList: (userId, prodId) => {
    return new Promise(async (resolve, reject) => {
      data={}
      let Whislist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectID(userId) });
      if (Whislist) {
        let productexist = Whislist.products.findIndex(
          (products) => products.product == prodId
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
};
