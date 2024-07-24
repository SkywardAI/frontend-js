import createDialog from "../../tools/dialog.js";
import showMessage from "../../tools/message.js"

const settings = {
    output_dir: "WANDB_NAME",
    evaluation_strategy: "steps",
    do_eval: true,
    optim: "adamw_8bit",
    per_device_train_batch_size: 8,
    gradient_accumulation_steps: 2,
    per_device_eval_batch_size: 8,
    log_level: "debug",
    logging_steps: 100,
    learning_rate: 8e-6,
    eval_steps: 100,
    save_steps: 100,
    save_strategy: "epoch",
    num_train_epochs: 1,
    warmup_ratio: 0.1,
    lr_scheduler_type: "linear",
    beta: 0.1,
    max_length: 1024,
    report_to: "wandb",
    run_name: 'WANDB_NAME'
}

const setting_value_type = {};
for(const key in settings) setting_value_type[key] = typeof settings[key];

const quick_edit = [
    "per_device_eval_batch_size",
    "gradient_accumulation_steps",
    "per_device_train_batch_size",
    "optim",
    "do_eval"
]

// TODO: load settings from local

const [ advanced_settings_dialog, controller ] = createDialog();
let main_form, init = false, showTrainingPage;

export default function loadParametersPage(main, switchPage) {
    showTrainingPage = switchPage;
    main.innerHTML = `
    <form id='training-params'>
        <section class='token'>
            <div>
                <div class='title'>Huggingface Token</div>
                <input type='text' autocomplete="off" name='huggingface-token'>
            </div>
            <div>
                <div class='title'>Wandb Token</div>
                <input type='text' autocomplete="off" name='wandb-token'>
            </div>
        </section>
        <section class='model'>
            <div>
                <div class='title'>Select Base Model</div>
                <select class='clickable' name='select-model'>
                    <option value='default model'>Default Model</option>
                </select>
            </div>
            <div>
                <div class='title'>Select Dataset</div>
                <select class='clickable' name='select-dataset'>
                    <option value='default dataset'>Default Dataset</option>
                </select>
            </div>
        </section>
        <section class='params'>
            <div id='advanced-setting' class='advanced clickable'>
                <div class='title'>Advanced Settings</div>
            </div>
        </section>
        <section class='function'>
            <button class='clickable' type='button' id='save-btn'>Save</button>
            <button class='clickable' type='submit'>Start Training</button>
        </section>
    </form>`

    main_form = document.getElementById('training-params');
    main_form.onsubmit = startTraining;

    document.getElementById('save-btn').onclick = () => {
        console.log(getEntryValues());
    }

    const params_section = document.querySelector('section.params');
    quick_edit.forEach(e=>{
        params_section.insertAdjacentElement("afterbegin", createQuickEditElement(e))
    })

    createAdvancedSettingPage();
    document.getElementById('advanced-setting').onclick = controller.showModal;

    return null;
}

function createQuickEditElement(name) {
    const type = setting_value_type[name];
    
    const block = document.createElement('div');
    block.innerHTML = `<div class='title'>${name}</div>`

    if(type === 'boolean') {
        const true_false = document.createElement('div')
        true_false.className = 'true-false';
        
        const selector = document.createElement('div');
        selector.className = 'selector';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `params-section-${name}`;
        checkbox.checked = settings[name]

        selector.appendChild(checkbox);
        
        true_false.insertAdjacentHTML('beforeend', "<div class='value'>False</div>")
        true_false.appendChild(selector);
        true_false.insertAdjacentHTML('beforeend', "<div class='value'>True</div>")

        block.appendChild(true_false)

        checkbox.onchange = evt => {
            const value = evt.target.checked;
            settings[name] = value;
            showMessage(`"${name}" set to ${value}`);
            document.getElementById(`advanced-section-${name}`).checked = value;
        }
    } else {
        const edit_var = document.createElement('input');
        edit_var.type = 'text';
        edit_var.id = `params-section-${name}`
        edit_var.value = settings[name]
        edit_var.onchange = () => {
            const value = settingValueParser(type, edit_var.value)
            if(value === null) {
                showMessage(`The entry "${name}" must be type of ${type}!`, { type:'warn' })
                edit_var.value = settings[name]
            } else {
                document.getElementById(`advanced-section-${name}`).value = value;
                settings[name] = value;
                showMessage(`"${name}" set to ${value}`);
            }
        }
        block.appendChild(edit_var)
    }
    return block;
}

function createAdvancedSettingPage() {
    if(init) return;

    const table = document.createElement('table');
    table.innerHTML = 
    `<thead>
        <tr>
            <th scope='col'>Key</th>
            <th scope='col'>Value</th>
        </tr>
    </thead>`

    const tbody = document.createElement('tbody');
    for(const key in settings) {
        const value = settings[key];
        tbody.appendChild(createAdvancedSettingRow(setting_value_type[key], key, value))
    }
    table.appendChild(tbody);

    const dialog_main = document.createElement('div');
    dialog_main.className = 'advanced-setting-table';
    dialog_main.onclick = evt => evt.stopPropagation();
    dialog_main.appendChild(table);

    advanced_settings_dialog.appendChild(dialog_main);

    init = true;
}

function createAdvancedSettingRow(type, key, value) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${key}</td>`;

    const column = document.createElement('td');

    const input = document.createElement('input');
    if(type === 'boolean') {
        const show_value = document.createElement('div');
        show_value.className = 'show-boolean-value';

        input.type = 'checkbox';
        input.className = 'clickable'
        input.checked = value;
        input.id = `advanced-section-${key}`
        input.onchange = evt => {
            const value = evt.target.checked;
            settings[key] = value;
            showMessage(`"${key}" set to ${value}`);
            document.getElementById(`params-section-${key}`).checked = value;
        }
        column.appendChild(show_value);
    } else {
        input.type = 'text';
        input.value = value;
        input.id = `advanced-section-${key}`
        input.onchange = evt => {
            const value = settingValueParser(type, evt.target.value);
            if(value === null) {
                showMessage(`The entry "${key}" must be type of ${type}!`, { type:'warn' })
                evt.target.value = settings[key]
                return;
            }
            settings[key] = value;
            evt.target.value = value;
            if(quick_edit.includes(key)) {
                document.getElementById(`params-section-${key}`).value = value;
            }
            showMessage(`"${key}" set to ${value}`);
        }
    }

    column.appendChild(input);
    row.appendChild(column);
    return row;
}

function getEntryValues() {
    const values = {
        "huggingface-token": main_form["huggingface-token"].value,
        "wandb-token": main_form["wandb-token"].value,
        "select-model": main_form["select-model"].value,
        "select-dataset": main_form["select-dataset"].value,
    };

    return values;

}

function startTraining(evt) {
    evt.preventDefault();

    showTrainingPage();    
}

function settingValueParser(type, value) {
    if(type === 'number') {
        value = +value;
        return isNaN(value) ? null : value;
    } else {
        return value || null;
    }
}