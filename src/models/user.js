const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            set: v => v.toLowerCase(),
            required: true
        },
        password: {
            type: String,
            required: true
        },
        words: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Word'
            }
        ]
    });

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);