const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const LocalStrategy  = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config({path:'secrets.env'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const distDirectory = 'dist';
app.use(express.static(distDirectory));

app.use(session({
    secret: 'work hard',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14 
    },
    // cookie: { secure: true } // Enable with HTTPS
    store: new MongoStore({
        url: process.env.DB_URL,
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default.
        touchAfter: 24 * 36000 // Update session only once a day regardless of # of requests, unless a request specifically changes session data.
    })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((username, done) => {
    done(null, username);
});
passport.deserializeUser((username, done) => {
    done(null, username);
});

passport.use(new LocalStrategy((username, password, done) => {
    db.collection('users').findOne({ username: username }, (err, user) => {
        if (err) return done(err);
        if (user === null) { // User not found.
            return done(null, null);
        } else {
            bcrypt.compare(password, user.password, (err, passwordIsCorrect) => {
                if (err) return done(err);
                if (passwordIsCorrect) {
                    return done(null, username);
                } else {
                    return done(null, false)
                }
            });
        }
    });
}));

let usersCollectionExists = false;
let pollsCollectionExists = false;
function startListening() {
    if (usersCollectionExists && pollsCollectionExists) {
        let listener = app.listen(process.env.PORT || 8080, () => {
            console.log('Good to go! Node listening on port ' + listener.address().port + '.');
        });
    }
}

let db;
MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    db = client.db('voting-app');
    db.listCollections({name: 'users'}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length === 0) {
            db.createCollection('users', function(err) {
                if (err) throw err;
                console.log('"users" collection created.');
                db.createIndex('users', {username: 1}, {unique: true}, function(err) {
                    if (err) throw err;
                    console.log('Unique index created.');
                    usersCollectionExists = true;
                    startListening();
                });
            });
        } else {
            usersCollectionExists = true;
            startListening();
        }
    });
    db.listCollections({name: 'polls'}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length === 0) {
            db.createCollection('polls', function(err) {
                if (err) throw err;
                console.log('"polls" collection created.');
                pollsCollectionExists = true;
                startListening();
            });
        } else {
            pollsCollectionExists = true;
            startListening();
        }
    });
});

app.get("*", (req, res) => res.sendFile('./index.html', {root: distDirectory}));

app.post('/polls', (req, res) => {
    db.collection('polls').find({}).toArray(function(err, result) {
        if (err) {
            res.status(500).send();
            throw err;
        } else {
            res.json(result);
        }
    });
    
});

app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (typeof username === 'undefined' || typeof password === 'undefined') {
        return res.status(500).send(); // Only users attempting to get around client-side validation should get these errors.
    } else {
        bcrypt.hash(password, null, null, (err, hash) => {
            if (err) throw err;
            db.collection('users').insertOne({ username: username, password: hash }, (err) => {
                if (err) {
                    if (err.code === 11000) { // Duplicate key error from MongoDB unique username index.
                        res.status(409).send();
                    } else {
                        throw err;
                    }
                } else {
                    req.login(username, (err) => { // login() is not called automatically when using a custom callback.
                        if (err) throw err;
                        res.json(true);
                    });
                }
            });
        });
    }
});

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (typeof username === 'undefined' || typeof password === 'undefined') {
        res.status(500).send();
    } else {
        passport.authenticate('local', (err, user) => { // Custom authenticate callback defined here.
            if (err) {
                res.status(500).send();
            } else if (!user) { // null: no username in database, false: incorrect password.
                res.status(401).json({ error: "Incorrect username or password." });
            } else {
                req.login(user, (err) => { // login() is not called automatically when using a custom callback.
                    if (err) throw err;
                    res.json(true);
                });
            }
        })(req, res); // Gives passport.authenticate access to req and res objects.
    }
});

app.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json(true);
    });
});

app.post('/isAuthenticated', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.json(null);
    }
});

