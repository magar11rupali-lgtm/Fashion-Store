import { handleFetchError, createApiError, logError } from './errors';

export async function createOrder(orderData, userToken) {
  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Format order data to match backend schema
  const formattedData = {
    orderNumber,
    customer: {
      firstName: orderData.customer.firstName,
      lastName: orderData.customer.lastName,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      city: orderData.customer.city,
      postalCode: orderData.customer.postalCode,
      country: orderData.customer.country,
    },
    items: orderData.items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
      image: item.image || '',
    })),
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    tax: orderData.tax,
    total: orderData.total,
    paymentMethod: orderData.paymentMethod,
    order_status: 'pending', // Set initial status to pending
  };
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      data: formattedData,
    }),
  });

  if (!res.ok) {
    const error = await handleFetchError(new Error('Order creation failed'), res);
    logError(error, { orderData: formattedData });
    throw createApiError(error.message, error.status, error.data);
  }

  return res.json();
}

export async function getUserOrders(userToken) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders?populate=*&sort=createdAt:desc`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!res.ok) {
      const error = await handleFetchError(new Error('Failed to fetch orders'), res);
      logError(error, { action: 'getUserOrders' });
      throw createApiError(error.message, error.status, error.data);
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    logError(error, { action: 'getUserOrders' });
    throw createApiError('Network error. Please check your connection.');
  }
}

export async function getOrderById(orderId, userToken) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}?populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!res.ok) {
      const error = await handleFetchError(new Error('Failed to fetch order'), res);
      logError(error, { action: 'getOrderById', orderId });
      throw createApiError(error.message, error.status, error.data);
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    logError(error, { action: 'getOrderById', orderId });
    throw createApiError('Network error. Please check your connection.');
  }
}