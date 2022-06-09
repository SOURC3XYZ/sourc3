!macro customInstall
    ReadRegStr $1 HKCU "Environment" Path
    MessageBox MB_OK "Current PATH: $1. Copy it somewhere."
    StrCpy $2 "$LOCALAPPDATA\Programs\${APP_FILENAME}"

    nsExec::ExecToStack 'cmd /c "echo $1 | findstr $2"'
    Pop $0 ; Ignore return code
    Pop $0
    ${If} $0 == ""
        MessageBox MB_OK "Not found, add!"
        StrLen $3 $1
        StrLen $4 $2
        IntOp $3 $3 + $4
        IntOp $3 $3 + 3
        IntCmp $3 ${NSIS_MAX_STRLEN} +4 +4 0
            DetailPrint "AddToPath: new length $3 > ${NSIS_MAX_STRLEN}"
            MessageBox MB_OK "PATH not updated, new length $3 > ${NSIS_MAX_STRLEN}."
            Goto done
        StrCpy $5 "$1;$2;"
        WriteRegExpandStr HKCU "Environment" "PATH" $5
    ${EndIf}
done:
    File /oname=$LOCALAPPDATA\Programs\${APP_FILENAME}\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
    ; File /oname=$LOCALAPPDATA\..\.sourc3\app.wasm "${BUILD_RESOURCES_DIR}\app.wasm"
    ; File /oname=$LOCALAPPDATA\..\.sourc3\sourc3-remote.cfg "${BUILD_RESOURCES_DIR}\sourc3-remote.cfg"
!macroend
