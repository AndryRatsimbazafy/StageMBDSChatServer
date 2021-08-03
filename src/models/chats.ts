import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let ChatsSchema = new Schema(
    {
        content: String,
        from: String,
        to: String,
        urlMatches: [String],
        upperDate: String,
        files: [String],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

export default mongoose.model("chats", ChatsSchema);
