!define StrStr "!insertmacro StrStr"

!macro StrStr ResultVar String SubString
  Push `${String}`
  Push `${SubString}`
  Call StrStr
  Pop `${ResultVar}`
!macroend

Function StrStr
/*After this point:
  ------------------------------------------
  $R0 = SubString (input)
  $R1 = String (input)
  $R2 = SubStringLen (temp)
  $R3 = StrLen (temp)
  $R4 = StartCharPos (temp)
  $R5 = TempStr (temp)*/

  ;Get input from user
  Exch $R0
  Exch
  Exch $R1
  Push $R2
  Push $R3
  Push $R4
  Push $R5

  ;Get "String" and "SubString" length
  StrLen $R2 $R0
  StrLen $R3 $R1
  ;Start "StartCharPos" counter
  StrCpy $R4 0

  ;Loop until "SubString" is found or "String" reaches its end
  loop:
    ;Remove everything before and after the searched part ("TempStr")
    StrCpy $R5 $R1 $R2 $R4

    ;Compare "TempStr" with "SubString"
    StrCmp $R5 $R0 done
    ;If not "SubString", this could be "String"'s end
    IntCmp $R4 $R3 done 0 done
    ;If not, continue the loop
    IntOp $R4 $R4 + 1
    Goto loop
  done:

/*After this point:
  ------------------------------------------
  $R0 = ResultVar (output)*/

  ;Remove part before "SubString" on "String" (if there has one)
  StrCpy $R0 $R1 `` $R4

  ;Return output to user
  Pop $R5
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Exch $R0
FunctionEnd

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
    WriteRegExpandStr HKCU "Environment" "PATH" $0

done:
    Pop $4
    Pop $3
    Pop $2
    Pop $1
    Pop $0
FunctionEnd


!macro customInstall
    MessageBox MB_OK "Will use as PATH: $LOCALAPPDATA"
    Push $LOCALAPPDATA
    Call AddToPath
    File /oname=$LOCALAPPDATA\git-remote-sourc3.exe "${BUILD_RESOURCES_DIR}\git-remote-sourc3.exe"
!macroend