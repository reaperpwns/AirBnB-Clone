// GET all spots
const express = require('express');
const router = express.Router();
const { Spot, Review, Booking, SpotImage, ReviewImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');

const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage("Country is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .withMessage("Latitude is not valid"),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage("Longitude is not valid"),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check('price')
        .exists({ checkFalsy: true })
        .withMessage("Price per day is required"),
    handleValidationErrors
];

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage("Review text is required"),
    check('stars')
        .exists({ checkFalsy: true })
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
];

router.get('/current', requireAuth, async (req, res) => {
    const Spots = [];
    const spotArr = await Spot.findAll({
        where: {
            ownerId: req.user.id
        },
        include: [{
            model: Review
        },
        {
            model: SpotImage
        }]
    });
    spotArr.forEach(spot => {
        Spots.push(spot.toJSON())
    })
    Spots.forEach(spot => {
        spot.Reviews.forEach(review => {
            if (review.stars) {
                spot.avgRating = review.stars
            }
        });
        spot.SpotImages.forEach(image => {
            if (image.url) {
                spot.previewImage = image.url
            }
        })
        delete spot.Reviews
        delete spot.SpotImages
    });
    res.json({ Spots });
});

router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const foundSpot = await Spot.findByPk(+req.params.spotId);
    if (foundSpot) {
        if (+foundSpot.ownerId === +req.user.id) {
            const Bookings = await Booking.findAll({
                where: {
                    userId: foundSpot.ownerId
                },
                include: {
                    model: User.scope('owner')
                }
            });
            res.statusCode = 200;
            res.json({ Bookings });
        } else {
            const Bookings = await Booking.findAll({
                where: {
                    userId: +foundSpot.ownerId
                },
                attributes: {
                    exclude: ['id', 'userId', 'createdAt', 'updatedAt']
                }
            });
            res.json({ Bookings })
        }
    } else {
        res.statusCode = 404;
        res.json({ message: "Spot couldn't be found", statusCode: 404 });
    }
});

router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body;
    const endDateCheck = new Date(`${endDate}`);
    const startDateCheck = new Date(`${startDate}`);
    const foundSpot = await Spot.findByPk(req.params.spotId);
    const allDates = await Booking.findAll({
        attributes: ['startDate', 'endDate']
    });
    if (endDateCheck.getTime() <= startDateCheck.getTime()) {
        res.statusCode = 400;
        res.json({ message: "Validation error", endDate: "endDate cannot be on or before startDate" })
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
    if (foundSpot && foundSpot.ownerId !== req.user.id) {
        const newBooking = await Booking.create({
            spotId: foundSpot.id,
            userId: req.user.id,
            startDate: startDate,
            endDate: endDate
        });
        res.json(newBooking)
    } else {
        res.statusCode = 404;
        res.json({
            message: "Spot couldn't be found",
            statusCode: 404
        });
    };
});

router.get('/:spotId/reviews', requireAuth, async (req, res) => {
    const foundSpot = await Spot.findByPk(req.params.spotId)
    if (foundSpot) {
        const Reviews = await Review.findAll({
            where: {
                spotId: req.params.spotId
            },
            include: [
                {
                    model: User.scope('owner')
                },
                {
                    model: ReviewImage.scope('clean')
                }]
        });
        res.statusCode = 200;
        res.json({ Reviews });
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        });
    }
});


router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
    const { review, stars } = req.body;
    const foundSpot = await Spot.findByPk(req.params.spotId);
    const userReviews = await Review.findAll({
        where: {
            spotId: req.params.spotId
        }
    })
    if (foundSpot) {
        for (let reviews of userReviews) {
            if (reviews.dataValues.userId === req.user.id) {
                res.statusCode = 403;
                return res.json({
                    "message": "User already has a review for this spot",
                    "statusCode": 403
                });
            }
        }
        const newReview = await Review.create({
            userId: req.user.id,
            spotId: +req.params.spotId,
            review: review,
            stars: stars
        });
        return res.json(newReview);
    } else {
        res.statusCode = 404;
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        });
    }
});

router.post('/:spotId/images', requireAuth, async (req, res) => {
    const { id, url, preview } = req.body;
    const foundSpot = await Spot.findByPk(req.params.spotId);
    if (foundSpot && foundSpot.ownerId === req.user.id) {
        const newSpotImg = await SpotImage.create({
            url: url,
            preview: preview
        })
        res.json(newSpotImg.toSafeObject());
    } else {
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }
});

