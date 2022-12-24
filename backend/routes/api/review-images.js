const express = require('express');
const router = express.Router();
const { Spot, Review, Booking, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

router.delete('/:imageId', requireAuth, async (req, res) => {
    let foundImg = await ReviewImage.findByPk(req.params.imageId);
    const foundReview = await Review.findByPk(foundImg.dataValues.reviewId);
    foundImg = foundImg.toJSON()
    if (foundImg[0] && foundReview.userId === req.user.id) {
        await foundImg.destroy();
        res.statusCode = 200;
        res.json({
            "message": "Successfully deleted",
            "statusCode": 200
        })
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Review Image couldn't be found",
            "statusCode": 404
        })
    }
});

module.exports = router;
