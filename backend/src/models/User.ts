import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isProUser: boolean;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  isProUser: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: {
    type: String
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
