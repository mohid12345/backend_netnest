import { Document, Schema, Types } from "mongoose";

interface ReportInterface extends Document {
  userId:  Types.ObjectId;
  postId: Types.ObjectId;
  reason: string;
  reasonType: string;
}

export default ReportInterface