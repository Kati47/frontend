'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('success');
  const [isLoading, setIsLoading] = useState(false);
  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }
  // Mock data for demo
  const orderDetails = {
    orderNumber: "ORD-12345-DEMO",
    orderId: "ORD-12345-DEMO",
    paymentStatus: "Paid",
    total: 209.96,
    date: new Date().toLocaleDateString()
  };

  // Simulate checking payment status
  const checkPaymentStatus = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setPaymentStatus('success');
    }, 1500);
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
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-500">Order Number:</div>
                  <div className="font-medium text-gray-900">{orderDetails.orderNumber}</div>
                  
                  <div className="text-gray-500">Total:</div>
                  <div className="font-medium text-gray-900">${orderDetails.total.toFixed(2)}</div>
                  
                  <div className="text-gray-500">Payment Status:</div>
                  <div className="font-medium text-gray-900">{orderDetails.paymentStatus}</div>
                  
                  <div className="text-gray-500">Date:</div>
                  <div className="font-medium text-gray-900">{orderDetails.date}</div>
                </div>
              </div>
              
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
              <p className="mt-2 text-md text-gray-700">
                Order Number: <span className="font-semibold">{orderDetails.orderNumber}</span>
              </p>
              <div className="mt-6">
                <Button 
                  onClick={checkPaymentStatus}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Check Status Again
                </Button>
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
                href="/orders" 
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