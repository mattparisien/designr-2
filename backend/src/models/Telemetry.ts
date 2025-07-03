import mongoose, { Document, Schema } from 'mongoose';

export interface ITelemetry extends Document {
  userId?: mongoose.Types.ObjectId;
  event: string;
  data: Record<string, unknown>;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const telemetrySchema = new Schema<ITelemetry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  event: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Telemetry = mongoose.model<ITelemetry>('Telemetry', telemetrySchema);
