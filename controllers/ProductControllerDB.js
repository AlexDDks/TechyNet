const {validationResult} = require("express-validator") //We just need the result of the validation, so we just destructuring to obtain it from the object of express validator
const db = require("../database/models"); //We require the module index.js from the folder models, which sumarize all the information of the tables in the DB

const controller = {

productsList: async (req, res) => { //This method send to the view products just the ones that match with the chosen by the user.

  try { //We use the try/catch approach to manage the asyncronous operation
      const categoryFilter = req.query.category;//Extracting the category from query parameters
      let queryOptions = {// This variable defines the options of the query
          include: [{ //The property include establish a relation which needs to be included in the query 
              model: db.Category,//Indactes the model to include in the query
              as: 'Category', //The model has the alias Category
          }]
      };
      if (categoryFilter) { // If a Category is provided, add a where clause to the query options
          queryOptions.include[0].where = { name: categoryFilter };//The queryOptions is modify in order of include the where statement in the first index of include.
      }
      const Products = await db.Product.findAll(queryOptions)//The constant Product is gonna be an object with all the requirements of the queryOptions, including the name of the category. Await the resolution of the findAll promise, effectively pausing execution until it's resolve. 

      res.render("products", { Products });// Render the products page with the retrieved products
  } catch (error) {// Catch handle any errors that occur during the try block
      console.error("Error searching the products: ", error);
      res.status(500).send("Internal Server Error"); //The server found an action that can't know how to manage it
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

      res.render("detail2", { product }); 
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
},

  createForm: (req, res) => { //This method only render the form of create product
  res.render("createForm")
},

createStore: async (req, res) => {
  try {
    const resultValidation = validationResult(req); // Validate incoming data

    if (resultValidation.errors.length > 0) { // Check for validation errors and return to form if any exist
      return res.render("createForm", { errors: resultValidation.mapped(), old: req.body });
    }
    else {
      const category = await db.Category.findOne({ where: { name: req.body.category } });// Find the category based on the name provided in the form by the asyncronous method
            if (!category) {// If the category is not found, handle the error
        // Error handling if category is not found (This can be adjusted based on your application's needs)
        console.error("Category not found");
        return res.status(400).send("Category not found.");
      }

      let productToCreate = {
        ...req.body, //Add everything in the form to the variable by spread operator
        imageUrl: req.file.filename, //The filename is defined in the route, as a middleware in order of not having any match among the names of the files. The data as files are not included in the req.body, so we use multer in order of using req.file.
        mif: req.body.mif === '' || isNaN(req.body.mif) ? null : req.body.mif, //If the data in mif are not void or is not a number, the result is gonna be null, so we just save a number value in this field and below as well
        discount: req.body.discount === '' || isNaN(req.body.discount) ? null : req.body.discount,
        categoryId: category.id, // Adding the categoryId
      };

      delete productToCreate.category; // Remove the category name as it's not needed for the Product, we just need the categoryId

      await db.Product.create(productToCreate);//Asyncronous function to Create the product
      
      // Redirect after successful product creation
      res.redirect("/products");
    }
  } catch (error) {
    // Catch and handle any errors that occur
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
        const categories = await db.Category.findAll(); //We found al the categories

        res.render("editFormProducts", { product, categories }); //Render the view and sending the variables which are gonna be needed for the that

    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send("There was a problem loading the edit form.");
    }   
},

editUpdate: async (req, res) => {
  try {
      const id = req.params.id; //We obtain the id from the route
      const product = await db.Product.findByPk(id);//This asyncronous method find the register

      if (!product) {
          console.log('Not found!');
          return res.status(404).send("Product not found."); // The rosource is not found
      }

      const resultValidation = validationResult(req);//Validation data
      if (resultValidation.errors.length > 0) { 
          return res.render("editFormProducts", { errors: resultValidation.mapped(), product, old: req.body }); //If there are any errors, those are sent with the old data 
      } else {
          let updateValues = {
              ...req.body,
              imageUrl: req.file ? req.file.filename : product.imageUrl, //We update only if the user added a new image
              mif: req.body.mif === '' || isNaN(req.body.mif) ? null : req.body.mif,
              discount: req.body.discount === '' || isNaN(req.body.discount) ? null : req.body.discount,
              categoryId: req.body.category //We add the category because in the form we establish the logic of relate the categoryId with the differents categories.
          };

          // Realizar la actualización con los valores preparados
          await product.update(updateValues);
          res.redirect("/products/detail/" + id); // Redireccionar a la página de detalles del producto después de la actualización exitosa
      }
  } catch (error) { // Capturar y manejar cualquier error que ocurra
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
  }
  
}

module.exports=controller