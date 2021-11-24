import axios                                             from "axios";
import { app }                                           from "@electron/remote";
import { getAuthorizationHeader, setAuthorizationToken } from "services/authorization_token";

const instance = axios.create({
  headers: {
    Accept:             "application/json",
    "X-Client-Type":    "DesktopApplication",
    "X-Client-Version": app.getVersion(),
    "X-Api-Version":    3
  },
  baseURL: process.env.ELECTRON_WEBPACK_APP_API_BASE_URL
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = getAuthorizationHeader();
  return config;
}, (error) => (
  Promise.reject(error)
));

instance.interceptors.response.use((response) => {
    if (response.headers["x-refreshed-authorization"]) {
      setAuthorizationToken(response.headers["x-refreshed-authorization"].split(" ")[1]);
    }
    return response;
  },
  (error) => {
    if (error && error.response && error.response.status === 503) {
      window.location.href = `/maintenance?return_to=${window.location.pathname}`;
    } else if (error && error.response && error.response.status === 401) {
      if (window.location.href.includes(process.env.APP_HOSTNAME)) {
        window.location = `${process.env.PROTOCOL}://${process.env.WEBSITE_HOSTNAME}`;
      } else {
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(error);
    }
  });

export default instance;
