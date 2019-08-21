import { Document, model, Schema, SchemaTypes } from 'mongoose';

export enum UserKind {
  Admin = 'admin',
  Normal = 'normal',
}
export enum AuthType {
  Twitter = 'twitter',
}

export interface UserDocument extends Document {
  userId: string;
  type: AuthType;
  token: string;
  tokenSecret: string;
  screenName: string;
  iconUrl?: string;
  kind: UserKind;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<UserDocument>(
  {
    userId: {
      type: SchemaTypes.String,
      required: true,
    },
    type: {
      type: SchemaTypes.String,
      enum: Object.values(AuthType),
      required: true,
      default: AuthType.Twitter,
    },
    token: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    tokenSecret: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    screenName: {
      type: SchemaTypes.String,
      required: true,
      default: '',
    },
    iconUrl: SchemaTypes.String,
    kind: {
      type: SchemaTypes.String,
      enum: Object.values(UserKind),
      required: true,
      default: UserKind.Normal,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ type: 1, userId: 1 }, { unique: true });

export const User = model<UserDocument>('User', schema);
