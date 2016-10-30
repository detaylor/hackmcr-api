// BASE SETUP
// =============================================================================

// call the packages we need
var cors = require('cors');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
app.use(cors({credentials: true, origin: true}))
var morgan     = require('morgan');


var multer = require('multer');

var upload = multer({dest: 'uploads/' });


// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));



var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://admin:root@ds139187.mlab.com:39187/hackispy')

var db = mongoose.connection;

db.on('error', function (err) {
  console.log('mongodb connection error: %s', err);
	console.log(err);
  process.exit();
});
db.once('open', function () {
  console.log('Successfully connected to mongodb');
  app.emit('dbopen');
});

var Bear     = require('./app/models/bear');
var Case     = require('./app/models/case');



// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

	// create a bear (accessed at POST http://localhost:8080/bears)
	.post(function(req, res) {

		var bear = new Bear();		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});


	})

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		Bear.find(function(err, bears) {
			if (err)
				res.send(err);

			res.json(bears);
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

	// get the bear with that id
	.get(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			if (err)
				res.send(err);
			res.json(bear);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


  router.route('/cases')

  //Create a case --------------------------------

    .post(function(req, res) {

		  var personCase = new Case();
      console.log(req.body)		// create a new instance of the Bear model
		  personCase.forename = req.body.forename;
      personCase.surname = req.body.surname;
      personCase.reference = req.body.reference;
      personCase.imageName = '';
      personCase.added = '';

      console.log(personCase)

		  personCase.save(function(err) {
			  if (err)
				  res.send(err);

			  res.json({ message: 'Case created!' });
		  });


	  })




  // get all cases  ----------------------------------

  	.get(function(req, res) {
  		Case.find(function(err, cases) {
  			if (err)
  				res.send(err);

  			res.json(cases);
  		});
  	});

  // Get case with reference id -----------------------------------

  router.route('/cases/:reference')

    	// get the bear with that id
    	.get(function(req, res) {
    		Case.findById(req.params.reference, function(err, aCase) {
    			if (err)
    				res.send(err);
    			res.json(aCase);
    		});
    	})

// Update case reference with image -------------------------------

  router.route('/cases/:reference/images')

    .post(upload.array('photos', 12), function(req, res, next) {

      Case.findById(req.params.reference, function(err, aCase) {
        if (err)
          res.send(err);

          if(req.files[0].fieldname) {
              aCase.imageName = req.files[0].path;
              aCase.added = Date.now();
              console.log('setting case filename', req.files[0].path, aCase.added)
          }
          aCase.save(function(err) {
            if (err)
              res.send(err);
              res.json({ message: 'Case Updated with missing person image!' });
          });
      });
    })


  //POST A 'DATE' AS JSON AND YOU WILL GET ALL CASES AFTER THAT DATE

  router.route('/searchbydate')

  .post(function(req, res) {

    var Case = mongoose.model('Case').schema
    var currentDate = Date.now()
    var requestedDate = req.body.date;

    console.log(requestedDate)

     mongoose.model('Case').find({"added": {"$gte": requestedDate, "$lt": currentDate}}, function (err, aCase) {
        if (err) return handleError(err);
        console.log(aCase) // Space Ghost is a talk show host.
        res.json({ cases: aCase });
    })


  });












// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
