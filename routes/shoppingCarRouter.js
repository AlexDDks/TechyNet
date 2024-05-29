// routes/cart.js
const express = require('express');
const router = express.Router();
const shoppingCarController = require("../controllers/shoppingCarController");

// Ruta para añadir productos al carrito
router.post('/add', shoppingCarController.addToCart);

// Ruta para visualizar el carrito de compras
router.get('/view', shoppingCarController.viewCart);

// Ruta para iniciar el proceso de compra/checkout
router.get('/checkout', shoppingCarController.checkout);

module.exports = router;
