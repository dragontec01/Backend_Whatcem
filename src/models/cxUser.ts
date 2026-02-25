import { model, Schema } from "mongoose";

const cxUserSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    accessType: {
        type: String,
        enum: ['admin', 'regular'],
        required: true,
    }
});

cxUserSchema.index({ email: 1, createdAt: -1 });

export default model('User', cxUserSchema);