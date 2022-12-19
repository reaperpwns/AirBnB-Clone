// GET all spots
const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User } = require('../../db/models');
const user = require('../../db/models/user');

router.post('/', async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const ownerId = await User.findOne({});
    const newSpot = await Spot.create({
        ownerId: ownerId.id,
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
    res.json(newSpot);
});

router.get('/', async (req, res) => {
    const allSpots = await Spot.findAll();
    res.json(allSpots);
});

module.exports = router;
