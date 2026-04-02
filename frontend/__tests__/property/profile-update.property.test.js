/**
 * Property-Based Tests for Profile Update Persistence
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfilePage from '../../app/profile/page';
import * as usersLib from '../../lib/users';

// Mock Next.js modules
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock users lib
jest.mock('../../lib/users', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

// Mock components
jest.mock('../../app/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../app/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

// Arbitrary generator for address data
const addressArbitrary = fc.record({
  label: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  address: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
  city: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
  postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => s.trim().length >= 3),
  country: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
  isDefault: fc.boolean(),
});

// Arbitrary generator for profile update data
const profileUpdateArbitrary = fc.record({
  firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
  lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: '' }),
  addresses: fc.array(addressArbitrary, { minLength: 0, maxLength: 5 }),
});

// Arbitrary generator for initial user profile
const userProfileArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length >= 3),
  email: fc.emailAddress(),
  firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
  lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: '' }),
  addresses: fc.array(addressArbitrary, { minLength: 0, maxLength: 3 }),
});

describe('Feature: ecommerce-fixes-and-enhancements, Profile Update Property Tests', () => {
  let mockPush;
  let mockRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    mockPush = jest.fn();
    mockRouter = { push: mockPush };
    useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Property 33: Profile update persistence', () => {
    /**
     * **Validates: Requirements 7.7**
     * 
     * Property: For any profile update, the backend should contain the updated user data
     */

    it('should persist profile updates to backend for any valid update data', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          profileUpdateArbitrary,
          async (initialProfile, updateData) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            // Mock initial profile fetch
            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            // Mock successful update
            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Update form fields
            if (updateData.firstName !== undefined) {
              const firstNameInput = screen.getByLabelText(/first name/i);
              fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });
            }

            if (updateData.lastName !== undefined) {
              const lastNameInput = screen.getByLabelText(/last name/i);
              fireEvent.change(lastNameInput, { target: { value: updateData.lastName } });
            }

            if (updateData.phone !== undefined) {
              const phoneInput = screen.getByLabelText(/phone/i);
              fireEvent.change(phoneInput, { target: { value: updateData.phone } });
            }

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: updateUserProfile should be called with correct data
            await waitFor(() => {
              expect(usersLib.updateUserProfile).toHaveBeenCalledWith(
                initialProfile.id,
                {
                  firstName: updateData.firstName,
                  lastName: updateData.lastName,
                  phone: updateData.phone,
                  addresses: updateData.addresses,
                },
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Profile should be refreshed after update
            await waitFor(() => {
              // getUserProfile should be called twice: once on mount, once after update
              expect(usersLib.getUserProfile).toHaveBeenCalledTimes(2);
            }, { timeout: 3000 });

            // Assert: Success message should be displayed
            await waitFor(() => {
              expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should call updateUserProfile with correct user ID and token', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          fc.string({ minLength: 10, maxLength: 50 }),
          profileUpdateArbitrary,
          async (initialProfile, accessToken, updateData) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();

            // Arrange: Mock authenticated session with custom token
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: accessToken,
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith(accessToken);
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Update a field
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: updateUserProfile should be called with correct user ID and token
            await waitFor(() => {
              expect(usersLib.updateUserProfile).toHaveBeenCalledWith(
                initialProfile.id,
                expect.any(Object),
                accessToken
              );
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should persist address updates to backend', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          fc.array(addressArbitrary, { minLength: 1, maxLength: 3 }),
          async (initialProfile, newAddresses) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            const updatedProfile = {
              ...initialProfile,
              addresses: newAddresses,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Click Save Changes button (addresses are already in formData from initial profile)
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: updateUserProfile should be called with addresses
            await waitFor(() => {
              const callArgs = usersLib.updateUserProfile.mock.calls[0];
              expect(callArgs[0]).toBe(initialProfile.id);
              expect(callArgs[1]).toHaveProperty('addresses');
              expect(Array.isArray(callArgs[1].addresses)).toBe(true);
              expect(callArgs[2]).toBe('mock-token-123');
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle empty profile updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          async (initialProfile) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);
            usersLib.updateUserProfile.mockResolvedValue(initialProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Click Save Changes without making any changes
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: updateUserProfile should still be called
            await waitFor(() => {
              expect(usersLib.updateUserProfile).toHaveBeenCalledWith(
                initialProfile.id,
                {
                  firstName: initialProfile.firstName || '',
                  lastName: initialProfile.lastName || '',
                  phone: initialProfile.phone || '',
                  addresses: initialProfile.addresses || [],
                },
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Success message should be displayed
            await waitFor(() => {
              expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should refresh profile data after successful update', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          profileUpdateArbitrary,
          async (initialProfile, updateData) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            // Mock initial profile fetch
            usersLib.getUserProfile.mockResolvedValueOnce(initialProfile);

            // Mock successful update
            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Mock profile refresh after update
            usersLib.getUserProfile.mockResolvedValueOnce(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledTimes(1);
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Update a field
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: Profile should be refreshed after update
            await waitFor(() => {
              // getUserProfile should be called twice: once on mount, once after update
              expect(usersLib.getUserProfile).toHaveBeenCalledTimes(2);
              expect(usersLib.getUserProfile).toHaveBeenNthCalledWith(1, 'mock-token-123');
              expect(usersLib.getUserProfile).toHaveBeenNthCalledWith(2, 'mock-token-123');
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should exit edit mode after successful update', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          profileUpdateArbitrary,
          async (initialProfile, updateData) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Verify we're in edit mode (Save Changes button should be visible)
            await waitFor(() => {
              expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
            });

            // Update a field
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: Should exit edit mode (Edit Profile button should be visible again)
            await waitFor(() => {
              expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
              expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should persist only editable fields (not username or email)', async () => {
      await fc.assert(
        fc.asyncProperty(
          userProfileArbitrary,
          profileUpdateArbitrary,
          async (initialProfile, updateData) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Update a field
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: updateUserProfile should NOT include username or email
            await waitFor(() => {
              const callArgs = usersLib.updateUserProfile.mock.calls[0];
              expect(callArgs[1]).not.toHaveProperty('username');
              expect(callArgs[1]).not.toHaveProperty('email');
              // Should only include editable fields
              expect(callArgs[1]).toHaveProperty('firstName');
              expect(callArgs[1]).toHaveProperty('lastName');
              expect(callArgs[1]).toHaveProperty('phone');
              expect(callArgs[1]).toHaveProperty('addresses');
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle update with all fields populated', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            username: fc.string({ minLength: 3, maxLength: 30 }),
            email: fc.emailAddress(),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
            addresses: fc.array(addressArbitrary, { minLength: 1, maxLength: 3 }),
          }),
          fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
            addresses: fc.array(addressArbitrary, { minLength: 1, maxLength: 3 }),
          }),
          async (initialProfile, updateData) => {
            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: initialProfile.id,
                email: initialProfile.email,
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            usersLib.getUserProfile.mockResolvedValue(initialProfile);

            const updatedProfile = {
              ...initialProfile,
              ...updateData,
            };
            usersLib.updateUserProfile.mockResolvedValue(updatedProfile);

            // Act: Render profile page
            const { unmount } = render(<ProfilePage />);

            // Wait for profile to load
            await waitFor(() => {
              expect(usersLib.getUserProfile).toHaveBeenCalledWith('mock-token-123');
            }, { timeout: 3000 });

            // Click Edit Profile button
            await waitFor(() => {
              const editButton = screen.getByRole('button', { name: /edit profile/i });
              fireEvent.click(editButton);
            });

            // Update all fields
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: updateData.firstName } });

            const lastNameInput = screen.getByLabelText(/last name/i);
            fireEvent.change(lastNameInput, { target: { value: updateData.lastName } });

            const phoneInput = screen.getByLabelText(/phone/i);
            fireEvent.change(phoneInput, { target: { value: updateData.phone } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Assert: All fields should be persisted
            await waitFor(() => {
              expect(usersLib.updateUserProfile).toHaveBeenCalledWith(
                initialProfile.id,
                {
                  firstName: updateData.firstName,
                  lastName: updateData.lastName,
                  phone: updateData.phone,
                  addresses: expect.any(Array),
                },
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Success message should be displayed
            await waitFor(() => {
              expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});






