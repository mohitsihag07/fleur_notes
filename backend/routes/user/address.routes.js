const express = require('express');
const router = express.Router();
const userAddressController = require('../../controller/user/address.controller');
const { authentication } = require('../../middleware/auth');

router.get('/', authentication, userAddressController.getAddresses);
router.post('/add', authentication, userAddressController.addAddress);
router.delete('/delete/:id', authentication, userAddressController.deleteAddress);

module.exports = router;
