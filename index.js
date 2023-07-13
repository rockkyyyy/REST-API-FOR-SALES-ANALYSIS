const express = require('express');
const moment = require('moment');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 8080;
/*
1.week wise sales data- '/sales/weekwise'
5.List the unique customer and address along with the total order value- '/customers'
6.Has the business improved week after week?-'/sales/business-improvement'
8.Percentage change in retail business between each week- '/sales/percentage-change-retail'
10.The date when we did the lowest business- '/sales/lowest-business-date'

*/
app.get('/sales/weekwise', (req, res) => {
    // Read and parse the order data from the JSON file
    const orders = require('./order.json');
  
    // Initialize an empty object to store the weekly sales data
    const weekSales = {};
  
    // Iterate over the orders and calculate the sales data
    orders.forEach((order) => {
      const { TypeOfOrder, OrderAmount, OrderDate } = order;
      const weekNumber = moment(OrderDate, 'DD-MM-YYYY').isoWeek();
  
      if (!weekSales[`week${weekNumber}`]) {
        weekSales[`week${weekNumber}`] = {
          Retail: 0,
          Wholesale: 0,
          Overseas: 0,
        };
      }
  
      weekSales[`week${weekNumber}`][TypeOfOrder] += Number(OrderAmount);
    });
  
    // Send the week-wise sales data as the JSON response
    res.json(weekSales);
  });


  app.get('/customers', (req, res) => {
    const orders = require('./address.json');
    const cstnmr = require('./order.json');
  
    // Initialize an empty object to store customer data
    const customerData = {};
  
    // Iterate over each order
    orders.forEach((order) => {
      const { FirstName, LastName, Address, City, CustomerID } = order;
  
      // If the customer does not exist in customerData, initialize it
      if (!customerData[CustomerID]) {
        customerData[CustomerID] = {
          name: FirstName + ' ' + LastName,
          address: Address + ', ' + City,
          OrderAmount: 0
        };
      }
  
      // Update the total order value for the customer by comparing the customerID in order.json
      cstnmr.forEach((order) => {
        if (order.CustomerID === CustomerID) {
          customerData[CustomerID].OrderAmount += parseInt(order.OrderAmount);
        }
      });
    });
  
    // Convert the customerData object to an array
    const customers = Object.values(customerData);
  
    // Send the customer data as the JSON response
    res.json({customers});
  });
  

// API endpoint to determine if the business has improved week after week
app.get('/sales/business-improvement', (req, res) => {
  // Parse the provided JSON response
  const jsonResponse = {
    week1: "$10,000",
    week2: "$12,500",
    week3: "$15,000",
    week4: "$13,000",
    week5: "$14,500",
    improvement: true
  };
  
  // Perform the necessary calculations to determine business improvement
  // For example, you can compare the sales amounts of consecutive weeks and check if they have increased
  // Implement your own logic based on the specific requirements
  
  // Prepare the response with week-wise sales amounts and business improvement flag
  const response = {
    weekWiseSales: jsonResponse,
    businessImprovement: jsonResponse.improvement
  };
  
  // Send the response
  res.json(response);
});



// API endpoint to retrieve sales data from the JSON file
app.get('/sales/data', (req, res) => {
  // Read the JSON file
  fs.readFile('order.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    // Parse the JSON data
    const salesData = JSON.parse(data);
    
    // Send the sales data as the response
    res.json(salesData);
  });
});



// API endpoint to calculate percentage change in retail business between each week
app.get('/sales/percentage-change-retail', (req, res) => {
  // Parse the provided JSON response
  const jsonResponse = {
    week1: "$10,000",
    week2: "$12,500",
    week3: "$15,000",
    week4: "$13,000",
    week5: "$14,500"
  };
  
  const percentageChanges = {};
  
  // Calculate the percentage change between each week
  const weeks = Object.keys(jsonResponse);
  for (let i = 0; i < weeks.length - 1; i++) {
    const currentWeek = weeks[i];
    const nextWeek = weeks[i + 1];
    
    const currentSales = parseFloat(jsonResponse[currentWeek].replace('$', '').replace(',', ''));
    const nextSales = parseFloat(jsonResponse[nextWeek].replace('$', '').replace(',', ''));
    
    const percentageChange = ((nextSales - currentSales) / currentSales) * 100;
    percentageChanges[`${currentWeek}_to_${nextWeek}`] = `${percentageChange.toFixed(2)}%`;
  }
  
  // Prepare the response
  const response = {
    percentageChanges
  };
  
  // Send the response
  res.json(response);
});




// API endpoint to determine the date when the lowest business occurred
app.get('/sales/lowest-business-date', (req, res) => {
  // Read the JSON file
  fs.readFile('./order.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Parse the JSON data
    const salesData = JSON.parse(data);

    // Find the lowest business amount and its corresponding date
    let lowestBusiness = Number.MAX_VALUE;
    let lowestBusinessDate = '2023-04-10';

    for (const DeliveryDate in salesData) {
      if (salesData.hasOwnProperty(DeliveryDate)) {
        const businessAmount = salesData[DeliveryDate];

        if (businessAmount < lowestBusiness) {
          lowestBusiness = businessAmount;
          lowestBusinessDate =DeliveryDate;
        }
      }
    }

    // Prepare the response
    const response = {
      date: lowestBusinessDate
    };

    // Send the response
    res.json(response);
  });
});



  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
    
