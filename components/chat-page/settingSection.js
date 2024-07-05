export default function settingSection(title, valueRange, updateSetting) {

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

    container.appendChild(range);
    container.appendChild(text);

    setting_section.appendChild(title_elem);
    setting_section.appendChild(container);

    range.oninput = function() {
        const value = from_range(+range.value);
        text.value = value;
        updateSetting(value);
    }

    text.onchange = function() {
        const value = +text.value;
        if(isNaN(value) || value < valueRange.min || value > valueRange.max) {
            text.value = from_range(+range.value)
            return;
        }

        range.value = to_range(value);
        updateSetting(value);
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