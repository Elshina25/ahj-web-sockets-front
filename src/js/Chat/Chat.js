export default class Chat {
  constructor(url, container) {
    this.url = url;
    this.container = container;
    this.popupRegister = null;
    this.chatWindow = null;
    this.usersOnline = [];
    this.currentUser = null;
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      console.log("Ура! Получилось!");
    });

    this.ws.addEventListener("message", (e) => {
      const response = JSON.parse(e.data);
      console.log(response);

      if (response.type === "error") {
        const error = document.querySelector(".error-message");
        error.textContent = "Такой юзер уже существует!";
      } else if (response.type === "users") {
        this.usersOnline = response.data;
        this.removePopup();
        this.createChatWindow();
      } else if (response.type === "sendMessage") {
        this.showNewMessage(response.data.data);
      }
    });

    this.ws.addEventListener("close", (e) => {
      console.log("Соединение прервано", e.code);
    });

    this.ws.addEventListener("error", () => {
      console.log("...ooops!");
    });

    window.addEventListener("beforeunload", () => {
      this.ws.send(
        JSON.stringify({ type: "deleteUser", username: this.currentUser })
      );
    });
  }

  //создание формы и отправка имени юзера
  createPopup() {
    this.popupRegister = document.createElement("div");
    this.popupRegister.classList.add("popup-register");
    this.container.appendChild(this.popupRegister);

    const registerForm = document.createElement("form");
    registerForm.classList.add("form", "register-form");

    const registerInput = document.createElement("input");
    registerInput.classList.add("input", "register-input");
    registerInput.setAttribute("type", "text");
    registerInput.setAttribute("name", "username");

    const registerButton = document.createElement("button");
    registerButton.classList.add("button", "register-button");
    registerButton.textContent = "Продолжить";

    const registerFormName = document.createElement("span");
    registerFormName.classList.add("form-name", "form-name-register");
    registerFormName.textContent = "Выберите псевдоним";

    const error = document.createElement("span");
    error.classList.add("error-message");

    registerForm.append(registerFormName, registerInput, registerButton, error);

    this.popupRegister.appendChild(registerForm);

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = registerInput.value;
      const response = { type: "createUser", username: username };
      console.log(response);
      this.ws.send(JSON.stringify(response));
      this.currentUser = username;
      registerForm.reset();
    });
  }

  //удаление попапа с формой регистрации
  removePopup() {
    this.container.removeChild(this.popupRegister);
  }

  createChatWindow() {
    this.chatWindow = document.createElement("div");
    this.chatWindow.classList.add("chat-window");
    this.container.appendChild(this.chatWindow);

    const usersOnline = document.createElement("div");
    usersOnline.classList.add("users-online");

    this.usersOnline.forEach((el) => {
      const user = document.createElement("span");
      user.classList.add("user");
      user.textContent = el.name;

      if (el.name === this.currentUser) {
        user.textContent = "Вы";
      }

      usersOnline.appendChild(user);
    });

    const messagesWindow = document.createElement("div");
    messagesWindow.classList.add("message-window");

    const chatForm = document.createElement("form");
    chatForm.classList.add("form", "chat-form");

    const chatInput = document.createElement("input");
    chatInput.classList.add("input", "chat-input");
    chatInput.setAttribute("type", "text");
    chatInput.setAttribute("name", "message");

    const sendButton = document.createElement("button");
    sendButton.classList.add("button", "send-button");
    sendButton.textContent = "Отправить";

    chatForm.append(chatInput, sendButton);

    this.chatWindow.append(usersOnline, messagesWindow, chatForm);

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const message = chatInput.value;
      const timestamp = `${new Date().toLocaleDateString()} ${new Date()
        .toLocaleTimeString()
        .slice(0, -3)}`;
      this.ws.send(
        JSON.stringify({
          type: "sendMessage",
          data: {
            name: this.currentUser,
            message,
            timestamp,
          },
        })
      );

      chatForm.reset();
    });
  }

  createMessage(data) {
    const message = document.createElement("div");
    message.classList.add("new-message");

    const username = document.createElement("span");
    username.classList.add("username");

    const time = document.createElement("span");
    time.classList.add("time");
    time.textContent = data.timestamp;

    const messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageText.textContent = data.message;

    if (data.name === this.currentUser) {
      username.textContent = "Вы";
      message.classList.add("you-message");
    } else {
      message.classList.remove("you-message");
      username.textContent = data.name;
    }

    message.append(username, time, messageText);

    return message;
  }

  showNewMessage(data) {
    const message = this.createMessage(data);
    this.container.querySelector(".message-window").appendChild(message);
  }
}
