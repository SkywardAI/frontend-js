import debounce from '../../tools/debounce.js';
import getSVG from '../../tools/svgs.js'
import createDialog from '../../tools/dialog.js'
import request from '../../tools/request.js'
import showMessage from '../../tools/message.js';

let templates = [
    // { name: 'template 1', description: 'this is description', parts: [{function_name: 'linear', param: ''},{function_name: 'linear', param: ''}] },
    // { name: 'template 2', description: 'this is description', parts: [{function_name: 'linear', param: ''},{function_name: 'linear', param: ''}] },
]

let display_templates, card_width = 0, move_length = 0, current_position = 'first';
let updateSelectedTemplate;

const [selected_template_popup, selected_template_controller] = createDialog();

export default async function createModelHeroPage(
    main = null, existed_templates = null, selectTemplate = null
) {
    main = main || document.getElementById('main');

    if(!existed_templates) {
        const response = await request('nn/list');
        if(!Array.isArray(response) && response.http_error) {
            showMessage('Update model list failed!', { type: 'err' });
            return;
        }
        templates = response;
    }
    else templates = existed_templates;

    updateSelectedTemplate = selectTemplate;

    main.innerHTML = `
    <div class='model-hero'>
        <div class='title'>Find Model Templates</div>
        <form id='search-template'>
            <input 
                type='text' name='search' 
                class='search-input' autocomplete="off"
                placeholder="Search for templates here"    
            >
            <div class='submit-search-container'>
                <input type='submit' class='submit-search btn clickable'>
                <div class='submit-search icon'>${getSVG('search')}</div>
            </div>
        </form>
        <div class='templates-section'>
            <div class='switch-template last clickable'>${getSVG('caret-right-fill')}</div>
            <div id='display-templates'></div>
            <div class='switch-template next clickable'>${getSVG('caret-right-fill')}</div>
        </div>
    </div>`

    const search_template = document.getElementById('search-template');
    display_templates = document.getElementById('display-templates');
    search_template.onsubmit = submitSearchTemplate;

    // =============================================================
    // 
    //                       templates section
    // 
    // =============================================================

    templates.forEach(template => {
        display_templates.appendChild(createTemplateCard(template));
    })

    document.addEventListener("resize", windowResized);
    display_templates.addEventListener('wheel', scrollTemplates);
    document.querySelector('.templates-section .switch-template.next').onclick = () => adjustScroll(true)
    document.querySelector('.templates-section .switch-template.last').onclick = () => adjustScroll(false)

    calculateWithInfo();

    const append_first_list = templates.slice(-2).map(e=>createTemplateCard(e));

    const append_first = append_first_list[0];
    const append_last = createTemplateCard(templates[0]);

    display_templates.append(append_last);
    display_templates.firstElementChild.before(...append_first_list);

    display_templates.scrollTo({ left: card_width + move_length, behavior: 'instant' })

    const obverver = new IntersectionObserver(entries=>{
        entries.forEach(e=>{
            if(!e.isIntersecting) {
                current_position = '';
            } else if(e.target === append_first) {
                current_position = 'first'
            } else if(e.target === append_last) {
                current_position = 'last';
            }
        })
    }, { root: display_templates });

    obverver.observe(append_first)
    obverver.observe(append_last)

    // =============================================================
    // 
    //                          return
    // 
    // =============================================================

    return () => {
        document.removeEventListener("resize", windowResized);
        document.removeEventListener("wheel", scrollTemplates);
        obverver.disconnect();
    };
}

function createTemplateCard(template) {
    const {name, description} = template;
    const card = document.createElement('div');
    card.className = 'template-card clickable';
    card.innerHTML = `<div class="title">${name}</div><div class='description'>${description}</div>`
    card.onclick = () => showTemplatePopup(template)
    return card;
}

function submitSearchTemplate(evt) {
    evt.preventDefault();

    const search_value = evt.target.search.value;
    console.log(search_value)
    evt.target.search.value = '';
}

const adjustScroll = debounce((direction)=>{
    if(current_position === 'last' && direction) {
        display_templates.scrollTo({ left: move_length, behavior: 'instant' })
    } else if(current_position === 'first' && !direction) {
        display_templates.scrollTo({ left: display_templates.scrollWidth  - card_width*2 - move_length, behavior: 'instant' })
        // return;
    }

    const multiplier = direction ? move_length : -move_length;
    display_templates.scrollLeft += multiplier;
}, 20)

function calculateWithInfo() {
    card_width = display_templates.firstElementChild.clientWidth;
    move_length = card_width * 0.6 + 20;
}

const windowResized = debounce(calculateWithInfo , 20);

function scrollTemplates(evt) {
    adjustScroll(evt.deltaY > 0)
}

function showTemplatePopup(template) {
    selected_template_popup.innerHTML = ''

    const template_main = document.createElement('div');
    template_main.onclick = evt => evt.stopPropagation();
    template_main.className = 'show-template-main';

    template_main.insertAdjacentHTML('beforeend', `<div class='template-name'>${template.name}</div>`);

    const template_block = document.createElement('div');
    template_block.className = 'template-block'
    template.modules.forEach(module => {
        const part_card = document.createElement('div');
        part_card.className = 'card';
        part_card.textContent = module;
        template_block.appendChild(part_card)
    })

    template_main.appendChild(template_block);

    const select_template_btn = document.createElement('div');
    select_template_btn.className = 'select-template-btn button clickable';
    select_template_btn.textContent = 'Select This Template';
    select_template_btn.onclick = () => {
        updateSelectedTemplate && updateSelectedTemplate(template.name)
        showMessage(`Template "${template.name}" selected for training`);
        selected_template_controller.close();
    }

    template_main.appendChild(select_template_btn);
    selected_template_popup.appendChild(template_main);

    selected_template_controller.showModal();
}