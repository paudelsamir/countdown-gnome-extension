import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const CountdownIndicator = GObject.registerClass(
class CountdownIndicator extends St.Bin {
    _init(settings) {
        super._init({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
        });

        this._settings = settings;

        this._label = new St.Label({
            text: 'Calculating...',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.set_child(this._label);
        this._timeoutId = null;

        this._settingsChanged = this._settings.connect('changed', () => this._updateText());
        this._updateText();
    }

    _updateText() {
        const year = this._settings.get_int('year');
        const month = this._settings.get_int('month') - 1;
        const day = this._settings.get_int('day');

        const targetDate = new Date(year, month, day);
        const today = new Date();
        const oneDayMs = 1000 * 60 * 60 * 24;

        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const diffTime = targetMidnight - todayMidnight;
        const diffDays = Math.ceil(diffTime / oneDayMs);

        if (diffDays >= 0) {
            this._label.text = `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
        } else {
            this._label.text = "Time's up!";
        }

        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilNextMidnight = nextMidnight - now;

        if (this._timeoutId)
            GLib.source_remove(this._timeoutId);

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, msUntilNextMidnight, () => {
            this._updateText();
            return GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._timeoutId)
            GLib.source_remove(this._timeoutId);
        if (this._settingsChanged)
            this._settings.disconnect(this._settingsChanged);
        super.destroy();
    }
});

export default class CountdownExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new CountdownIndicator(this._settings);

        // Insert into the center box, index 0 to appear before the clock
        Main.panel._centerBox.insert_child_at_index(this._indicator, 0);
    }

    disable() {
        if (this._indicator) {
            Main.panel._centerBox.remove_child(this._indicator);
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
