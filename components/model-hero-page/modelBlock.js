import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter.js";
import getSVG from "../../tools/svgs.js";

export default function createModelBlock(title, in_playground = false, removeModel = null, has_params = false) {
    const block = document.createElement('div');
    block.className = `model-block ${title}`;
    block.innerHTML = `<div class='model-title'>${capitalizeFirstLetter(title)}</div>`

    if(!in_playground) {
        return block;
    }

    const remove_btn = document.createElement('div');
    remove_btn.className = 'remove-model clickable'
    remove_btn.innerHTML = getSVG('x-lg')
    remove_btn.onclick = removeModel;
    block.appendChild(remove_btn);

    let value = null;

    if(has_params) {
        const param_input = document.createElement('input');
        param_input.type = 'text'
        param_input.className = 'param-input'
        param_input.placeholder = 'null'
        param_input.oninput = () => {
            value = param_input.value;
        }
        block.appendChild(param_input);
    }

    return [block, ()=>value]
}