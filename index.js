import createSideBar from "./components/sidebar.js";
import createChatPage from "./components/chat-page/index.js";
import createTrainingPage from "./components/training-page/index.js";
import createModelHeroPage from "./components/model-hero-page/index.js";

let last_selected_page = '';
let componetDismount = null;

function switchSelectedPage(page) {
    if(page === last_selected_page) return;
    document.getElementById('main').innerHTML = '';
    componetDismount && componetDismount();
    componetDismount = null;

    switch(page) {
        case 'model-hero':
            componetDismount = createModelHeroPage();
            break;
        case 'training':
            componetDismount = createTrainingPage();
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

function build() {
    createSideBar(switchSelectedPage);
}

window.onload = build;