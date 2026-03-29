@echo off
setlocal enabledelayedexpansion

set API=http://localhost:3001/api/events
set TOTAL=600
set ELAPSED=0
set COUNT=0

echo Starting simulation (~10 minutes)...
echo Press Ctrl+C to stop early.
echo.

:loop
if !ELAPSED! geq !TOTAL! goto done

set /a USER_ID=%RANDOM% %% 90 + 1
set /a TYPE_IDX=%RANDOM% %% 5

if !TYPE_IDX!==0 (
    set EVENT_TYPE=email_deleted
    set /a SIZE=%RANDOM% %% 2800 + 200
    set METADATA={\"sizeMb\":!SIZE!}
)
if !TYPE_IDX!==1 (
    set EVENT_TYPE=attachment_removed
    set /a SIZE=%RANDOM% %% 1900 + 100
    set METADATA={\"sizeMb\":!SIZE!}
)
if !TYPE_IDX!==2 (
    set EVENT_TYPE=cache_cleared
    set /a SIZE=%RANDOM% %% 3500 + 500
    set METADATA={\"sizeMb\":!SIZE!}
)
if !TYPE_IDX!==3 (
    set EVENT_TYPE=unsubscribe_action
    set METADATA={}
)
if !TYPE_IDX!==4 (
    set EVENT_TYPE=mailbox_scanned
    set /a SIZE=%RANDOM% %% 7000 + 1000
    set METADATA={\"sizeMb\":!SIZE!}
)

set /a COUNT+=1
set /a MINS=ELAPSED / 60
set /a SECS=ELAPSED %% 60

curl -s -o NUL -w "%%{http_code}" -X POST "%API%" -H "Content-Type: application/json" -d "{\"userId\":!USER_ID!,\"eventType\":\"!EVENT_TYPE!\",\"metadata\":!METADATA!}" > tmp_code.txt 2>&1
set /p CODE=<tmp_code.txt
del tmp_code.txt

echo [!MINS!m !SECS!s] #!COUNT! user=!USER_ID! !EVENT_TYPE! =^> !CODE!

set /a DELAY=%RANDOM% %% 11 + 5
timeout /t !DELAY! /nobreak > NUL
set /a ELAPSED+=DELAY
goto loop

:done
echo.
echo Simulation complete. !COUNT! events posted.
