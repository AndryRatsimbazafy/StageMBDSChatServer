import * as crypto from "crypto";
import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Veuillez utiliser au moins 2 caractères"],
            maxlength: [
                50,
                "Le nombre maximum de caractères autorisé est de 50 caractères",
            ],
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Veuillez utiliser au moins 2 caractères"],
            maxlength: [
                50,
                "Le nombre maximum de caractères autorisé est de 50 caractères",
            ],
        },
        phoneNumber: {
            type: String,
        },
        postalCode: {
            type: String,
        },
        projects: {
            type: [String],
        },
        password: {
            type: String,
            required: true,
            select: false,
            trim: true,
            minlength: [6, "Veuillez utiliser au moins 6 caratères"],
        },
        role: {
            type: String,
            default: "visiteur",
            enum: ["admin", "visiteur", "exposant", "commercial"],
        },
        active: {
            type: Boolean,
            default: true,
        },
        companyName: {
            type: String,
            default: "visiteur",
            trim: true,
        },
        standNumber: {
            type: Number,
            default: 301,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email non valide",
            ],
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        connected: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        contact: {
            type: [Schema.Types.ObjectId],
            ref: "users",
            required: false,
        },
        updatedAt: {
            type: Date,
            required: false,
        },
    },
    { _id: true }
);

export default mongoose.model("users", UserSchema);
