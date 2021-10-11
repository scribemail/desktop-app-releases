import Api from "services/api";

export const getAuthenticationMethod = (email) => (
  new Promise((resolve, reject) => {
    Api.get(`/authentication_method?email=${email}`).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);
