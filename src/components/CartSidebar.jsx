import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import axios from 'axios';

const CartSidebar = ({ isOpen, onClose, cartItems = [], onRemove, onUpdateQty, onClear, user, onLogin }) => {
    const [step, setStep] = useState('cart'); // 'cart' | 'delivery'
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        city: '',
        postalCode: '',
        state: '',
        deliveryOption: 'standard' // 'standard' | 'express'
    });

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = formData.deliveryOption === 'express' ? 50 : 0; // Standard is free in screenshot
    const total = Math.max(0, subtotal + shipping - discountAmount);

    const handleApplyCoupon = async () => {
        if (!user) {
            alert('Please login to apply coupons');
            onLogin();
            return;
        }
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/coupons/apply', { code: couponCode, cartTotal: subtotal }, config);
            setAppliedCoupon(data);
            setDiscountAmount(data.discountAmount);
            setCouponError('');
            alert('Coupon applied successfully!');
        } catch (error) {
            setAppliedCoupon(null);
            setDiscountAmount(0);
            setCouponError(error.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        setCouponError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const processPayment = async () => {
        if (!user) {
            onLogin();
            return;
        }

        // Validate Form
        if (!formData.address || !formData.city || !formData.postalCode || !formData.state || !formData.phone) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsCheckingOut(true);
        try {
            // 0. Ensure Razorpay SDK is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsCheckingOut(false);
                return;
            }

            // 1. Get Key ID
            const { data: { key } } = await axios.get('/api/payment/key');

            // 2. Create Order on Backend (Razorpay)
            const { data: { id: razorpayOrderId, currency, amount } } = await axios.post('/api/payment/order', {
                amount: total,
                currency: 'INR'
            });

            // 3. Initialize Razorpay
            const options = {
                key: key,
                amount: amount.toString(),
                currency: currency,
                name: "E-Commerce App",
                description: "Purchase",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await axios.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 4. Save Order to Database
                        const orderData = {
                            orderItems: cartItems.map(item => ({
                                name: item.name,
                                qty: item.qty,
                                image: item.image,
                                price: item.price,
                                product: item._id
                            })),
                            shippingAddress: {
                                name: formData.name,
                                email: formData.email,
                                address: formData.address,
                                city: formData.city,
                                postalCode: formData.postalCode,
                                country: "India", // Defaulting to India as per currency
                                phone: formData.phone
                            },
                            paymentMethod: "Razorpay",
                            paymentResult: {
                                id: response.razorpay_payment_id,
                                status: 'success',
                                update_time: new Date().toISOString(),
                                email_address: formData.email
                            },
                            itemsPrice: subtotal,
                            taxPrice: 0,
                            shippingPrice: shipping,
                            totalPrice: total,
                            discountAmount: discountAmount,
                            couponInfo: appliedCoupon ? { code: appliedCoupon.code || couponCode, type: appliedCoupon.discountType } : null
                        };

                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        const { data } = await axios.post('/api/orders', orderData, config);

                        setOrderId(data._id);
                        setShowSuccess(true);
                        removeCoupon();
                        onClear();

                    } catch (error) {
                        console.error("Payment verification failed", error);
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Checkout failed details:", error);
            const msg = error.response?.data?.error?.description || error.message || "Unknown error";
            alert(`Checkout failed: ${msg}. Check console for details.`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (showSuccess) {
        return (
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
                    <div className="bg-gray-50 p-4 rounded-xl w-full mb-6">
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono font-bold text-gray-800">{orderId}</p>
                    </div>
                    <button
                        onClick={() => { setShowSuccess(false); onClose(); setStep('cart'); }}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // Render Steps
    const renderHeader = () => (
        <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    {step === 'cart' ? (
                        <>
                            <ShoppingBag className="text-green-600" size={20} />
                            Your Cart <span className="text-gray-400 font-normal text-sm">({cartItems.length})</span>
                        </>
                    ) : (
                        <>
                            <ArrowRight className="text-gray-600 rotate-180 cursor-pointer" size={20} onClick={() => setStep('cart')} />
                            Delivery Details
                        </>
                    )}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <X size={20} />
                </button>
            </div>

            {/* Progress Bar */}
            {step === 'delivery' && (
                <div className="flex items-center justify-between px-2 mb-2 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-green-500 -z-10 transform -translate-y-1/2"></div>

                    <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                            <ShoppingBag size={14} />
                        </div>
                        <span className="text-[10px] text-green-600 font-bold">Cart</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-[10px] text-green-600 font-bold">Delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-white px-2 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">Complete</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCartItems = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p>Your cart is empty</p>
                    <button onClick={onClose} className="text-green-600 font-bold hover:underline">Start Shopping</button>
                </div>
            ) : (
                cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl group">
                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                                <p className="text-green-600 font-bold mt-1">₹{item.price}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => onUpdateQty(item._id, item.qty - 1)}
                                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                                        disabled={item.qty <= 1}
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                    <button
                                        onClick={() => onUpdateQty(item._id, item.qty + 1)}
                                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => onRemove(item._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderDeliveryForm = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Contact Info */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm">Contact Information</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter your full name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter your phone number" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter your email" />
                    </div>
                </div>
            </div>

            {/* Address Info */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm">Delivery Address</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter street address" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter city" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Postal Code</label>
                            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter postal code" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Enter state" />
                    </div>
                </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm">Delivery Options</h3>
                <div className="space-y-2">
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${formData.deliveryOption === 'standard' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                        <div className="flex items-center gap-3">
                            <input type="radio" name="deliveryOption" value="standard" checked={formData.deliveryOption === 'standard'} onChange={handleInputChange} className="text-green-600 focus:ring-green-500" />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Standard Delivery</p>
                                <p className="text-xs text-gray-500">3-5 business days</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">Free</span>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${formData.deliveryOption === 'express' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                        <div className="flex items-center gap-3">
                            <input type="radio" name="deliveryOption" value="express" checked={formData.deliveryOption === 'express'} onChange={handleInputChange} className="text-green-600 focus:ring-green-500" />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Express Delivery</p>
                                <p className="text-xs text-gray-500">1-2 business days</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-gray-800">₹50</span>
                    </label>
                </div>
            </div>

            {/* Coupon */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Coupon Code</label>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none uppercase transition-all"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value);
                                if (couponError) setCouponError('');
                            }}
                            disabled={!!appliedCoupon || isApplyingCoupon}
                        />
                        {!appliedCoupon ? (
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isApplyingCoupon || !couponCode}
                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                            </button>
                        ) : (
                            <button
                                onClick={removeCoupon}
                                className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg text-sm hover:bg-red-200 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    {appliedCoupon && (
                        <p className="text-xs text-green-600 font-bold">
                            Coupon {couponCode.toUpperCase()} applied! (-₹{discountAmount})
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="p-6 bg-white border-t border-gray-100 space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-bold' : 'font-bold'}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({couponCode.toUpperCase()})</span>
                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </div>

            {step === 'cart' ? (
                <button
                    onClick={() => setStep('delivery')}
                    disabled={cartItems.length === 0}
                    className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    Proceed to Checkout
                </button>
            ) : (
                <button
                    onClick={processPayment}
                    disabled={isCheckingOut}
                    className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isCheckingOut ? 'Processing...' : (
                        <>
                            Place Order <ArrowRight size={18} />
                        </>
                    )}
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {renderHeader()}
                    {step === 'cart' ? renderCartItems() : renderDeliveryForm()}
                    {cartItems.length > 0 && renderFooter()}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
