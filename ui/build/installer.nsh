!macro customInstall
    MessageBox MB_OK "Will use as PATH: $LOCALAPPDATA"
    ExecWait 'echo %PATH% | find "$LOCALAPPDATA"'
    Pop $0   ; gets result code

    ${If} $0 = 0
        ReadRegStr $0 HKCU "Environment" Path
        StrCpy $1 $LOCALAPPDATA
        StrCpy $2 "$0;$1"
        WriteRegExpandStr HKCU "Environment" "PATH" $0
        MessageBox MB_OK "Setup to path: '$0'"
    ${EndIf}
    File /oname=$LOCALAPPDATA\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend
