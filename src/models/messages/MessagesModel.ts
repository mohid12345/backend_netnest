import { model, Schema } from 'mongoose'
import {MessageDocument} from './MessagesTypes'

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    attachment: {
      type: {
        type: String,
        enum: ['image', 'video', 'file','audio'],
      },
      url: String,
      filename: String,
      size: Number,
    },
    isRead: {
      type:Boolean,
      default:false
    },
    isDeleted: {
      type:Boolean,
      default:false
    },
    sharedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  {timestamps: true}
);

const Message = model<MessageDocument>('Message', MessageSchema)
export default Message