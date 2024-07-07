const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const usersController = require("../controllers/UsersControllerDB");

router.post('/add', cartController.addToCart);
router.get('/', usersController.profile);
router.post('/checkout', cartController.checkout);
router.post('/remove/:productId', cartController.removeFromCart);

module.exports = router;
