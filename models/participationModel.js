import mongoose from "mongoose";
import User from "./userModel.js";
import Challenge from "./challengeModel.js";

const participationSchema = new mongoose.Schema({
    user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true
    },
    challenge: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Challenge",
       required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;