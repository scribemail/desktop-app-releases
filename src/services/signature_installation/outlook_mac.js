/* eslint-disable string-to-lingui/missing-lingui-transformation */

import applescript from "applescript";

const getOutlookAppleScript = (workspaceId, email, html) => {
  const oldSignatureName = `Scribe - ${email}`;
  const signatureName = `Scribe - ${email} - W${workspaceId}`;
  const signatureContent = html.replace(/"/g, "\\\"");
  return `
    tell application id "com.microsoft.Outlook"
      set oldSignatureList to every signature whose name is "${oldSignatureName}"
      if (count oldSignatureList) is 0 then
        set signatureName to "${signatureName}"
      else
        set signatureName to "${oldSignatureName}"
      end
      set signatureList to every signature whose name is signatureName
      if (count signatureList) is 0 then
        make new signature with properties { name: signatureName, content: "${signatureContent}" }
      else
        set counter to 0
        repeat with signatureItem in signatureList
          set counter to counter + 1
          if counter is 1 then
          set the content of signatureItem to the "${signatureContent}"
          else
            delete signatureItem
          end if
        end repeat
      end if
    end tell
  `;
};

export const installOnOutlookMac = (workspaceId, email, html) => (
  new Promise((resolve, reject) => {
    applescript.execString(getOutlookAppleScript(workspaceId, email, html), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })
);
