const router = require('express').Router();
const { json } = require('sequelize');
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // Find all tags
  try{
    const tagsAll = await Tag.findAll({
  // Include/Join its associated model/table Product data.
    include: [{ model: Product, through: ProductTag }]
    });
    res.status(200).json(tagsAll);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // Find a single tag by its `id`
  try {
    const tagSingle = await Tag.findByPk(req.params.id, {
    // Include/Join its associated model/table Product data.
    include: [{ model: Product, through: ProductTag }]
    });
    if(!tagSingle){
      res.status(404).json({ message: 'No tag found with this id'});
      return;
    }
    res.status(200).json(tagSingle);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // Create a new tag
  try {
    const tagNew = await Tag.create(req.body);
    res.status(200).json(tagNew);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tagUpdate = await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    res.json(tagUpdate);
  } catch(err) {
    res.status(400).json;
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagDelete = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if(!tagDelete) {
      res.status(404).json({ message: 'No tag found with this id'});
      return;
    }

    res.status(200).json(tagDelete);
  } catch(err) {
    res.status(500).json(err);
  }
});

module.exports = router;