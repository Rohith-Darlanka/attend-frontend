import authApi from "../api/authApi";

export const checkAuth = async () => {
  try {
    const res = await authApi.get("/auth/user/");
    return res.data; // user object if valid
  } catch (err) {
    console.error("Auth check failed:", err);
    return null;
  }
};