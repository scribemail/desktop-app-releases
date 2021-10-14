import React, { useState, useEffect } from "react";
import PropTypes                      from "prop-types";
import { setBugsnagUser }             from "services/bugsnag";
import SessionContext                 from "renderer/contexts/session/context";
import { getSession }                 from "requests/session";
import { Loader }                     from "renderer/components/ui";

const SessionProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  const deleteCurrentUser = () => {
    setCurrentUser(null);
  };

  const deleteCurrentWorkspace = () => {
    setCurrentWorkspace(null);
  };

  useEffect(() => {
    getSession().then((response) => {
      setCurrentUser(response.data.user);
      setCurrentWorkspace(response.data.account || response.data.workspace);
      setBugsnagUser(response.data.user.id, response.data.user.email, response.data.user.display_name);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Loader centered />
    );
  }

  return (
    <SessionContext.Provider
      value={ {
        currentUser,
        currentWorkspace,
        setCurrentUser,
        setCurrentWorkspace,
        deleteCurrentUser,
        deleteCurrentWorkspace
      } }
    >
      { children }
    </SessionContext.Provider>
  );
};

SessionProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export default SessionProvider;
