!macro customInstall
    ReadRegStr $1 HKCU "Environment" Path
    MessageBox MB_OK "Current PATH: $1. Copy it somewhere."
    StrCpy $2 "$LOCALAPPDATA\Programs\${APP_FILENAME}"

    Push $1
    Push $2
    Call StrContains
    Pop $0
    StrCmp $0 "" add
        Goto done
add:
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
done:
    File /oname=$LOCALAPPDATA\Programs\${APP_FILENAME}\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend
