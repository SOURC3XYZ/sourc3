!define Environ 'HKCU "Environment"'

Function AddToPath
    Exch $0
    Push $1
    Push $2
    Push $3
    Push $4

    ; NSIS ReadRegStr returns empty string on string overflow
    ; Native calls are used here to check actual length of PATH

    ; $4 = RegOpenKey(HKEY_CURRENT_USER, "Environment", &$3)
    System::Call "advapi32::RegOpenKey(i 0x80000001, t'Environment', *i.r3) i.r4"
    IntCmp $4 0 0 done done
    ; $4 = RegQueryValueEx($3, "PATH", (DWORD*)0, (DWORD*)0, &$1, ($2=NSIS_MAX_STRLEN, &$2))
    ; RegCloseKey($3)
    System::Call "advapi32::RegQueryValueEx(i $3, t'PATH', i 0, i 0, t.r1, *i ${NSIS_MAX_STRLEN} r2) i.r4"
    System::Call "advapi32::RegCloseKey(i $3)"

    IntCmp $4 234 0 +4 +4 ; $4 == ERROR_MORE_DATA
        DetailPrint "AddToPath: original length $2 > ${NSIS_MAX_STRLEN}"
        MessageBox MB_OK "PATH not updated, original length $2 > ${NSIS_MAX_STRLEN}"
        Goto done

    IntCmp $4 0 +5 ; $4 != NO_ERROR
        IntCmp $4 2 +3 ; $4 != ERROR_FILE_NOT_FOUND
            DetailPrint "AddToPath: unexpected error code $4"
            Goto done
        StrCpy $1 ""

    ; Check if already in PATH
    Push "$1;"
    Push "$0;"
    Call StrStr
    Pop $2
    StrCmp $2 "" 0 done
    Push "$1;"
    Push "$0\;"
    Call StrStr
    Pop $2
    StrCmp $2 "" 0 done

    ; Prevent NSIS string overflow
    StrLen $2 $0
    StrLen $3 $1
    IntOp $2 $2 + $3
    IntOp $2 $2 + 2 ; $2 = strlen(dir) + strlen(PATH) + sizeof(";")
    IntCmp $2 ${NSIS_MAX_STRLEN} +4 +4 0
        DetailPrint "AddToPath: new length $2 > ${NSIS_MAX_STRLEN}"
        MessageBox MB_OK "PATH not updated, new length $2 > ${NSIS_MAX_STRLEN}."
        Goto done

    ; Append dir to PATH
    DetailPrint "Add to PATH: $0"
    StrCpy $2 $1 1 -1
    StrCmp $2 ";" 0 +2
        StrCpy $1 $1 -1 ; remove trailing ';'
    StrCmp $1 "" +2   ; no leading ';'
        StrCpy $0 "$1;$0"
    WriteRegExpandStr ${Environ} "PATH" $0
    SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000

done:
    Pop $4
    Pop $3
    Pop $2
    Pop $1
    Pop $0
FunctionEnd

!macro customInstall
    Push $PROJECT_DIR
    Call AddToPath
    File /oname=$PROJECT_DIR\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend
