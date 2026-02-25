import { model, Schema } from "mongoose";

const clientUserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    tenants: {
        type: [String],
        default: [],
        enum: ['whatceme', 'wabia', 'leadcem'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export default model('ClientUser', clientUserSchema);