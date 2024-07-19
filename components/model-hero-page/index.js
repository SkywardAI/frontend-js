import debounce from '../../tools/debounce.js';
import getSVG from '../../tools/svgs.js'

const templates = [
    { name: 'template 1' },
    { name: 'template 2' },
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
        <div id='display-templates'>${
            templates.map(e=>{
                return `<div class='template-card'>${e.name}</div>`
            }).join('')
        }</div>
        <div id='selected-template'></div>
    </div>`

    const search_template = document.getElementById('search-template');
    display_templates = document.getElementById('display-templates');
    // const selected_template = document.getElementById('selected-template');

    search_template.onsubmit = submitSearchTemplate;

    document.addEventListener("resize", windowResized);
    display_templates.addEventListener('wheel', scrollTemplates);

    windowResized();

    const template_cards = Array.from(document.querySelectorAll('#display-templates .template-card'));
    const append_first_list = template_cards.slice(-2).map(e=>e.cloneNode(true));
    const append_last_list = template_cards.slice(0,2).map(e=>e.cloneNode(true));

    const append_first = append_first_list[0];
    const append_last = append_last_list[0];

    display_templates.append(...append_last_list);
    display_templates.firstElementChild.before(...append_first_list);

    display_templates.scrollTo({ left: card_width*2, behavior: 'instant' })

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
        display_templates.scrollTo({ left: display_templates.scrollWidth  - card_width*3 - move_length, behavior: 'instant' })
        // return;
    }

    const multiplier = direction ? move_length : -move_length;
    display_templates.scrollLeft += multiplier;
}, 20)

function windowResized() {
    card_width = display_templates.firstElementChild.clientWidth;
    move_length = card_width * 0.6;
}

function scrollTemplates(evt) {
    adjustScroll(evt.deltaY > 0)
}