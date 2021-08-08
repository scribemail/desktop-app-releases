import { ipcRenderer, remote }   from "electron";
import ActionCable               from "actioncable";
import Store                     from "electron-store";
import { getAuthorizationToken } from "renderer/services/authorization_token";
import { updateSignature }       from "renderer/services/signature";
import log                       from "electron-log";
import { startBugsnag }          from "renderer/services/bugsnag";

const { app } = remote;

startBugsnag(app, { process: { name: "worker" } });

const store = new Store({ watch: true });

let currentCable = null;
let currentCableSubscription = null;

const message2UI = (command, payload) => {
  ipcRenderer.send("message-from-worker", {
    command, payload
  });
};

const handleUpdateSignature = (data) => {
  log.info("socket-received");
  updateSignature(data.signature.id, data.signature.email, () => {
    message2UI("signatureUpdated", {});
  });
};

const handleDisconnected = () => {
  log.info("socket-disconnected");
  store.set("update_after_socket_connection", true);
};

const handleConnected = () => {
  log.info("socket-connected");
  if (store.get("update_after_socket_connection")) {
    message2UI("updateSignatures", {});
    store.delete("update_after_socket_connection");
  }
};

const createSocket = (token) => {
  if (currentCableSubscription) {
    currentCableSubscription.unsubscribe();
  }
  if (currentCable) {
    currentCable.disconnect();
  }
  currentCable = ActionCable.createConsumer(`${process.env.ELECTRON_WEBPACK_APP_CABLE_URL}?authorization_token=${token}`);
  currentCableSubscription = currentCable.subscriptions.create("SignaturesChannel", {
    received:     handleUpdateSignature,
    connected:    handleConnected,
    disconnected: handleDisconnected
  });
};

if (getAuthorizationToken() && store.get("is_subscription_active")) {
  createSocket(getAuthorizationToken());
}

store.onDidChange("authorization_token", (newValue) => {
  if (newValue && store.get("is_subscription_active")) {
    createSocket(newValue);
  }
});

store.onDidChange("is_subscription_active", (newValue) => {
  if (getAuthorizationToken() && newValue) {
    createSocket(getAuthorizationToken());
  }
});

setInterval(() => {
  message2UI("updateSignatures", {});
}, 1 * 12 * 60 * 60 * 60);
