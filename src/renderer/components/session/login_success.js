import React, { useEffect } from "react";
import { Icon, Button }     from "renderer/components/ui";
import { useNavigate }      from "react-router-dom";
import { clientNames }      from "services/client";
import { Trans }            from "@lingui/macro";
import { useSignatures }    from "renderer/contexts/signatures/hooks";

const SessionLoginSuccess = () => {
  const navigate = useNavigate();
  const { updateAllOnDisk } = useSignatures();

  const handleContinue = () => {
    navigate("/");
  };

  useEffect(() => {
    updateAllOnDisk();
  }, []);

  return (
    <div className="text-center login-success-block">
      <Icon icon="check-circle-1" className="text-success" /><br />
      <Trans>You are logged in<br />Your signatures have been succcessfully<br />installed on { clientNames() }</Trans>
      <div className="mt-5">
        <Button color="primary" padded onClick={ () => { handleContinue(); } }><Trans>Continue</Trans></Button>
      </div>
    </div>
  );
};

export default SessionLoginSuccess;
