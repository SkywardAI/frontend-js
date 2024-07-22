/**
 * create a normal setting section
 * @param { "text" | "select" } type What type this section should contains
 * @param {String} title Name of this secction, apperas on top
 * @param {Function} callback Callback function takes one parameter of updated value of this section
 * @returns { [HTMLElement, Function, Function] } 
 *  Returns an array containes necessary fields  
 *  **Index 0**: The HTMLElement
 *  **Index 1**: The setter function to update value
 *  **Index 2**: The setter function to update args
 */
export default function normalSettigSection(type, title, callback, ...args) {
    const section = document.createElement('div');
    section.className = 'setting-section'
    section.innerHTML = `<div class='title'>${title}</div>`;

    let input_like;
    if(type === 'text') {
        input_like = document.createElement('input');
        input_like.type = 'text';
    } else if(type === 'select') {
        input_like = document.createElement('select');
        args[0].forEach(({value, title})=>{
            const option = document.createElement('option');
            option.value = value;
            option.textContent = title || value;
            input_like.appendChild(option);
        })
    }

    function setter(value) {
        input_like.value = value;
    }

    function setArgs(...new_args) {
        args = new_args;
        if(type === 'select') {
            input_like.innerHTML = '';
            args[0].forEach(({value, title})=>{
                const option = document.createElement('option');
                option.value = value;
                option.textContent = title || value;
                input_like.appendChild(option);
            })
        }
    }

    input_like.onchange = () => {
        callback(input_like.value);
    }

    section.appendChild(input_like)

    return [section, setter, setArgs];
}