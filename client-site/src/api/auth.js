import axiosSecure from "./axiosSecure.js";

// Save user data in the database
export const saveUser = async (user) => {
  try {
    const currentUser = {
      email: user?.email,
      role: 'guest',
      status: 'verified',
    };

    const { data } = await axiosSecure.put(`/users/${user.email}`, currentUser);
    return data;
  } catch (error) {
    console.error("Error saving user:", error);
    throw new Error("Failed to save user");
  }
};

// Get JWT token for a user based on their email
export const getToken = async (email) => {
  try {
    const { data } = await axiosSecure.post(`/jwt`, { email });
    console.log("Token created ------------>", data);
    return data;
  } catch (error) {
    console.error("Error getting token:", error);
    throw new Error("Failed to get token");
  }
};

// Clear user session and logout
export const clearCookie = async () => {
  try {
    const { data } = await axiosSecure.get('/logout');
    return data;
  } catch (error) {
    console.error("Error clearing cookie:", error);
    throw new Error("Failed to clear cookie");
  }
};

// Get user role based on email
export const getRole = async (email) => {
  try {
    const { data } = await axiosSecure(`/user/${email}`);
    return data.role;
  } catch (error) {
    console.error("Error getting role:", error);
    throw new Error("Failed to get role");
  }
};

// Get all available packages
export const getAllPackage = async () => {
  try {
    const { data } = await axiosSecure(`/package`);
    return data;
  } catch (error) {
    console.error("Error getting packages:", error);
    throw new Error("Failed to get packages");
  }
};

// Update user role in the database
export const updateRole = async ({ email, role }) => {
  try {
    const currentUser = {
      email,
      role,
      status: 'Verified',
    };

    const { data } = await axiosSecure.put(`/users/update/${email}`, currentUser);
    return data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error("Failed to update role");
  }
};

// Update action for a package or booking
export const updateAction = async ({ update, id, type }) => {
  try {
    const endpoint = type === 'package' ? `/package/${id}` : `/bookings/${id}`;
    const currentAction = { update };
    const { data } = await axiosSecure.patch(endpoint, currentAction);
    return data;
  } catch (error) {
    console.error("Error updating action:", error);
    throw new Error("Failed to update action");
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const { data } = await axiosSecure(`/users`);
    return data;
  } catch (error) {
    console.error("Error getting users:", error);
    throw new Error("Failed to get users");
  }
};
