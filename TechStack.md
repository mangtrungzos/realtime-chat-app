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
