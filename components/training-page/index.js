const dataset_options = []
const model_options = []
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

export default function createTrainingPage() {

    document.getElementById("main").innerHTML = `
    <div class='training-main'>
        <div class='title'>Training</div>
        <div class='option-set'>
            <div class='option-name'>Dataset Name:</div>
            <select id='select-dataset'>
                ${dataset_options.map(e=>`<option value='${e}'>${e}</option>`).join('')}
            </select>
            <div class='api-key'>WANDB_API_KEY</div>
        </div>
        <div class='option-set'>
            <div class='option-name'>Model Name:</div>
            <select id='select-model'>
                ${model_options.map(e=>`<option value='${e}'>${e}</option>`).join('')}
            </select>
            <div class='api-key'>HUGGINGFACE_API_KEY</div>
        </div>
        <textarea class='show-json-setting' rows="15" cols="20">
{
    ${Array.from(Object.entries(settings)).map(([k, v])=>`"${k}": ${isNaN(+v)?`"${v}"`:v}`).join(',\n    ')}
}
        </textarea>
        <div class='save-btn clickable'>Save</div>
    </div>`

    return null;
}