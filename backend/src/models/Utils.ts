import mongoose, { Schema } from 'mongoose'

let Utils = new mongoose.Schema(
    {
        tag: String,
        data: Schema.Types.Mixed
    }
)

export default mongoose.model('UtilsModel', Utils, 'utils')