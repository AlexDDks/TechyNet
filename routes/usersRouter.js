const express = require("express") //We required the framework Express in order to use all its methods
const router = express.Router()  //We executed the Router method, saving its properties in the const router, we don't want all the express object, just the package router, so we just use only that.
const multer = require('multer'); //We use multer library in order of being able to upload files
const { body } = require('express-validator');//We just use the body function, not all the library, so with destructuring assigment we are able to instance the function body in the constant body.
const path = require('path');// We require from Node the native module path to use it to place the image that is gonna be uploaded in the forms.

const usersController=require("../controllers/UsersControllerDB") //We required the module that we have already export in the main controller

/*Multer
//All this code is based in the documentation: multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.*/
const storage = multer.diskStorage({ 
  destination: function (req, file, cb) {
  cb(null, path.join(__dirname, '../public/img/users')) //We establish where the file is gonna be saved
},
filename: function (req, file, cb) {
  //The file object has many properties such as originalname, mimetye, fieldname, and so on that we can use.
  const ext = file.mimetype.split('/') //From the mimetype, we extract de extension. The split function "split" an string taking account a breakpoint, in this case the slash and creates an array with two items, the first one [0], with the left side of the split, and the rigth side [1] with the other one (in this case in the position 1, there is the extension), We also could use the path.extname(file.originalname) to obtain the extension
  cb(null, file.fieldname + '-' + Date.now()+"."+ext[1]) // Here we create the new name of the file with the object date and extension (in order of not creater duplicated names)
}
})

const upload = multer({ storage }) //Here we save all properties of storage in the const upload

/*Validations
We use Express validator in order of validate (you will forgive the repetition) all the inputs in the forms. The sintax is based on documentation. The most of the validation are centered avoiding the null values in the blanks (not empty), so in the object resultsValidation of express validator it's gonna appear all the results of the fields that have some mistakes, that information is gonna be used in the controller and views. The atribute bail allow us to include more that one validation.*/
const validationLogin =[
    body("email").notEmpty().withMessage("You must fill the blank").bail().isEmail().withMessage("It needs to be email"),
    body("password").notEmpty().withMessage("You must write your password")
]//The validations must live in an array (one element for each name of the form that we want to validate)

const validationRegister = [
  body("name").notEmpty().withMessage("You must write a name"),
  body("email").notEmpty().withMessage("You must write an email").bail().isEmail().withMessage("It needs to be an email"),
  body("password").notEmpty().withMessage("You must write a password").bail().isLength({ min: 8 }).withMessage("Must be at least 8 characters"), // Ajuste aquí para permitir más de 8 si lo deseas
  body("passwordRep").notEmpty().withMessage("You must repeat the password").bail().custom((value, { req }) => {
      if (value !== req.body.password) {
          throw new Error("Password confirmation does not match password");
      }
      return true;
  }),
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
  })
];

const validateEditForm = [
  body("name").optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage("You must write a name"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("It needs to be an email"),
  body("password").optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage("Must be at least 8 characters"),
  body("passwordRep").optional({ checkFalsy: true }).custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  body("imageUrl").optional().custom((value, { req }) => {
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const acceptedExtensions = ['.jpg', '.png', '.gif', '.jpeg'];
      if (!acceptedExtensions.includes(fileExtension)) {
        throw new Error("The image extensions accepted are: .jpg, .png, .jpeg, and .gif");
      }
    }
    return true;
  })
];

// Validaciones para la solicitud de restablecimiento de contraseña
const validationResetRequest = [
  body('email').notEmpty().withMessage('You must fill the blank').bail().isEmail().withMessage('It needs to be an email')
];

// Validaciones para restablecer la contraseña
const validationResetPassword = [
  body('password').notEmpty().withMessage('You must write a password').bail().isLength({ min: 8 }).withMessage('Must be at least 8 characters'),
  body('passwordRep').notEmpty().withMessage('You must confirm your password').bail().custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  })
];


// CRUD
//GET
router.get("/login2",usersController.login2)

router.get("/login",usersController.login)
router.get("/signup",usersController.register) 
router.get("/profile/:id?",usersController.profile) //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/profile/<%= user.id %>">
router.get("/edit/:id", usersController.edit)//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/useredit/<%= user.id %>">
router.get("/logout", usersController.logout)


//POST
router.post("/login", validationLogin, usersController.processLogin) 
router.post("/register", upload.single("imageUrl"), validationRegister, usersController.processRegister) //This route sends us to the controller that made all the magi to upload an image and save it in the DB. upload.single('image'), means that only one image (which was uploaded in the fild name="image") is gonna be uploaded

//EDIT
router.put('/edit/:id', upload.single("imageUrl"), validateEditForm ,usersController.update);//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/edit/<%= user.id %>">

//DELETE
router.delete('/delete/:id', usersController.delete);//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/delete/<%= user.id %>">

// Rutas para restablecimiento de contraseña
router.get('/resetPasswordRequest', usersController.renderRequestResetPassword);
router.post('/resetPasswordRequest', validationResetRequest, usersController.requestResetPassword);

router.get('/resetPassword/:token', usersController.renderResetPassword);
router.post('/resetPassword/:token', validationResetPassword, usersController.resetPassword);


module.exports=router //We must export the variable router in order of being required in the entry point paths