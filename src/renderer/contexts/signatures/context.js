import React from "react";

const SignaturesContext = React.createContext({
  signatures:               [],
  workspacesWithSignatures: [],
  updatedAtForSignature:    () => { },
  loadingForSignature:      () => { },
  updateOnDiskForSignature: () => { },
  updateAllOnDisk:          () => { }
});

export default SignaturesContext;
