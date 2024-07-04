import generateKey from "../tools/generateKey.js";

export default function createHook() {
    let updatesList = {};
    
    function onmount(callback) {
        let new_key;
        do {
            new_key = generateKey();
        } while(new_key in updatesList)
        updatesList[new_key] = {callback, frozen: false};
        return new_key;
    }

    function remount(key) {
        return () => {
            const need_unfreeze = !updatesList[key].frozen
            updatesList[key].frozen = false;
            return need_unfreeze;
        }
    }

    function dismount(key) {
        return () => {
            updatesList[key].frozen = true;
        }
    }

    function updateAll(value) {
        for(const key in updatesList) {
            const {frozen, callback} = updatesList[key]
            if(!frozen) callback(value);
        }
    }

    return { onmount, remount, dismount, updateAll }
}