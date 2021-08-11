import store from "services/store";

export const setAuthorizationToken = (authorizationToken) => (
  store.set("authorization_token", authorizationToken)
);

export const getAuthorizationToken = () => (
  store.get("authorization_token")
);

export const deleteAuthorizationToken = () => (
  store.delete("authorization_token")
);

export const getAuthorizationHeader = () => {
  if (getAuthorizationToken()) {
    return `Bearer ${ getAuthorizationToken() }`;
  }
  return undefined;
};
