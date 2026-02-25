'use strict';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const CURRENCY_PAIRS = {
    // USD pairs
    'USD-EUR': 'USD/EUR', 'USD-GBP': 'USD/GBP', 'USD-JPY': 'USD/JPY',
    'USD-CNY': 'USD/CNY', 'USD-TRY': 'USD/TRY', 'USD-CAD': 'USD/CAD',
    'USD-AUD': 'USD/AUD', 'USD-CHF': 'USD/CHF', 'USD-MXN': 'USD/MXN',
    'USD-KRW': 'USD/KRW', 'USD-ARS': 'USD/ARS', 'USD-BRL': 'USD/BRL',
    'USD-SEK': 'USD/SEK', 'USD-NOK': 'USD/NOK', 'USD-DKK': 'USD/DKK',
    'USD-ZAR': 'USD/ZAR', 'USD-RUB': 'USD/RUB', 'USD-INR': 'USD/INR',
    'USD-ILS': 'USD/ILS', 'USD-SGD': 'USD/SGD',
    // EUR pairs
    'EUR-USD': 'EUR/USD', 'EUR-GBP': 'EUR/GBP', 'EUR-JPY': 'EUR/JPY',
    'EUR-CNY': 'EUR/CNY', 'EUR-TRY': 'EUR/TRY', 'EUR-CAD': 'EUR/CAD',
    'EUR-AUD': 'EUR/AUD', 'EUR-CHF': 'EUR/CHF', 'EUR-MXN': 'EUR/MXN',
    'EUR-KRW': 'EUR/KRW', 'EUR-ARS': 'EUR/ARS', 'EUR-BRL': 'EUR/BRL',
    'EUR-SEK': 'EUR/SEK', 'EUR-NOK': 'EUR/NOK', 'EUR-DKK': 'EUR/DKK',
    'EUR-ZAR': 'EUR/ZAR', 'EUR-RUB': 'EUR/RUB', 'EUR-INR': 'EUR/INR',
    'EUR-ILS': 'EUR/ILS', 'EUR-SGD': 'EUR/SGD',
    // GBP pairs
    'GBP-USD': 'GBP/USD', 'GBP-EUR': 'GBP/EUR', 'GBP-JPY': 'GBP/JPY',
    'GBP-CNY': 'GBP/CNY', 'GBP-TRY': 'GBP/TRY',
    // Other fiat
    'JPY-USD': 'JPY/USD', 'JPY-EUR': 'JPY/EUR',
    'CNY-USD': 'CNY/USD', 'CNY-EUR': 'CNY/EUR',
    'TRY-USD': 'TRY/USD', 'TRY-EUR': 'TRY/EUR',
    'MXN-USD': 'MXN/USD', 'MXN-EUR': 'MXN/EUR',
    // Crypto - via awesomeapi
    'BTC-USD': 'BTC/USD', 'BTC-EUR': 'BTC/EUR', 'BTC-GBP': 'BTC/GBP',
    'BTC-JPY': 'BTC/JPY', 'BTC-TRY': 'BTC/TRY',
    'ETH-USD': 'ETH/USD', 'ETH-EUR': 'ETH/EUR',
    // Kaspa - via CoinGecko
    'KAS-USD': 'KAS/USD', 'KAS-EUR': 'KAS/EUR', 'KAS-TRY': 'KAS/TRY',
    // Argentine Dollar - via dolarapi.com
    'USD-ARS-OFICIAL':   'USD/ARS (Oficial)',
    'USD-ARS-BLUE':      'USD/ARS (Blue)',
    'USD-ARS-BOLSA':     'USD/ARS (Bolsa)',
    'USD-ARS-CCL':       'USD/ARS (CCL)',
    'USD-ARS-TARJETA':   'USD/ARS (Tarjeta)',
    'USD-ARS-CRIPTO':    'USD/ARS (Cripto)',
    'USD-ARS-MAYORISTA': 'USD/ARS (Mayorista)',
};

