import getSVG from "../../tools/svgs.js";

export default function textSettingSection(title, callback) {
    const section = document.createElement('form');
    section.className = 'setting-section'
    section.innerHTML = `<div class='title'>${title}</div>`;

    const input_section = document.createElement('div');
    input_section.className = 'input-with-confirm';

    const input = document.createElement('input');
    input.type = 'text';

    function setter(value) {
        input.value = value;
    }

    input_section.appendChild(input);

    const confirm_btn = document.createElement('div');
    confirm_btn.className = 'confirm-input clickable';
    confirm_btn.innerHTML = getSVG('check');
    confirm_btn.onclick = () => callback(input.value);


    section.onsubmit = evt => {
        evt.preventDefault();
        callback(input.value);
    }

    input_section.appendChild(confirm_btn);
    section.appendChild(input_section)

    return [section, setter];
}