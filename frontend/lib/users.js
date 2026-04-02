import { handleFetchError, createApiError, logError } from './errors';

export async function getUserProfile(userToken) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!res.ok) {
      const error = await handleFetchError(new Error('Failed to fetch user profile'), res);
      logError(error, { action: 'getUserProfile' });
      throw createApiError(error.message, error.status, error.data);
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    logError(error, { action: 'getUserProfile' });
    throw createApiError('Network error. Please check your connection.');
  }
}

export async function updateUserProfile(userId, profileData, userToken) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!res.ok) {
      const error = await handleFetchError(new Error('Failed to update profile'), res);
      logError(error, { action: 'updateUserProfile', userId });
      throw createApiError(error.message, error.status, error.data);
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    logError(error, { action: 'updateUserProfile', userId });
    throw createApiError('Network error. Please check your connection.');
  }
}
