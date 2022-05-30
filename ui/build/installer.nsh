!macro customInstall
    MessageBox MB_OK 'Start custom part'

    ExecWait 'echo %PATH% | find "$PROJECT_DIR"'
    MessageBox MB_OK 'Check for path'
    Pop $0   ; gets result code

    ${If} $0 = 0
        ExecWait 'setx PATH=%PATH%;$PROJECT_DIR'
        MessageBox MB_OK 'Setup path'
    ${EndIf}
    File /oname=$PROJECT_DIR\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
    MessageBox MB_OK 'Copy file, end custom part'
!macroend