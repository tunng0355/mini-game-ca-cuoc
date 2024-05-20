import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  password: string;
  moneycu?: string;
  money?: string;
  win?: string;
  status?: string;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    moneycu: {
      type: String,
    },
    money: {
      type: String,
    },
    win: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }, // Tự động thêm trường createdAt và updatedAt
);

export default mongoose.model<IUser>('User', UserSchema);
