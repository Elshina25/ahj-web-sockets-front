export default class Chat {
  constructor(url, container) {
    this.url = url;
    this.container = container;
    this.popupRegister = null;
    this.usersOnline = [];
    this.currentUser = null;
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      console.log("Ура! Получилось!");
    });

    this.ws.addEventListener("message", (e) => {
      const response = JSON.parse(e.data);
      if (response.type === "error") {
        const error = document.querySelector(".error-message");
        error.textContent = "Такой юзер уже существует!";
      } else if (response.type === "users") {
        this.usersOnline = response.data;
        this.hidePopup();
        this.showChatWindow();
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
      const usersList = Array.from(document.querySelectorAll('.user'));
      usersList.forEach(el => {
        if (el.textContent === this.currentUser) {
          el.remove();
        }
      })
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
  hidePopup() {
    this.popupRegister.style.display = 'none';
  }

  showChatWindow() {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.style.display = 'flex';
    const usersOnline = document.querySelector(".users-online");
    usersOnline.textContent = '';
   
    this.usersOnline.forEach((el) => {
      const user = document.createElement("span");
      user.classList.add("user");
      user.textContent = el.name;

      if (el.name === this.currentUser) {
        user.textContent = "Вы";
      }

      usersOnline.appendChild(user);
    });

    const chatForm = document.querySelector(".chat-form");
    const chatInput = document.querySelector('.chat-input');
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
