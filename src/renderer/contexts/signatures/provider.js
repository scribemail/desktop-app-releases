import React, { useEffect, useState }       from "react";
import PropTypes                            from "prop-types";
import store                                from "services/store";
import map                                  from "lodash/map";
import uniq                                 from "lodash/uniq";
import concat                               from "lodash/concat";
import flatten                              from "lodash/flatten";
import filter                               from "lodash/filter";
import pull                                 from "lodash/remove";
import includes                             from "lodash/includes";
import find                                 from "lodash/find";
import { updateSignature }                  from "services/signature";
import { isSubscriptionActiveForWorkspace } from "services/workspaces";
import { ipcRenderer }                      from "electron";
import { useSession }                       from "renderer/contexts/session/hooks";
import SignaturesContext                    from "renderer/contexts/signatures/context";

const SignaturesProvider = ({ children }) => {
  const { currentWorkspaces } = useSession();
  const activeWorkspaces = map(filter(currentWorkspaces, (workspace) => isSubscriptionActiveForWorkspace(workspace) && workspace.co_worker));
  const signatures = flatten(map(activeWorkspaces, (workspace) => map(workspace.co_worker.emails.filter((email) => email.has_signature), (email) => { return { workspace, email, id: email.signature_id }; })));
  const workspacesWithSignatures = map(currentWorkspaces, (workspace) => { return { ...workspace, signatures: filter(signatures, (signature) => signature.workspace.id === workspace.id) }; });

  const [signatureUpdates, setSignatureUpdates] = useState(store.get("signature_updates"));
  const [signatureLoadings, setSignatureLoadings] = useState([]);

  const updateOnDiskForSignature = async (signature, updateStore = true) => {
    setSignatureLoadings((oldIds) => uniq(concat(oldIds, signature.id)));
    try {
      await updateSignature(signature.workspace.id, signature.id, signature.email.email);
      if (updateStore) {
        store.set(`signature_updates.${signature.id}`, Date.now());
        setSignatureUpdates(store.get("signature_updates"));
      }
      setSignatureLoadings((oldIds) => pull(oldIds, signature.id));
    } catch (error) {
      setSignatureLoadings((oldIds) => pull(oldIds, signature.id));
    }
  };

  const updateAllOnDisk = () => {
    signatures.map((signature) => (
      updateOnDiskForSignature(signature, false)
    ));
    const value = signatures.reduce((acc, signature) => {
      const obj = {};
      obj[signature.id] = Date.now();
      return { ...acc, ...obj };
    }, {});
    store.set("signature_updates", value);
    setSignatureUpdates(store.get("signature_updates"));
  };

  const updatedAtForSignature = (signature) => (
    signatureUpdates ? signatureUpdates[signature.id] : null
  );

  const loadingForSignature = (signature) => (
    includes(signatureLoadings, signature.id)
  );

  useEffect(() => {
    if (ipcRenderer.rawListeners("update-signature").length === 0) {
      ipcRenderer.on("update-signature", (event, args) => {
        const signature = find(signatures, (localSignature) => localSignature.id === args.id);
        if (signature) {
          updateOnDiskForSignature(signature);
          if (!store.get("using_icloud_drive") && process.platform === "darwin") {
            ipcRenderer.send("try-restart-apple-mail");
          }
        }
      });
    }

    if (ipcRenderer.rawListeners("update-all-signatures").length === 0) {
      ipcRenderer.on("update-all-signatures", () => {
        updateAllOnDisk();
      });
    }
  }, []);

  return (
    <SignaturesContext.Provider
      value={ {
        signatures,
        workspacesWithSignatures,
        updatedAtForSignature,
        loadingForSignature,
        updateOnDiskForSignature,
        updateAllOnDisk
      } }
    >
      { children }
    </SignaturesContext.Provider>
  );
};

SignaturesProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export default SignaturesProvider;
