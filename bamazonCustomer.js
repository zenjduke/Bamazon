const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');
const chalk = require('chalk');

const divider = "___________________________________________________________________\n"

var cart = [];

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  console.log("working...");
  if (err) throw err;
  console.log(divider);
  console.log(chalk.green("Welcome to Bamazon!"));
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
        "Shop.",
        // "View recent orders.",
        "Quit."
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View inventory.":
        queryAllProducts();
        break;

      case "Shop.":
        shop();
        break;

      // case "View recent orders.":
      //   console.log(chalk.green(divider));
        
      //   viewCart();
      //   mainMenu();
      //   break;

      case "Quit.":
        exitApp();
        break;
      }
    })
};

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

function shop() {
    console.log(divider);
    inquirer
    .prompt([
     {   
      name: "idRequest",
      type: "input",
      message: "What is the ID number of the item you would like to buy?\n",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
        }
      },  
      {
        name: "quantityRequest",
        type: "input",
        message: "How many would you like to buy?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var productID = Number(answer.idRequest);
      var productQuant = Number(answer.quantityRequest);
      purchase(productID, productQuant);
    });
};

function purchase(id, quantity) {
 
    // query the database for all items in customer's order
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
        // get the information of the chosen item
        for (var i = 0; i < results.length; i++) {
            if (results[i].item_id == id && results[i].stock_quantity >= quantity)
            {
              var chosenItem = results[i].product_name;
              var chosenPrice = results[i].price;
              var currentStock = results[i].stock_quantity - quantity;
              var receipt = quantity * chosenPrice;
        
              console.log(cart);

              var currentSales = (results[i].product_sales) + receipt;

              console.log(chalk.magenta("\n"+quantity+" '"+chosenItem+"' purchased for a total of $"+receipt+".\n"));

              
              checkout(currentSales, currentStock, id);
            }
        
            else if (results[i].item_id == id && results[i].stock_quantity < quantity){
                chosenItem = results[i].product_name;
                console.log(chalk.red("\nSorry. We only have "+results[i].stock_quantity+" '"+chosenItem+"' in stock.\n"));
                mainMenu();
            } 
    }
   ;})   
};

function checkout(currentSales, stock, id) {
    console.log(chalk.magenta("Updating inventory...\n"));
   
    var query = connection.query(
      "UPDATE products SET stock_quantity="+stock+", product_sales="+currentSales+" WHERE item_id="+id,

      function(err, res) {
        if (err) throw err;
        console.log(chalk.magenta("Products updated!\n"));
        mainMenu();
      }
    );
}; 

function exitApp() {
  connection.end();
  process.exit(1);
};

