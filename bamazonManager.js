const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');
const chalk = require('chalk');

const divider = "__________________________________________________________\n"

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log(divider);
  console.log(chalk.green("Welcome to the Bamazon Inventory Manager."));
  mainMenu();
});

function mainMenu() {
  console.log(divider);
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View inventory.",
        "View low inventory.",
        "Update inventory.",
        "Add a new product.",
        "Quit."
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View inventory.":
        queryAllProducts();
        break;

      case "View low inventory.":
        viewLowInventory();
        break;

      case "Update inventory.":
        updateInventory();
        break;

      case "Add a new product.":
        addProduct();
        break;

      case "Quit.":
        exitApp();
        break;
      }
    })
};

// Returns info on all current products.
function queryAllProducts() {
  console.log(divider);
  console.log(chalk.green("Items In Stock:\n"));
  connection.query("SELECT * FROM products", function(err, res) {
     
    // Instantiate table
      var table = new Table({
        head: [chalk.green('ID'), chalk.green('Product'), chalk.green('Department'), chalk.green('Price'), chalk.green('Stock')]
      , colWidths: [4, 28, 15, 10, 7]
    });
  
      for (var i = 0; i < res.length; i++) {
        
      table.push( [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price+".00", res[i].stock_quantity]
      );
      }
      console.log(table.toString());
    mainMenu();
  });
};

// * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.
function viewLowInventory() {
  var query = "SELECT * FROM products WHERE stock_quantity < 5;";
  connection.query(query, function(err, res) {

    console.log(divider);
    console.log(chalk.red("Low Stock:\n"));

     // Instantiate table
     var table = new Table({
      head: [chalk.red('ID'), chalk.red('Product'), chalk.red('Department'), chalk.red('Price'), chalk.red('Stock')]
    , colWidths: [4, 28, 15, 10, 7]
    });

    for (var i = 0; i < res.length; i++) {
      
    table.push( [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price+".00", res[i].stock_quantity]
    );
    }
    console.log(table.toString());
    
    mainMenu();
  });
};

//* If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
function updateInventory() {
  console.log(chalk.magenta("\nUpdating inventory...\n"));
  inquirer
  .prompt([
    {
      name: "productID",
      type: "input",
      message: "Select product by ID.",
    },
    {   
      name: "quantity",
      type: "input",
      message: "How many are on hand?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
        }
    }
  ])
  .then(function(answers) {
  
   var id =  answers.productID;
   var newStock = answers.quantity;
 
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newStock
      },
      {
        item_id: id
      }
    ],
    function(err, res) {
      console.log(chalk.magenta("\n Item ID #"+id+" stock updated to "+newStock+".\n"));
      mainMenu();
    })
  })
};

//* If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
function addProduct() {
  console.log(chalk.magenta("\nAdding a new product...\n"));
  inquirer
  .prompt([
    {
      name: "nameInput",
      type: "input",
      message: "Product name?",
    },
    {   
      name: "priceInput",
      type: "input",
      message: "What is the price of the new item?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
        }
    },  
    {   
      name: "quantityInput",
      type: "input",
      message: "How many are on hand?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
        }
    }, 
    {
      name: "departmentInput",
      type: "input",
      message: "Department?",
    }
  ])
  .then(function(answers) {
  
   var product =  answers.nameInput;
   var price = answers.priceInput;
   var quantity = answers.quantityInput;
   var department =  answers.departmentInput;

  updateDB(product, price, quantity, department);
  })
}; 

function updateDB(product, price, quantity, department) {
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      product_name: product,
      department_name: department,
      price: price,
      stock_quantity: quantity,
      product_sales: 0
    },
    function(err, res) {
      console.log(chalk.magenta(product+" added!\n"));
      mainMenu();
    }
  )
};

function exitApp() {
  connection.end();
  process.exit(1);
};