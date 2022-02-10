import { ipcRenderer }           from "electron";
import ActionCable               from "actioncable";
import { app }                   from "@electron/remote";
import Store                     from "electron-store";
import { getAuthorizationToken } from "services/authorization_token";
import { startBugsnag }          from "services/bugsnag";

startBugsnag(app, { process: { name: "worker" } });

const store = new Store({ watch: true });

let currentCable = null;
let currentCableSubscription = null;

const handleUpdateSignature = (data) => {
  ipcRenderer.send("message-from-worker", { command: "update-signature", payload: { id: data.signature.id } });
};

const handleDisconnected = () => {
  store.set("update_after_socket_connection", true);
};

const handleConnected = () => {
  if (store.get("update_after_socket_connection")) {
    store.delete("update_after_socket_connection");
    ipcRenderer.send("message-from-worker", { command: "update-all-signatures" });
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

if (getAuthorizationToken()) {
  createSocket(getAuthorizationToken());
}

store.onDidChange("authorization_token", (newValue) => {
  if (newValue) {
    createSocket(newValue);
  }
});

setInterval(() => {
  ipcRenderer.send("message-from-worker", { command: "update-all-signatures" });
}, 1000 * 60 * 60 * 12);
