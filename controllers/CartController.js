// controllers/CartController.js
const db = require('../database/models');

const controller = {
  addToCart: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/users/login');
      }

      const { productId, quantity } = req.body;
      const userId = req.session.user.id;

      let cart = await db.Cart.findOne({ where: { userId } });

      if (!cart) {
        cart = await db.Cart.create({ userId });
      }

      const cartItem = await db.CartItem.findOne({ where: { cartId: cart.id, productId } });

      if (cartItem) {
        await cartItem.update({ quantity: cartItem.quantity + quantity });
      } else {
        await db.CartItem.create({ cartId: cart.id, productId, quantity });
      }

      res.redirect('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  removeFromCart: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/users/login');
      }

      const userId = req.session.user.id;
      const { productId } = req.params;

      const cart = await db.Cart.findOne({ where: { userId } });

      if (cart) {
        await db.CartItem.destroy({ where: { cartId: cart.id, productId } });
      }

      res.redirect('/users/profile');
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  
  checkout: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/users/login');
      }
  
      const userId = req.session.user.id;
      const { productId, quantity } = req.body;
  
      let cartItems = [];
      let cart = null; // Definimos cart como null
  
      if (productId && quantity) {
        // Compra directa desde la página de detalles del producto
        const product = await db.Product.findByPk(productId);
  
        if (!product || product.stock < quantity) {
          return res.status(400).send('Product not available');
        }
  
        cartItems.push({
          productId: product.id,
          quantity: parseInt(quantity),
          price: product.price,
          productName: product.name,
          imageUrl: `subfolder/${product.imageUrl}`
        });
      } else {
        // Compra desde el carrito
        cart = await db.Cart.findOne({
          where: { userId },
          include: [
            {
              model: db.CartItem,
              as: 'items',
              include: [
                {
                  model: db.Product,
                  as: 'product'
                }
              ]
            }
          ]
        });
  
        if (!cart || cart.items.length === 0) {
          return res.redirect('/users/profile');
        }
  
        cartItems = cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
          imageUrl: `subfolder/${item.product.imageUrl}`
        }));
      }
  
      let total = 0;
      for (const item of cartItems) {
        total += item.price * item.quantity;
      }
  
      const order = await db.Order.create({
        userId,
        total,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      for (const item of cartItems) {
        await db.OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          createdAt: new Date(),
          updatedAt: new Date()
        });
  
        const product = await db.Product.findByPk(item.productId);
        if (product) {
          await product.update({ stock: product.stock - item.quantity });
        }
      }
  
      if (cart) {
        // Si es una compra desde el carrito, vaciamos el carrito
        await db.CartItem.destroy({ where: { cartId: cart.id } });
      }
  
      res.redirect('/users/profile?success=checkout');
    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  
};

module.exports = controller;
