import Api from "renderer/services/api";

export const getSignatureRawHtml = (id) => (
  new Promise((resolve, reject) => {
    Api.get(`/signatures/${id}/raw_html`).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  })
);
