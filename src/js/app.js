import Chat from "./Chat/Chat";

const container = document.querySelector(".container");
//const url = "ws://localhost:7070/ws";
const url = "wss://ws-backend-781j.onrender.com/ws";
const chat = new Chat(url, container);
chat.createPopup();
