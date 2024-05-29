const express = require("express") //We required the framework Express in order to use all its methods
const router = express.Router() //We executed the Router method, saving its properties in the const router, we don't want all the express object, just the package router, so we just use only that.

const mainController=require("../controllers/mainController") //We required the module that we have already export in the controller of the main items

router.get("/",mainController.index) //By the const router, all the requirements by the clients to this will be send to the controller and its properties
router.get("/socialMedia",mainController.socialMedia) //By the const router, all the requirements by the clients to this will be send to the controller and its properties
router.get("/contact",mainController.contact) //By the const router, all the requirements by the clients to this will be send to the controller and its properties
router.get("/personalcontact",mainController.personalContact) //By the const router, all the requirements by the clients to this will be send to the controller and its properties
router.get("/pruebas",mainController.pruebas) //By the const router, all the requirements by the clients to this will be send to the controller and its propertie

router.get("/map",mainController.map) //By the const router, all the requirements by the clients to this will be send to the controller and its properties

module.exports=router //We must export the variable router in order of being required in the entry point paths