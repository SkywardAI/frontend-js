import { VERSION } from '../settings.js'
import capitalizeFirstLetter from '../tools/capitalizeFirstLetter.js';
import request from '../tools/request.js';
import getSVG from '../tools/svgs.js';

export default function createInfoPage() {
    const icon = document.getElementById('sidebar-icon-info');
    
    icon.insertAdjacentHTML("beforeend", `
    <div id='all-versions'>
        ${getSVG('arrow-clockwise', 'loading')}
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