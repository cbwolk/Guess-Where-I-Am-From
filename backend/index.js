
/*
 * Required modules
 */

const express = require('express')
const app = express();
const bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// TODO: Implement database
//const MongoClient = require('mongodb').MongoClient;



/*
 * Start the server
 */

// Port on which to listen
const PORT = process.env.PORT || 5000;

// Allow cross-origin requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Start the server
const server = app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT)
});

//app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname + '/../frontend/build/')));



/*
 * TODO: Initialize connection to the database
 */

var mongoUri = process.env.MONGODB_URI || 'mongodb://heroku_bnrnmdbx:m0d6cbv61e3pal3hefnt1ooieh@ds133556.mlab.com:33556/heroku_bnrnmdbx';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
let db;

MongoClient.connect(mongoUri, function(error, databaseConnection) {
    if(error){
        console.log("ERROR WITH MONGODB:", error);
    }
    else {
        console.log("SUCCESS");
        db = databaseConnection;
        // Assign weights, either blank or from server (if they exist)
        getWeights();
    }
});




// All questions
const questions = [
    {
        question: "Which childhood toys do you remember playing with?",
        options: ["Hess Truck", "Slinky", "Etch A Sketch"],
        type: 'checkbox',
    },
    {
        question: "Which of these fast food joints have you been to?",
        options: ["Sonic", "McDonald's", "Bojangles'", "Burger King", "Chipotle", "ShakeShack", "Whataburger", "White Castle", "In-N-Out Burger", "Chick-fil-A", "Jack in the Box"],
        type: 'checkbox',
    },
    {
        question: "What do you call the bubbly carbonated sugar drink?",
        options: ["Soda", "Pop"],
        type: 'radio',
    },
    {
        question: "You're in a local shop and heard someone speaking a language that isn't English. What language is it likely to be?",
        options: ["Chinese", "Arabic", "French", "Italian", "Spanish"],
        type: "checkbox",
    },
    {
        question: "What do you call a circular intersection?",
        options: ["Roundabout", "Traffic Circle", "Rotary", "What are you talking about?"],
        type: "radio",
    },
    {
        question: "What type of weather are you most afraid of?",
        options: ["Tornado", "Hurricane", "Earthquake", "Mudslide", "Flood", "Wildfire", "Blizzard"],
        type: "radio",
    },
    {
        question: "What's your go-to convenient store?",
        options: ["Wawa", "7-Eleven", "QuickChek", "Shell", "Mobil", "Conoco", "Raceway", "QuikTrip"],
        type: "radio",
    },
    {
        question: "How do most people get to work where you're from?",
        options: ["Drive", "Walk", "Bike", "Train", "Subway", "Bus"],
        type: "checkbox",
    },
    {
        question: "What is your favorite season?",
        options: ["Spring", "Summer", "Fall", "Winter"],
        type: "radio",
    },
    {
        question: "What're your favorite types of music?",
        options: ["Rock and Roll", "R&B", "Pop", "Country", "Latin", "EDM", "Jazz", "Classical", "Punk"],
        type: "checkbox",
    },
];

// All states
const states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

// Array of weights, to be updated from server or set to blank weights
let weights;

/*
 * Get the JSON Object from MONGODB at the start of session
 */
function getWeights() {
    let collection = db.collection('weights');
    collection.findOne({})
    .then((results) => {
        // Results are null
        if (!results) {
            weights = getBlankWeights();
            insertWeights();
        }
        // Results are good!
        else {
            //weights = getBlankWeights();
            //insertWeights();
            weights = results.weights;

        }
    })
    .catch((error) => {
        // Error; re-assign weights
        weights = getBlankWeights();
        insertWeights();
    })
}

/*
Purpose: Get an array of blank weights, where each option for each question
    for each state has no responses and no "true" answers
*/
function getBlankWeights() {

    let weights = [];

    for (let i = 0; i < questions.length; i++) {
        weights.push([]);
        for (let j = 0; j < questions[i].options.length; j++) {

            let responsesByStates = {};
            for (let k = 0; k < states.length; k++) {
                // True responses from this state, and total responses from this state
                responsesByStates[states[k]] = {
                    trueResponses: 0,
                    totalResponses: 0,
                }
            }

            weights[i].push({
                responsesByStates: responsesByStates
            });
        }
    }

    return weights;
}



/*
Purpose: Given an array of answers, guess the state which these answers came from
*/
function guessState(answers) {

    // Create a blank array of weights for each state, to be updated
    let resultWeights = {};
    for (let i = 0; i < states.length; i++) {
        resultWeights[states[i]] = 0;
    }

    // Figure out how many total options there are
    let totalOptions = 0;
    for (let i = 0; i < questions.length; i++) {
        for (let j = 0; j < questions[i].options.length; j++) {
            totalOptions++;
        }
    }

    // For each option, if they answered true, increase the weight for each
    // state accordingly
    for (let i = 0; i < questions.length; i++) {
        for (let j = 0; j < questions[i].options.length; j++) {
            Object.keys(resultWeights).forEach((state) => {

                if (answers[i][j]) {
                    let trueResponses = weights[i][j].responsesByStates[state].trueResponses;
                    let totalResponses = weights[i][j].responsesByStates[state].totalResponses;

                    let w = (totalResponses == 0 ? 0 : trueResponses / totalResponses);
                    resultWeights[state] += (w / totalOptions);
                }
            });
        }
    }

    return resultWeights;
}



function insertWeights() {
    let obj = {
        weights: weights
    }
    console.log('inserting weights:', obj);
    let collection = db.collection('weights');
    // Clear database
    collection.deleteMany({})
    .then(() => {
        // Store object
        collection.insertOne(obj)
        .then(() => {
            console.log('success inserting')
        })
        .catch(() => {
            console.log('no success inserting')
        });
    })
    .catch(() => {
        console.log('error deleting everything');
    });


}

/*
Purpose: Given an array of answers (true/false for each option on each question),
    update the weights array to represent this answer
*/
function updateWeights(answers, correctState) {

    for (let i = 0; i < questions.length; i++) {
        for (let j = 0; j < questions[i].options.length; j++) {

            let trueResponses = weights[i][j].responsesByStates[correctState].trueResponses;
            let totalResponses = weights[i][j].responsesByStates[correctState].totalResponses;

            // Increment totalResponses for this option on this question for this state
            weights[i][j].responsesByStates[correctState].totalResponses = totalResponses + 1;

            // If they answered yes to this option, increment trueResponses
            if (answers[i][j]) {
                weights[i][j].responsesByStates[correctState].trueResponses = trueResponses + 1;
            }
        }
    }

    /*
    TODO: Update weights and upload to MongoDB database.
    */
    insertWeights();

}


/*
 * Whenever someone accesses route page, should display index.html
 * from frontend directory
 */
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'));
});

/*
 * Get questions
 */

app.get('/get-questions', (req, res) => {
    res.send(JSON.stringify(questions));
});

/*
 * Submit answers
 */

app.post('/submit-answers', (req, res) => {
    // Get their answers
    const answers = req.body;
    // Guess the state from their answers
    const state = guessState(answers);

    res.send(JSON.stringify(state));
});

/*
 * Correct the weights
 */

app.post('/correct-weights', (req, res) => {
    console.log('hello')
    const answers = req.body.answers;
    const correctState = req.body.correctState;

    console.log('User is updating weights with:', answers, correctState);

    updateWeights(answers, correctState)

    res.sendStatus(200);
});
