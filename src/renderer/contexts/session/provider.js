import React, { useState, useEffect } from "react";
import PropTypes                      from "prop-types";
import { setBugsnagUser }             from "services/bugsnag";
import SessionContext                 from "renderer/contexts/session/context";
import { getSession }                 from "requests/session";
import { Loader }                     from "renderer/components/ui";

const SessionProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();
  const [currentWorkspaces, setCurrentWorkspaces] = useState(null);

  const deleteCurrentUser = () => {
    setCurrentUser(null);
  };

  const deleteCurrentWorkspaces = () => {
    setCurrentWorkspaces(null);
  };

  useEffect(() => {
    getSession().then((response) => {
      setCurrentUser(response.data.user);
      setCurrentWorkspaces(response.data.workspaces);
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
        currentWorkspaces,
        setCurrentUser,
        setCurrentWorkspaces,
        deleteCurrentUser,
        deleteCurrentWorkspaces
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
