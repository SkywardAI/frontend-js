// const dataset_options = []
// const model_options = []

import { loadDefaultPage } from "../../global/switchPage.js";
import useUser from "../../global/useUser.js";
import showMessage from "../../tools/message.js";
import request from "../../tools/request.js";
import createModelHeroPage from "../model-hero-page/index.js";
import loadFAQPage from "./faq-page.js";
import loadParametersPage from "./parameters-page.js";
import loadTrainingVisualizationPage from "./training-visualization-page.js";

const pages = [
    {index: 'template', title: 'Find Models'},
    {index: 'parameters', title: 'Start Training'},
    {index: 'training-visualization', title: 'Training Visualization'},
    {index: 'faq', title: 'FAQ'},
]

let  training_page_main, current_page = '',
     models = [], current_model = '';

function switchPage(page) {
    if(current_page === page) return;
    switch(page) {
        case 'template':
            createModelHeroPage(
                training_page_main, models, 
                name=>{current_model = name}
            );
            break;
        case 'parameters': 
            loadParametersPage(
                training_page_main, 
                ()=>switchPage('training-visualization'), 
                models, ()=>current_model,
                name=>{current_model = name}
            );
            break;
        case 'faq': 
            loadFAQPage(training_page_main);
            break;
        case 'training-visualization': 
            loadTrainingVisualizationPage(training_page_main);
            break;
        default: return;
    }
    
    current_page && document.getElementById(`training-tab-${current_page}`).classList.remove('selected');
    document.getElementById(`training-tab-${page}`).classList.add('selected');
    current_page = page;
}

let logged_in;
const { componentReMount, componetDismount } = useUser(user=>{
    logged_in = user.logged_in;
    if(!logged_in) {
        loadDefaultPage();
    }
})

export default function createTrainingPage() {
    componentReMount();

    document.getElementById("main").innerHTML = `
    <div class='training-main'>
        <div id='training-tabs'></div>
        <div id='training-page-main'></div>
    </div>`

    training_page_main = document.getElementById('training-page-main');

    const tabs = document.getElementById('training-tabs');
    pages.forEach(page => {
        const tab = document.createElement('div');
        tab.className = 'tab clickable';
        tab.id = `training-tab-${page.index}`
        tab.textContent = page.title;
        tab.onclick = () => {
            switchPage(page.index);
        }
        tabs.appendChild(tab);
    })

    request('nn/list').then(response=>{
        if(!Array.isArray(response) && response.http_error) {
            showMessage('Get available models failed!', { type: 'err' });
        } else {
            models = response;

            const loaded_page = current_page;
            current_page = '';
            switchPage(loaded_page || pages[0].index);
        }
    })
    return componetDismount;
}