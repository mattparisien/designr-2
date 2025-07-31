import mongoose, { Schema, Document } from 'mongoose';

export interface ChatSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  aiModel: string; // renamed from model
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<ChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, default: 'New Chat' },
    aiModel: { type: String, default: 'gpt-4' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true }
);


export default mongoose.model<ChatSessionDocument>('ChatSession', ChatSessionSchema);
