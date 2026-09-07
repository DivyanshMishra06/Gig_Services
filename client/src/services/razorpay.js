const CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise;

export const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_URL;
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error('Razorpay Checkout did not load.'));
    script.onerror = () => reject(new Error('Could not load secure payment checkout.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

// A Checkout handler only means Razorpay returned control to the browser. It
// never declares a booking paid; callers must fetch server state after this.
export const openRazorpayCheckout = async ({ order, booking, customer }) => {
  await loadRazorpayCheckout();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'ActiveSetu',
      description: booking.serviceName || 'Service booking',
      order_id: order.orderId,
      prefill: {
        name: customer?.name || '',
        email: customer?.email || '',
        contact: customer?.phone || ''
      },
      theme: { color: '#0B8F4D' },
      handler: () => resolve({ submitted: true }),
      modal: { ondismiss: () => resolve({ submitted: false }) }
    });
    checkout.on('payment.failed', response => reject(new Error(response?.error?.description || 'Payment could not be completed.')));
    checkout.open();
  });
};
