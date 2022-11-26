var db = require("../config/connection");
var collection = require("../config/collection");
var objectID = require("mongodb").ObjectId;

module.exports = {
  addproduct: (product) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(product)
        .then(() => {
          resolve();
        });
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  findProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectID(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectID(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      console.log(proDetails);
      if (proDetails.imagefileName.length > 0) {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: objectID(proId) },
            {
              $set: {
                product: proDetails.product,
                brand: proDetails.brand,
                category: proDetails.category,
                price: proDetails.price,
                offerprice: proDetails.offerprice,
                description: proDetails.description,
                imagefileName: proDetails.imagefileName,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } else {
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: objectID(proId) },
            {
              $set: {
                product: proDetails.product,
                brand: proDetails.brand,
                category: proDetails.category,
                price: proDetails.price,
                offerprice: proDetails.offerprice,
                description: proDetails.description,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
 
};
