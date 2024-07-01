const express = require("express"); // We require from Node the "express" framework 
const app = express(); // We invoke the variable express and save the funcionality of it in the const app
const dotenv = require("dotenv"); // We require dotenv to load environment variables
const path = require("path"); // We require from Node the native module path

// Create an absolute path to the "public" folder
const publicPath = path.join(__dirname, "public"); 

// We require the module globalConstants which saves information to connect with the DB
const globalConstants = require("./const/globalConstants"); 

// We require the module that manages the database models
const db = require("./database/models");

// Load environment variables
dotenv.config();

const session = require("express-session"); // We require this module and save all its functionality in this constant

// Using session at app level (based on documentation)
app.use(session({
    secret: "Secret!!!",
    resave: false,
    saveUninitialized: true
}));

// Using the method static we tell to express where the direction of public folder is. It receives a root that in this case is inside the variable publicPath.
app.use(express.static(publicPath));

// We require this module and save all its functionality in this constant
const cookieParser = require('cookie-parser');

// This is a native module, that allows us to use cookies.
app.use(cookieParser()); 

// We require the middleware for remembering the user through cookies
const rememberMiddleware = require("./middlewares/rememberMiddleware");
app.use(rememberMiddleware); // The middleware of cookie is gonna be executed every time, in every req, res.

// We require the middleware for setting local user data
const localsUser = require("./middlewares/localsUser");
app.use(localsUser); // The middleware of user is gonna be executed every time, in every req, res.

// We are using the EJS view engine, so we tell it to Express in order to use it.
app.set('view engine', 'ejs');

// To capture the information from forms (post), that receives an object with property and value extended: false.
app.use(express.urlencoded({ extended: false }));

app.use(express.json()); // To parse incoming JSON requests

// We require and use the method-override module to support PUT and DELETE methods
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// We require the routers for different parts of our application
const mainRouter = require("./routes/mainRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const cartRouter = require("./routes/cartRouter");

// Paths for routers
app.use("/", mainRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);

// Commented out services router
// const servicesRouter = require("./routes/servicesRouter");
// app.use("/services", servicesRouter);

// Commented out 404 error handling
// app.use((req, res, next) => {
//     res.status(404).render('not-found');
// })

// Setting
const PORT = globalConstants.PORT; // We use the PORT from globalConstants

// Server and promise
db.sequelize.sync().then(() => { // This method synchronizes the models in Sequelize with the DB
    app.listen(PORT, () => { // With the listen method, we created a server in the port specified in globalConstants
        return console.log(`Server has been created in port ${PORT}`); // Log message indicating the server is running
    });
}).catch((error) => {
    console.error('Error during database synchronization or server startup', error); // Catch and log any errors during sync or startup
});

module.exports = app; // Export the app for use in Vercel
