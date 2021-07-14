const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    setId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set',
        required: true
    },
    cardId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Cards = mongoose.model('Card', cardSchema);

module.exports = Cards;