router.get('/:spotId', async (req, res) => {
    const foundSpot = [];
    const rowArr = [];
    const { count, rows } = await Review.findAndCountAll({
        where: {
            spotId: req.params.spotId
        }
    })
    const foundSpotArr = await Spot.findAll({
        where: {
            id: req.params.spotId
        },
        include: [
            {
                model: SpotImage.scope('clean'),
                spotId: req.params.spotId
            },
            {
                model: User.scope('owner'),
                as: 'Owner',
            }],
    });
    foundSpotArr.forEach(spot => {
        foundSpot.push(spot.toJSON());
    });
    rows.forEach(row => {
        rowArr.push(row.toJSON())
    })
    if (foundSpot) {
        foundSpot[0].numReviews = count
        foundSpot[0].avgStarRating = rowArr[0].stars
        res.json(foundSpot);
    } else {
        res.statusCode = 404;
        res.json({ message: "Spot couldn't be found", statusCode: 404 })
    }
});

router.put('/:spotId', requireAuth, validateSpot, async (req, res,) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const foundSpot = await Spot.findByPk(req.params.spotId);
    if (foundSpot && foundSpot.ownerId === req.user.id) {
        await foundSpot.update({
            ownerId: req.user.id,
            address: address,
            city: city,
            state: state,
            country: country,
            lat: lat,
            lng: lng,
            name: name,
            description: description,
            price: price
        })
        res.json(foundSpot)
    } else {
        res.statusCode = 404;
        res.json({ message: "Spot couldn't be found", "statusCode": 404 })
    }
});

router.delete('/:spotId', requireAuth, async (req, res) => {
    const foundSpot = await Spot.findByPk(req.params.spotId);
    if (foundSpot && foundSpot.ownerId === req.user.id) {
        await foundSpot.destroy();
        res.json({
            "message": "Successfully deleted",
            "statusCode": 200
        })
    } else {
        res.statusCode = 404;
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }
});

router.post('/', requireAuth, validateSpot, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
    });
    return res.json(newSpot);
});

router.get('/', handleValidationErrors, async (req, res, next) => {
    let { page, size, maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    const where = {};

    if (page) {
        if (page < 1 || isNaN(page)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Page must be greater than or equal to 1"
            })
        } if (page > 10) page = 10;
    } else {
        page = 1;
    };
    if (size) {
        if (size < 1 || isNaN(size)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Size must be greater than or equal to 1"
            });
        } else {
            if (size > 20) size = 20;
        }
    } else {
        size = 20;
    }
    if (maxLat) {
        if (isNaN(maxLat)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Maximum latitude is invalid"
            });
        } if (maxLat < minLat) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Maximum latitude is invalid"
            });
        } if (!where.maxLat) where.lat = {};
        where.lat[Op.lte] = maxLat
    }
    if (minLat) {
        if (isNaN(minLat)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Minimum latitude is invalid"
            });
        } if (!where.minLat) where.lat = {};
        where.lat[Op.gte] = minLat
    };
    if (minLng) {
        if (isNaN(minLng)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Minimum longitude is invalid"
            });
        } if (!where.lng) where.lng = {};
        where.lng[Op.gte] = minLng;
    };
    if (maxLng) {
        if (isNaN(maxLng)) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Maximum longitude is invalid"
            })
        } if (!where.lng) where.lng = {};
        where.lng[Op.lte] = maxLng;
    };
    if (minPrice) {
        if (isNaN(minPrice) || minPrice < 1) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Minimum price must be greater than or equal to 0"
            });
        } if (!where.price) where.price = {};
        where.price[Op.gte] = minPrice
    };
    if (maxPrice) {
        if (isNaN(maxPrice) || maxPrice < 1) {
            res.statusCode = 400;
            res.json({
                message: "Validation Error",
                statusCode: 400,
                error: "Maximum price must be greater than or equal to 0"
            });
        } if (!where.price) where.price = {};
        where.price[Op.lte] = maxPrice
    };

    const spotArr = await Spot.findAll({
        where,
        include: [{
            model: SpotImage
        }, {
            model: Review
        }],
        limit: size,
        offset: (page - 1) * size
    });
    const Spots = [];
    spotArr.forEach(spot => {
        Spots.push(spot.toJSON());
    })
    Spots.forEach(spot => {
        spot.Reviews.forEach(review => {
            if (review.stars) {
                spot.avgRating = review.stars
            }
        });
        spot.SpotImages.forEach(image => {
            if (image.url) {
                spot.previewImage = image.url
            }
        });
        delete spot.Reviews;
        delete spot.SpotImages;
    });
    page = +page;
    size = +size;
    res.json({ Spots, page, size });
});

module.exports = router;
