import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const postSchema = new Schema(
    {
        
        idUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title:{
            type: String,
            required: true
        },
        content:{
            type: String
        },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]  ,
        imagePost: {
            publicId: {
                type: String,
            },
            secureUrl: {
                type: String,
            },
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)
postSchema.plugin(mongoosePaginate)
export default model("Post", postSchema);