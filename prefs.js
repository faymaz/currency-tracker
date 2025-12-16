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

       
        const page = new Adw.PreferencesPage();
        window.add(page);

       
        const generalGroup = new Adw.PreferencesGroup({
            title: 'General Settings',
            description: 'Configure general extension settings'
        });
        page.add(generalGroup);

       
        const currencyRow = new Adw.ComboRow({
            title: 'Default Currency Pair',
            subtitle: 'Select the default currency pair to display'
        });

        const currencyModel = new Gtk.StringList();
        Object.entries(CURRENCY_PAIRS).forEach(([key, value]) => {
            currencyModel.append(value);
        });

        currencyRow.model = currencyModel;
        
       
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

       
        const displayGroup = new Adw.PreferencesGroup({
            title: 'Display Settings',
            description: 'Configure how the currency information is displayed'
        });
        page.add(displayGroup);

       
        const showChangeSwitch = new Adw.SwitchRow({
            title: 'Show Percentage Change',
            subtitle: 'Display the percentage change in the panel'
        });

        showChangeSwitch.set_active(settings.get_boolean('show-percentage-change'));
        showChangeSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-percentage-change', widget.active);
        });

        displayGroup.add(showChangeSwitch);

       
        const showIconSwitch = new Adw.SwitchRow({
            title: 'Show Icon',
            subtitle: 'Display the currency icon in the panel'
        });

        showIconSwitch.set_active(settings.get_boolean('show-icon'));
        showIconSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-icon', widget.active);
        });

        displayGroup.add(showIconSwitch);

       
        const advancedGroup = new Adw.PreferencesGroup({
            title: 'Advanced Settings',
            description: 'Configure advanced options'
        });
        page.add(advancedGroup);

       
        const debugSwitch = new Adw.SwitchRow({
            title: 'Enable Debug Logging',
            subtitle: 'Enable debug logging for troubleshooting (check logs with: journalctl -f -o cat /usr/bin/gnome-shell)'
        });

        debugSwitch.set_active(settings.get_boolean('enable-debug-log'));
        debugSwitch.connect('notify::active', widget => {
            settings.set_boolean('enable-debug-log', widget.active);
        });

        advancedGroup.add(debugSwitch);

       
        const notificationGroup = new Adw.PreferencesGroup({
            title: 'Notification Settings',
            description: 'Configure price alerts and notifications'
        });
        page.add(notificationGroup);

       
        const enableNotificationsSwitch = new Adw.SwitchRow({
            title: 'Enable Notifications',
            subtitle: 'Show notifications when rate reaches threshold'
        });

        enableNotificationsSwitch.set_active(settings.get_boolean('enable-notifications'));
        enableNotificationsSwitch.connect('notify::active', widget => {
            settings.set_boolean('enable-notifications', widget.active);
        });

        notificationGroup.add(enableNotificationsSwitch);

       
        const thresholdRow = new Adw.SpinRow({
            title: 'Notification Threshold',
            subtitle: 'Rate value to trigger notification (0 = disabled)',
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000000,
                step_increment: 0.1,
                value: settings.get_double('notification-threshold')
            }),
            digits: 2
        });

        thresholdRow.connect('notify::value', widget => {
            settings.set_double('notification-threshold', widget.value);
        });

        notificationGroup.add(thresholdRow);

       
        const notificationTypeRow = new Adw.ComboRow({
            title: 'Notification Type',
            subtitle: 'Trigger notification when rate goes above or below threshold'
        });

        const notificationTypeModel = new Gtk.StringList();
        notificationTypeModel.append('Above Threshold');
        notificationTypeModel.append('Below Threshold');

        notificationTypeRow.model = notificationTypeModel;
        notificationTypeRow.selected = settings.get_string('notification-type') === 'above' ? 0 : 1;

        notificationTypeRow.connect('notify::selected', widget => {
            const type = widget.selected === 0 ? 'above' : 'below';
            settings.set_string('notification-type', type);
        });

        notificationGroup.add(notificationTypeRow);

       
        const customizationGroup = new Adw.PreferencesGroup({
            title: 'Display Customization',
            description: 'Customize how currency data is displayed'
        });
        page.add(customizationGroup);

       
        const decimalPlacesRow = new Adw.SpinRow({
            title: 'Decimal Places',
            subtitle: 'Number of decimal places to display',
            adjustment: new Gtk.Adjustment({
                lower: 2,
                upper: 4,
                step_increment: 1,
                value: settings.get_int('decimal-places') || 2
            })
        });

        decimalPlacesRow.connect('notify::value', widget => {
            settings.set_int('decimal-places', widget.value);
        });

        customizationGroup.add(decimalPlacesRow);
    }
}