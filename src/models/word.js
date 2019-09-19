const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema(
    {
        word: {
            type: String,
            set: v => v.toLowerCase(),
            required: true
        },
        translate: {
            type: String,
            set: v => v.toLowerCase(),
            required: true
        },
        description: {
            type: String,
            required: false
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    });

wordSchema.index({ word: 1 }, { unique: true });

module.exports = mongoose.model('Word', wordSchema);
