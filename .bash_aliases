alias firebase='npx firebase-tools'
alias work-dir='cd ~/workspace'
alias emulators-dir='work-dir && cd webservice'
alias emulators-start='emulators-dir && firebase emulators:start --import export/emulators/'
alias emulators-export='emulators-dir && firebase emulators:export --force export/emulators/'
