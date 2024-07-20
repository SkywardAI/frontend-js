// const dataset_options = []
// const model_options = []
// const settings = {
//     output_dir: "WANDB_NAME",
//     evaluation_strategy: "steps",
//     do_eval: true,
//     optim: "adamw_8bit",
//     per_device_train_batch_size: 8,
//     gradient_accumulation_steps: 2,
//     per_device_eval_batch_size: 8,
//     log_level: "debug",
//     logging_steps: 100,
//     learning_rate: 8e-6,
//     eval_steps: 100,
//     save_steps: 100,
//     save_strategy: "epoch",
//     num_train_epochs: 1,
//     warmup_ratio: 0.1,
//     lr_scheduler_type: "linear",
//     beta: 0.1,
//     max_length: 1024,
//     report_to: "wandb",
//     run_name: 'WANDB_NAME'
// }

import loadFAQPage from "./faq-page.js";
import loadParametersPage from "./parameters-page.js";
import loadTrainingVisualizationPage from "./training-visualization-page.js";

const pages = [
    {index: 'parameters', title: 'Start Training'},
    {index: 'training-visualization', title: 'Training Visualization'},
    {index: 'faq', title: 'FAQ'},
]

let  training_page_main, current_page = '';

function switchPage(page) {
    if(current_page === page) return;
    switch(page) {
        case 'parameters': 
            loadParametersPage(training_page_main);
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

export default function createTrainingPage() {
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


    const loaded_page = current_page;
    current_page = '';

    switchPage(loaded_page || pages[0].index);
    return null;
}