import generateKey from "../../tools/generateKey.js";
import createModelBlock from "./modelBlock.js";

const available_models = {
    linear: { has_params: true },
    dropout: { has_params: true },
    softmax: { has_params: true },
}
const builtModels = {}
let models_playground;

export default function createModelHeroPage() {

    const main = document.getElementById('main');
    main.innerHTML = `
    <div class='model-hero'>
        <div id='available-models'>
            <div id='finish-build' class='clickable'>Save</div>
        </div>
        <div id='models-playground'></div>
    </div>`

    models_playground = document.getElementById('models-playground')
    document.getElementById('finish-build').onclick = saveBuilder;
    fillAvailableModels();
    rebuildPlayground();

    return null;
}

function fillAvailableModels() {
    const finish_build_btn = document.getElementById('finish-build')
    for(const key in available_models) {
        const model_block = createModelBlock(key);
        model_block.classList.add('clickable')
        model_block.onclick = () => {
            addModelToPlayground(key);
        }
        finish_build_btn.before(model_block);
    }
}

function rebuildPlayground() {
    if(Object.keys(builtModels).length) {
        for(const key in builtModels) {
            models_playground.appendChild(builtModels[key].elem);
        }
    }
}

function addModelToPlayground(key) {
    let unique_key;
    do {
        unique_key = generateKey();
    } while(unique_key in builtModels)

    const { has_params } = available_models[key];
    const [ elem, getValue ] = createModelBlock(key, true, ()=>removeModel(unique_key), has_params)
    models_playground.appendChild(elem);

    builtModels[unique_key] = { type: key, elem, getValue };
}

function removeModel(key) {
    builtModels[key].elem.remove();
    delete builtModels[key];
}

function saveBuilder() {
    const built_models =[];
    for(const key in builtModels) {
        const {type, getValue} = builtModels[key];
        const value = getValue();
        built_models.push({ type, value });
    }
    console.log(built_models);
}