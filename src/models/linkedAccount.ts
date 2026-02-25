import { model, Schema } from "mongoose";

const linkedAccountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'CxUser',
        required: true,
        index: true,
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true,
    },
    accessType: {
        type: String,
        enum: ['admin', 'sales', 'cx'],
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
});

export default model('LinkedAccount', linkedAccountSchema);