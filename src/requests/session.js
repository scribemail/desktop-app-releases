import Api         from "services/api";
import queryString from "query-string";

export const getSession = () => (
  new Promise((resolve, reject) => {
    Api.get("/sessions").then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createSession = (attributes) => (
  new Promise((resolve, reject) => {
    Api.post("/sessions", { user: attributes }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createDomainTokenSession = (domainToken, userName) => (
  new Promise((resolve, reject) => {
    Api.post("domain_token/sessions", { user: { domain_token: domainToken, name: userName } }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createMicrosoftSession = (accessToken) => (
  new Promise((resolve, reject) => {
    Api.post("/microsoft/sessions", { user: { access_token: accessToken }, only_login: true }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createGoogleSession = (token) => (
  new Promise((resolve, reject) => {
    Api.post("/google/sessions", { user: { google_access_token: token }, only_login: true }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createSsoSession = (code, params = {}) => (
  new Promise((resolve, reject) => {
    Api.post(`/sso/sessions?${queryString.stringify(params)}`, { code }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const destroySession = () => (
  new Promise((resolve, reject) => {
    Api.delete("/sessions").then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  })
);
