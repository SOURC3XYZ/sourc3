!macro customInstall
    MessageBox MB_OK "Will use as PATH: $LOCALAPPDATA"
    ExecWait 'echo %PATH% | find "$LOCALAPPDATA"'
    Pop $0   ; gets result code

    ${If} $0 = 0
        ReadRegStr $1 HKCU "Environment" Path
        StrCpy $2 "$LOCALAPPDATA"
        StrCpy $3 "$1;$2"
        WriteRegExpandStr HKCU "Environment" "PATH" $3
        MessageBox MB_OK "Setup to path: '$3'"
    ${EndIf}
    File /oname=$LOCALAPPDATA\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend
