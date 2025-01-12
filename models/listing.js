const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { boolean } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
    },
    description: String,
     image: {
        url: {
           type:String,
        },
        filename: {
            type:String,
        },
       
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner :{
        type:Schema.Types.ObjectId,
        ref: "User",
    },
    category:{
        type : String ,
        enum: ["Trending","Rooms","Iconic Cities","Mountains","Castles","Amazing Pools","Camping","Farms","Arctic","Domes","Boats"],
    },
    reserve: { type: Boolean, default: false },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Add reservedBy field
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    }

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;