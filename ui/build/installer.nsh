!macro customInstall
    Push $0
    Push $1
    Push $2
    Push $3
    Push $4
    Push $5
    
    ReadRegStr $0 HKCU "Environment" Path
    MessageBox MB_YESNO "Current PATH: $0. Copy it to clipboard?" IDYES copy IDNO nocopy
copy:
    Push $0
    Exch $0
    Push $1
    Push $2
    Push $3
    
    System::Call 'user32::OpenClipboard(i 0)'
    System::Call 'user32::EmptyClipboard()'
    StrLen $1 $0
    IntOp $1 $1 + 1
    !ifdef NSIS_UNICODE
    IntOp $1 $1 * ${NSIS_CHAR_SIZE}
    StrCpy $3 13
    !else
    StrCpy $3 1
    !endif
    MessageBox MB_OK "Size of path: $1"
    System::Call 'kernel32::GlobalAlloc(i 2, i r1) i.r1'
    System::Call 'kernel32::GlobalLock(i r1) p.r2'
    !ifdef NSIS_UNICODE
    System::Call 'kernel32::lstrcpyW(i r2, w r0)'
    !else
    System::Call 'kernel32::lstrcpyA(i r2, m r0)'
    !endif
    System::Call 'kernel32::GlobalUnlock(i r1)'
    System::Call 'user32::SetClipboardData(i r3, i r1)'
    System::Call 'user32::CloseClipboard()'
   
    Pop $3
    Pop $2
    Pop $1
    Pop $0
    
nocopy:
    StrCpy $1 $0
    StrCpy $2 "$LOCALAPPDATA\Programs\${APP_FILENAME}"

    nsExec::ExecToStack 'cmd /c "echo $1 | findstr $2"'
    Pop $0 ; Ignore return code
    Pop $0
    ${If} $0 == ""
        MessageBox MB_OK "Not found, add!"
        StrLen $3 $1
        StrLen $4 $2
        IntOp $3 $3 + $4
        IntOp $3 $3 + 2
        IntCmp $3 ${NSIS_MAX_STRLEN} +4 +4 0
            DetailPrint "AddToPath: new length $3 > ${NSIS_MAX_STRLEN}"
            MessageBox MB_OK "PATH not updated, new length $3 > ${NSIS_MAX_STRLEN}."
            Goto done
        StrCpy $5 "$1$2;"
        WriteRegExpandStr HKCU "Environment" "PATH" $5
    ${EndIf}
done:
    File /oname=$LOCALAPPDATA\Programs\${APP_FILENAME}\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
    ; File /oname=$LOCALAPPDATA\..\.sourc3\app.wasm "${BUILD_RESOURCES_DIR}\app.wasm"
    ; File /oname=$LOCALAPPDATA\..\.sourc3\sourc3-remote.cfg "${BUILD_RESOURCES_DIR}\sourc3-remote.cfg"

    Pop $5
    Pop $4
    Pop $3
    Pop $2
    Pop $1
    Pop $0
!macroend