app.post('/vote', (req, res) => {
    let pollId = req.body.pollId;
    let optionIndex = req.body.optionIndex;
    if (typeof pollId === 'undefined' || typeof optionIndex === 'undefined') {
        res.status(500).send();
    } else {

        let user;
        if (typeof req.user === 'undefined') {
            user = req.ip; // TODO: Guest session.
        } else {
            user = req.user;
        }

        db.collection('polls').find({id: pollId}).toArray(function(err, result) {
            if (err) throw err;

            poll = result[0]
            let voters = poll.voters;
            let alreadyVoted = false;
            if (voters.hasOwnProperty(user)) {
                alreadyVoted = true;
            }

            if (alreadyVoted) {
                if (poll.voters[user] === optionIndex) { // Duplicate vote.
                    res.status(409).send();
                } else { // Change vote.
                    poll.votes[poll.voters[user]]--;
                    poll.votes[optionIndex]++;
                    poll.voters[user] = optionIndex;
                    db.collection('polls').replaceOne({id: pollId}, poll, function(err, result) {
                        if (err) throw err;
                        res.json(poll);
                    });
                }
            } else { // New vote.
                poll.votes[optionIndex]++;
                poll.voters[user] = optionIndex;
                db.collection('polls').replaceOne({id: pollId}, poll, function(err) {
                    if (err) throw err;
                    res.json(poll);
                });
            }
        });

    }
});

app.post('/addOption', (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).json(false);
    } else {
        let pollId = req.body.pollId;
        let option = req.body.option;
        if (typeof pollId === 'undefined' || typeof option === 'undefined' || option.length < 1) {
            res.status(500).send();
        } else {

            db.collection('polls').findOne({ id: pollId }, function(err, result) {
                if (err) throw err;

                let poll = result;
                if (poll.options.includes(option)) { // Duplicate option.
                    res.status(409).send();
                } else {
                    poll.options.push(option);
                    poll.votes.push(0);
                    db.collection('polls').replaceOne({id: pollId}, poll, function(err) {
                        if (err) throw err;
                        res.json(poll);
                        return;
                    });
                }

            });
        }
    }
    
});

app.post('/new-poll', (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).json(false);
    } else {
        let title = req.body.title;
        let options = req.body.options;
        if (typeof title === 'undefined' || typeof options === 'undefined' || title.length < 4 || options.length < 1) {
            res.status(500).send();
        } else {
            db.collection('polls').find({title: title}).toArray(function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    res.status(409).send(); // Duplicate title.
                } else {
                    let votes = [];
                    for (var i = 0; i < options.length; i++) {
                        votes[i] = 0;
                    }
                    let id = Math.random().toString(16).slice(2, 10); // Random 8-digit hexadecimal number.
                    let poll = {
                        id: id,
                        title: title,
                        author: req.user,
                        options: options,
                        votes: votes,
                        voters: {},
                        timestamp: new Date().getTime()
                    };
                    db.collection('polls').insertOne(poll, function(err) {
                        if (err) throw err;
                        res.json(poll);
                    });
                }
            });
        }
    } 
});

app.post('/delete-poll', (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).json(false);
    } else {
        let pollId = req.body.pollId;
        if (typeof pollId === 'undefined') {
            res.status(500).json(false);
        } else {
            db.collection('polls').find({id: pollId}).toArray(function(err, result) {
                if (err) throw err;
                if (req.user === result[0].author) {
                    db.collection('polls').deleteOne({id: pollId}, function(err) {
                        if (err) throw err;
                        res.json(result[0]);
                    });
                } else {
                    res.status(403).json(false);
                }
                
            });
        }
    }

});

app.post('/poll', (req, res) => {
    let pollId = req.body.pollId;
    if (pollId === 'undefined') {
        res.status(500).send();
    } else {
        db.collection('polls').find({id: pollId}).toArray(function(err, result) {
            if (err) throw err;
            if (result.length > 0) {
                res.json(result);
            } else {
                res.status(404).json(false);
            }
        });
    }
});