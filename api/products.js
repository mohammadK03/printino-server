var express = require('express');
var router = express.Router();
const Product = require('../model/Product');
const Cart = require('../model/Cart');
const slug = require('../utils/slug');
const lang = require('../utils/lang')
const Category = require('../model/Category');
const vToken = require('../utils/jwt')
const messageToClient = require('../utils/messages').messageToClient;
const generate = require('../utils/generate');
const Value = require('../model/Value');
router.use("/properties", require('./products/properties'));
router.use("/:id/dimensions", require('./products/dimensions'));
router.use("/:id/comments", require('./products/comments'));

router.use("/:id/variations", require('./products/variations'));

function isAdmin(req, res, next) {
  let decoded = req.user;
  if (decoded && decoded.role === "admin") {
    next();
  } else {
    res.statusCode = 403;
    res.json(messageToClient(false, "access_denied", {}));

  }
}

function isAdminOrSeller(req, res, next) {
  let decoded = req.user;
  if (decoded && decoded.role === "admin" || decoded.role === "seller") {
    next();
  } else {
    res.statusCode = 403;
    res.json(messageToClient(false, "access_denied", {}));

  }
}

router.get('/', async (req, res, next) => {
  let options = {
    page: 1,
    limit: 30,
    // select: "name images price discountPercent slug stock variations productType"
  };
  let page = req.query.page;
  let search = req.query.search;
  let sellerId = req.query.seller;
  let category = req.query.category;
  let categoryid = req.query.categoryid;
  let brands = req.query.brands;
  let sortby = req.query.sortby;
  let query = {};
  let price = req.query.price;
  console.log(req.query.isActive)
  if(req.query.isActive==="false"){
    query.isActive=false;
  }else if(req.query.isActive===""){

  }else{
    query.isActive=true;
  }
  if (category) {
    let resCategory = await Category.findOne({ slug: category })
    if (resCategory) {
      category = resCategory._id;

    } else {
      category = null;
    }
  }
  if (categoryid) {
    category = categoryid;
  }
  if (search && search.length >= 3 && search.length <= 30) {
    let wordsArray = search.split(" ");
    let wordRegex = '';
    for (let a = 0; a < wordsArray.length; a++) {
      let word = wordsArray[a] + '';
      if (word.startsWith("ا")) {
        wordRegex += `آ${word.substr(1)}|`;

      }
      wordRegex += word;

      if (a < wordsArray.length - 1) {
        wordRegex += "|"
      }
    }
    const regex = new RegExp(wordRegex, "igm");
    query.name = regex
  }
  if (category) {
    query.categories = category;

  }
  if (sellerId) {
    query.sellerId = sellerId;
    query.isActive={$in: [true, false]};
  }
  if (brands) {
    query.brand = brands;

  }
  if (sortby) {
    switch (sortby) {
      case "new":
        options.sort = {
          createdAt: -1
        }
        break;
      case "price-low":
        options.sort = {
          price: 1
        }
        break;
      case "price-high":
        options.sort = {
          price: -1
        }
        break;
    }
  }


  if (page && page > 1) {
    options.page = page;
  }
  try {
    let language = req.query.lang;
    let products = await Product.paginate(query, options);
    if (products.docs.length >= 1) {
      if (language) {
        if (price === 'dollar') {
          let value = await Value.findOne();
          products.docs = lang.setLangs(products.docs, language, true, true, value.dollar)
        } else {
          products.docs = lang.setLangs(products.docs, language, true);
          
        }

      } else {
        products.docs = lang.setLangs(products.docs, language, false)

      }
    }

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json(messageToClient(false, "internall_error", error.message));
  }

});
// router.get('/search', async function (req, res) {
//     let search = req.query.search;
//     if (search) {
//         var regex = new RegExp(search, 'i');
//         let products = await Product.find({ name: regex }).limit(10)
//         res.send(messageToClient(true, "products", products))
//     } else {
//         res.json(messageToClient(false, "search_notfound", {}))
//     }




// });

