import React, { useContext } from "react";
import SessionContext        from "renderer/contexts/session/context";

export const useSession = () => useContext(SessionContext);
