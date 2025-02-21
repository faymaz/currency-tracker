'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';
import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, _('Currency Tracker'));

        this._extension = extension;
        this._settings = extension.getSettings();
        
        // Panel box oluşturma
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });

        // Icon oluşturma
        this._icon = new St.Icon({
            gicon: Gio.Icon.new_for_string(`${extension.path}/icons/icon.svg`),
            style_class: 'currency-tracker-icon'
        });

        // Label oluşturma
        this._label = new St.Label({
            text: _('Loading...'),
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'currency-tracker-label'
        });

        // Panel'e elementleri ekleme
        if (this._settings.get_boolean('show-icon')) {
            this._panelBox.add_child(this._icon);
        }
        this._panelBox.add_child(this._label);
        this.add_child(this._panelBox);

        // Menu oluşturma ve refresh
        this._buildMenu();
        this._refresh();

        // Settings değişikliklerini dinleme
        this._settingsChangedId = this._settings.connect('changed::show-icon', () => {
            this._updateIconVisibility();
        });
    }

    _updateIconVisibility() {
        if (this._settings.get_boolean('show-icon')) {
            if (!this._icon.get_parent()) {
                this._panelBox.insert_child_at_index(this._icon, 0);
            }
        } else {
            if (this._icon.get_parent()) {
                this._panelBox.remove_child(this._icon);
            }
        }
    }

    _buildMenu() {
        // Kategorilere göre para birimi seçimi
        for (const [category, pairs] of Object.entries(CURRENCY_CATEGORIES)) {
            const categorySubMenu = new PopupMenu.PopupSubMenuMenuItem(_(category));
            
            for (const pair of pairs) {
                const menuItem = new PopupMenu.PopupMenuItem(CURRENCY_PAIRS[pair]);
                menuItem.connect('activate', () => {
                    this._currentPair = pair;
                    this._refresh();
                });
                categorySubMenu.menu.addMenuItem(menuItem);
            }
            
            this.menu.addMenuItem(categorySubMenu);
        }
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Refresh butonu
        const refreshItem = new PopupMenu.PopupMenuItem(_('Refresh'));
        refreshItem.connect('activate', () => {
            this._refresh();
        });
        this.menu.addMenuItem(refreshItem);

        // Settings butonu
        const settingsItem = new PopupMenu.PopupMenuItem(_('Settings'));
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }

    async _refresh() {
        try {
            this._label.set_text(_('Loading...'));
            const pair = this._currentPair || 'USD-TRY';
            const response = await this._fetchData(pair);
            
            if (!response) {
                throw new Error('No response from API');
            }

            const text = new TextDecoder().decode(response);
            const data = JSON.parse(text);
            const currencyData = data[pair.replace('-', '')];
            
            if (!currencyData) {
                throw new Error('Invalid currency data');
            }

            let displayText = `${CURRENCY_PAIRS[pair]}: ${currencyData.bid}`;
            if (currencyData.pctChange) {
                const change = parseFloat(currencyData.pctChange);
                const changeText = change >= 0 ? `+${change}%` : `${change}%`;
                displayText += ` (${changeText})`;
            }
            this._label.set_text(displayText);
        } catch (error) {
            console.error('Refresh error:', error);
            this._label.set_text(`Error: ${error.message}`);
        }
    }

    async _fetchData(pair) {
        let session = null;
        try {
            const url = `https://economia.awesomeapi.com.br/json/last/${pair}`;
            session = new Soup.Session();
            const message = Soup.Message.new('GET', url);
            
            if (!message) {
                throw new Error('Failed to create HTTP message');
            }

            const bytes = await session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null
            );

            if (!bytes) {
                throw new Error('No response data');
            }

            return bytes.get_data();
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        } finally {
            if (session) {
                session.abort();
            }
        }
    }

    destroy() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
        }
        super.destroy();
    }
});

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
    'CNY-EUR': 'CNY/EUR',
    'CNY-USD': 'CNY/USD',
    'BTC-EUR': 'BTC/EUR',
    'BTC-USD': 'BTC/USD'
};

const CURRENCY_CATEGORIES = {
    'USD Pairs': ['USD-EUR', 'USD-GBP', 'USD-CNY', 'USD-TRY'],
    'EUR Pairs': ['EUR-USD', 'EUR-GBP', 'EUR-CNY', 'EUR-TRY'],
    'CNY Pairs': ['CNY-USD', 'CNY-EUR'],
    'TRY Pairs': ['USD-TRY', 'EUR-TRY'],
    'Bitcoin': ['BTC-USD', 'BTC-EUR']
};

export default class CurrencyTracker extends Extension {
    enable() {
        console.log('Currency Tracker: enabling...');
        this._indicator = new Indicator(this);
        Main.panel.addToStatusArea('currency-tracker', this._indicator);
    }

    disable() {
        console.log('Currency Tracker: disabling...');
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}