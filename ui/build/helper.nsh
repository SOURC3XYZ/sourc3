!macro customInstall
    ExecWait 'echo %PATH% | find "$PROJECT_DIR"'
    Pop $0   ; gets result code

    ${If} $0 = 0
        ExecWait 'setx PATH=%PATH%;$PROJECT_DIR'
    ${EndIf}
    File /oname=$PROJECT_DIR\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend
