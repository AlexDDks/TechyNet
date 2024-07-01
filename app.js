const express = require("express"); // Requerimos el framework "express" de Node 
const app = express(); // Invocamos express y guardamos su funcionalidad en la constante app
const dotenv = require("dotenv"); // Requerimos dotenv para manejar variables de entorno
dotenv.config(); // Configuramos dotenv para cargar las variables de entorno

const path = require("path"); // Requerimos el módulo nativo path
const publicPath = path.join(__dirname, "public"); // Creamos una ruta absoluta hacia la carpeta public

const globalConstants = require("./const/globalConstants"); // Requerimos el módulo globalConstants que guarda información para conectar con la DB
const db = require("./database/models"); // Requerimos los modelos de la base de datos

const session = require("express-session"); // Requerimos express-session y guardamos su funcionalidad
app.use(session({
    secret: "Secret!!!",
    resave: false,
    saveUninitialized: true
})); // Configuramos la sesión en el nivel de la aplicación

// Configuración de la carpeta public
app.use(express.static(publicPath)); // Indicamos a express la dirección de la carpeta public

// Cookies
const cookieParser = require('cookie-parser'); // Requerimos cookie-parser
app.use(cookieParser()); // Habilitamos el uso de cookies

const rememberMiddleware = require("./middlewares/rememberMiddleware");
app.use(rememberMiddleware); // Ejecutamos el middleware de cookies en cada req, res

const localsUser = require("./middlewares/localsUser");
app.use(localsUser); // Ejecutamos el middleware de usuario en cada req, res

// Motor de vistas
app.set('view engine', 'ejs'); // Configuramos el motor de vistas EJS

// Configuración para capturar información de formularios (POST)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración para métodos PUT y DELETE
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Rutas
const mainRouter = require("./routes/mainRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const cartRouter = require("./routes/cartRouter");

// Configuración de rutas en la aplicación
app.use("/", mainRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);

// // Configuración de error 404
// app.use((req, res, next) => {
//     res.status(404).render('not-found');
// });

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
db.sequelize.sync().then(() => { // Sincronizamos los modelos en Sequelize con la DB
    app.listen(PORT, () => { // Creamos un servidor en el puerto especificado
        return console.log(`Server has been created in port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error during database synchronization or server startup', error);
});

module.exports = app;
