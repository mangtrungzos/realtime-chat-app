# Tech: ReactJS, TypeScript, WebSockets(Socket.io), NodeJS, TailWind CSS , peerjs
# Create id for room - server
## yarn add uuid @types/uuid
# Deploy heroku

# Run Client / Server / PeerJS
## /Client - yarn start
## /Server - yarn dev
## /WebRTCVideoChat - peerjs --port 9000 --key peerjs --path /myapp

# React router lib - Using react router hooks can access our room id
\\ index.tsx Route Room id with: /room/:id

## Redirect user to the page with our room  - RoomContext
\\ Using navigate - react-router

## Let user know in which room - Room
\\ Use Hooks in react-routr-dom

## If user want to share room with links - Room
\\ Use Websocket

# Create a Peer that will join our server
\\ Install peerJs lib

# Peer-to-Peer connection work
\\ need to call every peer in the room and to send them a video stream - send their own stream to us and show them in the video grid in our room

# Hide and show chat messages

# Add user names
\\ User will be saved in the local storage if it's not some kind of sensitive data, if it's not some token or information we don't want to share and it's just some string like userName or phone or something not so important, not so secure and then we can just save  it in local storage.

# Refractor React WebRTC app

# Testing 
\\ yarn test
## test all file in client 
\\ yarn test --coverage 
\\ Room.test, Chat.test

## End to end tesing with Cypress - client
\\ yarn e2e 
\\ ter: yarn start:all

## Testing with Cypress stub
\\

# git
\\ git push --force origin master

# Deploy WeRTC app to AWS EC2 With docker 
\\ Dockerfile - Use node:18-alpine
\\ AWS

home: "http://mangtrungzos.github.io/WebRTCVideoChat/"