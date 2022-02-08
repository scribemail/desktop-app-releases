import React from "react";

const SessionContext = React.createContext({
  currentUser:             null,
  currentWorkspaces:       [],
  setCurrentUser:          () => {},
  setCurrentWorkspaces:    () => {},
  deleteCurrentUser:       () => {},
  deleteCurrentWorkspaces: () => {},
  refresh:                 () => {}
});

export default SessionContext;
