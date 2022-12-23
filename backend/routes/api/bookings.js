const express = require('express');
const router = express.Router();
const { Spot, Review, Booking, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

router.get('/current', requireAuth, async (req, res) => {
    const Bookings = await Booking.findAll({
        where: {
            userId: req.user.id
        },
        include: {
            model: Spot,
            attributes: {
                exclude: ['updatedAt', 'createdAt']
            }
        }
    });
    for (let spot of Bookings) {
        const foundImg = await SpotImage.findByPk(spot.dataValues.Spot.id);
        spot.dataValues.Spot.dataValues.previewImage = foundImg.url;
    }
    res.json({ Bookings });
});

router.put('/:bookingId', requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body;
    const endDateCheck = new Date(`${endDate}`);
    const startDateCheck = new Date(`${startDate}`);
    const allDates = await Booking.findAll({
        attributes: ['startDate', 'endDate']
    });
    if (endDateCheck.getTime() <= startDateCheck.getTime()) {
        res.statusCode = 400;
        res.json({ message: "Validation error", endDate: "endDate cannot be on or before startDate" })
    };
    if (endDateCheck.getTime() < Date.now() || startDateCheck.getTime() < Date.now()) {
        res.statusCode = 403;
        res.json({
            "message": "Past bookings can't be modified",
            "statusCode": 403
        });
    };
    for (let booking of allDates) {
        const dateObjs = booking.dataValues;
        if (startDateCheck.getTime() === new Date(`${dateObjs.startDate}`).getTime()) {
            res.statusCode = 403;
            res.json({ "message": "Sorry, this spot is already booked for the specified dates", startDate: "Start date conflicts with an existing booking" })
        }
        if (endDateCheck.getTime() === new Date(`${dateObjs.endDate}`).getTime()) {
            res.statusCode = 403;
            res.json({ "message": "Sorry, this spot is already booked for the specified dates", startDate: "End date conflicts with an existing booking" })
        }
    };
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
