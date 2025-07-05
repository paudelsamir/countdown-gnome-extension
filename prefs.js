import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CountdownPrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: 'Target Date',
    });
    page.add(group);

    const yearRow = new Adw.SpinRow({
      title: 'Year',
      adjustment: new Gtk.Adjustment({ lower: 2020, upper: 2100, step_increment: 1 }),
    });
    const monthRow = new Adw.SpinRow({
      title: 'Month',
      adjustment: new Gtk.Adjustment({ lower: 1, upper: 12, step_increment: 1 }),
    });
    const dayRow = new Adw.SpinRow({
      title: 'Day',
      adjustment: new Gtk.Adjustment({ lower: 1, upper: 31, step_increment: 1 }),
    });

    group.add(yearRow);
    group.add(monthRow);
    group.add(dayRow);

    const settings = this.getSettings();
    settings.bind('year', yearRow, 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('month', monthRow, 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('day', dayRow, 'value', Gio.SettingsBindFlags.DEFAULT);
  }
}
