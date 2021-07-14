const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Collections = require('../models/collection');

const collectionRouter = express.Router();

collectionRouter.use(bodyParser.json());

collectionRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Collections.findOne({user: req.user._id})
    .populate('user')
    .populate('cards')
    .then((cards) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cards);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Collections.findOne({"user": req.user._id})
    .then((collection) => {
        if (collection != null) {
            for (var i=0; i<req.body.length; i++) {
                if (collection.cards.indexOf(req.body[i]._id) === -1) {
                    collection.cards.push(req.body[i]._id);
                }
            }
            collection.save()
                .then((collection) => {
                    Collections.findById(collection._id)
                    .populate('user')
                    .populate('cards')
                    .then((collection) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(collection);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
        }
        else {
            Collections.create({"user": req.user._id, "cards": req.body})
            .then((collection) => {
                console.log('Collection Created ', collection);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(collection);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err)); 
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /collections');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Collections.findOneAndRemove({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));  
});

collectionRouter.route('/:cardId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Collections.findOne({user: req.user._id})
    .then((collection) => {
        if (!collection) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "cards": cards});
        }
        else {
            if (collection.cards.indexOf(req.params.cardId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "cards": cards});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "cards": cards});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Collections.findOne({"user": req.user._id})
    .then((collection) => {
        if (collection != null) {
            if (collection.cards.indexOf(req.body[i]._id) === -1) {
              collection.cards.push(req.body[i]._id);
              collection.save()
                .then((collection) => {
                    Collections.findById(collection._id)
                    .populate('user')
                    .populate('cards')
                    .then((collection) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(collection);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            }
            
        }
        else {
            Collections.create({"user": req.user._id, "cards": [req.params.cardId]})
            .then((collection) => {
                console.log('Collection Created ', collection);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(collection);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /cards/'+ req.params.cardId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Collections.findOne({user: req.user._id})
    .then((collection) => {
        if (collection != null) {            
            index = collection.cards.indexOf(req.params.cardId);
            if (index >= 0) {
                collection.cards.splice(index, 1);
                collection.save()
                .then((collection) => {
                    Collections.findById(collection._id)
                    .populate('user')
                    .populate('cards')
                    .then((collection) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(collection);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else {
                err = new Error('Dish ' + req.params.cardId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Collections not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = collectionRouter;