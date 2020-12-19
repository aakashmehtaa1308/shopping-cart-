const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/isAdmin');


const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, isAdmin, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/addProduct',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
  ],
  isAuth, isAdmin,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);

router.post(
  '/editProduct',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    
    
  ],
  isAuth, isAdmin,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, isAdmin, adminController.deleteProduct);

router.get('/orders', isAuth, isAdmin, adminController.getAllOrders);

router.post('/order/status',isAuth, isAdmin, adminController.getOrderStatus);

module.exports = router;