export default class CurrencyTrackerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // ── Tab 1: General ──────────────────────────────────────────────
        const generalPage = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(generalPage);

        const generalGroup = new Adw.PreferencesGroup({
            title: 'General Settings',
            description: 'Configure currency pair and refresh interval',
        });
        generalPage.add(generalGroup);

        const currencyRow = new Adw.ComboRow({
            title: 'Default Currency Pair',
            subtitle: 'Select the default currency pair to display',
        });
        const currencyModel = new Gtk.StringList();
        Object.values(CURRENCY_PAIRS).forEach(v => currencyModel.append(v));
        currencyRow.model = currencyModel;
        const currentPair = settings.get_string('currency-pair');
        const pairIndex = Object.keys(CURRENCY_PAIRS).indexOf(currentPair);
        if (pairIndex !== -1)
            currencyRow.selected = pairIndex;
        currencyRow.connect('notify::selected', widget => {
            settings.set_string('currency-pair', Object.keys(CURRENCY_PAIRS)[widget.selected]);
        });
        generalGroup.add(currencyRow);

        const refreshRow = new Adw.SpinRow({
            title: 'Refresh Interval',
            subtitle: 'Seconds between automatic updates (30–3600)',
            adjustment: new Gtk.Adjustment({
                lower: 30, upper: 3600, step_increment: 30,
                value: settings.get_int('refresh-interval') || 60,
            }),
        });
        refreshRow.connect('notify::value', widget => {
            settings.set_int('refresh-interval', widget.value);
        });
        generalGroup.add(refreshRow);

        // ── Tab 2: Display ──────────────────────────────────────────────
        const displayPage = new Adw.PreferencesPage({
            title: 'Display',
            icon_name: 'video-display-symbolic',
        });
        window.add(displayPage);

        const displayGroup = new Adw.PreferencesGroup({
            title: 'Panel & Menu Display',
            description: 'Configure how currency data is shown',
        });
        displayPage.add(displayGroup);

        const showChangeSwitch = new Adw.SwitchRow({
            title: 'Show Percentage Change',
            subtitle: 'Colored ↑/↓ indicator in the panel',
        });
        showChangeSwitch.set_active(settings.get_boolean('show-percentage-change'));
        showChangeSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-percentage-change', widget.active);
        });
        displayGroup.add(showChangeSwitch);

        const showIconSwitch = new Adw.SwitchRow({
            title: 'Show Icon',
            subtitle: 'Display the currency icon in the panel',
        });
        showIconSwitch.set_active(settings.get_boolean('show-icon'));
        showIconSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-icon', widget.active);
        });
        displayGroup.add(showIconSwitch);

        const showSparklineSwitch = new Adw.SwitchRow({
            title: 'Show Sparkline Chart',
            subtitle: 'Display 24-hour price trend in popup menu',
        });
        showSparklineSwitch.set_active(settings.get_boolean('show-sparkline'));
        showSparklineSwitch.connect('notify::active', widget => {
            settings.set_boolean('show-sparkline', widget.active);
        });
        displayGroup.add(showSparklineSwitch);

        const decimalPlacesRow = new Adw.SpinRow({
            title: 'Decimal Places',
            subtitle: 'Precision of displayed rates (2–4)',
            adjustment: new Gtk.Adjustment({
                lower: 2, upper: 4, step_increment: 1,
                value: settings.get_int('decimal-places') || 2,
            }),
        });
        decimalPlacesRow.connect('notify::value', widget => {
            settings.set_int('decimal-places', widget.value);
        });
        displayGroup.add(decimalPlacesRow);

        // ── Tab 3: Alerts ───────────────────────────────────────────────
        const alertsPage = new Adw.PreferencesPage({
            title: 'Alerts',
            icon_name: 'preferences-system-notifications-symbolic',
        });
        window.add(alertsPage);

        const notificationGroup = new Adw.PreferencesGroup({
            title: 'Price Alerts',
            description: 'Get notified when a rate crosses your threshold',
        });
        alertsPage.add(notificationGroup);

        const enableNotificationsSwitch = new Adw.SwitchRow({
            title: 'Enable Notifications',
            subtitle: 'Show notifications when rate reaches threshold',
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
                lower: 0, upper: 1000000, step_increment: 0.1,
                value: settings.get_double('notification-threshold'),
            }),
            digits: 2,
        });
        thresholdRow.connect('notify::value', widget => {
            settings.set_double('notification-threshold', widget.value);
        });
        notificationGroup.add(thresholdRow);

        const notificationTypeRow = new Adw.ComboRow({
            title: 'Notification Type',
            subtitle: 'Trigger when rate goes above or below threshold',
        });
        const notificationTypeModel = new Gtk.StringList();
        notificationTypeModel.append('Above Threshold');
        notificationTypeModel.append('Below Threshold');
        notificationTypeRow.model = notificationTypeModel;
        notificationTypeRow.selected = settings.get_string('notification-type') === 'above' ? 0 : 1;
        notificationTypeRow.connect('notify::selected', widget => {
            settings.set_string('notification-type', widget.selected === 0 ? 'above' : 'below');
        });
        notificationGroup.add(notificationTypeRow);

        // ── Tab 4: Advanced ─────────────────────────────────────────────
        const advancedPage = new Adw.PreferencesPage({
            title: 'Advanced',
            icon_name: 'applications-engineering-symbolic',
        });
        window.add(advancedPage);

        const advancedGroup = new Adw.PreferencesGroup({
            title: 'Advanced Settings',
            description: 'Debugging and developer options',
        });
        advancedPage.add(advancedGroup);

        const debugSwitch = new Adw.SwitchRow({
            title: 'Enable Debug Logging',
            subtitle: 'View logs: journalctl -f -o cat /usr/bin/gnome-shell',
        });
        debugSwitch.set_active(settings.get_boolean('enable-debug-log'));
        debugSwitch.connect('notify::active', widget => {
            settings.set_boolean('enable-debug-log', widget.active);
        });
        advancedGroup.add(debugSwitch);

        const customCoinGroup = new Adw.PreferencesGroup({
            title: 'Custom Coin (CoinGecko)',
            description: 'Track any CoinGecko coin. Find IDs at coingecko.com',
        });
        advancedPage.add(customCoinGroup);

        const coinIdRow = new Adw.EntryRow({
            title: 'CoinGecko Coin ID',
            text: settings.get_string('custom-coin-id'),
            show_apply_button: true,
        });
        coinIdRow.connect('apply', widget => {
            settings.set_string('custom-coin-id', widget.text.trim().toLowerCase());
        });
        customCoinGroup.add(coinIdRow);

        const symbolRow = new Adw.EntryRow({
            title: 'Display Symbol',
            text: settings.get_string('custom-coin-symbol'),
            show_apply_button: true,
        });
        symbolRow.connect('apply', widget => {
            settings.set_string('custom-coin-symbol', widget.text.trim().toUpperCase());
        });
        customCoinGroup.add(symbolRow);

        const vsCurrencies = ['usd', 'eur', 'try', 'gbp'];
        const vsCurrencyRow = new Adw.ComboRow({
            title: 'Quote Currency',
            subtitle: 'Currency to price the custom coin against',
        });
        const vsModel = new Gtk.StringList();
        vsCurrencies.forEach(c => vsModel.append(c.toUpperCase()));
        vsCurrencyRow.model = vsModel;
        const currentVs = settings.get_string('custom-coin-vs-currency') || 'usd';
        vsCurrencyRow.selected = Math.max(0, vsCurrencies.indexOf(currentVs));
        vsCurrencyRow.connect('notify::selected', widget => {
            settings.set_string('custom-coin-vs-currency', vsCurrencies[widget.selected]);
        });
        customCoinGroup.add(vsCurrencyRow);
    }
}
