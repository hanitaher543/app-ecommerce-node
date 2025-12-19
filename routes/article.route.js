const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Scategorie = require('../models/scategorie');
const { uploadFile } = require('../middleware/uploadfile');
const { verifyToken } = require('../middleware/verify-token');
const {authorizeRoles} = require("../middleware/authorizeRoles")

/* ================================
   AFFICHER LA LISTE DES ARTICLES
================================ */
router.get('/', verifyToken, authorizeRoles("user","admin","visiteur"), async (req, res) => {
  try {
    const articles = await Article.find({}, null, { sort: { _id: -1 } })
      .populate('scategorieID')
      .exec();
    res.status(200).json(articles);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   CREER UN NOUVEL ARTICLE + IMAGE
================================ */
router.post(
  '/',
  uploadFile.single('imageart'),
  async (req, res) => {
    try {
      const {
        reference,
        designation,
        prix,
        marque,
        qtestock,
        scategorieID,
      } = req.body;

      const imageart = req.file ? req.file.filename : null;

      const nouvarticle = new Article({
        reference,
        designation,
        prix,
        marque,
        qtestock,
        scategorieID,
        imageart,
      });

      await nouvarticle.save();
      res.status(200).json(nouvarticle);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

/* ================================
   PAGINATION
================================ */
router.get('/pagination', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const articlesTot = await Article.countDocuments();
    const articles = await Article.find({}, null, { sort: { _id: -1 } })
      .skip(offset)
      .limit(limit);

    res.status(200).json({ articles, tot: articlesTot });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   CHERCHER UN ARTICLE PAR ID
================================ */
router.get('/:articleId', async (req, res) => {
  try {
    const art = await Article.findById(req.params.articleId);
    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   MODIFIER UN ARTICLE
================================ */
router.put('/:articleId', async (req, res) => {
  try {
    const art = await Article.findByIdAndUpdate(
      req.params.articleId,
      { $set: req.body },
      { new: true }
    );

    const updatedArticle = await Article.findById(art._id)
      .populate('scategorieID')
      .exec();

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   SUPPRIMER UN ARTICLE
================================ */
router.delete('/:articleId', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.articleId);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   ARTICLES PAR SOUS-CATEGORIE
================================ */
router.get('/scat/:scategorieID', async (req, res) => {
  try {
    const articles = await Article.find({
      scategorieID: req.params.scategorieID,
    }).exec();

    res.status(200).json(articles);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   ARTICLES PAR CATEGORIE
================================ */
router.get('/cat/:categorieID', async (req, res) => {
  try {
    const sousCategories = await Scategorie.find({
      categorieID: req.params.categorieID,
    }).exec();

    const sousCategorieIDs = sousCategories.map((sc) => sc._id);

    const articles = await Article.find({
      scategorieID: { $in: sousCategorieIDs },
    }).exec();

    res.status(200).json(articles);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/* ================================
   ROUTE PROTEGEE (TOKEN)
================================ */
router.get('/secure/list', verifyToken, async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).json(articles);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
