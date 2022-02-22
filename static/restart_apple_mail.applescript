set processName to "Mail"

tell application "System Events"
  if exists process processName then
    my quitIt(processName)
  end if
  repeat while (exists process processName)
    delay 0.2
  end repeat
  my launchIt(processName)
end tell

on quitIt(processName)
  tell application processName
    quit
  end tell
end quitIt

on launchIt(processName)
  tell application processName
    activate
  end tell
end launchIt
