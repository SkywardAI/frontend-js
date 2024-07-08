import createChatMain from "./chatMain.js";
import createChatHistory from "./history.js";
import createModelSettings from "./modelSettings.js";

export default function createChatPage() {
    const chatPage = document.createElement('div');
    chatPage.id = 'chat-page'

    document.getElementById('main').appendChild(chatPage);

    const dismount_components = []

    dismount_components.push(createChatHistory(chatPage));
    dismount_components.push(createChatMain(chatPage));
    dismount_components.push(createModelSettings(chatPage));

    return () => {
        dismount_components.forEach(e=>e());
    }
}