const express = require("express") //We required the framework Express in order to use all its methods.
const router = express.Router() //We executed the Router method, saving its properties in the const router, we don't want all the express object, just the package router, so we just use only that.
const path = require('path'); // We require from Node the native module path to use it to place the image that is gonna be uploaded in the forms.
const multer = require('multer'); //We required module multer in order to use it for uplading files (specially images in this case).
const {body} = require('express-validator'); //We just use the body function, not all the library, so with destructuring assigment we are able to instance the function body in the constant body.

// Requires
const productControllerDB=require("../controllers/ProductControllerDB") //We required the module that we have already export in the controller of products.

/*Multer
//All this code is based in the documentation: multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.*/
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/products/selectProducts')) //We establish where the file is gonna be saved
  },
  filename: function (req, file, cb) {
    //The file object has many properties such as originalname, mimetye, fieldname, and so on that we can use.
    const ext = file.mimetype.split('/') //From the mimetype, we extract de extension. The split function "split" an string taking account a breakpoint, in this case the slash and creates an array with two items, the first one [0], with the left side of the split, and the rigth side [1] with the other one (in this case in the position 1, there is the extension), We also could use the path.extname(file.originalname) to obtain the extension
    cb(null, file.fieldname + '-' + Date.now()+"."+ext[1]) // Here we create the new name of the file with the object date and extension (in order of not creater duplicated names)
  }
})

const upload = multer({ storage }) //Here we save all properties of storage in the const upload

/*Validations
We use Express validator in order of validate (you will forgive the repetition) all the inputs in the forms, in this case the edit and create ones. The sintax is based on documentation. The most of the validation are centered avoiding the null values in the blanks (not empty), so in the object resultsValidation of express validator it's gonna appear all the results of the fields that have some mistakes, that information is gonna be used in the controller and views. The atribute bail allow us to include more that one validation.*/
const validateEditForm = [
  body("name").notEmpty().withMessage("You must fill the name"),
  body("price").notEmpty().withMessage("You must fill the price").bail()
    .isNumeric().withMessage("Price needs to be a number"),
  body("description").notEmpty().withMessage("You must fill the description"),
  body("stock").notEmpty().withMessage("You must fill the stock").bail()
    .isNumeric().withMessage("Stock needs to be a number"),
  body("imageFile").custom((value, { req }) => {
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const acceptedExtensions = ['.jpg', '.png', '.gif', '.jpeg'];
      if (!acceptedExtensions.includes(fileExtension)) {
        throw new Error("The image extensions accepted are: .jpg, .png, .jpeg, and .gif");
      }
    }
    return true; // Allow empty to keep existing image
  }),
  body("monthsInterestFree").optional({ checkFalsy: true }).isNumeric().withMessage("Months Interest Free needs to be a number if provided"),
  body("discount").optional({ checkFalsy: true }).isDecimal().withMessage("Discount needs to be a valid decimal if provided"),
  body("category").notEmpty().withMessage("You must select a category"),
  body("rating").optional({ checkFalsy: true }).isDecimal().withMessage("Rating needs to be a valid decimal if provided"),
  body("reviewCount").optional({ checkFalsy: true }).isNumeric().withMessage("Review Count needs to be a number if provided")
];


const validateCreateForm = [
  body("name").notEmpty().withMessage("You must fill the name"),
  body("price").notEmpty().withMessage("You must fill the price").bail()
      .isNumeric().withMessage("Price needs to be a number"),
  body("description").notEmpty().withMessage("You must fill the description"),
  body("stock").notEmpty().withMessage("You must fill the stock").bail()
      .isNumeric().withMessage("Stock needs to be a number"),
  body("imageUrl").custom((value, { req }) => {
      if (!req.file) {
          throw new Error("You must upload an image");
      }
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const acceptedExtensions = ['.jpg', '.png', '.gif', '.jpeg'];
      if (!acceptedExtensions.includes(fileExtension)) {
          throw new Error("The image extensions accepted are: .jpg, .png, .jpeg, and .gif");
      }
      return true;
  }),
  body("monthsInterestFree").optional({ checkFalsy: true }).isNumeric().withMessage("Months Interest Free needs to be a number if provided"),
  body("rating").optional({ checkFalsy: true }).isDecimal().withMessage("Rating needs to be a valid decimal if provided"),
  body("reviewCount").optional({ checkFalsy: true }).isNumeric().withMessage("Review Count needs to be a number if provided"),
  body("category").notEmpty().withMessage("You must select a category"),
];

module.exports = validateCreateForm;



// CRUD
// Get
router.get("/",productControllerDB.productsList) 
router.get("/create",productControllerDB.createForm) 
router.get("/shoppingcar",productControllerDB.shoppingCar)
router.get("/detail/:id",productControllerDB.detail) //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/products/detail/<%= product.id %>">
router.get("/edit/:id",productControllerDB.editForm) //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/products/detail/<%= product.id %>">
router.get('/search', productControllerDB.search);

// Post
router.post('/create', upload.single('imageUrl'), validateCreateForm, productControllerDB.createStore); //This route sends us to the controller that made all the magi to upload an image and save it in the DB. upload.single('image'), means that only one image (which was uploaded in the fild name="image") is gonna be uploaded

// Put
router.put('/edit/:id', upload.single('imageUrl'), validateEditForm, productControllerDB.editUpdate); //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/products/edit/<%= product.id %>">

// Delete
router.delete('/delete/:id', productControllerDB.delete); //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/products/delete/<%= product.id %>">

module.exports=router //We must export the variable router in order of being required in the entry point paths