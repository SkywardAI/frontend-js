import getSVG from "../../tools/svgs.js";

export default function rangeSettingSection(title, valueRange, setToDefault, updateSetting) {

    const { max, min, from_range, to_range } = rangeValueConverter(valueRange)

    const setting_section = document.createElement('div');
    setting_section.className = 'setting-section';

    const title_elem = document.createElement('div');
    title_elem.className = 'title';
    title_elem.textContent = title;

    const container = document.createElement('div');
    container.className = 'combined-section range';
    
    const range = document.createElement('input');
    range.type = 'range';
    range.max = max;
    range.min = min;
    
    const text = document.createElement('input');
    text.type = 'text';

    const restore_default_btn = document.createElement('div');
    restore_default_btn.className = 'restore-default-icon clickable';
    restore_default_btn.innerHTML = getSVG('arrow-counterclockwise');
    restore_default_btn.onclick = setToDefault;

    container.appendChild(range);
    container.appendChild(text);
    container.appendChild(restore_default_btn);

    setting_section.appendChild(title_elem);
    setting_section.appendChild(container);

    range.oninput = function() {
        const value = from_range(+range.value);
        text.value = value;
        updateSetting(value);
    }

    text.onchange = function() {
        const value = +text.value;
        if(isNaN(value)) {
            text.value = from_range(+range.value);
            return;
        } else if(value < valueRange.min) {
            text.value = valueRange.min;
        } else if(value > valueRange.max) {
            text.value = valueRange.max;
        }

        range.value = to_range(+text.value);
        updateSetting(+text.value);
    }

    function setter(value) {
        text.value = value;
        range.value = to_range(value);
    }

    return [setting_section, setter]
}

function rangeValueConverter({ max, min, is_100_times }) {
    if(is_100_times) {
        max *= 100;
        min *= 100;
    }

    function no_change(value) {
        return value;
    }

    function from_range(value) {
        return value / 100;
    }

    function to_range(value) {
        return value * 100;
    }

    return { 
        max, min, 
        from_range: is_100_times ? from_range : no_change, 
        to_range: is_100_times ? to_range : no_change 
    }
}