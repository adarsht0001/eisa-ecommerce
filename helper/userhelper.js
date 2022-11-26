var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/collection");
const { response } = require("express");
const { ObjectID } = require("bson");
const { Collection } = require("mongodb");

const referrel = require("referral-codes");
const Razorpay = require("razorpay");
const { resolve } = require("path");
const console = require("console");
const cookieParser = require("cookie-parser");

require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.razor_pay_key_id,
  key_secret: process.env.razor_pay_key_secret,
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          email: userData.email,
        })
        .then(async (response) => {
          if (response) {
            resolve(response);
          } else {
            userData.blocked = false;
            userData.Address = [];
            if (userData.referralCode) {
              let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ referralCode: userData.referralCode });
              if (user) {
                userData.referralCode = referrel
                  .generate({
                    prefix: userData.name,
                  })[0]
                  .replace(/\s+/, "");
                db.get()
                  .collection(collection.USER_COLLECTION)
                  .insertOne(userData)
                  .then((data) => {
                    wallet = {
                      user: data.insertedId,
                      Total: 100,
                      History: [
                        {
                          RefferdFrom: user._id,
                          user: user.name,
                          credited: 100,
                          Time: new Date(),
                        },
                      ],
                    };
                    db.get()
                      .collection(collection.WALLET_COLLECTION)
                      .insertOne(wallet);
                    db.get()
                      .collection(collection.WALLET_COLLECTION)
                      .updateOne(
                        { user: user._id },
                        {
                          $inc: { Total: 150 },
                          $push: {
                            History: {
                              RefferdTo: data.insertedId,
                              name: userData.name,
                              credited: 150,
                              Time: new Date(),
                            },
                          },
                        }
                      );
                    resolve(data);
                  });
              } else {
                reject('kii');
              }
            } else {
              userData.referralCode = referrel
                .generate({
                  prefix: userData.name,
                })[0]
                .replace(/\s+/, "");
              db.get()
                .collection(collection.USER_COLLECTION)
                .insertOne(userData)
                .then((data) => {
                  console.log(data);
                  wallet = {
                    user: data.insertedId,
                    Total: 0,
                    History: [],
                  };
                  db.get()
                    .collection(collection.WALLET_COLLECTION)
                    .insertOne(wallet);
                  resolve(data);
                });
            }
          }
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        email: userData.email,
      });
      if (user) {
        if (user.blocked === false) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              resolve({
                status: false,
              });
            }
          });
        } else {
          response.block = true;
          resolve(response);
        }
      } else {
        console.log("failed at bcrypt");
        resolve({
          status: false,
        });
      }
    });
  },
  dootp: (userNum) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          phone: userNum,
        })
        .then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        });
    });
  },
  getAddres: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          _id: ObjectID(userId),
        })
        .then((response) => {
          if (response) {
            resolve(response.Address);
          } else {
            reject("No Address");
          }
        });
    });
  },
  recentAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      recent = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectID(userId),
            },
          },
          {
            $unwind: "$Address",
          },
          {
            $skip: 1,
          },
          {
            $sort: {
              time: -1,
            },
          },
          {
            $limit: 2,
          },
        ])
        .toArray();
      // console.log(recent);
      resolve(recent);
    });
  },
  generteRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log("erris" + err);
        } else {
          resolve(order);
        }
      });
    });
  },
  verifyOrder: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      const hmac = crypto
        .createHmac("sha256", "Xt6JypvySiP3EeN98Ze5Ttg4")
        .update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        )
        .digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  getUser: (uId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          _id: ObjectID(uId),
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updateUser: (userData, id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            _id: ObjectID(id),
          },
          {
            $set: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  ViewWallet: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db
        .get()
        .collection(collection.WALLET_COLLECTION)
        .findOne({ user: ObjectID(userId) });
      if (wallet) {
        resolve(wallet);
      } else {
        reject("No Balance");
      }
    });
  },
  getRefund: (data, price) => {
    return new Promise((resolve, reject) => {
      details = {
        From: "Refund",
        credited: price,
        Time: new Date(),
      };

      db.get()
        .collection(collection.WALLET_COLLECTION)
        .updateOne(
          { user: ObjectID(data.user) },
          { $inc: { Total: parseInt(price) }, $push: { History: details } }
        )
        .then(() => {
          resolve();
        });
    });
  },
  walletHistory: (userId) => {
    return new Promise(async (resolve, reject) => {
      let History = await db
        .get()
        .collection(collection.WALLET_COLLECTION)
        .aggregate([
          { $match: { user: ObjectID(userId) } },
          { $unwind: "$History" },
          {
            $sort: { "History.Time": -1 },
          },
          {
            $match: { "History.From": "Refund" },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();
      resolve(History);
    });
  },
  referrel: (userId) => {
    return new Promise(async (resolve, reject) => {
      let referral = await db
        .get()
        .collection(collection.WALLET_COLLECTION)
        .aggregate([
          { $match: { user: ObjectID(userId) } },
          { $unwind: "$History" },
          {
            $sort: { "History.Time": -1 },
          },
          {
            $match: { "History.From": { $ne: "Refund" } },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();
      console.log(referral);
      resolve(referral);
    });
  },
  getBanner: () => {
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find({ active: true })
        .toArray();
      resolve(banners);
    });
  },
  updateAddres: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userId), "Address._id": ObjectID(data.id) },
          {
            $set: {
              "Address.$.Name": data.Name,
              "Address.$.Mobile": data.Mobile,
              "Address.$.email": data.email,
              "Address.$.address": data.address,
              "Address.$.city": data.city,
              "Address.$.pin": data.pin,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  topProducts: () => {
    return new Promise(async (resolve, reject) => {
      let TopProducts = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$products.product",
              total: { $sum: "$products.quantity" },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 8,
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $addFields: {
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              _id: 0,
              total: 1,
              products: 1,
            },
          },
        ])
        .toArray();
      resolve(TopProducts);
    });
  },
  changePassword: (id, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectID(id) })
        .then((user) => {
          bcrypt
            .compare(data.currentpassword, user.password)
            .then(async (status) => {
              if (status) {
                const bcryptpassword = await bcrypt.hash(data.newpassword, 10);
                db.get()
                  .collection(collection.USER_COLLECTION)
                  .updateOne(
                    { _id: ObjectID(id) },
                    {
                      $set: { password: bcryptpassword },
                    }
                  )
                  .then(() => resolve());
              } else {
                reject("Password Didnt Match");
              }
            });
        });
    });
  },
  otpChangePass: (id, data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      const bcryptpassword = await bcrypt.hash(data.newpassword, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(id) },
          {
            $set: { password: bcryptpassword },
          }
        )
        .then(() => resolve());
    });
  },
};
