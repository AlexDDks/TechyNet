const db = require("../database/models");


const controller = {

   // All the views are rendered here, as well as if some mathematical/logical operations are required, here is where the magic is done 
   index: (req,res) => { //This one just render a view
        res.render("main/index")
   },

   contact: (req, res) => {
      res.locals.success = req.query.success === 'true';
      res.render("main/contact");
    },
  
    contactProcessing: async (req, res) => {
      try {
        const { name, email, phone, comments } = req.body;
  
        if (!name || !email || !phone || !comments) {
          return res.status(400).send('All fields are required.');
        }
  
        await db.Contact.create({
          name,
          email,
          phone,
          comments,
          createdAt: new Date(),
          updatedAt: new Date()
        });
  
        res.redirect('/contact?success=true');
      } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).send('Internal Server Error');
      }
    }
}

module.exports=controller

