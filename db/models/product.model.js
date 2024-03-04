
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*const CategorySchema = new Schema({
    name: { type: String, index:true },
    image:{ type: String, required: true},
    isDeleted: { type: Boolean, default:true},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});*/

/*const Slider1Schema = new Schema({
    image: { type: String,default:'', index:true },
    title: { type: String,default:'', index:true },
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean,default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});*/

/*const Slider2Schema = new Schema({
    
    image: { type: String,default:'', index:true },
    title: { type: String,default:'', index:true },
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean,default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }

});*/

/*const ProductSchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String,default:'', index:true },
    name: { type: String,default:'', index:true },
    price: { type: Number, default: 0},
    unit: {type: String,enum: ["Kg", "Gram", "Piece"]},
    quantity: {type: Number,default: 0},
    discount: {type: Number,default: 0},
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean,default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});*/

/* ProductSchema.index({ _id: 1 }, { unique: true }); */
/* ProductSchema.index({ categoryId: 1 }); */

/*const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1},
    qty: { type: Number, default:1},
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean,default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});*/


/*const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    totalCost: { type: Number, default: 0},
    finalCost:{ type: Number, default: 0},
    totalDiscount:{ type: Number, default: 0},
    isPaid: { type: String, default: 'COD'},
    status: { type: Number, default: 1},
    txn_id: { type: String, default:''},
    ord_id:{ type: String, default:'Order-00000001'},
    items:[{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        image: { type: String,default:'', index:true },
        quantity: { type: Number, default:1},
        qty: { type: Number, default:1},
        price: { type: Number,default:0},
        name: { type: String, default:''},
        discount: { type: Number, default:0}
    }],
    isDeleted: {type: Boolean, default: false},
    isCanceled: {type: Boolean,default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});*/


/*const Category = mongoose.model('Category', CategorySchema);
const Slider1 = mongoose.model('Slider1', Slider1Schema);
const Slider2 = mongoose.model('Slider2', Slider2Schema);
const Product = mongoose.model('Product', ProductSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);*/

/*module.exports = { Category, Slider1, Slider2,Product,Cart,Order };*/
