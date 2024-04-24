import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Room } from "./Room";
import { ChatProvider } from "../context/ChatContext";
import { RoomContext } from "../context/RoomContext";

test("chat button toggles chat", () => {
    render(
        <ChatProvider>
            <Room />
        </ChatProvider>
    );
    
    const chatButton = screen.getByTestId("chat-button");
    fireEvent(
        chatButton,
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      );
    
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
});

const customRender = (ui: any, providerProps = {}) => {
  const defaultProps = {
    value: {
      peers: {
        'qew': {
          stream: {} as MediaStream,
          userName: "",
          peerId: 'qewew',
        },
        'qewwgh': {
          stream: {} as MediaStream,
          userName: "",
          peerId: 'qewewq',
        },
        'qeqghw': {
          stream: {} as MediaStream,
          userName: "",
          peerId: 'qewewqa',
        },
      },
      screenSharingId: "",
      shareScreen: () => {},
      setRoomId: () => {},
      roomId: "q",
    },
  };
  const props = {...defaultProps, ...providerProps}
  return render(
    <RoomContext.Provider {...props}>{ui}</RoomContext.Provider>
  );
};

test("room page renders video for every peer", () => {
  customRender(<Room />, {});
  const videos = screen.getAllByTestId("peer-video");
  expect(videos).toHaveLength(3);
});
