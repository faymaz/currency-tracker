'use strict';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const CURRENCY_PAIRS = {
    'USD-EUR': 'USD/EUR',
    'USD-GBP': 'USD/GBP',
    'USD-CNY': 'USD/CNY',
    'USD-TRY': 'USD/TRY',
    'EUR-USD': 'EUR/USD',
    'EUR-GBP': 'EUR/GBP',
    'EUR-CNY': 'EUR/CNY',
    'EUR-TRY': 'EUR/TRY',
    'GBP-TRY': 'GBP/TRY',
    'GBP-CNY': 'GBP/CNY',
    'CNY-TRY': 'CNY/TRY',
    'CNY-EUR': 'CNY/EUR',
    'CNY-USD': 'CNY/USD',
    'CNY-GBP': 'CNY/GBP',
    'BTC-TRY': 'BTC/TRY',
    'BTC-EUR': 'BTC/EUR',
    'BTC-GBP': 'BTC/GBP',
    'BTC-USD': 'BTC/USD',
    'BTC-CNY': 'BTC/CNY'
};

const CURRENCY_CATEGORIES = {
    'USD Pairs': ['USD-EUR', 'USD-GBP', 'USD-CNY', 'USD-TRY'],
    'EUR Pairs': ['EUR-USD', 'EUR-GBP', 'EUR-CNY', 'EUR-TRY'],
    'CNY Pairs': ['CNY-USD', 'CNY-EUR', 'CNY-GBP', 'CNY-TRY'],
    'TRY Pairs': ['USD-TRY', 'EUR-TRY', 'GBP-TRY', 'CNY-TRY'],
    'Bitcoin': ['BTC-USD', 'BTC-EUR', 'BTC-GBP', 'BTC-TRY', 'BTC-CNY']
};

export default class CurrencyTrackerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create preferences page
        const page = new Adw.PreferencesPage();
        window.add(page);

        // General settings group
        const generalGroup = new Adw.PreferencesGroup({
            title: 'General Settings',
            description: 'Configure general extension settings'
        });
        page.add(generalGroup);

        // Default currency pair
        const currencyRow = new Adw.ComboRow({
            title: 'Default Currency Pair',
            subtitle: 'Select the default currency pair to display'
        });

        const currencyModel = new Gtk.StringList();
        Object.entries(CURRENCY_PAIRS).forEach(([key, value]) => {
            currencyModel.append(value);
        });

        currencyRow.model = currencyModel;
        
        // Set current value
        const currentPair = settings.get_string('currency-pair');
        const index = Object.keys(CURRENCY_PAIRS).indexOf(currentPair);
        if (index !== -1) {
            currencyRow.selected = index;
        }

        currencyRow.connect('notify::selected', widget => {
            const selected = Object.keys(CURRENCY_PAIRS)[widget.selected];
            settings.set_string('currency-pair', selected);
        });

        generalGroup.add(currencyRow);

        // Refresh interval
        const refreshRow = new Adw.SpinRow({
            title: 'Refresh Interval',
            subtitle: 'Time in seconds between updates (30-3600)',
            adjustment: new Gtk.Adjustment({
                lower: 30,
                upper: 3600,
                step_increment: 30,
                value: settings.get_int('refresh-interval') || 60
            })
        });

        refreshRow.connect('notify::value', widget => {
            settings.set_int('refresh-interval', widget.value);
        });

        generalGroup.add(refreshRow);

        // Display settings group
        const displayGroup = new Adw.PreferencesGroup({
            title: 'Display Settings',
            description: 'Configure how the currency information is displayed'
        });
        page.add(displayGroup);

        // Show percentage change
        const showChangeSwitch = new Adw.SwitchRow({
            title: 'Show Percentage Change',
            subtitle: 'Display the percentage change in the panel'
        });

        showChangeSwitch.set_active(settings.get_boolean('show-percentage-change'));
        showChangeSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-percentage-change', widget.active);
        });

        displayGroup.add(showChangeSwitch);

        // Show currency icon
        const showIconSwitch = new Adw.SwitchRow({
            title: 'Show Icon',
            subtitle: 'Display the currency icon in the panel'
        });

        showIconSwitch.set_active(settings.get_boolean('show-icon'));
        showIconSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-icon', widget.active);
        });

        displayGroup.add(showIconSwitch);
    }
}