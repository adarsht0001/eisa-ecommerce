var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  addCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let Category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ Category: data.Category });
      if (Category) {
        data = {};
        data.exists = true;
        resolve(data);
      } else {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(data)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  viewcategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    });
  },
  deletecategory: (categoryid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectID(categoryid) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getDetails: (category) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectID(category) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updatecategory: (id, update) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectID(id) },
          {
            $set: {
              Category: update.Category,
              Discount: update.Discount,
            },
          }
        )
        .then(() => {
          db.get()
            .collection(collection.CATEGORY_COLLECTION)
            .findOne({ _id: objectID(id) })
            .then((response) => {
              let val = 1 - parseInt(response.Discount) / 100;
              console.log(val);
              db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateMany({ category: response.Category }, [
                  {
                    $addFields: {
                      Amount: { $toInt: "$price" },
                    },
                  },
                  {
                    $project: {
                      brand: 1,
                      product: 1,
                      description: 1,
                      category: 1,
                      price: 1,
                      Amount: 1,
                      imagefileName: 1,
                      offerprice: {
                        $round: [{ $multiply: ["$Amount", val] }, 0],
                      },
                    },
                  },
                  { $set: { offerprice: "$offerprice" } },
                ]);
            });
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  bestCategory: () => {
    return new Promise(async (resolve, reject) => {
      let Category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $sort: { Discount: -1 },
          },
          {
            $limit: 1,
          },
        ])
        .toArray();
      resolve(Category[0]);
    });
  },
  categoryAddpro:(name)=>{
    return new Promise(async(resolve, reject) => {
      let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({Category:name})
      resolve(category)
    })
  }
};
