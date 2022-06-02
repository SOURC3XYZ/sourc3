Var CUSTOM_STR_HAYSTACK
Var CUSTOM_STR_NEEDLE
Var CUSTOM_STR_CONTAINS_VAR_1
Var CUSTOM_STR_CONTAINS_VAR_2
Var CUSTOM_STR_CONTAINS_VAR_3
Var CUSTOM_STR_CONTAINS_VAR_4
Var CUSTOM_STR_RETURN_VAR

Function CustomStrContains
  Exch $CUSTOM_STR_NEEDLE
  Exch 1
  Exch $CUSTOM_STR_HAYSTACK
  ; Uncomment to debug
  ;MessageBox MB_OK 'CUSTOM_STR_NEEDLE = $CUSTOM_STR_NEEDLE CUSTOM_STR_HAYSTACK = $CUSTOM_STR_HAYSTACK '
    StrCpy $CUSTOM_STR_RETURN_VAR ""
    StrCpy $CUSTOM_STR_CONTAINS_VAR_1 -1
    StrLen $CUSTOM_STR_CONTAINS_VAR_2 $CUSTOM_STR_NEEDLE
    StrLen $CUSTOM_STR_CONTAINS_VAR_4 $CUSTOM_STR_HAYSTACK
    loop:
      IntOp $CUSTOM_STR_CONTAINS_VAR_1 $CUSTOM_STR_CONTAINS_VAR_1 + 1
      StrCpy $CUSTOM_STR_CONTAINS_VAR_3 $CUSTOM_STR_HAYSTACK $CUSTOM_STR_CONTAINS_VAR_2 $CUSTOM_STR_CONTAINS_VAR_1
      StrCmp $CUSTOM_STR_CONTAINS_VAR_3 $CUSTOM_STR_NEEDLE found
      StrCmp $CUSTOM_STR_CONTAINS_VAR_1 $CUSTOM_STR_CONTAINS_VAR_4 done
      Goto loop
    found:
      StrCpy $CUSTOM_STR_RETURN_VAR $CUSTOM_STR_NEEDLE
      Goto done
    done:
   Pop $CUSTOM_STR_NEEDLE ;Prevent "invalid opcode" errors and keep the
   Exch $CUSTOM_STR_RETURN_VAR
FunctionEnd

!macro _CustomStrContainsConstructor OUT NEEDLE HAYSTACK
  Push `${HAYSTACK}`
  Push `${NEEDLE}`
  Call CustomStrContains
  Pop `${OUT}`
!macroend

!define CustomStrContains '!insertmacro "_CustomStrContainsConstructor"'

!macro customInstall
    ReadRegStr $1 HKCU "Environment" Path
    MessageBox MB_OK "Current PATH: $1. Copy it somewhere."
    StrCpy $2 "$LOCALAPPDATA\Programs\${APP_FILENAME}"

    ${CustomStrContains} $0 $1 $2
    ${If} $0 == ""
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
