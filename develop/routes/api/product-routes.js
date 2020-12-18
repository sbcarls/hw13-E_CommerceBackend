const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // Find all products in the database.
  try{
    const productsAll = await Product.findAll({
      // Include/Join its associated models/tables Category and Tag data.
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(200).json(productsAll);
  } catch(err) {
    res.status(500).json(err);
  }  
});

// get one product
router.get('/:id', async (req, res) => {
  // Find a single product by its `id`.
  try{
    const productSingle = await Product.findByPk(req.params.id, {
      // Include/Joing its associated models/tables Category and Tag data.
      include:[
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    if(!productSingle){
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }
    res.status(200).json(productSingle);
  } catch(err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tagId) => {
          return {
            productId: product.id,
            tagId,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { productId: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tagIds
      const productTagIds = productTags.map(({ tagId }) => tagId);
      // create filtered list of new tagIds
      const newProductTags = req.body.tagIds
        .filter((tagId) => !productTagIds.includes(tagId))
        .map((tagId) => {
          return {
            productId: req.params.id,
            tagId,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tagId }) => !req.body.tagIds.includes(tagId))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
  // delete one product by its `id` value
  const productDelete = await Product.destroy({
    where: {
      id: req.params.id
    }
  });

  if(!productDelete){
    res.status(404).json({ message: 'No product found with this id.'})
  }

  res.status(200).json(productDelete);
}catch(err){
  res.status(500).json(err);
}
});

module.exports = router;
© 2020 GitHub, Inc.