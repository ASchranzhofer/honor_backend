const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Sets = require('../models/sets');

const setRouter = express.Router();

setRouter.use(bodyParser.json());

setRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Sets.find({})
    .populate('cards')
    .then((sets) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(sets);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.create(req.body)
    .then((set) => {
        console.log('Set Created ', set);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(set);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /sets');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

setRouter.route('/:setId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Sets.findById(req.params.setId)
    .populate('cards')
    .then((set) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(set);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /sets/'+ req.params.setId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findByIdAndUpdate(req.params.setId, {
        $set: req.body
    }, { new: true })
    .then((set) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(set);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findByIdAndRemove(req.params.setId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

setRouter.route('/:setId/cards')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Sets.findById(req.params.setId)
    .populate('cards')
    .then((set) => {
        if (set != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(set.cards);
        }
        else {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findById(req.params.setId)
    .then((set) => {
        if (set != null) {
            set.cards.push(req.body);
            set.save()
            .then((set) => {
                Sets.findById(set._id)
                .populate('cards')
                .then((set) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(set);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /sets/'
        + req.params.setId + '/cards');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findById(req.params.setId)
    .then((set) => {
        if (set != null) {
            for (var i = (set.cards.length -1); i >= 0; i--) {
                set.cards.pop();
            }
            set.save()
            .then((set) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(set);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

setRouter.route('/:setId/cards/:cardId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Sets.findById(req.params.setId)
    .populate('cards')    
    .then((set) => {
        if (set != null && set.cards.id(req.params.cardId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(set.cards.id(req.params.cardId));
        }
        else if (set == null) {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Card ' + req.params.cardId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /sets/'+ req.params.setId
        + '/cards/' + req.params.cardId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findById(req.params.setId)
    .then((set) => {
        if (set != null && set.cards.id(req.params.cardId) != null) {
            if (req.body.name) {
                set.cards.id(req.params.cardId).name = req.body.name;
            }
            if (req.body.description) {
                set.cards.id(req.params.cardId).description = req.body.description;                
            }
            set.save()
            .then((set) => {
                Sets.findById(set._id)
                .populate('cards')
                .then((set) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(set);  
                })              
            }, (err) => next(err));
        }
        else if (set == null) {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Card ' + req.params.cardId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Sets.findById(req.params.setId)
    .then((set) => {
        if (set != null && set.cards.id(req.params.cardId) != null) {
            set.cards.id(req.params.cardId).remove();
            set.save()
            .then((set) => {
                Sets.findById(set._id)
                .populate('cards')
                .then((set) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(set);  
                })               
            }, (err) => next(err));
        }
        else if (set == null) {
            err = new Error('Set ' + req.params.setId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Card ' + req.params.cardId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = setRouter;