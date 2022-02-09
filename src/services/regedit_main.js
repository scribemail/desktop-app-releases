import regedit   from "regedit";
import { app }   from "electron";
import * as path from "path";

const vbsDirectory = path.join(path.dirname(app.getPath("exe")), "./resources/vbs");

regedit.setExternalVBSLocation(vbsDirectory);

export default regedit;
