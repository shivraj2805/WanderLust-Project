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

            reserve: Joi.boolean().default(false).messages({
                'boolean.base': 'Reserved must be a boolean value.',
            }),
            // Make sure to validate the reservations as an array of user IDs
            reservations: Joi.array().items(Joi.string().hex().length(24)).default([]), // An array of 24-character hex strings (ObjectIds)
            reservedBy: Joi.string().optional().allow(null), // Allow `reservedBy` to be a string (user ID), and null when not reserved
    }).required(),
    
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required()
});
