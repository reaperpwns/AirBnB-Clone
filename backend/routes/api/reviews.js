const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

const validation = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage("Review text is required"),
    check('stars')
        .exists({ checkFalsy: true })
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
];

router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const { url } = req.body;
    const foundReview = await Review.findByPk(req.params.reviewId);
    const { count, rows } = await ReviewImage.findAndCountAll({
        where: {
            reviewId: req.params.reviewId
        }
    })
    console.log(count)
    if (count > 10) {
        res.statusCode = 403;
        res.json({
            "message": "Maximum number of images for this resource was reached",
            "statusCode": 403
        });
    } if (foundReview && req.user.id === foundReview.userId) {
        const newImage = await ReviewImage.create({
            reviewId: foundReview.id,
            url: url
        });
        const foundImg = await ReviewImage.scope('clean').findByPk(newImage.id)
        res.json(foundImg);
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Review couldn't be found",
            "statusCode": 404
        });
    }
});

router.put('/:reviewId', requireAuth, validation, async (req, res) => {
    const { review, stars } = req.body;
    const foundReview = await Review.findByPk(req.params.reviewId);
    if (foundReview && req.user.id === foundReview.userId) {
        await foundReview.update({
            review: review,
            stars: stars
        });
        res.json(foundReview);
    } else {
        res.statusCode = 400;
        res.json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }
});

router.delete('/:reviewId', requireAuth, async (req, res) => {
    const foundReview = await Review.findByPk(req.params.reviewId);
    if (foundReview && req.user.id === foundReview.userId) {
        await foundReview.destroy();
        res.json({
            "message": "Successfully deleted",
            "statusCode": 200
        })
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Review couldn't be found",
            "statusCode": 404
        })
    }
});

router.get('/current', requireAuth, async (req, res) => {
    const Reviews = await Review.findAll({
        where: {
            userId: req.user.id
        },
        include: [{
            model: User.scope('owner')
        },
        {
            model: Spot,
            attributes: { exclude: ['description', 'updatedAt', 'createdAt'] }
        },
        {
            model: ReviewImage.scope('clean')
        }],
    });
    for (const Review of Reviews) {
        const imageUrl = await SpotImage.findOne({
            where: {
                spotId: Review.dataValues.Spot.id
            }
        })
        Review.dataValues.Spot.dataValues.previewImage = imageUrl.url
    }
    res.json({ Reviews });
});

module.exports = router;
