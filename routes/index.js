const router = require('express').Router();
const userRoutes = require('./userRoutes');
const subscriberRoutes = require('./subscriberRoutes');
const courseRoutes = require('./courseRoutes');
const homeRoutes = require('./homeRoutes');
const errorRoutes = require('./errorRoutes');
const apiRoutes = require('./apiRoutes');

router.use('/users', userRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/courses', courseRoutes);
router.use('/api', apiRoutes);
router.use('/', homeRoutes);
router.use('/', errorRoutes);


module.exports = router;