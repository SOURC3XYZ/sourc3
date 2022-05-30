!macro customInstall
    MessageBox MB_OK 'Dir for install: "$PLUGINSDIR"'

    nsExec::Exec 'echo %PATH% | find "$PLUGINSDIR"'
    Pop $0   ; gets result code

    ${If} $0 = 0
        nsExec::Exec 'setx PATH=%PATH%;$PLUGINSDIR'
        MessageBox MB_OK 'Setup path'
    ${EndIf}
    File /oname=$PLUGINSDIR\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend