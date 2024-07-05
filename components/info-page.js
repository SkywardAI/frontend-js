import { VERSION } from '../settings.js'

export default function createInfoPage() {
    const icon = document.getElementById('sidebar-icon-info');
    
    icon.insertAdjacentHTML("beforeend", `
    <div id='all-versions'>
        <img class='loading' src='/medias/arrow-clockwise.svg'>
    </div>`)

    updateVersions();
}

async function updateVersions() {
    await new Promise(s=>setTimeout(s, 5000));
    
    const versions = {
        rebel: VERSION,
        kirin: '0.1.8',
        some: '1.2.3',
        random: '3.4.5',
        version: '4.5.6'
    };

    const all_versions_elem = document.getElementById('all-versions');
    all_versions_elem.innerHTML = '';

    for(const key in versions) {
        all_versions_elem.insertAdjacentHTML('beforeend',
            `<div class='version-elem'>${firstLetterCapital(key)}: <span>v${versions[key]}</span></div>`
        )
    }
}

function firstLetterCapital(word) {
    return `${word[0].toUpperCase()}${word.slice(1)}`
}