const express = require('express');
const router = express.Router();
const { Spot, Review, Booking, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

router.delete('/:imageId', requireAuth, async (req, res) => {
    let foundImg = await ReviewImage.findByPk(req.params.imageId);
    const newImg = foundImg.toJSON();
    const foundReview = await Review.findByPk(newImg[0].reviewId);
    if (newImg[0] && foundReview.userId === req.user.id) {
        await foundImg.destroy();
        res.statusCode = 200;
        return res.json({
            "message": "Successfully deleted",
            "statusCode": 200
        })
    } else {
        res.statusCode = 404;
        return res.json({
            "message": "Review Image couldn't be found",
            "statusCode": 404
        })
    }
});

module.exports = router;
