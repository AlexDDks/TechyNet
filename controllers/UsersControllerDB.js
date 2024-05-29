const {validationResult} = require("express-validator");//We just need the result of the validation, so we just do destructuring to obtain it from the object of express validator
const path = require("path")
const fs = require ("fs")
const bcrypt = require('bcrypt'); //We require the module bcrypt to use a method of hash the password of the user
let db = require("../database/models");

const controller = {
   login: (req,res) => {
     if (req.session.user) {//If the log in view is visited, but the req.session.user exists is because the user is already logged and the req.session.user variable has not been deleted
          let loggedUser =req.session.user//The information in the global variable now has been save in this new variable in order of obtain information to parameterize the path to be redirected
          let emailName = loggedUser.email.split('@')//The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
          res.redirect("/users/profile/"+ emailName[0]) //As the user is logged, we sent him/her to its profile with his/hers information
     }
     else{
        res.render("login") //If the user is not logged, the view login is rendered
     }
     },

     processLogin: async (req, res) => {
        const resultValidation = validationResult(req);
        if (!resultValidation.isEmpty()) {
            // Hay errores en las validaciones del formulario
            return res.render("login", {errors: resultValidation.mapped()});
        }
    
        try {
            const user = await db.User.findOne({ where: {email: req.body.email} });
    
            if (!user) {
                // El usuario no existe
                return res.render("login", {errors: {validationUser: {msg: "The user doesn't exist"}}});
            }
    
            // El usuario existe, verificar contraseña
            if (bcrypt.compareSync(req.body.password, user.password)) {
                // La contraseña es correcta
                req.session.user = user;
                let emailName = user.email.split('@');
                if (req.body.remember) {
                    res.cookie("remember", user.email, {maxAge: 600000});
                }
                return res.redirect("/users/profile/" + user.name);
            } else {
                // La contraseña no es correcta
                return res.render("login", {errors: {validationPassword: {msg: "Wrong password"}}, old: req.body});
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },
    

register: (req,res) => {//This method only render
     res.render("register")
},

processRegister: async (req, res) => {
     const resultValidation = validationResult(req);
     if (!resultValidation.isEmpty()) {
         return res.render("register", { 
             errors: resultValidation.mapped(), 
             old: req.body 
         });
     }
     try {
         // Verificar si el usuario ya existe
         const userExist = await db.User.findOne({ where: { email: req.body.email } });
         if (userExist) {
             return res.render("register", { 
                 errors: { validationUserExist: { msg: "The user already exists" } }
             });
         }
         // Verificar si las contraseñas coinciden
         if (req.body.password !== req.body.passwordRep) {
             return res.render("register", { 
                 errors: { validationPassword: { msg: "The passwords do not match" } }, 
                 old: req.body 
             });
         }
         // Crear el usuario en la base de datos
         const newUser = await db.User.create({
             name: req.body.name,
             email: req.body.email,
             password: bcrypt.hashSync(req.body.password, 10), // Encriptar contraseña
             isAdmin: false, // Los usuarios registrados por este método no son administradores
             imageUrl: req.file.filename
          });
          let loggedUser= newUser //Here, the user recently created is saved in a variable that is added to the req.session.user global variable
          req.session.user=loggedUser
          let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
          res.redirect("/users/profile/"+ emailName[0])
     } catch (error) {
         console.error(error);
         res.status(500).send("Internal Server Error");
     }
 },

restore: (req,res) => { //This method just render a view
     res.render("restorePassword")
},

profile: (req,res) => {
     if (req.session.user) { //If the user is already logged, we sent him/her to his/hers profile with all the information
          res.render("profile",{user:req.session.user}) //We send all the information of the user, to the view
     }
     else{
          res.render("login") //If the user is not logged, we sent the view login
     }
},

edit: async (req, res) => {//This method only render the view detail and sends a form with the   information of one product
     const id = req.params.id//We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %>">
     const user = await db.User.findByPk(id)//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
     res.render("editUserView", { user })//We render the view and send all necesary information by the const product
},
 
update: async (req, res) => {
    const id = req.params.id;
    let user = await db.User.findByPk(id);
  
    if (!user) {
      return res.status(404).send("User not found");
    }
  
    const resultValidation = validationResult(req);
    if (!resultValidation.isEmpty()) {
      return res.render("editUserView", {
        errors: resultValidation.mapped(),
        user,
        oldData: req.body
      });
    }
  
    let updateData = {};
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }
    if (req.file) {
      updateData.imageUrl = req.file.filename;
    }
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await db.User.findOne({ where: { email: req.body.email, id: { [Op.ne]: id } } });
      if (emailExists) {
        return res.render("editUserView", {
          errors: { email: { msg: "The email is already in use." } },
          user,
          oldData: req.body
        });
      }
      updateData.email = req.body.email;
    }
    if (req.body.name) {
      updateData.name = req.body.name;
    }
  
    try {
      await user.update(updateData);
      req.session.user = { ...req.session.user, ...updateData, password: undefined };
      res.redirect("/users/profile/" + user.name);
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  

  
 delete: async (req, res) => {
     // Asumiendo que el ID del usuario está almacenado en la sesión bajo req.session.user.id
     const userId = req.session.user.id;
     try {
         await db.User.destroy({
             where: {
                 id: userId
             }
         });
         // Cerrar la sesión del usuario después de eliminarlo
         req.session.destroy(function(err) {
             if(err) {
                 console.error("Error al cerrar la sesión del usuario:", err);
                 return res.status(500).send("Internal Server Error");
             }
              // Redirige a la página principal (o a cualquier otra página que consideres adecuada después de la eliminación de la cuenta)
             res.redirect("/");
         });
     } catch (error) {
         console.error("Error al eliminar el usuario:", error);
         res.status(500).send("Internal Server Error");
     }
 },

   logout: (req, res) => { //With this method we delete the cookie and the req.session variable. So any information about the user is deleted at the moment of executing this code.
     res.clearCookie("remember") //We delete the cookie
     req.session.destroy()//We delete the sessions variables
     res.redirect("/")//We redirect to the index
}

}

module.exports=controller