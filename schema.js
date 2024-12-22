const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string()
            .valid(
                'Trending',
                'Rooms',
                'Iconic Cities',
                'Mountains',
                'Castles',
                'Amazing Pools',
                'Camping',
                'Farms',
                'Arctic',
                'Domes',
                'Boats'
            )
            .required(), // Ensure the category field is required and has valid values
     'image.url': Joi.string()
            .uri()
            .empty('') // Empty string ko undefined karein
            .default('https://example.com/default-image.jpg'),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required()
});
