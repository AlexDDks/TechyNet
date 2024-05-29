// controllers/shoppingCarController.js
const db = require('../database/models'); // Asegúrate de importar tus modelos correctamente

const shoppingCarController = {
  addToCart: async (req, res) => {
    if (!req.session) {
      return res.redirect('/users/login'); // Redirige a login si el usuario no está logueado
    }

    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        return res.status(404).send('Producto no encontrado');
      }

      let cartItem = await db.Cart.findOne({
        where: { userId, productId },
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        await db.Cart.create({
          userId,
          productId,
          quantity,
        });
      }

      res.redirect('/cart/view'); // Redirige al carrito después de añadir el producto
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      res.status(500).send('Error al procesar la solicitud');
    }
  },

  viewCart: async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const userId = req.session.userId;

    try {
      const cartItems = await db.Cart.findAll({
        where: { userId },
        include: [{
          model: db.Product,
        }]
      });

      res.render('cart/view', { cartItems }); // Asumiendo que tienes una vista 'cart/view'
    } catch (error) {
      console.error('Error al visualizar el carrito:', error);
      res.status(500).send('Error al procesar la solicitud');
    }
  },

  checkout: async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const userId = req.session.userId;

    try {
      const cartItems = await db.Cart.findAll({
        where: { userId },
        include: [{ model: db.Product }]
      });

      let total = 0;
      cartItems.forEach(item => {
        total += item.quantity * item.Product.price; // Calcula el total
      });

      // Aquí iría la lógica para procesar el pago
      // Por simplicidad, solo vaciaremos el carrito y redirigiremos

      await db.Cart.destroy({
        where: { userId }
      });

      // Redirigir a una página de éxito o similar
      res.render('cart/checkoutSuccess', { total }); // Asumiendo que tienes una vista para el éxito del checkout
    } catch (error) {
      console.error('Error durante el checkout:', error);
      res.status(500).send('Error al procesar la solicitud');
    }
  }
};

module.exports = shoppingCarController;
