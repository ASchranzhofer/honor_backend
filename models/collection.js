const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var collectionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cards: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Card' }],
}, {
    timestamps: true
});

var Collections = mongoose.model('Collection', collectionSchema);

module.exports = Collections;