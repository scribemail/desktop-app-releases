import axios                      from "axios";
import { getAuthorizationHeader } from "renderer/services/authorization_token";

const instance = axios.create({
  headers: {
    Accept: "application/json"
  },
  baseURL: process.env.ELECTRON_WEBPACK_APP_API_BASE_URL
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = getAuthorizationHeader();
  return config;
}, (error) => (
  Promise.reject(error)
));

export default instance;
