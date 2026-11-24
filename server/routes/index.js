// Single entry point mounted at /api by server.js.
const router = require('express').Router();

// Register the Amenity model up front: it is only referenced by `ref` strings,
// so Mongoose would otherwise not know it when populating hotels/rooms.
require('../models/Amenity');

router.use('/auth', require('./auth.routes'));
router.use('/hotels', require('./hotel.routes'));
router.use('/rooms', require('./room.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