router.get('/byid/:id', async (req, res) => {
  try {
    let product = await Product.findOne({ _id: req.params.id });
    res.json(messageToClient(true, "product", product));

  } catch (error) {
    res.json(messageToClient(false, "internal_error", error.message));

    console.log(error);
  }

});
router.get('/:slug', async (req, res, next) => {
  let slug = req.params.slug;
  let values = req.query.values;
  let price = req.query.price;
  try {
    let product = await Product.findOne({ 'slug': slug }).populate('categories');
    if (product) {
      if (product.productType === "variations" && product.dimensions.length >= 1) {
        let product = []
        if (!values) {
          product = await Product.aggregate([
            {
              '$match': {
                'slug': slug,
                'productType': 'variations'
              }
            }, {
              '$unwind': {
                'path': '$dimensions'
              }
            }, {
              '$lookup': {
                'from': 'properties',
                'localField': 'dimensions.key',
                'foreignField': '_id',
                'as': 'dimensions.key'
              }
            }, {
              '$unwind': {
                'path': '$dimensions.key'
              }
            }, {
              '$lookup': {
                'from': 'properties',
                'localField': 'dimensions.values',
                'foreignField': '_id',
                'as': 'dimensions.values'
              }
            }, {
              '$lookup': {
                'from': 'categories',
                'localField': 'categories',
                'foreignField': '_id',
                'as': 'categories'
              }
            }, {
              '$project': {
                'properties.key.createdAt': 0,
                'properties.key.updatedAt': 0,
                'properties.key.__v': 0,
                'properties.values.createdAt': 0,
                'properties.values.updatedAt': 0,
                'properties.values.__v': 0,
                'createdAt': 0,
                'updatedAt': 0,
                '__v': 0
              }
            }, {
              '$group': {
                '_id': '$_id',
                'dimensions': {
                  '$push': '$dimensions'
                },
                'name': {
                  '$first': '$name'
                },
                'details': {
                  '$first': '$details'
                },
                'productType': {
                  '$first': '$productType'
                },
                'price': {
                  '$first': '$price'
                },
                'variations': {
                  '$first': '$variations'
                },
                'categories': {
                  '$first': '$categories'
                },
                'categoryId': {
                  '$first': '$categoryId'
                },
                'attributes': {
                  '$first': '$attributes'
                },
                'tags': {
                  '$first': '$tags'
                },
                'slug': {
                  '$first': '$slug'
                },
                'discountPercent': {
                  '$first': '$discountPercent'
                },
                'amazing': {
                  '$first': '$amazing'
                },
                'images': {
                  '$first': '$images'
                },
                'shortId': {
                  '$first': '$shortId'
                },
              }
            }
          ]);
        } else {
          product = await Product.aggregate([
            {
              '$match': {
                'slug': slug,
              }
            }, {
              '$unwind': {
                'path': '$dimensions'
              }
            }, {
              '$lookup': {
                'from': 'properties',
                'localField': 'dimensions.key',
                'foreignField': '_id',
                'as': 'dimensions.key'
              }
            }, {
              '$unwind': {
                'path': '$dimensions.key'
              }
            }, {
              '$lookup': {
                'from': 'categories',
                'localField': 'categories',
                'foreignField': '_id',
                'as': 'categories'
              }
            }, {
              '$lookup': {
                'from': 'properties',
                'localField': 'variations.keys',
                'foreignField': '_id',
                'as': 'variationNames'
              }
            }, {
              '$project': {
                'properties.key.createdAt': 0,
                'properties.key.updatedAt': 0,
                'properties.key.__v': 0,
                'properties.values.createdAt': 0,
                'properties.values.updatedAt': 0,
                'properties.values.__v': 0,
                'createdAt': 0,
                'updatedAt': 0,
                '__v': 0
              }
            }, {
              '$group': {
                '_id': '$_id',
                'dimensions': {
                  '$push': '$dimensions'
                },
                'name': {
                  '$first': '$name'
                },
                'productType': {
                  '$first': '$productType'
                },
                'price': {
                  '$first': '$price'
                },
                'variations': {
                  '$first': '$variations'
                },
                'categories': {
                  '$first': '$categories'
                },
                'categoryId': {
                  '$first': '$categoryId'
                },
                'attributes': {
                  '$first': '$attributes'
                },

                'tags': {
                  '$first': '$tags'
                },
                'name': {
                  '$first': '$name'
                },
                'slug': {
                  '$first': '$slug'
                },
                'discountPercent': {
                  '$first': '$discountPercent'
                },
                'amazing': {
                  '$first': '$amazing'
                },
                'images': {
                  '$first': '$images'
                },
                'variationNames': {
                  '$first': '$variationNames'
                },
                'shortId': {
                  '$first': '$shortId'
                },
              }
            }
          ]);
        }
        let mProduct = product[0];
        if (price === 'dollar') {
          let value = await Value.findOne();
          if (mProduct.price) {
            mProduct =lang.convertPrice(mProduct,value.dollar)

          }
        }

        return res.send(messageToClient(true, "product",mProduct))

      }
      let mProduct = product;
      if (price === 'dollar') {
        let value = await Value.findOne();
        if (mProduct.price) {
          mProduct =lang.convertPrice(mProduct,value.dollar)
        }
      }
      res.send(messageToClient(true, "product", mProduct))

    } else {
      res.send(messageToClient(false, "product_not_found", {}))

    }

  } catch (error) {
    console.log(error);
    res.json(messageToClient(false, "internall_error", error.message));

  }

});

