require('dotenv').config() 

module.exports ={
    PORT: process.env.PORT,
    dbName: process.env.DB_NAME,
    dbUserName: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
}