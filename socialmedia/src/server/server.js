
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;        // set our port
var flat = require('array.prototype.flat');
// include data type tweet
var Tweet = require("./Tweet.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Sentiment analysis
var Sentiment = require('sentiment');

// Twitter
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});

var params = {screen_name: 'nodejs'};

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    // console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.redirect('/index.html');
});

router.get('/before', function (req, res) {
    res.send(before);
})

router.get('/after', function (req, res) {
    res.send(after);
})

router.get('/beforeDetailed', function (req, res) {
    res.send(JSON.stringify(beforeDetailed));
})

router.get('/afterDetailed', function (req, res) {
    res.send(JSON.stringify(afterDetailed));
})

var hashtags;
router.get('/hashtags', function (req, res) {
    res.send(hashtags);
})

var dateofinterest;
router.get('/dateofinterest', function (req, res) {
    res.send(dateofinterest);
})

var beforeBarplotData = [];
router.get('/beforebarplotdata', function (req, res) {
    res.send(JSON.stringify(beforeBarplotData));
})

var afterBarplotData = [];
router.get('/afterbarplotdata', function (req, res) {
    res.send(JSON.stringify(afterBarplotData));
})

router.post('/analyse', async function (req, res) {
    console.log("querying data...");
    var tags = [];
    tags = req.body.tags;
    var queryDate = req.body.dateOfInterest;

    // for getters
    hashtags = tags;
    dateofinterest = queryDate;

    var tweetsBeforeDateOfInterest = [];
    const resultBeforeDateOfInterest = await Promise.all(tags.map((t) =>new Promise((resolve,reject)=>{
        client.get('search/tweets', {q: t, until: queryDate, lang: 'en', count: 100, tweet_mode: 'extended', exclude: 'retweets'}, function(error, tweets, response) {
            resolve(tweets.statuses)
        })
    })))
    flat(resultBeforeDateOfInterest, 1).forEach(function (tweet) {
        tweetsBeforeDateOfInterest.push(new Tweet(tweet.id, tweet.created_at, tweet.full_text))
    })
    console.log(tweetsBeforeDateOfInterest)

    var tweetsAfterDateOfInterest = [];
    const resultAfterDateOfInterest = await Promise.all(tags.map((t) =>new Promise((resolve,reject)=>{
        client.get('search/tweets', {q: t, since: queryDate, lang: 'en', count: 100, tweet_mode: 'extended', exclude: 'retweets'}, function(error, tweets, response) {
            resolve(tweets.statuses)
        })
    })))
    flat(resultAfterDateOfInterest, 1).forEach(function (x) {
        tweetsAfterDateOfInterest.push(new Tweet(x.id, x.created_at, x.full_text))
    })
    console.log(tweetsAfterDateOfInterest)
    await analyseTweets(tweetsBeforeDateOfInterest, tweetsAfterDateOfInterest);
    res.redirect('/results.html');
})

// functions
async function analyseTweets(tweetsBeforeDateOfInterest, tweetsAfterDateOfInterest) {
    var sentiment = new Sentiment();
    console.log("Tweets before date of interest:")
    var avgBefore = 0;
    tweetsBeforeDateOfInterest.forEach(function (tweet) {
        var result = sentiment.analyze(tweet.getText());
        console.log(tweet.getText());
        console.log("Sentiment Score: " + result.score);
        tweet.setScore(result.score);
        avgBefore+=result.score;
    })
    avgBefore = avgBefore/tweetsBeforeDateOfInterest.length;
    console.log("Tweets after date of interest:");
    var avgAfter = 0;
    tweetsAfterDateOfInterest.forEach(function (tweet) {
        var result = sentiment.analyze(tweet.getText());
        console.log(tweet.getText());
        console.log("Sentiment Score: " + result.score);
        tweet.setScore(result.score);
        avgAfter+=result.score;
    })
    avgAfter = avgAfter/tweetsAfterDateOfInterest.length;
    console.log("Average sentiment weight before date of interest: " + avgBefore);
    console.log("Average sentiment weight after date of interest: " + avgAfter);
    before = "Amount of tweets: " + tweetsBeforeDateOfInterest.length + " Average sentiment weight: " + avgBefore;
    after = "Amount of tweets: " + tweetsAfterDateOfInterest.length + " Average sentiment weight: " + avgAfter;
    beforeDetailed = tweetsBeforeDateOfInterest;
    afterDetailed = tweetsAfterDateOfInterest;
    await barplot(tweetsBeforeDateOfInterest, tweetsAfterDateOfInterest);
}
var before;
var after;
var beforeDetailed;
var afterDetailed;

async function barplot(tweetsBeforeDateOfInterest, tweetsAfterDateOfInterest) {
    var beforeCounter = [0, 0, 0];
    tweetsBeforeDateOfInterest.forEach(function (t) {
        if(t.getScore() < 0) {
            beforeCounter[0]++;
        } else if(t.getScore() == 0) {
            beforeCounter[1]++;
        } else if(t.getScore() > 0) {
            beforeCounter[2]++;
        }
    })
    // console.log("negativeBefore: " + beforeCounter[0]);
    // console.log("positive:" + beforeCounter[2]);
    // console.log("neurtral: " + beforeCounter[1]);
    var afterCounter = [0, 0, 0];
    tweetsAfterDateOfInterest.forEach(function (t) {
        if(t.getScore() < 0) {
            afterCounter[0]++;
        } else if(t.getScore() == 0) {
            afterCounter[1]++;
        } else if(t.getScore() > 0) {
            afterCounter[2]++;
        }
    })
    beforeBarplotData = beforeCounter;
    afterBarplotData = afterCounter;
    console.log(beforeBarplotData);
    console.log(afterBarplotData);
}



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(express.static('./public'));
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port, function () {
    console.log('Using port ' + port);
})