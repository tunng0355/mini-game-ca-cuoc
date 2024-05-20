import mongoose, { Schema, Document } from 'mongoose';

interface IdGame extends Document {
  phien: any;
  TeamA: string;
  TeamB: string;
  time?: any;
  status?: any;
}

const GameSchema: Schema<IdGame> = new Schema<IdGame>(
  {
    phien: {
      type: Schema.Types.Mixed,
      required: true,
    },
    TeamA: {
      type: Schema.Types.Mixed,
      required: true,
    },
    TeamB: {
      type: Schema.Types.Mixed,
      required: true,
    },
    time: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }, // Automatically adds the createdAt and updatedAt fields
);

export default mongoose.model<IdGame>('Game', GameSchema);
