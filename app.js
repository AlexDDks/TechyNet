require('dotenv').config();
const express = require("express"); // We require from Node the "express" framework 
const app = express(); // We invoke the variable express and save the funcionality of it in the const app

const path = require("path"); // We require from Node the native module path
const publicPath = path.join(__dirname, "public"); // We save the funcionality of the method resolve in publicPath in order to have a public folder. We just have created an absolute path which will be used for the method static of express. It recieves the parameters of the route. We could just put in the arguments that the folder is PUBLIC, but in another PC, the absolute route could be different, for that reason we use the string DIRNAME, so we can reach the public folder in an absolute enviroment. __dirname is a variable that give to us the name of the folder where we are, so with __dirname, "public", we create a path that ends in the folder "public".
const globalConstants = require("./const/globalConstants") //We require the module globalConstants which saves information to conect with the DB
const db = require("./database/models") //We require the module globalConstants which saves information to conect with the DB

const session = require("express-session")//We require this module and save all its functionallity in this constant. The sessions variables are globals and I am using those in the views, where I need to share information of a logged user, for example.
app.use(session({secret: "Secret!!!"})) //Using of session at app level (based on documentation)

//Public folder
app.use(express.static(publicPath)) // Using the method static we tell to express where the direction of public folder is. It recieves a root that in this case is insede the variable publicPath.

// Cookies
const cookieParser = require('cookie-parser')//We require this module and save all its functionallity in this constant
app.use(cookieParser()); // This is a native module, that allows us to use cookies.

const rememberMiddleware = require("./middlewares/rememberMiddleware")
app.use(rememberMiddleware) //The middleware of cookie is gonna be executed every time, in every req,res.

//User
const localsUser = require("./middlewares/localsUser")
app.use(localsUser)//The middleware of user is gonna be executed every time, in every req,res.

// View engine
app.set('view engine', 'ejs'); // We are using the EJS view engine, so we tell it to Express in order to use it.

// POST obligated lines
app.use(express.urlencoded({ extended: false })) //To capture the information from forms (post), that receives an object with propertie and value extended: false.
app.use(express.json())

//PUT-DELETE obligated lines
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// Routes
const mainRouter = require("./routes/mainRouter")
const usersRouter = require("./routes/usersRouter")
const productsRouter = require("./routes/productsRouter")
const cartRouter = require("./routes/cartRouter");

// const servicesRouter = require("./routes/servicesRouter")

// Paths for router
app.use("/", mainRouter)
app.use("/users", usersRouter)
app.use("/products", productsRouter)
app.use("/cart", cartRouter);

// app.use("/services", servicesRouter)

// // 404 error set
// app.use((req, res, next) => {
//     res.status(404).render('not-found')
// })

//Setting
const PORT =  globalConstants.PORT;

// Server and promise
db.sequelize.sync().then(() => {//This method sincronize the models in Sequelize with the DB
    app.listen(PORT, () => { // Whit the listen method, we created a server in the port 3000. In order to figured out if the server is working, we can add a message in console that is gonna be shown only if rhe server is running
        return console.log(`Server has been created in port ${PORT}`)
    })
}).catch((error) => {
    console.error('Error during database synchronization or server startup', error);
});

  
module.exports = app;
