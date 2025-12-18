const express = require('express');
const router = express.Router();
const Article = require("../models/article");
const Scategorie = require("../models/scategorie");

// ================================
// Afficher la liste des articles
// ================================
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}, null, { sort: { '_id': -1 } })
            .populate("scategorieID")
            .exec();
        res.status(200).json(articles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Créer un nouvel article
// ================================
router.post('/', async (req, res) => {
    const nouvArticle = new Article(req.body);
    try {
        await nouvArticle.save();
        res.status(200).json(nouvArticle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Afficher la liste des articles avec pagination
// ================================
router.get('/pagination', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Page courante
    const limit = parseInt(req.query.limit) || 5; // Nombre d'articles par page
    const offset = (page - 1) * limit; // Calcul de l'offset

    try {
        const articlesTot = await Article.countDocuments();
        const articles = await Article.find({}, null, { sort: { '_id': -1 } })
            .skip(offset)
            .limit(limit);
        res.status(200).json({ articles: articles, tot: articlesTot });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Chercher un article par ID
// ================================
router.get('/:articleId', async (req, res) => {
    try {
        const art = await Article.findById(req.params.articleId);
        res.status(200).json(art);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Modifier un article
// ================================
router.put('/:articleId', async (req, res) => {
    try {
        const art = await Article.findByIdAndUpdate(
            req.params.articleId,
            { $set: req.body },
            { new: true }
        );
        const updatedArticle = await Article.findById(art._id)
            .populate("scategorieID")
            .exec();
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Supprimer un article
// ================================
router.delete('/:articleId', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.articleId);
        res.json({ message: "Article deleted successfully." });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Chercher les articles par sous-catégorie
// ================================
router.get('/scat/:scategorieID', async (req, res) => {
    try {
        const articles = await Article.find({ scategorieID: req.params.scategorieID }).exec();
        res.status(200).json(articles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// ================================
// Chercher les articles par catégorie
// ================================
router.get('/cat/:categorieID', async (req, res) => {
    try {
        // Récupérer les sous-catégories correspondant à la catégorie
        const sousCategories = await Scategorie.find({ categorieID: req.params.categorieID }).exec();
        const sousCategorieIDs = sousCategories.map(sc => sc._id);

        // Récupérer les articles correspondant aux sous-catégories
        const articles = await Article.find({ scategorieID: { $in: sousCategorieIDs } }).exec();
        res.status(200).json(articles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
