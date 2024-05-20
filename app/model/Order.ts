import mongoose, { Schema, Document, Model } from 'mongoose';

interface IOrder extends Document {
    phien?: any;
    username?: any;
    quantity?: any;
    team: any;
    status: any;
}


const OrderSchema: Schema<IOrder> = new Schema<IOrder>(
    {
        phien: {
            type: Schema.Types.Mixed,
            required: true,
        },
        username: {
            type: Schema.Types.Mixed,
            required: true,
        },
        quantity: {
            type: Schema.Types.Mixed,
        },
        team: {
            type: Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true }, // Tự động thêm các trường createdAt và updatedAt
);

const OrderModel: Model<IOrder> = mongoose.model<IOrder>(
    'Order',
    OrderSchema,
);

export default OrderModel;
