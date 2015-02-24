var express = require('express');
var anyDB = require('any-db');
var config = require('../shopXX-ierg4210.config.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var ext = "";
var fname = "";
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var inputPattern = {
	name: /^[\w- ']+$/,
};
var app = express.Router();

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
// this line must be immediately after express.bodyParser()!
// Reference: https://www.npmjs.com/package/express-validator
app.use(expressValidator());
app.use(multer({ dest: './images'}));

// URL expected: http://hostname/admin/api/cat/add
app.post('/cat/add', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('name', 'Invalid Category Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('INSERT INTO categories (name) VALUES (?)', 
		[req.body.name],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			res.status(200).json(result).end();
		}
	);

});

// URL expected: http://hostname/admin-api/cat/add
app.post('/cat/edit', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
	req.checkBody('name', 'Invalid Category Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('UPDATE categories SET name = ? WHERE catid = ? LIMIT 1', 
		[req.body.name, req.body.catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'catid', 
					msg: 'Invalid Category ID', 
					value: req.body.catid
				}]}).end();	
			}

			res.status(200).json(result).end();
		}
	);
});

app.post('/cat/del', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	
	pool.query('DELETE FROM categories WHERE catid = ?', 
		[req.body.catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result).end();
		}
	);

});

// URL expected: http://hostname/admin/api/cat/add
app.post('/prod/add', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	req.checkBody('name', 'Invalid Product Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	req.checkBody('price', 'Invalid Product Price')
		.notEmpty()
		.isInt();
	
	req.checkBody('color', 'Invalid Product Color')
		.isLength(1, 50)
		.matches(inputPattern.color);	

	req.checkBody('size', 'Invalid Product Size')
		.isLength(1, 50)
		.matches(inputPattern.size);

	req.checkBody('desc', 'Invalid Product Description')
		.isLength(0, 1500)
		.matches(inputPattern.desc);

	req.checkBody('detail', 'Invalid Product Description')
		.isLength(0, 1000)
		.matches(inputPattern.detail);

		console.log(req.files);
	
	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	
	pool.query('INSERT INTO products (catid, name, price, color, size, description, detail, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
		[req.body.catid,req.body.name,req.body.price,req.body.color,req.body.size,req.body.desc,req.body.detail,req.files.file.name],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			else {
			    ext = path.extname(req.files.file.path);
				fname=result.lastInsertId;
				console.log(result.lastInsertId);
				console.log(req.files.file.path);
				console.log('images/'+fname+ext);
				fs.rename(req.files.file.path,'images/'+fname+ext);
				pool.query('UPDATE products SET img = ? WHERE pid= ?',[fname+ext,fname],
				function (error, result){
				if (error) {
					console.error(error);
					return res.status(500).json({'dbError': 'check server log'}).end();
				}
				res.status(200).json(result).end();
				});
			}
		}
	);
});

app.post('/prod/edit1', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	console.log('hello edit 1');
	req.checkBody('pid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('Select * from products WHERE pid = ?', 
		[req.body.pid],
		function (error, pro) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (pro.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'pid', 
					msg: 'Invalid product ID', 
					value: req.body.pid
				}]}).end();	
			}
			
			pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}

		pool.query('SELECT * FROM products', function (error, products) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			
			res.status(200).render('admin-panel', {
				layout: 'admin',
		    	title: 'IERG4210 Shop21 Admin',
				cat: categories.rows,
		    	prod: products.rows,
				product: true,
				product_id: req.body.pid,
				product_name: pro[2],
				product_catid: pro[1],
				product_price: pro[3],
				product_color: pro[4],
				product_size: pro[5],
				product_desc: pro[6],
				product_detail: pro[7],
				product_img: pro[8]
		    });
			});
			});
		});
		});


app.post('/prod/edit2', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();
	
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	req.checkBody('name', 'Invalid Product Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	req.checkBody('price', 'Invalid Product Price')
		.notEmpty()
		.isInt();
	
	req.checkBody('color', 'Invalid Product Color')
		.isLength(1, 50)
		.matches(inputPattern.color);	

	req.checkBody('size', 'Invalid Product Size')
		.isLength(1, 50)
		.matches(inputPattern.size);

	req.checkBody('desc', 'Invalid Product Description')
		.isLength(0, 1500)
		.matches(inputPattern.desc);

	req.checkBody('detail', 'Invalid Product Description')
		.isLength(0, 1000)
		.matches(inputPattern.detail);

		console.log(req.files);
	
	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	
	pool.query('UPDATE products SET catid = ?, name=?, price=?, color=?, size=?, description=?, detail=?, img=? WHERE pid=?', 
		[req.body.catid,req.body.name,req.body.price,req.body.color,req.body.size,req.body.desc,req.body.detail,req.files.file.name,req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			else {
			    ext = path.extname(req.files.file.path);
				fname=result.lastInsertId;
				console.log(result.lastInsertId);
				console.log(req.files.file.path);
				console.log('images/'+fname+ext);
				fs.rename(req.files.file.path,'images/'+fname+ext);
				pool.query('UPDATE products SET img = ? WHERE pid= ?',[fname+ext,fname],
				function (error, result){
				if (error) {
					console.error(error);
					return res.status(500).json({'dbError': 'check server log'}).end();
				}
				res.status(200).json(result).end();
				});
			}
		}
	);
});

app.post('/prod/del', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	
	pool.query('DELETE FROM products WHERE pid = ?', 
		[req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result).end();
		}
	);

});

module.exports = app;