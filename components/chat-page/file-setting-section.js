import showMessage from '../../tools/message.js'

export default function fileSettingSection(title, submitted, restrictions = []) {
    const section = document.createElement('form');
    section.className = 'setting-section'
    section.innerHTML = `<div class='title'>${title}</div>`;

    section.onsubmit = evt => {
        evt.preventDefault();
        submitted(evt.target);
    }

    const upload_file_container = document.createElement('div');
    upload_file_container.className = 'file-container';

    const file = document.createElement('input')
    file.type = 'file';
    file.name = 'file';
    file.className = 'clickable'
    upload_file_container.appendChild(file);

    const file_status_display = document.createElement('div');
    file_status_display.className = 'file-status';
    file_status_display.textContent = 'No file selected yet'
    upload_file_container.appendChild(file_status_display);

    file.onchange = (evt) => {
        const { name, size } = evt.target.files[0];
        if(restrictions.length) {
            const ext = name.split('.').pop();
            if(!restrictions.includes(ext)) {
                showMessage(
                    `The file with extension <strong>.${ext}</strong> is not valid for this section.`, 
                    { type: 'warn' }
                );
                evt.target.value = ''
                file_status_display.textContent = 'No file selected yet'
                return;
            }
        }
        const mb_size = Math.round(size / (1024 * 1024));
        const strong_name = document.createElement('strong');
        strong_name.textContent = name;
        file_status_display.appendChild(strong_name);
        file_status_display.insertAdjacentText("beforeend", ` (${mb_size} MB)`)
    }

    section.appendChild(upload_file_container);
    return section;
}