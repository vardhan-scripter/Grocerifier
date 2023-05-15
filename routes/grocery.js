const express = require('express');
const router = express.Router();
const GroceryItem = require('../models/GroceryItem');
const passport= require('passport');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

//@type: POST
//@path: /api/grocery/addItem
//@access: PRIVATE
//@description: Adding grocery Item
router.post('/addItem', passport.authenticate('jwt', {session: false}), (req, res) => {
    GroceryItem.findOne({name: req.body.name}).then(item => {
        if(item){
            res.status(400).json({errorMessage: 'Item with same name already exists'});
        }else{
            const newGroceryItem = GroceryItem({
                name: req.body.name,
                description: req.body.description,
                availableCount: req.body.availableCount,
                price: req.body.price,
                rating: req.body.rating
            });
            newGroceryItem.save().then(success => {
                res.status(200).json({message: 'Grocery Item added successfully'});
            }).catch(err => {
                res.status(500).status({errorMessage: "Internal server error"});
            })
        }
    }).catch(err => {
        res.status(500).status({errorMessage: "Internal server error"});
    })
})

//@type: GET
//@path: /api/grocery/all
//@access: PRIVATE
//@description: Get all grocery Items
router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
    GroceryItem.find({}, "-__v").then(items => {
        res.status(200).json({
            Items: items
        })
    }).catch(err => {
        res.status(500).status({errorMessage: "Internal server error"});
    })
})

//@type: POST
//@path: /api/grocery/cart/add
//@access: PRIVATE
//@description: Add grocery Item to cart
router.post('/cart/add', passport.authenticate('jwt', {session: false}), (req, res) => {
    GroceryItem.findById(req.body.productId).then(item => {
        if(item.availableCount < +req.body.count){
            res.status(404).json({
                errorMessage: "Requested count of Items not available in groceries list"
            })
        }else{
            Cart.findOne({emailId: req.user.email}, "-__v").then(cart => {
                if(!cart){
                    const cart = Cart({
                        emailId: req.user.email,
                        items: [
                            {
                                productId: req.body.productId,
                                count: +req.body.count
                            }
                        ],
                        total: +req.body.count * item.price
                    });
                    cart.save().then(updatedCart => {
                        item.availableCount -= +req.body.count;
                        item.save().then(sucess => {
                            res.status(200).json({
                                message: "Grocery Item added to cart successfully",
                                cart: updatedCart
                            })
                        }).catch(err => {
                            throw err;
                        })
                    }).catch(err => {
                        throw err;
                    })
                }else{
                    let total = cart.total;
                    let cartItems = cart.items;
                    const filterItem = cart.items.filter(cartItem => cartItem.productId === req.body.productId);
                    if(!filterItem.length){
                        cartItems.push({
                            productId: req.body.productId,
                            count: +req.body.count
                        });
                        total += (+req.body.count * item.price);
                    }
                    else{
                        cartItems = cartItems.map(cartItem => {
                            if(cartItem.productId === req.body.productId){
                                cartItem.count += +req.body.count;
                                // Updating total with updated grocery Item count in cart
                                total += (+req.body.count * item.price);
                            }
                            return cartItem;
                        });
                    }
                    cart.items = cartItems;
                    cart.total = total;
                    cart.save().then(updatedCart => {
                        item.availableCount -= +req.body.count;
                        item.save().then(sucess => {
                            res.status(200).json({
                                message: "Grocery Item added to cart successfully",
                                cart: updatedCart
                            })
                        }).catch(err => {
                            throw err;
                        })
                    }).catch(err => {
                        throw err;
                    })
                }
            })
        }
    }).catch(err => {
        res.status(500).status({errorMessage: "Internal server error"});
    })
})

//@type: GET
//@path: /api/grocery/cart
//@access: PRIVATE
//@description: Get Cart details for LoggedIn User
router.get('/cart', passport.authenticate('jwt', {session: false}), (req, res) => {
    Cart.findOne({emailId: req.user.email}, "-__v").then(cart => {
        if(!cart){
            res.status(200).json({
                success: false,
                message: "No active cart found for LoggedIn user"
            })
        }else{
            res.status(200).json({
                success: true,
                cart: cart
            })
        }
    }).catch(err => {
        res.status(500).status({errorMessage: "Internal server error"});
    })
})

