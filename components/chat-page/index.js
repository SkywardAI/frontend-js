import createChatMain from "./chatMain.js";
import createChatHistory from "./history.js";
// import createModelSettings from "./modelSettings.js";

export default function createChatPage() {
    const chatPage = document.createElement('div');
    chatPage.id = 'chat-page';
    chatPage.className = 'sidebar-expanded';
    document.getElementById('main').appendChild(chatPage);

    function toggleExpand() {
        chatPage.classList.toggle('sidebar-expanded');
    }

    const dismount_components = []

    dismount_components.push(createChatHistory(chatPage, toggleExpand));
    dismount_components.push(createChatMain(chatPage, toggleExpand));
    // dismount_components.push(createModelSettings(chatPage));

    return () => {
        dismount_components.forEach(e=>e());
    }
}