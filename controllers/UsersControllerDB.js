const {validationResult} = require("express-validator");//We just need the result of the validation, so we just do destructuring to obtain it from the object of express validator
const path = require("path")
const fs = require ("fs")
const crypto = require('crypto');
const bcrypt = require('bcrypt'); //We require the module bcrypt to use a method of hash the password of the user
const db = require("../database/models");
const nodemailer = require('nodemailer');
require('dotenv').config(); // Cargar las variables de entorno

const controller = {

  login2:(req,res)=> {
    res.send("este es login 2");
  },

   login: (req,res) => {
     if (req.session.user) {//If the log in view is visited, but the req.session.user exists is because the user is already logged and the req.session.user variable has not been deleted
      console.log(req.session.user);    
      let loggedUser =req.session.user//The information in the global variable now has been save in this new variable in order of obtain information to parameterize the path to be redirected
          let emailName = loggedUser.email.split('@')//The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
          res.redirect("/users/profile/"+ emailName[0]) //As the user is logged, we sent him/her to its profile with his/hers information
     }
     else{
        res.render("users/login") //If the user is not logged, the view login is rendered
     }
     },

     processLogin: async (req, res) => {
        const resultValidation = validationResult(req);
        if (!resultValidation.isEmpty()) {
            // Hay errores en las validaciones del formulario
            return res.render("users/login", {errors: resultValidation.mapped()});
        }
    
        try {
            const user = await db.User.findOne({ where: {email: req.body.email} });
    
            if (!user) {
                // El usuario no existe
                return res.render("users/login", {errors: {validationUser: {msg: "The user doesn't exist"}}});
            }
    
            // El usuario existe, verificar contraseña
            if (bcrypt.compareSync(req.body.password, user.password)) {
                // La contraseña es correcta
                req.session.user = user;
                let emailName = user.email.split('@');
                if (req.body.remember) {
                    res.cookie("remember", user.email, {maxAge: 600000});
                }
                return res.redirect("/");
            } else {
                // La contraseña no es correcta
                return res.render("users/login", {errors: {validationPassword: {msg: "Wrong password"}}, old: req.body});
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    register: (req, res) =>{
      res.render("users/register")
    },
    
    // Método para renderizar la vista de solicitud de restablecimiento de contraseña
    renderRequestResetPassword: (req, res) => {
      res.render('users/requestResetPassword');
    },
  
    requestResetPassword: async (req, res) => {
      const resultValidation = validationResult(req);
      if (!resultValidation.isEmpty()) {
        res.locals.errors = resultValidation.mapped();
        return res.render('users/requestResetPassword');
      }
  
      const { email } = req.body;
      try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
          res.locals.errors = { email: { msg: "Email not found" } };
          return res.render('users/requestResetPassword');
        }
  
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();
  
        const resetLink = `http://${req.headers.host}/users/resetPassword/${token}`;
        console.log(`Password reset link: ${resetLink}`);
  
// Enviar email solo si el email es magarciaa92@gmail.com
if (email === 'magarciaa92@gmail.com') {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // o cualquier otro servicio de correo
    auth: {
      user: process.env.EMAIL_USER, // Usar variable de entorno
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${resetLink}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error sending email: ${error}`);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}  
        return res.render('users/resetPasswordConfirmation');
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }
    },
  
    renderResetPassword: (req, res) => {
      res.render('users/resetPassword', { token: req.params.token });
    },
  
    resetPassword: async (req, res) => {
      const resultValidation = validationResult(req);
      if (!resultValidation.isEmpty()) {
        res.locals.errors = resultValidation.mapped();
        return res.render('users/resetPassword', { token: req.params.token });
      }
  
      const { token } = req.params;
      const { password, passwordRep } = req.body;
  
      if (password !== passwordRep) {
        res.locals.errors = { passwordRep: { msg: "Passwords do not match" } };
        return res.render('users/resetPassword', { token });
      }
  
      try {
        const user = await db.User.findOne({
          where: {
            resetPasswordToken: token,
            resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() }
          }
        });
  
        if (!user) {
          res.locals.errors = { token: { msg: "Password reset token is invalid or has expired." } };
          return res.render('users/resetPassword', { token });
        }
  
        user.password = bcrypt.hashSync(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
  
        return res.render('users/resetPasswordSuccess');
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }
    },
  
  

processRegister: async (req, res) => {
     const resultValidation = validationResult(req);
     if (!resultValidation.isEmpty()) {
         return res.render("users/register", { 
             errors: resultValidation.mapped(), 
             old: req.body 
         });
     }
     try {
         // Verificar si el usuario ya existe
         const userExist = await db.User.findOne({ where: { email: req.body.email } });
         if (userExist) {
             return res.render("users/register", { 
                 errors: { validationUserExist: { msg: "The user already exists" } }
             });
         }
         // Verificar si las contraseñas coinciden
         if (req.body.password !== req.body.passwordRep) {
             return res.render("users/register", { 
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
          res.redirect("/");
     } catch (error) {
         console.error(error);
         res.status(500).send("Internal Server Error");
     }
 },

restore: (req,res) => { //This method just render a view
     res.render("requestResetPassword")
},

profile: async (req, res) => {
  if (req.session.user) {
    try {
      const user = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Cart,
            as: 'cart',
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
          },
          {
            model: db.Order,
            as: 'orders',
            include: [
              {
                model: db.OrderItem,
                as: 'items',
                include: [
                  {
                    model: db.Product,
                    as: 'product'
                  }
                ]
              }
            ]
          }
        ]
      });

      const cartItems = user.cart ? user.cart.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        productId: item.product.id,
        imageUrl:item.product.imageUrl,
      })) : [];

      const purchaseHistory = user.orders ? user.orders.map(order => ({
        orderId: order.id,
        date: order.date.toDateString(),
        total: order.total,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      })) : [];

      res.render("users/profile", {
        user: req.session.user,
        cart: cartItems,
        purchaseHistory
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect("/users/login");
  }
},


edit: async (req, res) => {//This method only render the view detail and sends a form with the   information of one product
     const id = req.params.id//We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %>">
     const user = await db.User.findByPk(id)//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
     res.render("users/editUser", { user })//We render the view and send all necesary information by the const product
},
 
update: async (req, res) => {
  const id = req.params.id;
  let user = await db.User.findByPk(id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  const resultValidation = validationResult(req);
  if (!resultValidation.isEmpty()) {
    return res.render("users/editUser", {
      errors: resultValidation.mapped(),
      user,
      old: req.body
    });
  }

  let updateData = {};
  if (req.body.password) {
    updateData.password = bcrypt.hashSync(req.body.password, 10);
  }
  if (req.file) {
    updateData.imageUrl = req.file.filename;
  } else {
    updateData.imageUrl = user.imageUrl; // Mantener la imagen original si no se sube una nueva
  }
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await db.User.findOne({ where: { email: req.body.email, id: { [Op.ne]: id } } });
    if (emailExists) {
      return res.render("users/editUser", {
        errors: { email: { msg: "The email is already in use." } },
        user,
        old: req.body
      });
    }
    updateData.email = req.body.email;
  } else {
    updateData.email = user.email; // Mantener el email original si no se cambia
  }
  if (req.body.name) {
    updateData.name = req.body.name;
  } else {
    updateData.name = user.name; // Mantener el nombre original si no se cambia
  }

  try {
    await user.update(updateData);
    req.session.user = { ...req.session.user, ...updateData, password: undefined };
    res.redirect("/users/profile/" + user.id);
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

module.exports=controller;