import React                   from "react";
import PropTypes               from "prop-types";
import { clientNames }         from "services/client";
import { useSignatures }       from "renderer/contexts/signatures/hooks";
import { Trans }               from "@lingui/macro";
import { Icon }                from "renderer/components/ui";
import { UncontrolledTooltip } from "reactstrap";
import TimeAgo                 from "timeago-react";

const SignaturesListItem = ({ signature }) => {
  const { updatedAtForSignature, loadingForSignature, updateOnDiskForSignature } = useSignatures();

  return (
    <div key={ `email-${signature.id}` } className="mb-2 d-flex align-items-center">
      <div>
        { signature.email.email }
        <div className="update-date">
          { updatedAtForSignature(signature) && (
            <>
              <Trans>Installed <TimeAgo datetime={ updatedAtForSignature(signature) } locale="en" /></Trans>
            </>
          ) }
          { !updatedAtForSignature(signature) && <Trans>Never updated</Trans> }
        </div>
      </div>
      <div className="ml-auto">
        { !loadingForSignature(signature) && (
          <>
            <a href="#" onClick={ () => { updateOnDiskForSignature(signature); } } className="ml-1">
              <Icon icon="desktop-monitor-download" className="icon-install" id={ `install-signature-${signature.id}` } />
            </a>
            <UncontrolledTooltip placement="left" target={ `install-signature-${signature.id}` }>
              <Trans>Install signature in { clientNames() }</Trans>
            </UncontrolledTooltip>
          </>
        ) }
        { loadingForSignature(signature) && <Icon icon="loading" className="icon-install icon-is-spinning" /> }
      </div>
    </div>
  );
};

SignaturesListItem.propTypes = {
  signature: PropTypes.object.isRequired
};

export default SignaturesListItem;
