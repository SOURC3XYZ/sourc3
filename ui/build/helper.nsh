!macro customInstall

    nsExec::Exec 'echo %PATH% | find "$PLUGINSDIR"'
    Pop $0   ; gets result code

    ${If} $0 = 0
        File /oname=$PLUGINSDIR\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
        nsExec::Exec 'setx PATH=%PATH%;$PLUGINSDIR'
    ${EndIf}
!macroend
