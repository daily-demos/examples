const ROOM_URL = "https://acb.daily.co/no-chat"

async function setup() {
  callFrame = DailyIframe.createFrame({
    url: ROOM_URL,
    showLeaveButton: true,
    iframeStyle: {
      position: 'fixed',
      border: 0,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });
  await callFrame.join();
  document.getElementById("chatBox").classList.remove('hidden');
  addChatBox()
}

function addChatMsg(event) {
  const chatMsg = document.createElement("p");
  chatMsg.innerText = (`${callFrame.participants()[event.fromId].user_name  }: ${  event.data.message}`)
  document.getElementById("chatBoxTexts").appendChild(chatMsg)
}

function addChatBox() {
  callFrame.on("app-message", (event) => addChatMsg(event))
}

document.getElementById("chatBox").addEventListener("keyup", (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("chatBoxButton").click();
  }
});

document.getElementById("chatBoxButton").addEventListener("click", () => {
  let inputVal = document.getElementById("chatBoxInput").value;
  callFrame.sendAppMessage({ message: inputVal }, '*');
  const chatMsg = document.createElement("p");
  chatMsg.innerText = (`${callFrame.participants().local.user_name  }: ${ inputVal }`);
  document.getElementById("chatBoxTexts").appendChild(chatMsg);
  document.getElementById("chatBoxInput").value = "";
})