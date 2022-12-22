const express = require('express');
const router = express.Router();
const { Spot, Review, Booking, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

const validation = [
    check('startDate')
        .isAfter()
        .withMessage("Start date conflicts with an existing booking"),
    check('endDate')
        .isBefore('startDate')
        .withMessage("endDate cannot come before startDate"),
    handleValidationErrors
];

router.put('/:bookingId', requireAuth, validation, async (req, res) => {
    const { startDate, endDate } = req.body;
    const endDateCheck = new Date(`${endDate}`);
    if (endDateCheck.getTime() < Date.now()) {
        res.statusCode = 403;
        res.json({
            "message": "Past bookings can't be modified",
            "statusCode": 403
        });
    }
    const foundBooking = await Booking.findByPk(req.params.bookingId);
    if (foundBooking && foundBooking.userId === req.user.id) {
        await foundBooking.update({
            startDate: startDate,
            endDate: endDate
        });
        res.json(foundBooking);
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Booking couldn't be found",
            "statusCode": 404
        });
    }
});

router.delete('/:bookingId', requireAuth, async (req, res) => {
    const foundBooking = await Booking.findByPk(req.params.bookingId);
    const bookingDate = new Date(`${foundBooking.dataValues.startDate}`);
    console.log(bookingDate.getTime(), Date.now());
    if (foundBooking && foundBooking.userId === req.user.id) {
        if (bookingDate.getTime() > Date.now()) {
            await foundBooking.destroy();
            res.statusCode = 200;
            res.json({
                "message": "Successfully deleted",
                "statusCode": 200
            });
        } else {
            res.statusCode = 403;
            res.json({
                "message": "Bookings that have been started can't be deleted",
                "statusCode": 403
            });
        }
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Booking couldn't be found",
            "statusCode": 404
        });
    }
});

module.exports = router;
