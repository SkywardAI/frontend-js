import debounce from '../../tools/debounce.js';
import getSVG from '../../tools/svgs.js'

const templates = [
    { name: 'template 1', description: 'this is description' },
    { name: 'template 2', description: 'this is description' },
]

let display_templates, card_width = 0, move_length = 0, current_position = 'first';

export default function createModelHeroPage() {
    const main = document.getElementById('main');
    main.innerHTML = `
    <div class='model-hero'>
        <div class='title'>Model Hero Templates</div>
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
            <div id='display-templates'>${
                templates.map(e=>{
                    return `
                    <div class='template-card clickable'>
                        <div class='title'>${e.name}</div>
                        <div class='description'>${e.description}</div>
                    </div>`
                }).join('')
            }</div>
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

    document.addEventListener("resize", windowResized);
    display_templates.addEventListener('wheel', scrollTemplates);
    document.querySelector('.templates-section .switch-template.next').onclick = () => adjustScroll(true)
    document.querySelector('.templates-section .switch-template.last').onclick = () => adjustScroll(false)

    calculateWithInfo();

    const template_cards = Array.from(document.querySelectorAll('#display-templates .template-card'));
    const append_first_list = template_cards.slice(-2).map(e=>e.cloneNode(true));

    const append_first = append_first_list[0];
    const append_last = template_cards[0].cloneNode(true);

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