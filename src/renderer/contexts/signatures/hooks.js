import React, { useContext } from "react";
import SignaturesContext     from "renderer/contexts/signatures/context";

export const useSignatures = () => useContext(SignaturesContext);
