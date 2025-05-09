import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        unique: true,
    },
    items: [
        {
            name: {type:String, required:true},
            quantity: {type:Number, required: true},
            pricePerItem: {type:Number, required: true},
            totalPrice: {type:Number, required: true}
        }
    ],
    buyer: {
        type:String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})

export const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);