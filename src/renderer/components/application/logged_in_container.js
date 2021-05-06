import React, { useState, useEffect, useRef } from "react";
import { useSession }                         from "renderer/contexts/session/hooks";
import store                                  from "renderer/services/store";
import get                                    from "lodash/get";
import { getSession }                         from "renderer/requests/session";
import { Loader, Icon }                       from "renderer/components/ui";
import { updateSignature }                    from "renderer/services/signature";
import { UncontrolledTooltip }                from "reactstrap";
import { ipcRenderer }                        from "electron";
import TimeAgo                                from "timeago-react";

import "./logged_in_container.scss";

const ApplicationLoggedInContainer = () => {
  const [loading, setLoading] = useState(false);
  const [signatureUpdates, setSignatureUpdates] = useState(store.get("signature_updates"));
  const { currentUser, setCurrentUser, setCurrentAccount } = useSession();
  const didRender = useRef();

  const emailsWithSignature = currentUser.co_worker.emails.filter((email) => email.has_signature);

  const handleRefresh = () => {
    setLoading(true);
    getSession().then((response) => {
      setCurrentUser(response.data.user);
      setCurrentAccount(response.data.account);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleUpdate = () => {
    emailsWithSignature.map((email) => (
      updateSignature(email.signature_id, email.email, () => {
        setSignatureUpdates(store.get("signature_updates"));
      })
    ));
  };

  const installEmail = (email) => {
    updateSignature(email.signature_id, email.email, () => {
      setSignatureUpdates(store.get("signature_updates"));
    });
  };

  useEffect(() => {
    ipcRenderer.on("message-from-worker", (event, arg) => {
      if (arg.command === "signatureUpdated") {
        setSignatureUpdates(store.get("signature_updates"));
      }
      if (arg.command === "updateSignatures") {
        handleUpdate();
      }
    });
    if (!didRender) {
      handleUpdate();
      didRender.current = true;
    }
  }, []);

  return (
    <div className="application-container">

      <div className="d-flex mt-2 mb-2 align-items-end">
        <h1 className="mt-0 mb-0">Your signatures</h1>
        <a href="#" onClick={ handleRefresh } className="ml-auto" id="refresh-icon"><Icon icon="button-refresh-arrows" className="icon-refresh" /></a>
        <UncontrolledTooltip placement="left" target="refresh-icon">
          Refresh signature list
        </UncontrolledTooltip>
      </div>
      { loading && <div className="d-flex align-items-center justify-content-center" style={ { height: "150px" } }><Loader /></div> }
      { !loading && (
        <>
          { emailsWithSignature.map((email) => (
            <div key={ `email-${email.id}` } className="mb-1 d-flex align-items-center">
              <div>
                { email.email }
                <div className="update-date">
                  { get(signatureUpdates, email.signature_id) && (
                    <>
                      Installed <TimeAgo datetime={ get(signatureUpdates, email.signature_id) } locale="en" />
                    </>
                  ) }
                  { !get(signatureUpdates, email.signature_id) && "Never updated" }
                </div>
              </div>
              <div className="ml-auto">
                <a href="#" onClick={ () => { installEmail(email); } } className="ml-1">
                  <Icon icon="desktop-monitor-download" className="icon-install" id={ `install-email-${email.id}` } />
                </a>
                <UncontrolledTooltip placement="left" target={ `install-email-${email.id}` }>
                  Install signature in Outlook
                </UncontrolledTooltip>
              </div>
            </div>
          )) }
        </>
      ) }
    </div>
  );
};

export default ApplicationLoggedInContainer;
