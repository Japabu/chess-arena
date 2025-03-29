import { createSignal, createEffect, createMemo } from "solid-js";
import { UserService } from "./api/UserService";

// Create signals for authentication state
const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [authUser, setAuthUser] = createSignal<any>(null);
const [isAdmin, setIsAdmin] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(true);

// Create a memo for the user's display name
const userDisplayName = createMemo(() => {
  const user = authUser();
  return user ? user.username : "Guest";
});

// Initialize the auth state
createEffect(() => {
  checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
  setIsLoading(true);

  const claims = UserService.getUserClaims();

  if (claims && claims.id) {
    // User is authenticated
    setIsAuthenticated(true);

    const user = await UserService.getUserById(claims.id);
    setAuthUser(user);
    setIsAdmin(claims.roles.includes("admin"));
  } else {
    // No valid token
    logout();
  }

  setIsLoading(false);
}

// Login function
async function login(username: string, password: string) {
  const response = await UserService.login(username, password);
  localStorage.setItem("token", response.access_token);
  await checkAuthStatus();
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  setIsAuthenticated(false);
  setAuthUser(null);
  setIsAdmin(false);
}

// Export the auth store
export const AuthStore = {
  isAuthenticated,
  authUser,
  isAdmin,
  isLoading,
  userDisplayName,
  login,
  logout,
  checkAuthStatus,
};
