var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  findcoupon: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(collection.COUPON_COLLECtION)
        .findOne({ name: data });
      if (coupon) {
        let cip = coupon._id;
        if (coupon.ExpiryDate >= new Date()) {
          let Used = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({
              $and: [{ _id: objectID(userId) }, { coupons: { $in: [cip] } }],
            });
          if (Used) {
            reject("Already Used Coupon");
          } else {
            resolve(coupon);
          }
        } else {
          reject("Coupon Expired");
        }
      } else {
        reject("Invalid Coupon");
      }
    });
  },
  deleteCoupon: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECtION)
        .deleteOne({ _id: objectID(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  findWalletTotal:(userId)=>{
    return new Promise(async(resolve, reject) => {
      let wallet=await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectID(userId)})
      resolve(wallet.Total)
    })
  },
  walletPurchase:(userId,price)=>{
    return new Promise((resolve, reject) => {
      details = {
        From: "Purchase",
        credited: -price,
        Time: new Date(),
      };
      db.get()
        .collection(collection.WALLET_COLLECTION)
        .updateOne(
          { user: objectID(userId) },
          { $inc: { Total: parseInt(-price) }, $push: { History: details } }
        )
        .then(() => {
          resolve();
        });
      })
  },     
};
