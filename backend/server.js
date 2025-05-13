require('dotenv').config()
console.log('Connection String Variables:');
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_HOSTNAME:', process.env.DB_HOSTNAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_UID:', process.env.DB_UID);
console.log('DB_PWD:', process.env.DB_PWD);
console.log('DB_SCHEMA:', process.env.DB_SCHEMA);

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
const ibmdb = require('ibm_db');
const async = require('async');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enhanced CORS handling
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Fix double slash issue in URLs
    if (req.url.indexOf('//') !== -1) {
        req.url = req.url.replace('//', '/');
    }
    
    next();
});


let connStr = "DATABASE="+process.env.DB_DATABASE+";HOSTNAME="+process.env.DB_HOSTNAME+";PORT="+process.env.DB_PORT+";PROTOCOL=TCPIP;UID="+process.env.DB_UID+";PWD="+process.env.DB_PWD+";";

// CREATE - Add new home data
app.get('/', function (request, response) {
  ibmdb.open(connStr, function (err, conn) {
    if( err) {
      return response.json({ success: -1, message: err });
    }else{
      console.log('Connected to DB!');
    }
  })
})
app.post('/create', function (request, response) {
  const customer = JSON.parse(request.body['customer']);

  ibmdb.open(connStr, function (err, conn) {
    if (err) {
      return response.json({ success: -1, message: err });
    }

    const schema = process.env.DB_SCHEMA;

    // Generate a new ID (or use UUID in real apps)
    const id = customer.id; // Expecting ID to be sent by frontend

    const insertQuery = `
      INSERT INTO ${schema}.CUSTOMERS (
        ID, COMPANY_NAME, CONTACT_PERSON, PHONE, EMAIL,
        QUOTATION_ID, QUOTATION_REG, QUOTATION_EXP, TOTAL_AMOUNT,
        STATUS, ADDRESS, CITY, STATE
      ) VALUES (
        '${id}', '${customer.company_name}', '${customer.contact_person}', '${customer.phone}', '${customer.email}',
        '${customer.quotation_id}', '${customer.quotation_reg}', '${customer.quotation_exp}', ${customer.total_amount},
        ${customer.status}, '${customer.address}', '${customer.city}', '${customer.state}'
      );
    `;

    conn.query(insertQuery, function (err) {
      conn.close(() => {
        if (err) {
          return response.json({ success: -2, message: err });
        }
        return response.json({ success: 1, message: 'Customer Created Successfully!' });
      });
    });
  });
});

// READ - Get all home data with limit
app.post('/view', function(request, response){
  console.log('hi')
   ibmdb.open(connStr, function (err,conn) {
     if (err){
       return response.json({success:-1, message:err});
     }
     conn.query("SELECT * FROM "+process.env.DB_SCHEMA+".CUSTOMERS ORDER BY ID DESC LIMIT "+request.body.num+";", function (err, data) {
       if (err){
         return response.json({success:-1, message:err});
       }
       conn.close(function () {
         return response.json({success:1, message:'Data Received!', data:data});
       });
     });
   });
})

// READ - Get specific home data by ID
app.post('/viewByID', function(request, response) {
  ibmdb.open(connStr, function(err, conn) {
    if (err) {
      return response.json({ success: -1, message: err });
    }

    const query = `SELECT * FROM ${process.env.DB_SCHEMA}.CUSTOMERS WHERE ID = ?`;

    conn.query(query, [request.body.id], function(err, data) {
      if (err) {
        return response.json({ success: -2, message: err });
      } else {
        return response.json({ success: 1, message: 'Data Received!', data: data });
      }
    });
  });
});


// UPDATE - Update home data
app.post('/update', function (request, response) {
  ibmdb.open(connStr, function (err, conn) {
    if (err) {
      return response.json({ success: -1, message: err });
    }

    const schema = process.env.DB_SCHEMA;
    const id = request.body.id;
    const data = request.body.data;

    const updateQuery = `
      UPDATE ${schema}.CUSTOMERS
      SET 
        COMPANY_NAME='${data.company_name}',
        CONTACT_PERSON='${data.contact_person}',
        PHONE='${data.phone}',
        EMAIL='${data.email}',
        QUOTATION_ID='${data.quotation_id}',
        QUOTATION_REG='${data.quotation_reg}',
        QUOTATION_EXP='${data.quotation_exp}',
        TOTAL_AMOUNT=${data.total_amount},
        STATUS=${data.status},
        ADDRESS='${data.address}',
        CITY='${data.city}',
        STATE='${data.state}'
      WHERE ID='${id}';
    `;

    const selectQuery = `SELECT * FROM ${schema}.CUSTOMERS WHERE ID='${id}';`;

    conn.query(updateQuery, function (err) {
      if (err) {
        conn.close(() => {});
        return response.json({ success: -2, message: err });
      }

      conn.query(selectQuery, function (err, updatedData) {
        conn.close(() => {
          if (err) {
            return response.json({ success: -3, message: err });
          }
          return response.json({ success: 1, message: 'Data Updated!', data: updatedData });
        });
      });
    });
  });
});

// DELETE - Delete home data
app.post('/delete', function (request, response) {
  ibmdb.open(connStr, function (err, conn) {
    if (err) {
      return response.json({ success: -1, message: err });
    }

    const schema = process.env.DB_SCHEMA;
    const id = request.body.id;
    const deleteQuery = `DELETE FROM ${schema}.CUSTOMERS WHERE ID = ?`;

    conn.query(deleteQuery, [id], function (err, data) {
      conn.close(() => {
        if (err) {
          return response.json({ success: -2, message: err });
        } else {
          return response.json({ success: 1, message: 'Customer deleted successfully!' });
        }
      });
    });
  });
});



app.listen(8888, function(){
    console.log("Server is listening on port 8888");
})