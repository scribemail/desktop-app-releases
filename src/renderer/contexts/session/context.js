import React from "react";

const SessionContext = React.createContext({
  currentUser:          null,
  currentAccount:       null,
  setCurrentUser:       () => {},
  setCurrentAccount:    () => {},
  deleteCurrentUser:    () => {},
  deleteCurrentAccount: () => {}
});

export default SessionContext;
