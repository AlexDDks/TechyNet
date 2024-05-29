const controller = {

   // All the views are rendered here, as well as if some mathematical/logical operations are required, here is where the magic is done 
   index: (req,res) => { //This one just render a view
        res.render("index")
   },

   socialMedia: (req,res) => {//This one just render a view
      res.render("socialMedia")
   },

   contact:(req,res) => {//This one just render a view
      res.render("contact")
   },

   personalContact:(req,res) => {//This one just render a view
      res.render("personalContact")
   },

   pruebas:(req,res) => {//This one just render a view
      res.render("pruebas")
   },

   map:(req,res) => {//This one just render a view
      res.render("map")
   }}

module.exports=controller