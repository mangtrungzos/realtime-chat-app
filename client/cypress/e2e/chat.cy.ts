/// <reference types="Cypress" />

describe("Text chat", () => {
    const PeerId = "qwe";
    const userName = "Cypress";
    it("sends message and displays it in the chat", () => {
        cy.visit('http://localhost:3000');
        cy.get("input").type("TrongSang");
        cy.get("button").click();
        cy.get(' [data-testid="chat-button"] ').click();
        cy.get('textarea').type("Hello Cypress");
        cy.get(' [data-testid="send-msg-button"] ').click();
        cy.get(' [data-testid="chat"] ').should("contain.text", "Hello Cypress");
        cy.get(' [data-testid="chat"] ').should("contain.text", "You");
        cy.task("connect");
        cy.url().then((url) => {
            const roomId = url.split("/").reverse()[0];
            cy.task("joinRoom", { roomId, PeerId, userName });
            cy.task("emit", {
                event: "send-message", 
                roomId, 
                eventData: {
                    content: "Hello, Sang!",
                    timestamp: new Date().toLocaleTimeString(),
                    author: "qwe",
            }});
        });
        cy.get(' [data-testid="chat"] ').should("contain.text", "Hello, Sang!");
        cy.get(' [data-testid="chat"] ').should("contain.text", userName);
    });
});