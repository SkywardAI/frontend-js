import createDialog from "../../tools/dialog.js";
import createChatMain from "./chatMain.js";
import createChatHistory from "./history.js";
import createModelSettings from "./modelSettings.js";

const [settings_main, { toggleModal }] = createDialog();
document.body.appendChild(settings_main)

export default function createChatPage() {
    const chatPage = document.createElement('div');
    chatPage.id = 'chat-page';
    chatPage.className = 'sidebar-expanded';
    document.getElementById('main').appendChild(chatPage);

    function toggleExpand() {
        chatPage.classList.toggle('sidebar-expanded');
    }

    const dismount_components = []

    dismount_components.push(createChatHistory(chatPage));
    dismount_components.push(createChatMain(chatPage, toggleExpand, toggleModal));
    dismount_components.push(createModelSettings(settings_main));

    return () => {
        dismount_components.forEach(e=>e());
    }
}