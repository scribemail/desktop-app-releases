import React, { useState }              from "react";
import { useSession }                   from "renderer/contexts/session/hooks";
import { Trans }                        from "@lingui/macro";
import { clientNames }                  from "services/client";
import store                            from "services/store";
import { ipcRenderer }                  from "electron";
import { useSignatures }                from "renderer/contexts/signatures/hooks";
import { Loader, Icon, WorkspaceImage } from "renderer/components/ui";
import { UncontrolledTooltip }          from "reactstrap";
import SignaturesListItem               from "renderer/components/signatures/List_item";

import "./list.scss";

const SignaturesList = () => {
  const [loading, setLoading] = useState(false);
  const { refresh } = useSession();

  const { workspacesWithSignatures, updateAllOnDisk } = useSignatures();

  const handleRefresh = (event) => {
    event.preventDefault();
    setLoading(true);
    refresh().then(() => {
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleUpdateAll = (event) => {
    event.preventDefault();
    updateAllOnDisk();
    if (!store.get("using_icloud_drive") && process.platform === "darwin") {
      ipcRenderer.send("try-restart-apple-mail");
    }
  };

  return (
    <>
      <div className="d-flex mt-2 mb-3 align-items-end">
        <h1 className="mt-0 mb-0"><Trans>Your signatures</Trans></h1>
        <div className="ml-auto">
          <a href="#" onClick={ handleRefresh } id="refresh-icon" aria-label="Refresh"><Icon icon="button-refresh-arrows" className="icon-refresh" /></a>
          <UncontrolledTooltip placement="left" target="refresh-icon">
            <Trans>Refresh signature list</Trans>
          </UncontrolledTooltip>
          <a href="#" onClick={ handleUpdateAll } id="install-all" aria-label="Refresh" className="ml-2"><Icon icon="desktop-monitor-download" className="icon-refresh" /></a>
          <UncontrolledTooltip placement="left" target="install-all">
            <Trans>Install all signatures in { clientNames() }</Trans>
          </UncontrolledTooltip>
        </div>
      </div>
      { loading && <div className="d-flex align-items-center justify-content-center" style={ { height: "150px" } }><Loader /></div> }
      { !loading && (
        <>
          { workspacesWithSignatures.map((workspace) => (
            <React.Fragment key={ `workspace-signatures-${workspace.id}` }>
              <div className="d-flex align-items-center mb-1">
                <WorkspaceImage workspace={ workspace } className="mr-1" size={ 30 } />
                <h2 className="mb-0">{ workspace.name }</h2>
              </div>
              { workspace.signatures.length > 0 && (
                <div className="mb-2">
                  { workspace.signatures.map((signature) => (
                    <SignaturesListItem key={ `signature-item-${signature.id}` } signature={ signature } />
                  )) }
                </div>
              ) }
              { workspace.signatures.length === 0 && (
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

export default SignaturesList;
