// BASE SETUP
// =============================================================================

// call the packages we need
var cors = require('cors');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
app.use(cors({credentials: true, origin: true}))
var morgan     = require('morgan');
var os = require('os');
var path = require('path');
var crypto = require('crypto');

if(os.platform() == 'win32') {
  path.join2 = path.join;
  path.sep = '/';
  path.join = function(){
      var res = path.join2.apply({}, arguments);
      res = res.replace(/\\/g, path.sep);
      return res;
  }
}

var multer = require('multer');

var upload = multer({storage: createMulterStorage('public/uploads/') });
var matchedUpload = multer({storage: createMulterStorage('public/uploads/matched') });


// configure app
app.use(express.static('public'));
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
      console.log(req.body);		// create a new instance of the Bear model
		  personCase.forename = req.body.forename;
      personCase.surname = req.body.surname;
      personCase.reference = req.body.reference;
      personCase.gender = req.body.gender;
      personCase.birthYear = req.body.birthYear;
      personCase.status = req.body.status;
      personCase.category = req.body.category;
      personCase.accomodation = req.body.accomodation;
      personCase.borough = req.body.borough;
      personCase.area = req.body.area;
      personCase.xCord = req.body.xCord;
      personCase.yCord = req.body.yCord;
      personCase.dateMissing = req.body.dateMissing;
      personCase.recordCreated = req.body.recordCreated;
      personCase.imageName = '';
      personCase.added = '';
      personCase.matchedImages = [];
      personCase.images = [];
      personCase.reporteeForename = req.body.reporteeForename;
    	personCase.reporteeSurname = req.body.reporteeSurname;
    	personCase.reporteeMobileNumber = req.body.reporteeMobileNumber;

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

         console.log(aCase)
         var existingImages = [];
          if(aCase.images){
            existingImages = aCase.images;
            console.log('existing array', existingImages)
          }

         var filePath = req.files[0].path.replace(/^public\//, '');
         var image = {
           path: 'https://sheltered-headland-81365.herokuapp.com/' + filePath,
           dateAdded: new Date().getTime()
         }

         console.log(image);

         existingImages.push(image);
         console.log('updated array:  ', existingImages)
         aCase.images = existingImages;

        aCase.save(function(err) {
          if (err)
            res.send(err);
            res.json({ message: 'Case Updated with missing person image!' });
        });
    });
  })


    // Update case reference with multiple matched Images -------------------------------

      router.route('/cases/:reference/matchedImages')

        .get(function(req, res) {
          Case.findById(req.params.reference, function(err, aCase) {
            if (err)
              res.send(err);
            res.json(aCase);
          });
        })

        .post(matchedUpload.array('photos', 12), function(req, res, next) {

          Case.findById(req.params.reference, function(err, aCase) {
            if (err)
               res.send(err);

               console.log(aCase)
               var existingMatchedImages = [];
                if(aCase.matchedImages){
                  existingMatchedImages = aCase.matchedImages;
                  console.log('existing array', existingMatchedImages)
                }


               var filePath = req.files[0].path.replace(/^public\//, '');
               var image = {
                 path: 'https://sheltered-headland-81365.herokuapp.com/' + filePath,
                 dateAdded: new Date().getTime(),
                 lon: req.body.lon,
                 lat: req.body.lat
               }


              console.log(image);

               existingMatchedImages.push(image);
               //console.log('updated array:  ', existingMatchedImages)
               aCase.matchedImages = existingMatchedImages;

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

     mongoose.model('Case').find({"images.dateAdded": {"$gte": requestedDate, "$lt": currentDate}}, function (err, aCase) {
        if (err) return handleError(err);
        console.log(aCase) // Space Ghost is a talk show host.
        res.json({ cases: aCase });
    })
  });


  router.route('/textFamily')
  .post(function(req, res) {

    var mobile = req.body.mobileNumber; //'447123456789'
    var customText = req.body.textMessage; //'we have found your daughter!'
    var forename = req.body.forename;
    var surname = req.body.surname;

    if(!customText){
      customText = "We have had a confirmed sighting of Mr. " + surname;
    }

    console.log(customText)
    var clockwork = require('clockwork')({key:'867bb2ee441f2b216557c61776897ef6f5ac907a'});
    clockwork.sendSms({ To: mobile, Content: customText},
      function(error, resp) {
        if (error) {
            console.log('Something went wrong', error);
        } else {
            console.log('Message sent',resp.responses[0].id);
            res.json({ delivery: 'Message sent' });
        }
    });

  });

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

function createMulterStorage(destinationPath) {
  return multer.diskStorage({
    destination: destinationPath,
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname))
      });
    }
  });
}
