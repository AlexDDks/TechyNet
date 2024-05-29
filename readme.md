# Full Stack E-commerce: TechyNet

## Description

This project is a full-stack web application built with Express.js. It uses EJS as a templating engine, native JavaScript, and CSS for front-end functionality and styling. The project follows the MVC (Model-View-Controller) pattern and includes database integration for performing all CRUD (Create, Read, Update, Delete) operations. Additionally, it utilizes APIs to enhance functionality and interaction.

## Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (or any other database of your choice)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up your database and configure the connection string in the project.

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## File Structure

- `controllers/mainController.js`: Controller logic for handling requests and responses.
- `models/itemModel.js`: Database schema and model.
- `public/css/style.css`: CSS styles file.
- `public/js/main.js`: JavaScript scripts file.
- `routes/index.js`: Application routes.
- `views/pages/index.ejs`: Main page template.
- `views/partials/header.ejs`: Common header for the pages.
- `app.js`: Main Express server file.
- `package.json`: Project configuration file.

## Creating the Project from Scratch

### Step 1: Create a Project Folder

```bash
mkdir my-express-project
cd my-express-project
