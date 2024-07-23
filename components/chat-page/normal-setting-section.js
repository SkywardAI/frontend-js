/**
 * create a normal setting section
 * @param { "text" | "select" | "button" } type What type this section should contains
 * @param {String} title Name of this secction, apperas on top
 * @param {Function} callback Callback function takes one parameter of updated value of this section
 * @returns { [HTMLElement, Function, Function] } 
 *  Returns an array containes necessary fields  
 *  **Index 0**: The HTMLElement  
 *  **Index 1**: The setter function to update value  
 *  **Index 2**: The setter function to update args  
 */
export default function normalSettigSection(type, title, callback = null, ...args) {
    const section = document.createElement('div');
    section.className = 'setting-section'
    section.innerHTML = `<div class='title'>${title}</div>`;

    let input_like;

    function setArgs(...new_args) {
        args = new_args;
        loadArgs();
    }

    function loadArgs() {
        if(type === 'select') {
            input_like.innerHTML = '';
            args[0].forEach(({value, title})=>{
                const option = document.createElement('option');
                option.value = value;
                option.textContent = title || value;
                input_like.appendChild(option);
            })
        } else if(type === 'button') {
            input_like.value = args[0];
            input_like.onclick = args[1];
            input_like.classList.add('clickable')
        }
    }
    
    if(type === 'select') {
        input_like = document.createElement('select');
    } else {
        input_like = document.createElement('input');
        input_like.type = type;
    }

    loadArgs();

    function setValue(value) {
        input_like.value = value;
    }

    function toggleDisable(is_disabled) {
        switch(type) {
            case 'text':
                input_like.disable = is_disabled;
                break;
            case 'button':
                input_like.onclick = is_disabled ? null : args[1];
                break;
            case 'select':
                input_like.classList.toggle('disabled', is_disabled);
                break;
        }
    }

    input_like.onchange = () => {
        callback && callback(input_like.value);
    }

    section.appendChild(input_like)

    return [section, { setValue, setArgs, toggleDisable }];
}