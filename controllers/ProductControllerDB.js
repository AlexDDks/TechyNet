const {validationResult} = require("express-validator") //We just need the result of the validation, so we just destructuring to obtain it from the object of express validator
const db = require("../database/models"); //We require the module index.js from the folder models, which sumarize all the information of the tables in the DB
const { Op } = require('sequelize'); // Importa Op para usar operadores

const controller = {

  productsList: async (req, res) => { 
    try { 
        const categoryFilter = req.query.category || 'All categories';
        let queryOptions = {
            include: [{ 
                model: db.Category,
                as: 'category', 
            }]
        };
        if (categoryFilter && categoryFilter !== 'All categories') {
            queryOptions.include[0].where = { name: categoryFilter };
        }
        const Products = await db.Product.findAll(queryOptions);
        res.render("products/productsList", { Products, query: null, category: categoryFilter });
    } catch (error) { 
        console.error("Error searching the products: ", error);
        res.status(500).send("Internal Server Error"); 
    }
},

detail: async (req, res) => {
  try {
    const id = req.params.id; //We obtain the product ID from the URL
    const product = await db.Product.findByPk(id); //The asyncronous method search a product with an specific id

    if (!product) {
      return res.status(404).send("Product not found"); //The server couldn't find the resource
    }
    
    else {

      if (product.discount) { //Discount is optional but price not
        const { discount, price } = product;
        const finalPrice = discount * price / 100;
        product.finalPrice = price - finalPrice;
      }
      else { //If discount is not provided
        const { price } = product;
        product.finalPrice = price;
      }

      res.render("products/productsDetail", { product });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
},

  createForm: (req, res) => { //This method only render the form of create product
  res.render("products/createProduct")
},

createStore: async (req, res) => {
  try {
    const errors = validationResult(req); // Obtener los errores de validación

    if (!errors.isEmpty()) { // Si hay errores de validación
      return res.render("products/createProduct", { errors: errors.mapped(), old: req.body });
    }

    const category = await db.Category.findOne({ where: { name: req.body.category } });

    if (!category) {
      console.error("Category not found");
      return res.status(400).send("Category not found.");
    }

    // Asignar valores predeterminados si no se proporcionan
    let productToCreate = {
      ...req.body,
      imageUrl: req.file.filename,
      monthsInterestFree: req.body.monthsInterestFree ? parseFloat(req.body.monthsInterestFree) : 0,
      rating: req.body.rating ? parseFloat(req.body.rating) : 0,
      reviewCount: req.body.reviewCount ? parseInt(req.body.reviewCount) : 0,
      discount: req.body.discount ? parseFloat(req.body.discount) : 0,
      categoryId: category.id,
    };

    delete productToCreate.category;

    await db.Product.create(productToCreate);

    res.redirect("/products");
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("There was a problem creating the product.");
  }
},


  shoppingCar: (req,res) => { //This method only render
        res.render("shoppingCar")
   },

   editForm: async (req, res) => {
    try {
        const id = req.params.id; //We obtain the id of the product by the route

        const product = await db.Product.findByPk(id); //This asyncronous method find the register
        if (!product) {
            return res.status(404).render('productNotFound', { id });
        }
        // const categories = await db.Category.findAll(); //We found al the categories

        res.render("products/editProduct", { product, }); //Pendiente categories //Render the view and sending the variables which are gonna be needed for the that

    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send("There was a problem loading the edit form.");
    }   
},

editUpdate: async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.Product.findByPk(id);

    if (!product) {
      console.log('Not found!');
      return res.status(404).send("Product not found.");
    }

    const resultValidation = validationResult(req);
    if (!resultValidation.isEmpty()) {
      return res.render("products/editProduct", { errors: resultValidation.mapped(), product, old: req.body });
    } else {
      const category = await db.Category.findOne({ where: { name: req.body.category } });
      if (!category) {
        console.error("Category not found");
        return res.status(400).send("Category not found.");
      }

      let updateValues = {
        ...req.body,
        imageUrl: req.file ? req.file.filename : product.imageUrl,
        monthsInterestFree: req.body.monthsInterestFree === '' ? null : req.body.monthsInterestFree,
        discount: req.body.discount === '' ? null : req.body.discount,
        categoryId: category.id,
        rating: req.body.rating === '' ? null : req.body.rating,
        reviewCount: req.body.reviewCount === '' ? null : req.body.reviewCount
      };

      await product.update(updateValues);
      res.redirect("/products/detail/" + id);
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("There was a problem updating the product.");
  }
},



delete: async (req, res) => {
    try {
      // This method deletes a product using its ID
      await db.Product.destroy({
        where: {
          id: req.params.id
        }
      });
        // Redirect to the products page to verify that the item was deleted
      res.redirect("/products");
    } catch (error) {
      // Handle any errors that occur during the deletion
      console.error("Error deleting product:", error);
      // Redirect or render an error page with a message, depending on your app's flow
      res.status(500).send("There was a problem deleting the product.");
    }
  },
    search: async (req, res) => {
      try {
          const query = req.query.q;
          const products = await db.Product.findAll({
              where: {
                  [Op.or]: [
                      { name: { [Op.like]: `%${query}%` } },
                      { description: { [Op.like]: `%${query}%` } },
                      { '$category.name$': { [Op.like]: `%${query}%` } }
                  ]
              },
              include: [{
                  model: db.Category,
                  as: 'category'
              }]
          });
          res.render('products/productsList', { Products: products, query: query, category: 'Personalized Categories' });
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
      }
  },
  
}

module.exports=controller