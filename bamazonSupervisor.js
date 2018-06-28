const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');
const chalk = require('chalk');

const divider = "__________________________________________________________\n"

const connection = mysql.createConnection({
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
  console.log(chalk.green("Welcome to the Bamazon Company Server."));
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
        "View All Departments.",
        "View Product Sales by Department.",
        "Create New Department.",
        "Quit."
      ]
    })
    .then(function(answer) {
      switch (answer.action) {

      case "View All Departments.":
      queryDepartments();
      break;

      case "View Product Sales by Department.":
        queryDepartmentSales();
        break;

      case "Create New Department.":
        createDepartment();
        break;

      case "Quit.":
        exitApp();
        break;
      }
    })
};

function queryDepartments() {
  console.log(divider);
  console.log(chalk.green("Bamazon Departments:\n"));
  connection.query("SELECT * FROM departments", function(err, res) {

      // Instantiate table
      var table = new Table({
        head: [chalk.green('ID'), chalk.green('Department'), chalk.green('Monthly Overhead Costs')]
      , colWidths: [4, 18, 26]
    });
  
      for (var i = 0; i < res.length; i++) {
        
      table.push( [res[i].id, res[i].name, res[i].over_head_costs+".00"]
      );
      }
      console.log(table.toString());

    mainMenu();
  });
};

// Returns info on all current products.
function queryDepartmentSales() {
  console.log(divider);
  console.log(chalk.green("\nTotal Sales and Profit By Department:\n"));

  connection.query("SELECT id, name, over_head_costs, product_sales FROM departments INNER JOIN products ON departments.name = products.department_name GROUP BY department_name ORDER BY id;", function(err, res) {

     // Instantiate table
     var table = new Table({
      head: [chalk.green('ID'), chalk.green('Dept. Name'), chalk.green('Monthly Overhead Costs'), chalk.green('Sales'), chalk.green('Total Profit')]
    , colWidths: [5, 13, 26, 10, 15]
  });

    for (var i = 0; i < res.length; i++) {
      sales = res[i].product_sales;
      cost = res[i].over_head_costs;
      profit = sales-cost;
 
    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    table.push( [res[i].id, res[i].name, res[i].over_head_costs+".00", res[i].product_sales+".00", profit+".00"]
    );
    }
    console.log(table.toString());

    mainMenu();
  });
};

//* If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
function createDepartment() {

  console.log(chalk.magenta("\nAdding a new department...\n"));
  inquirer
  .prompt([
    {
      name: "nameInput",
      type: "input",
      message: "Department name?",
    },
    {
      name: "overheadInput",
      type: "input",
      message: "What are the over head costs?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
        }
    }
  ])
  .then(function(answers) {

   var department =  answers.nameInput;
   var overhead = answers.overheadInput;

  //  updateInventory(productNew, priceNew, stockNew, departmentNew);
  console.log("New "+department+" department created with $"+overhead+" monthly overhead cost.");
  updateDB(department, overhead);
  });
};

function updateDB(newName, newCost) {

  var query = connection.query(
    "INSERT INTO departments SET ?",
    {
      name: newName,
      over_head_costs: newCost,
    },
    function(err, res) {
      console.log(res.affectedRows + " department inserted!\n");
    }
  )
  mainMenu();
};

function exitApp() {
  connection.end();
  process.exit(1);
};
