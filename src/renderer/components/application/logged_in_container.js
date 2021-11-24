import React, { useState, useEffect, useRef } from "react";
import { useSession }                         from "renderer/contexts/session/hooks";
import store, { setWorkspaces }               from "services/store";
import { isSubscriptionActiveForWorkspace }   from "services/workspaces";
import get                                    from "lodash/get";
import flatten                                from "lodash/flatten";
import { Trans, t }                           from "@lingui/macro";
import map                                    from "lodash/map";
import filter                                 from "lodash/filter";
import { getSession }                         from "requests/session";
import { Loader, Icon, WorkspaceImage }       from "renderer/components/ui";
import { updateSignature }                    from "services/signature";
import { UncontrolledTooltip }                from "reactstrap";
import { ipcRenderer }                        from "electron";
import TimeAgo                                from "timeago-react";

import "./logged_in_container.scss";

const ApplicationLoggedInContainer = () => {
  const [loading, setLoading] = useState(false);
  const [signatureUpdates, setSignatureUpdates] = useState(store.get("signature_updates"));
  const { currentWorkspaces, setCurrentUser, setCurrentWorkspaces } = useSession();
  const didRender = useRef();

  const emailsWithSignature = map(filter(currentWorkspaces, (workspace) => isSubscriptionActiveForWorkspace(workspace) && workspace.co_worker), (workspace) => { return { workspaceId: workspace.id, emails: workspace.co_worker.emails.filter((email) => email.has_signature) }; });
  const workspacesWithCoWorker = filter(currentWorkspaces, (workspace) => workspace.co_worker);

  const handleRefresh = () => {
    setLoading(true);
    getSession().then((response) => {
      setCurrentUser(response.data.user);
      setCurrentWorkspaces(response.data.workspaces);
      setWorkspaces(response.data.workspaces);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleUpdate = () => {
    console.log(emailsWithSignature);
    emailsWithSignature.map((tuple) => (
      tuple.emails.map((email) => (
        updateSignature(tuple.workspaceId, email.signature_id, email.email, () => {
          setSignatureUpdates(store.get("signature_updates"));
        })
      ))
    ));
  };

  const installEmail = (workspaceId, email) => {
    console.log(workspaceId, email.signature_id, email);
    updateSignature(workspaceId, email.signature_id, email.email, () => {
      setSignatureUpdates(store.get("signature_updates"));
    });
  };

  const updateMessage = () => {
    if (store.get("update_apple_mail") && store.get("update_outlook")) {
      return t`Install signature in Outlook and Apple Mail`;
    }
    if (store.get("update_outlook")) {
      return t`Install signature in Outlook`;
    }
    return t`Install signature in Apple Mail`;
  };

  const emailsWithSignatureForWorkspace = (workspace) => {
    if (!isSubscriptionActiveForWorkspace(workspace)) {
      return [];
    }
    return workspace.co_worker.emails.filter((email) => email.has_signature);
  };

  useEffect(() => {
    if (!didRender.current) {
      ipcRenderer.on("message-from-worker", (event, arg) => {
        if (arg.command === "signatureUpdated") {
          setSignatureUpdates(store.get("signature_updates"));
        }
        if (arg.command === "updateSignatures") {
          handleUpdate();
        }
      });
      didRender.current = true;
    }
  }, []);

  return (
    <>
      <div className="d-flex mt-2 mb-3 align-items-end">
        <h1 className="mt-0 mb-0"><Trans>Your signatures</Trans></h1>
        <a href="#" onClick={ handleRefresh } className="ml-auto" id="refresh-icon" aria-label="Refresh"><Icon icon="button-refresh-arrows" className="icon-refresh" /></a>
        <UncontrolledTooltip placement="left" target="refresh-icon">
          <Trans>Refresh signature list</Trans>
        </UncontrolledTooltip>
      </div>
      { loading && <div className="d-flex align-items-center justify-content-center" style={ { height: "150px" } }><Loader /></div> }
      { !loading && (
        <>
          { workspacesWithCoWorker.map((workspace) => (
            <React.Fragment key={ `workspace-signatures-${workspace.id}` }>
              <div className="d-flex align-items-center mb-1">
                <WorkspaceImage workspace={ workspace } className="mr-1" size={ 30 } />
                <h2 className="mb-0">{ workspace.name }</h2>
              </div>
              { emailsWithSignatureForWorkspace(workspace).length > 0 && (
                <div className="mb-2">
                  { emailsWithSignatureForWorkspace(workspace).map((email) => (
                    <div key={ `email-${email.id}` } className="mb-2 d-flex align-items-center">
                      <div>
                        { email.email }
                        <div className="update-date">
                          { get(signatureUpdates, email.signature_id) && (
                            <>
                              <Trans>Installed <TimeAgo datetime={ get(signatureUpdates, email.signature_id) } locale="en" /></Trans>
                            </>
                          ) }
                          { !get(signatureUpdates, email.signature_id) && <Trans>Never updated</Trans> }
                        </div>
                      </div>
                      <div className="ml-auto">
                        <a href="#" onClick={ () => { installEmail(workspace.id, email); } } className="ml-1">
                          <Icon icon="desktop-monitor-download" className="icon-install" id={ `install-email-${email.id}` } />
                        </a>
                        <UncontrolledTooltip placement="left" target={ `install-email-${email.id}` }>
                          { updateMessage() }
                        </UncontrolledTooltip>
                      </div>
                    </div>
                  )) }
                </div>
              ) }
              { emailsWithSignatureForWorkspace(workspace).length === 0 && (
                <div className="mb-2 wrong-subscription">
                  <Trans>
                    There is an issue with this workspace subscription<br /> Contact your admin to resolve the issue
                  </Trans>
                </div>
              ) }
            </React.Fragment>
          )) }
        </>
      ) }
    </>
  );
};

export default ApplicationLoggedInContainer;
