import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'user' | 'assistant' | 'system';

export interface MessageDocument extends Document {
  chatSessionId: mongoose.Types.ObjectId;
  role: Role;
  content: string;
  tokenCount?: number;
  createdAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    chatSessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    tokenCount: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<MessageDocument>('Message', MessageSchema);
