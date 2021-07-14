const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    abbr: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default:false      
    },
    cards: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Card' }]
}, {
    timestamps: true
});

var Sets = mongoose.model('Set', setSchema);

module.exports = Sets;