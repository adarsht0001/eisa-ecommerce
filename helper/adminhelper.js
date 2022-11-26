var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  viewUser: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  blockuser: (userid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            _id: objectID(userid),
          },
          {
            $set: {
              blocked: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  unblockuser: (userid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            _id: objectID(userid),
          },
          {
            $set: {
              blocked: false,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  chartPayment: () => {
    return new Promise(async (resolve, reject) => {
      Chart = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: "$payment",
              Total: {
                $count: {},
              },
            },
          },
        ])
        .toArray();
      resolve(Chart);
    });
  },
  amount: () => {
    return new Promise((resolve, reject) => {
      Amount = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: "$payment",
              Total: {
                $sum: "$ToatalAmount",
              },
            },
          },
        ])
        .toArray();
      resolve(Amount);
    });
  },
  getYearly: () => {
    return new Promise(async (resolve, reject) => {
      var graphDta = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $project: {
              day: {
                $dayOfMonth: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: {
                // day: "$day",
                month: "$month",
                // year: "$year"
              },
              Total: {
                $count: {},
              },
            },
          },
        ])
        .toArray();
      resolve(graphDta);
    });
  },
  AnnualSale: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },

          {
            $addFields: {
              day: {
                $dayOfMonth: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $addFields: {
              date: {
                $dateFromParts: {
                  year: "$year",
                  month: "$month",
                  day: "$day",
                  hour: 12,
                },
              },
            },
          },
          {
            $match: {
              date: {
                $gt: new Date(new Date() - 300 * 60 * 60 * 12 * 1000),
              },
            },
          },
        ])
        .toArray();
      resolve(data);
    });
  },
  viewCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let Coupons = await db
        .get()
        .collection(collection.COUPON_COLLECtION)
        .find()
        .toArray();
      resolve(Coupons);
    });
  },
  addCoupon: (CouponData) => {
    return new Promise((resolve, reject) => {
      let coupon = {
        name: CouponData.couponName,
        ExpiryDate: new Date(CouponData.expiryDate),
        upTo: parseInt(CouponData.Upto),
        MinAmount: parseInt(CouponData.MinAmount),
        Percentage: parseInt(CouponData.Percentage),
      };
      db.get()
        .collection(collection.COUPON_COLLECtION)
        .insertOne(coupon)
        .then(() => {
          resolve();
        });
    });
  },
  addBanner: (banner) => {
    banner.active = true;
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .insertOne(banner)
        .then(() => {
          resolve();
        });
    });
  },
  getBanners: () => {
    return new Promise(async (resolve, reject) => {
      let Banners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(Banners);
    });
  },
  deleteBanner: (BannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: objectID(BannerId) })
        .then(() => {
          resolve();
        });
    });
  },
  changeBannerStatus: (data) => {
    return new Promise((resolve, reject) => {
      if (data.Action === "Actice") {
        db.get()
          .collection(collection.BANNER_COLLECTION)
          .updateOne({ _id: objectID(data.Banner) }, { $set: { active: true } })
          .then(() => {
            resolve();
          });
      } else {
        db.get()
          .collection(collection.BANNER_COLLECTION)
          .updateOne(
            { _id: objectID(data.Banner) },
            { $set: { active: false } }
          )
          .then(() => {
            resolve();
          });
      }
    });
  },
  fromTo: (dates) => {
    return new Promise(async (resolve, reject) => {
      if (dates.FromDate.trim().length === 0) {
        var from = new Date();
        from.setUTCHours(0, 0, 0, 0);
      } else {
        var from = new Date(dates.FromDate);
      }
      if (dates.ToDate.trim().length === 0) {
        var to = new Date();
        to.setUTCHours(0, 0, 0, 0);
      } else {
        var to = new Date(dates.ToDate);
      }
      let Data = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              date: {
                $dateFromString: {
                  dateString: "$orderDate",
                },
              },
            },
          },
          {
            $match: { date: { $gte: from, $lte: to } },
          },
          {
            $project: {
              _id: 1,
              user: 1,
              ToatalAmount: 1,
              date: 1,
              products: 1,
              orderDate: 1,
            },
          },
          {
            $unwind: "$products",
            // },{
            //   $match:{'products.status':'Delivered'}
            // },{
          },
          {
            $project: {
              product: "$products.product",
              name: "$products.name",
              quantity: "$products.quantity",
              Total: "$products.Total",
            },
          },
          {
            $group: {
              _id: "$product",
              quantity: { $sum: "$quantity" },
              total: { $sum: "$Total" },
            },
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
              _id: 1,
              quantity: 1,
              total: 1,
              productName: "$products.product",
              brand: "$products.brand",
              category: "$products.category",
            },
          },
        ])
        .toArray();
      resolve(Data);
    });
  },
  getSalesByMonth: (dateData) => {
    datamonth = parseInt(dateData.month);
    datayear = parseInt(dateData.year);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              day: {
                $dayOfMonth: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $match: { month: datamonth, year: datayear },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$orderDate",
              quantity: { $sum: "$products.quantity" },
              total: { $sum: "$ToatalAmount" },
            },
          },
        ])
        .toArray();
      resolve(orders);
    });
  },
  getSalesByyear: (dateData) => {
    datayear = parseInt(dateData.yearly);
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentStatus: "Success",
            },
          },
          {
            $addFields: {
              month: {
                $month: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
              year: {
                $year: {
                  $dateFromString: {
                    dateString: "$orderDate",
                  },
                },
              },
            },
          },
          {
            $match: { year: datayear },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$month",
              quantity: { $sum: "$products.quantity" },
              total: { $sum: "$ToatalAmount" },
            },
          },
        ])
        .toArray();
      resolve(orders);
    });
  },
  categorychart: () => {
    let day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    let Today = new Date(day.getTime() + 1 * 24 * 60 * 60 * 1000);
    let Week = new Date(day.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Promise(async (resolve, reject) => {
      let categorychart = await db
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
            $project: {
              product: "$products.product",
              name: "$products.name",
              quantity: "$products.quantity",
              Total: "$products.Total",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "product",
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
              _id: 1,
              quantity: 1,
              Total: 1,
              productName: "$products.product",
              brand: "$products.brand",
              category: "$products.category",
            },
          },
          {
            $group: { _id: "$category", total: { $sum: "$Total" } },
          },
        ])
        .toArray();
      resolve(categorychart);
    });
  },
  getuserCount: () => {
    return new Promise(async (resolve, reject) => {
      let Users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({})
        .toArray();
      length = Users.length;
      resolve(length);
    });
  },
};
