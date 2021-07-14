const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Cards = require('../models/cards');

const cardRouter = express.Router();

cardRouter.use(bodyParser.json());

cardRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cards.find(req.query)
    .populate('setId')
    .then((cards) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cards);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Cards.create(req.body)
    .then((card) => {
        console.log('Card Created ', card);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(card);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /cards');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Cards.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

cardRouter.route('/:cardId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cards.findById(req.params.cardId)
    .then((card) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(card);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /cards/'+ req.params.cardId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Cards.findByIdAndUpdate(req.params.cardId, {
        $set: req.body
    }, { new: true })
    .then((card) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(card);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Cards.findByIdAndRemove(req.params.cardId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = cardRouter;