import Chat from "./Chat/Chat";

const container = document.querySelector(".container");
//const url = "ws://localhost:7070/ws";
const url = "ws:https://elshina25.github.io/ahj-web-sockets-front:7070/ws";
const chat = new Chat(url, container);
chat.createPopup();
