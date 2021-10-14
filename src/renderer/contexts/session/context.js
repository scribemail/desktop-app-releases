import React from "react";

const SessionContext = React.createContext({
  currentUser:            null,
  currentWorkspace:       null,
  setCurrentUser:         () => {},
  setCurrentWorkspace:    () => {},
  deleteCurrentUser:      () => {},
  deleteCurrentWorkspace: () => {}
});

export default SessionContext;
