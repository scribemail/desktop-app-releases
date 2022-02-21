set appRef to "com.microsoft.Outlook"
set appBundleId to do shell script "osascript -e " & ("id of application \"" & appRef & "\"")'s quoted form & " || osascript -e " & ("id of application id \"" & appRef & "\"")'s quoted form & " || :"
set doesExist to (appBundleId ≠ "")
return doesExist