router.post('/', vToken.verifyToken, async (req, res, next) => {
  let decoded = req.user;
  if (decoded.role === "admin") {
    req.body.isActive = true;
  } else if (decoded.role === "seller") {
    req.body.isActive = false;
    req.body.with = "seller";
    req.body.sellerId = decoded.id;
  } else {
    return res.send(messageToClient(false, "access_denied", {}))

  }
  let categoryId = req.body.categoryId;

  if (!categoryId) {
    return res.json(messageToClient(false, `categoryId_is_required`, {}));

  }
  let category = await Category.findOne({ _id: categoryId });
  if (!category) {
    return res.json(messageToClient(false, `category_not_found`, {}));

  }

  if (!req.body.name) {
    return res.json(messageToClient(false, `name_is_required`, {}));

  }

  category.ancestors.unshift(category);
  req.body.categories = category.ancestors;
  req.body.parent = category._id;
  try {
  

    req.body.slug=generate.getRandomString(6);

    let shortId = generate.getRandomString(3);
    req.body.shortId = shortId;
    let product = Product(req.body);

     await product.save();
    res.send(messageToClient(true, "ok_added", {slug:req.body.slug}));


  } catch (error) {

    console.log(error)

    if (error.code && error.code === 11000) {
      return res.json(messageToClient(false, "duplicate_key", {}));
    }

    res.json(messageToClient(false, "internall_error", error.message));

  }


});



router.put('/:id', vToken.verifyToken, isAdminOrSeller, async (req, res, next) => {
  let categoryId = req.body.categoryId;
  if (categoryId) {
    let category = await Category.findOne({ _id: categoryId });
    if (!category) {
      return res.json(messageToClient(false, `category_not_found`, {}));

    }
    category.ancestors.unshift(category);
    req.body.categories = category.ancestors;
    req.body.parent = category._id;
  }



  try {
    if (req.body.slug) {
      req.body.slug = slug.slugify(req.body.slug);
    }
    await Product.updateOne({ _id: req.params.id }, req.body)


    res.send(messageToClient(true, "ok_updated", {}));


  } catch (error) {
    console.log(error)
    if (error.code && error.code === 11000) {
      return res.json(messageToClient(false, "duplicate_key", {}));
    }

    res.json(messageToClient(false, "internall_error", error.message));

  }


});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res, next) => {
  try {
    await Product.deleteOne({ _id: req.params.id })
    try {
      await Cart.updateMany({ "products.productId": req.params.id }, { $pull: { 'products': { 'productId': req.params.id } } })
    } catch (error) {
      console.log(error);
    }
    res.send(messageToClient(true, "ok_delete", {}));
  } catch (error) {
    console.log(error)
    res.statusCode = 500;
    res.status(500).json(messageToClient(false, "internall_error", error.message));

  }


});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
