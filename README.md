# firestore emulator on

1) gcloud emulators firestore start --host-port=127.0.0.1:8080
2) npm run start:test

# clear firestore emulator data
3) curl -v -X DELETE http://127.0.0.1:8080/emulator/v1/projects/ttcg-1170e/databases/games/documents

# create component
npx generate-react-cli component MyComponent

# bugs
