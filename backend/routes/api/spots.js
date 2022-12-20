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

router.post('/:spotId/images', requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const foundSpot = await Spot.findByPk(req.params.spotId);
    if (foundSpot && foundSpot.ownerId === req.user.id) {
        const newSpotImg = await SpotImage.create({
            url: url,
            preview: preview
        })
        res.json(newSpotImg);
    } else {
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }
})

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
})

router.delete('/:spotId', requireAuth, async (req, res) => {
    const foundSpot = await Spot.findByPk(req.params.spotId);
    logging: console.log(foundSpot)
    if (foundSpot && foundSpot.ownerId === req.user.id) {
        await foundSpot.destroy();
        res.json({
            "message": "Successfully deleted",
            "statusCode": 200
        })
    } else {
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }
})

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

router.get('/', async (req, res) => {
    const allSpots = await Spot.findAll();
    res.json(allSpots);
});

module.exports = router;
