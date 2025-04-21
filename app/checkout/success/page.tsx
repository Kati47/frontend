'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type OrderDetails = {
  orderNumber?: string;
  orderId?: string;
  paymentStatus?: string;
  total?: number;
  date?: string;
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({});
  const [error, setError] = useState<string | null>(null);
  
  // Get status and order info from URL query parameters
  useEffect(() => {
    console.log('🔍 Checkout success page loaded, checking parameters...');
    
    const status = searchParams.get('status');
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    
    console.log(`📋 URL Parameters: status=${status}, success=${success}, orderId=${orderId}, orderNumber=${orderNumber}`);
    
    if (status === 'failed' || success === 'false') {
      console.log('❌ Setting payment status to failed based on URL parameters');
      setPaymentStatus('failed');
    } else if (success === 'true') {
      console.log('✅ Setting payment status to success based on URL parameters');
      setPaymentStatus('success');
    }
    
    // Save basic order details from URL parameters
    setOrderDetails({
      orderNumber: orderNumber || undefined,
      orderId: orderId || undefined,
    });
    
    // If we have an orderId, fetch the payment status from API
    if (orderId) {
      console.log(`🔍 Found order ID in URL: ${orderId}, checking payment status...`);
      checkPaymentStatus(orderId);
    } else {
      console.log('⚠️ No order ID found in URL, skipping payment verification');
      setIsLoading(false);
    }
  }, [searchParams]);
  
  // Function to check payment status with the backend
  const checkPaymentStatus = async (orderId: string) => {
    try {
      console.log(`📡 Fetching payment status for order: ${orderId}`);
      setIsLoading(true);
      
      const response = await fetch(`/api/order/payment-status/${orderId}`);
      console.log(`📡 API response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📋 Payment status response:`, data);
        
        if (data.success) {
          setOrderDetails(prevDetails => ({
            ...prevDetails,
            paymentStatus: data.isPaid ? 'Paid' : 'Pending',
            total: data.amount,
            date: new Date().toLocaleDateString()
          }));
          
          // Update payment status based on API response
          setPaymentStatus(data.isPaid ? 'success' : 'processing');
          console.log(`💰 Payment status from API: ${data.isPaid ? 'PAID' : 'NOT PAID'}`);
        } else {
          console.error('❌ API returned error:', data.message);
          setError(`Error checking payment status: ${data.message}`);
        }
      } else {
        console.error(`❌ API returned status: ${response.status}`);
        setError(`Error checking payment status. Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error checking payment status:', err);
      setError('Failed to check payment status. Please contact customer support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:max-w-3xl lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          {isLoading ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
              </div>
              <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Checking Payment Status...</h1>
              <p className="mt-3 text-lg text-gray-500">
                Please wait while we verify your payment.
              </p>
            </div>
          ) : paymentStatus === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Payment Successful!</h1>
              <p className="mt-3 text-lg text-gray-500">
                Thank you for your purchase. Your order has been processed successfully.
              </p>
              
              {/* Order details section */}
              {orderDetails.orderNumber && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Order Number:</div>
                    <div className="font-medium text-gray-900">{orderDetails.orderNumber}</div>
                    
                    {orderDetails.total && (
                      <>
                        <div className="text-gray-500">Total:</div>
                        <div className="font-medium text-gray-900">${orderDetails.total.toFixed(2)}</div>
                      </>
                    )}
                    
                    {orderDetails.paymentStatus && (
                      <>
                        <div className="text-gray-500">Payment Status:</div>
                        <div className="font-medium text-gray-900">{orderDetails.paymentStatus}</div>
                      </>
                    )}
                    
                    {orderDetails.date && (
                      <>
                        <div className="text-gray-500">Date:</div>
                        <div className="font-medium text-gray-900">{orderDetails.date}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900">What's next?</h2>
                <p className="mt-2 text-sm text-gray-500">
                  You will receive an email confirmation shortly with your order details.
                </p>
              </div>
            </div>
          ) : paymentStatus === 'processing' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
              <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Payment Processing</h1>
              <p className="mt-3 text-lg text-gray-500">
                Your payment is being processed. This may take a few moments.
              </p>
              {orderDetails.orderNumber && (
                <p className="mt-2 text-md text-gray-700">
                  Order Number: <span className="font-semibold">{orderDetails.orderNumber}</span>
                </p>
              )}
              {error && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                  {error}
                </div>
              )}
              <div className="mt-6">
                <button 
                  onClick={() => orderDetails.orderId && checkPaymentStatus(orderDetails.orderId)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Check Status Again
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Payment Failed</h1>
              <p className="mt-3 text-lg text-gray-500">
                We couldn't process your payment. Please try again or contact customer support.
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                  {error}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-10 flex justify-center space-x-4">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Home Page
            </Link>
            
            {paymentStatus === 'success' && (
              <Link 
                href="/account/orders" 
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                View My Orders
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}