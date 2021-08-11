import Api from "services/api";

export const getSignatureRawHtml = (id) => (
  new Promise((resolve, reject) => {
    Api.get(`/signatures/${id}/raw_html`).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);

export const createSignatureInstallation = (id, params) => (
  new Promise((resolve, reject) => {
    Api.post(`/signatures/${id}/installation`, { installation: params }).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);
