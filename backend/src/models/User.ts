import { ObjectId } from "mongodb";
import mongoose from "mongoose";

let User = new mongoose.Schema(
    {
        _id: ObjectId,
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        address: String,
        phone: String,
        email: String,
        avatarImagePath: String,
        role: String,
        registeredSuccessfully: Boolean,
        blocked: Boolean
    }
)

export default mongoose.model('UserModel', User, 'users')