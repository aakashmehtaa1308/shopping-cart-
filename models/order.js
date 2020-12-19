const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  paymentType: {
    type: String,
    default: 'COD'
  },
  status: {
    type: String,
    default: 'placed'
  },
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  }
}, {timestamps: true});

module.exports = mongoose.model('order', OrderSchema);

// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Order = sequelize.define('Order', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
// });
// module.exports = Order;
