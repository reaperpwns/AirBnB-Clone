// GET all spots
const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

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

router.get('/current', requireAuth, async (req, res) => {
    const Spots = await Spot.findAll({
        where: {
            ownerId: req.user.id
        }
    });
    for (const spot of Spots) {
        const spotImg = await SpotImage.findOne({
            where: {
                spotId: spot.dataValues.id
            }
        });
        const spotRating = await Review.findOne({
            where: {
                spotId: spot.dataValues.id
            }
        });
        spot.dataValues.avgRating = spotRating.dataValues.stars
        spot.dataValues.previewImage = spotImg.dataValues.url
    }
    res.json({ Spots });
})

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
    const { count, rows } = await Review.findAndCountAll({
        where: {
            spotId: req.params.spotId
        }
    })
    const foundSpot = await Spot.findByPk(req.params.spotId, {
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
    if (foundSpot) {
        foundSpot.dataValues.numReviews = count;
        foundSpot.dataValues.avgStarRating = rows[0].dataValues.stars;
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
    const errors = {
        page: "Page must be greater than or equal to 1",
        size: "Size must be greater than or equal to 1",
        maxLat: "Maximum latitude is invalid",
        minLat: "Minimum latitude is invalid",
        minLng: "Maximum longitude is invalid",
        maxLng: "Minimum longitude is invalid",
        minPrice: "Maximum price must be greater than or equal to 0",
        maxPrice: "Minimum price must be greater than or equal to 0"
    };

    page = parseInt(page);
    size = parseInt(size);
    maxLat = parseFloat(maxLat);
    minLat = parseFloat(minLat);
    minLng = parseFloat(minLng);
    maxLng = parseFloat(maxLng);
    minPrice = parseInt(minPrice);
    maxPrice = parseInt(maxPrice);

    console.log(maxLat)

    if (Number.isNaN(page)) page = 1;
    if (Number.isNaN(size)) size = 20;
    // if (page < 1) {
    //     res.statusCode = 400;
    //     res.json({
    //         message: "Validation Error",
    //         statusCode: 400,
    //         error: errors.page
    //     })
    // };
    // if (size < 1) {
    //     res.statusCode = 400;
    //     res.json({
    //         message: "Validation Error",
    //         statusCode: 400,
    //         error: errors.size
    //     })
    // };
    // if (maxLat) {
    //     if (Number.isNaN(maxLat)) {
    //         res.statusCode = 400;
    //         res.json({
    //             message: "Validation Error",
    //             statusCode: 400,
    //             error: errors.maxLat
    //         })
    //     };
    // }
    // if (Number.isNaN(minLat)) {
    //     res.statusCode = 400;
    //     res.json({
    //         message: "Validation Error",
    //         statusCode: 400,
    //         error: errors.minLat
    //     })
    // };
    // if (minLng && minLng === '') {
    //     res.statusCode = 400;
    //     res.json({
    //         message: "Validation Error",
    //         statusCode: 400,
    //         error: errors.minLng
    //     })
    // };
    // if (maxLng && maxLng === '') {
    //     res.statusCode = 400;
    //     res.json({
    //         message: "Validation Error",
    //         statusCode: 400,
    //         error: errors.maxLng
    //     })
    // };
    if (page > 10) size = 10;
    if (size > 20) size = 20;

    const Spots = await Spot.findAll({
        limit: size,
        offset: (page - 1) * size
    });
    for (const spot of Spots) {
        const spotImg = await SpotImage.findOne({
            where: {
                spotId: spot.dataValues.id
            }
        });
        const spotRating = await Review.findOne({
            where: {
                spotId: spot.dataValues.id
            }
        });
        spot.dataValues.avgRating = spotRating.dataValues.stars
        spot.dataValues.previewImage = spotImg.dataValues.url
    }
    res.json({ Spots, page, size });
});

module.exports = router;
