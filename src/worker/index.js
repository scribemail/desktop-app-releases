import { ipcRenderer }           from "electron";
import ActionCable               from "actioncable";
import Store                     from "electron-store";
import { getAuthorizationToken } from "renderer/services/authorization_token";
import { updateSignature }       from "renderer/services/signature";

const store = new Store({ watch: true });

const message2UI = (command, payload) => {
  ipcRenderer.send("message-from-worker", {
    command, payload
  });
};

const handleUpdateSignature = (data) => {
  console.log("received", data);
  updateSignature(data.signature.id, data.signature.email, () => {
    message2UI("signatureUpdated", {});
  });
};

const handleDisconnected = () => {
  console.log("disconnected");
  store.set("update_after_socket_connection", true);
};

const handleConnected = () => {
  console.log("connected");
  if (store.get("update_after_socket_connection")) {
    message2UI("updateSignatures", {});
    store.delete("update_after_socket_connection");
  }
};

const createSocket = (token) => {
  const cable = ActionCable.createConsumer(`${process.env.ELECTRON_WEBPACK_APP_CABLE_URL}?authorization_token=${token}`);
  cable.subscriptions.create("SignaturesChannel", {
    received:     handleUpdateSignature,
    connected:    handleConnected,
    disconnected: handleDisconnected
  });
};

if (getAuthorizationToken()) {
  createSocket(getAuthorizationToken());
}

store.onDidChange("authorization_token", (newValue) => {
  if (newValue) {
    createSocket(newValue);
  }
});
