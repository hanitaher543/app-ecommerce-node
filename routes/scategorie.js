const express = require('express');
const router = express.Router();
const SCategorie = require("../models/scategorie");

// ==============================
// 1️⃣ Afficher toutes les sous-catégories
// ==============================
router.get('/', async (req, res) => {
  try {
    const scat = await SCategorie.find({}, null, { sort: { '_id': -1 } })
                                 .populate("categorieID");
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// ==============================
// 2️⃣ Créer une nouvelle sous-catégorie
// ==============================
router.post('/', async (req, res) => {
  const { nomscategorie, imagescat, categorieID } = req.body;
  const newSCategorie = new SCategorie({
    nomscategorie,
    imagescat,
    categorieID
  });

  try {
    await newSCategorie.save();
    res.status(200).json(newSCategorie);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// ==============================
// 3️⃣ Chercher une sous-catégorie par ID
// ==============================
router.get('/:scategorieId', async (req, res) => {
  try {
    const scat = await SCategorie.findById(req.params.scategorieId);
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// ==============================
// 4️⃣ Modifier une sous-catégorie
// ==============================
router.put('/:scategorieId', async (req, res) => {
  try {
    const scat = await SCategorie.findByIdAndUpdate(
      req.params.scategorieId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// ==============================
// 5️⃣ Supprimer une sous-catégorie
// ==============================
router.delete('/:scategorieId', async (req, res) => {
  try {
    await SCategorie.findByIdAndDelete(req.params.scategorieId);
    res.json({ message: "Sous-catégorie supprimée avec succès." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// ==============================
// 6️⃣ Chercher les sous-catégories par catégorie
// ==============================
router.get('/cat/:categorieID', async (req, res) => {
  try {
    const scat = await SCategorie.find({ categorieID: req.params.categorieID }).exec();
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
