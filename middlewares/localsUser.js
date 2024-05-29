function userMiddleware (req, res, next) {
    if (req.session.user)  { //If the req.session.user exists, the conditional is executed:
       res.locals.user=req.session.user //We save the information of the variable session into the locals variable, in order of use this information in the views, like to render an image, an so on.
    }
    next()
}

module.exports = userMiddleware