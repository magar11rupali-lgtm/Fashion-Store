'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserProfile, updateUserProfile } from '../../lib/users';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '@/hooks/useNotification';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import FormInput from '../components/FormInput';
import { ERROR_MESSAGES } from '../../lib/errors';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validation rules
  const validationRules = (values) => {
    const errors = {};
    
    // Phone validation (optional but validate format if provided)
    if (values.phone) {
      const phoneError = validators.phone(values.phone);
      if (phoneError) errors.phone = phoneError;
    }
    
    return errors;
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
  } = useFormValidation(
    {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      addresses: [],
    },
    validationRules
  );

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.accessToken) return;
      
      try {
        setIsLoading(true);
        const userData = await getUserProfile(session.accessToken);
        setProfile(userData);
        setValues({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          addresses: userData.addresses || [],
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setGeneralError(err.message || ERROR_MESSAGES.FETCH_FAILED);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    }
  }, [session, setValues]);

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value,
    };
    setValues({
      ...formData,
      addresses: updatedAddresses,
    });
  };

  const handleAddAddress = () => {
    setValues({
      ...formData,
      addresses: [
        ...formData.addresses,
        {
          label: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
          isDefault: false,
        },
      ],
    });
  };

  const handleRemoveAddress = (index) => {
    setValues({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  };
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) return;
    
    setGeneralError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      await updateUserProfile(
        session.user.id,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          addresses: formData.addresses,
        },
        session.accessToken
      );
      
      setSuccessMessage('Profile updated successfully!');
      showNotification('success', 'Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      const userData = await getUserProfile(session.accessToken);
      setProfile(userData);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.message || ERROR_MESSAGES.UPDATE_FAILED;
      setGeneralError(errorMsg);
      showNotification('error', errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile
    setValues({
      username: profile.username || '',
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      addresses: profile.addresses || [],
    });
    setIsEditing(false);
    setGeneralError('');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">Redirecting to sign in...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {generalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {generalError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <FormInput
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.firstName}
                  touched={touched.firstName}
                  placeholder="Enter your first name"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />

                <FormInput
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.lastName}
                  touched={touched.lastName}
                  placeholder="Enter your last name"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />

                <div className="md:col-span-2">
                  <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone}
                    touched={touched.phone}
                    placeholder="Enter your phone number"
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Address
                  </button>
                )}
              </div>

              {formData.addresses.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved addresses</p>
              ) : (
                <div className="space-y-4">
                  {formData.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 relative"
                    >
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAddress(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Label (e.g., Home, Work)
                          </label>
                          <input
                            type="text"
                            value={address.label || ''}
                            onChange={(e) =>
                              handleAddressChange(index, 'label', e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Home"
                            className={`w-full px-3 py-2 border border-gray-300 rounded text-sm ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            value={address.address || ''}
                            onChange={(e) =>
                              handleAddressChange(index, 'address', e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Street address"
                            className={`w-full px-3 py-2 border border-gray-300 rounded text-sm ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={address.city || ''}
                            onChange={(e) =>
                              handleAddressChange(index, 'city', e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="City"
                            className={`w-full px-3 py-2 border border-gray-300 rounded text-sm ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={address.postalCode || ''}
                            onChange={(e) =>
                              handleAddressChange(index, 'postalCode', e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Postal code"
                            className={`w-full px-3 py-2 border border-gray-300 rounded text-sm ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={address.country || ''}
                            onChange={(e) =>
                              handleAddressChange(index, 'country', e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Country"
                            className={`w-full px-3 py-2 border border-gray-300 rounded text-sm ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isDefault || false}
                            onChange={(e) =>
                              handleAddressChange(index, 'isDefault', e.target.checked)
                            }
                            disabled={!isEditing}
                            className="mr-2"
                          />
                          <label className="text-xs text-gray-700">
                            Set as default address
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