//@path: /api/grocery/cart/remove
//@access: PRIVATE
//@description: Remove grocery Item to cart
router.post('/cart/remove', passport.authenticate('jwt', {session: false}), (req, res) => {
    GroceryItem.findById(req.body.productId).then(item => {
        Cart.findOne({emailId: req.user.email}, "-__v").then(cart => {
            if(!cart){
                res.status(404).json({
                    message: "No cart found on username"
                })
            }else{
                const filterItem = cart.items.filter(cartItem => cartItem.productId === req.body.productId);
                    if(!filterItem.length){
                        res.status(404).json({
                            message: "No item found on cart"
                        })
                    }else if (filterItem[0].count < req.body.count){
                        res.status(404).json({
                            message: "Requested count is more than available count in cart"
                        })
                    }else{
                      let total = cart.total;
                      let cartItems = cart.items.map((cartItem) => {
                        if (cartItem.productId === req.body.productId) {
                          // Removing existing grocery Item total
                          total -= cartItem.count * item.price;
                          if (cartItem.count > +req.body.count)
                            cartItem.count -= +req.body.count;
                          else cartItem.count = 0;
                          // Updating total with updated grocery Item count in cart
                          total += cartItem.count * item.price;
                        }
                        return cartItem;
                      });
                      cart.items = cartItems.filter(
                        (cartItem) => cartItem.count > 0
                      );
                      cart.total = total;
                      cart
                        .save()
                        .then((updatedCart) => {
                          item.availableCount += +req.body.count;
                          item
                            .save()
                            .then((sucess) => {
                              res.status(200).json({
                                message:
                                  "Grocery Item added to cart successfully",
                                cart: updatedCart,
                              });
                            })
                            .catch((err) => {
                              throw err;
                            });
                        })
                        .catch((err) => {
                          throw err;
                        });
                    }
            }
        })
    }).catch(err => {
        res.status(500).status({errorMessage: "Internal server error"});
    })
})

//@type: POST
//@path: /api/grocery/order
//@access: PRIVATE
//@description: Confirm Order for LoggedIn User with current active cart
router.post('/order', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
      const cart = await Cart.findOne({ emailId: req.user.email }, "-__v");
      if (!cart) {
        res.status(404).json({
          errorMessage: "No cart found on username",
        });
      } else if(cart.items.length <= 0){
        res.status(404).json({
            errorMessage: "Please add some items to proceed with order",
          });
      } else {
        const order = Order({
          emailId: cart.emailId,
          items: cart.items,
          total: cart.total,
        });
        const savedOrder = await order.save();
        if (!savedOrder) {
          res.status(400).json({
            errorMessage: "Something wet wrong while saving order",
          });
        } else {
          await Cart.findByIdAndDelete(cart._id);
          res.status(200).json({
            message: "Your order confirmed",
            orderId: savedOrder._id,
          });
        }
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
})

//@type: GET
//@path: /api/grocery/order/all
//@access: PRIVATE
//@description: Get all orders list for loggedIn user
router.get('/order/all', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const orders = await Order.find({emailId: req.user.email});
        if(!orders){
            res.status(200).json({
                message: "No order found with provided orderId"
            })
        }else{
            res.status(200).json({
                success: true,
                orders: orders
            })
        }
    }catch(err){
        res.status(500).status({errorMessage: "Internal server error"});
    }
})

//@type: GET
//@path: /api/grocery/order/:orderId
//@access: PRIVATE
//@description: Get Order details based on orderId
router.get('/order/:orderId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId, "-__v");
        if(!order){
            res.status(200).json({
                message: "No order found with provided orderId"
            })
        }else{
            res.status(200).json({
                success: true,
                order: order
            })
        }
    }catch(err){
        res.status(500).status({errorMessage: "Internal server error"});
    }
})

module.exports = router;