import { VERSION } from '../settings.js'
import capitalizeFirstLetter from '../tools/capitalizeFirstLetter.js';
import request from '../tools/request.js';

export default function createInfoPage() {
    const icon = document.getElementById('sidebar-icon-info');
    
    icon.insertAdjacentHTML("beforeend", `
    <div id='all-versions'>
        <img class='loading' src='/medias/arrow-clockwise.svg'>
    </div>`)

    updateVersions();
}

async function updateVersions() {

    const query_versions = await (await request('version')).json();

    const versions = {
        rebel: `v${VERSION}`,
        ...query_versions
    };

    const all_versions_elem = document.getElementById('all-versions');
    all_versions_elem.innerHTML = '';

    for(const key in versions) {
        all_versions_elem.insertAdjacentHTML('beforeend',
            `<div class='version-elem'>${capitalizeFirstLetter(key)}: <span>${versions[key]}</span></div>`
        )
    }
}