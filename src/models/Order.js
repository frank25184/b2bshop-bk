"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Product = require('./Product');

const orderSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    billingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        company: { type: String },
        country: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        street: { type: String, required: true },
        postcode: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    additionalInfo: {
        notes: { type: String },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'credit_card', 'paypal', 'unknown'],
            default: 'unknown'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { 
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at' 
    }
});

// 处理订单时间格式
orderSchema.methods.formatTime = function(time) {
    return new Date(time).toISOString().split('T')[0];
};

// 订单对象处理函数
orderSchema.methods.processOrder = function(order) {
    return {
        _id: order._id,
        user: order.user,
        items: order.items.map(item => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            total: item.quantity * item.price
        })),
        totalAmount: order.totalAmount,
        billingAddress: order.billingAddress,
        additionalInfo: order.additionalInfo,
        status: order.status,
        created_at: this.formatTime(order.created_at),
        updated_at: this.formatTime(order.updated_at)
    };
};

module.exports = mongoose.model('Order', orderSchema);