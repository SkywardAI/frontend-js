import createSideBar from "./components/sidebar.js";
import createChatPage from "../components/chat-page/index.js";
import createTrainingPage from "../components/training-page/index.js";
import useUser from "../global/useUser.js";
import showMessage from "../tools/message.js";
import createAccountPage from "../components/account-page/index.js";

let last_selected_page = '';
let componetDismount = null;

let logged_in = false;
useUser(user=>{
    logged_in = user.logged_in;
})

function switchSelectedPage(page) {
    if(page === last_selected_page) return;
    if(!logged_in) {
        if(/^(training)$/.test(page)) {
            showMessage('Please login to use this function.', { type: 'warn' });
            createAccountPage();
            return;
        }
    }

    document.getElementById('main').innerHTML = '';
    componetDismount && componetDismount();
    componetDismount = null;

    switch(page) {
        case 'training':
            componetDismount = createTrainingPage(loadDefaultPage);
            break;
        case 'chat': default:
            componetDismount = createChatPage();
            break;
    }

    // change side-bar icon class
    document.getElementById(`sidebar-icon-${page}`).classList.add('selected');
    last_selected_page && document.getElementById(`sidebar-icon-${last_selected_page}`).classList.remove('selected');
    last_selected_page = page;
}

function loadDefaultPage() {
    switchSelectedPage('chat');
}

function build() {
    createSideBar(switchSelectedPage);
    loadDefaultPage();
}

window.onload = build;