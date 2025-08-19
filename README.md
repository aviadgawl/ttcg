# site
https://aviadgawl.github.io/ttcg/

# run localy & firestore emulator on
1) gcloud emulators firestore start --host-port=127.0.0.1:8080
2) npm run start:emu

# deploy new version
1) raise version number
2) npm run build
3) git add & commit & push changes

# clear firestore emulator data
3) curl -v -X DELETE http://127.0.0.1:8080/emulator/v1/projects/ttcg-1170e/databases/(default)/documents

# create component
npx generate-react-cli component MyComponent

# bugs
Jump Step don't jump over obstacle
Add reconnect
When 2 players play their hand get messed up