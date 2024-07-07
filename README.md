# Full Stack E-commerce: TechyNet

## Description

This project is a full-stack web application built with Express.js. It uses EJS as a templating engine, native JavaScript, and CSS for front-end functionality and styling. The project follows the MVC (Model-View-Controller) pattern and includes database integration for performing all CRUD (Create, Read, Update, Delete) operations. Additionally, it utilizes APIs to enhance functionality and interaction.

## Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/AlexDDks/TechyNet.git
    cd TechyNet
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```


3. **Initialize a New Node.js Project**

    ```bash
    npm init -y
    ```

## Usage

1. **Set up your database:**

    - **Create a new MySQL database:**
        ```sql
        CREATE DATABASE techynet;
        ```

2    - **Update the database configuration in the project, rename your .env variables and set your database credentials:**
        ```
        DB_HOST=localhost
        DB_USER=root
        DB_PASS=yourpassword
        DB_NAME=techynet
        ```

3. **Run database migrations to create tables:**
    ```bash
    npx sequelize-cli db:migrate
    ```

4. **Seed the database with initial data:**
    ```bash
    npx sequelize-cli db:seed:all
    ```
    If you have some trubles with the seeders, the order of the seed should be:
    ...-demo-categories.js
    ...-demo-products.js
    ...-demo-user.js


5.    - **Configure the database connection in `config/config.json`:**

        Update the `config/config.json` file with your database details:

        ```json
        {
          "development": {
            "username": "root",
            "password": "yourpassword",
            "database": "techynet",
            "host": "127.0.0.1",
            "dialect": "mysql"
          },
          "test": {
            "username": "root",
            "password": null,
            "database": "database_test",
            "host": "127.0.0.1",
            "dialect": "mysql"
          },
          "production": {
            "username": "root",
            "password": null,
            "database": "database_production",
            "host": "127.0.0.1",
            "dialect": "mysql"
          }
        }
        ```

6. **Open your browser and navigate to `http://localhost:3000`.**

## File Structure

- `controllers/`: Controller business logic
- `models/`: Database schema and model
- `public/styles/`: CSS styles folder
- `public/js/`: JavaScript scripts files
- `routes/`: Application routes
- `views/`: All pages and templates
- `views/partials/`: Common templates for the pages
- `app.js`: Main Express server file
- `package.json`: Project configuration file


