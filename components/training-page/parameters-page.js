let main_form;

export default function loadParametersPage(main) {
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
            <div>
                <div class='title'>Some Random Setting 1</div>
                <select class='clickable' name='random-setting-1'>
                    <option value='default option'>Default Option</option>
                </select>
            </div>
            <div>
                <div class='title'>Some Random Setting 2</div>
                <input type='text'>
            </div>
            <div>
                <div class='title'>Some Random Setting 3</div>
                <input type='text'>
            </div>
            <div>
                <div class='title'>Some Random Setting 4</div>
                <select class='clickable' name='random-setting-1'>
                    <option value='option 1'>Option 1</option>
                    <option value='option 2'>Option 2</option>
                    <option value='option 3'>Option 3</option>
                </select>
            </div>
            <div>
                <div class='title'>Some Random Setting 5</div>
                <input type='text'>
            </div>
            <div class='advanced clickable'>
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

    return null;
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
}