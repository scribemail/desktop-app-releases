SET DESKTOP_APP_VERSION="1.2.4"
xcopy "\\Mac\Host\\Users\gva\Projects\scribe\desktop-app\dist\Scribe Setup %DESKTOP_APP_VERSION%.exe" "\\Mac\Host\\Users\gva\Projects\scribe\desktop-app\dist\intune_source\"
\\Mac\Host\\Users\gva\Projects\scribe\desktop-app\build\IntuneWinAppUtil.exe -c \\Mac\Host\\Users\gva\Projects\scribe\desktop-app\dist\intune_source -s "Scribe Setup %DESKTOP_APP_VERSION%.exe" -o \\Mac\Host\\Users\gva\Projects\scribe\desktop-app\dist
