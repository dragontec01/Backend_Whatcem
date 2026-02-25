import { model, Schema } from "mongoose";

const tenantSchema = new Schema({
    tenant: {
        type: String,
        required: true,
        enum: ['whatcem', 'wabia', 'leadcem'],
    },
    acquiredAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Boolean,
        default: true,
    },
    onboardingStatus: {
        type: String,
        enum: ['active', 'reviewing', 'dataloading', 'baseline'],
        default: 'baseline',
    },
    acquiredUntil: { // This field will help us to deactivate services with a cron job
        type: Date,
        default: null,
    },
    soldBy: {
        type: Schema.Types.ObjectId,
        ref: 'CxUser',
        required: true,
    }
}, {
    _id: false, // Prevents creation of _id for subdocuments
});

const clientSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    owner: { // This is the contact person for the client
        type: {
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
            }
        },
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
    },
    tenants: {
        type: [tenantSchema],
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

clientSchema.index({ email: 1, createdAt: -1 });

export default model('Client', clientSchema);