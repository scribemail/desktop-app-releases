import React, { useState, useEffect } from "react";
import PropTypes                      from "prop-types";
import SessionContext                 from "renderer/contexts/session/context";
import { getSession }                 from "requests/session";
import { Loader }                     from "renderer/components/ui";

const SessionProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();
  const [currentAccount, setCurrentAccount] = useState(null);

  const deleteCurrentUser = () => {
    setCurrentUser(null);
  };

  const deleteCurrentAccount = () => {
    setCurrentAccount(null);
  };

  useEffect(() => {
    getSession().then((response) => {
      setCurrentUser(response.data.user);
      setCurrentAccount(response.data.account);
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
        currentAccount,
        setCurrentUser,
        setCurrentAccount,
        deleteCurrentUser,
        deleteCurrentAccount
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
