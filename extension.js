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

const CURRENCY_PAIRS = {
    // USD çiftleri
    'USD-EUR': 'USD/EUR',
    'USD-GBP': 'USD/GBP',
    'USD-JPY': 'USD/JPY',
    'USD-CNY': 'USD/CNY',
    'USD-TRY': 'USD/TRY',
    'USD-MXN': 'USD/MXN',
    'USD-KRW': 'USD/KRW',
    'USD-ARS': 'USD/ARS',
    'USD-BRL': 'USD/BRL',
    'USD-CAD': 'USD/CAD',
    'USD-AUD': 'USD/AUD',
    'USD-CHF': 'USD/CHF',
    'USD-SEK': 'USD/SEK',
    'USD-NOK': 'USD/NOK',
    'USD-DKK': 'USD/DKK',
    'USD-ZAR': 'USD/ZAR',
    'USD-RUB': 'USD/RUB',
    'USD-INR': 'USD/INR',
    'USD-ILS': 'USD/ILS',
    'USD-SGD': 'USD/SGD',
    
    // EUR çiftleri
    'EUR-USD': 'EUR/USD',
    'EUR-GBP': 'EUR/GBP',
    'EUR-JPY': 'EUR/JPY',
    'EUR-CNY': 'EUR/CNY',
    'EUR-TRY': 'EUR/TRY',
    'EUR-MXN': 'EUR/MXN',
    'EUR-KRW': 'EUR/KRW',
    'EUR-ARS': 'EUR/ARS',
    'EUR-BRL': 'EUR/BRL',
    'EUR-CAD': 'EUR/CAD',
    'EUR-AUD': 'EUR/AUD',
    'EUR-CHF': 'EUR/CHF',
    'EUR-SEK': 'EUR/SEK',
    'EUR-NOK': 'EUR/NOK',
    'EUR-DKK': 'EUR/DKK',
    'EUR-ZAR': 'EUR/ZAR',
    'EUR-RUB': 'EUR/RUB',
    'EUR-INR': 'EUR/INR',
    'EUR-ILS': 'EUR/ILS',
    'EUR-SGD': 'EUR/SGD',
    
    // GBP çiftleri
    'GBP-USD': 'GBP/USD',
    'GBP-EUR': 'GBP/EUR',
    'GBP-JPY': 'GBP/JPY',
    'GBP-CNY': 'GBP/CNY',
    'GBP-TRY': 'GBP/TRY',
    
    // CNY çiftleri
    'CNY-USD': 'CNY/USD',
    'CNY-EUR': 'CNY/EUR',
    
    // TRY çiftleri
    'TRY-USD': 'TRY/USD',
    'TRY-EUR': 'TRY/EUR',
    
    // Diğer fiat çiftleri
    'MXN-USD': 'MXN/USD',
    'MXN-EUR': 'MXN/EUR',
    'JPY-USD': 'JPY/USD',
    'JPY-EUR': 'JPY/EUR',
    
    // Kripto para birimleri
    'BTC-USD': 'BTC/USD',
    'BTC-EUR': 'BTC/EUR',
    'BTC-GBP': 'BTC/GBP',
    'BTC-JPY': 'BTC/JPY',
    'BTC-TRY': 'BTC/TRY',
    'ETH-USD': 'ETH/USD',
    'ETH-EUR': 'ETH/EUR'
};

const CURRENCY_CATEGORIES = {
    // Ana para birimleri
    'USD Pairs': ['USD-EUR', 'USD-GBP', 'USD-JPY', 'USD-CNY', 'USD-TRY', 'USD-CAD', 'USD-AUD', 'USD-CHF'],
    'EUR Pairs': ['EUR-USD', 'EUR-GBP', 'EUR-JPY', 'EUR-CNY', 'EUR-TRY', 'EUR-CAD', 'EUR-AUD', 'EUR-CHF'],
    'GBP Pairs': ['GBP-USD', 'GBP-EUR', 'GBP-JPY'],
    
    // Asya para birimleri
    'JPY Pairs': ['USD-JPY', 'EUR-JPY', 'GBP-JPY', 'JPY-USD', 'JPY-EUR'],
    'CNY Pairs': ['USD-CNY', 'EUR-CNY', 'GBP-CNY', 'CNY-USD', 'CNY-EUR'],
    'KRW Pairs': ['USD-KRW', 'EUR-KRW'],
    'SGD Pairs': ['USD-SGD', 'EUR-SGD'],
    
    // Avrupa para birimleri
    'TRY Pairs': ['USD-TRY', 'EUR-TRY', 'TRY-USD', 'TRY-EUR'],
    'CHF Pairs': ['USD-CHF', 'EUR-CHF'],
    'SEK Pairs': ['USD-SEK', 'EUR-SEK'],
    'NOK Pairs': ['USD-NOK', 'EUR-NOK'],
    'DKK Pairs': ['USD-DKK', 'EUR-DKK'],
    'RUB Pairs': ['USD-RUB', 'EUR-RUB'],
    
    // Amerika para birimleri
    'CAD Pairs': ['USD-CAD', 'EUR-CAD'],
    'MXN Pairs': ['USD-MXN', 'EUR-MXN', 'MXN-USD', 'MXN-EUR'],
    'BRL Pairs': ['USD-BRL', 'EUR-BRL'],
    'ARS Pairs': ['USD-ARS', 'EUR-ARS'],
    
    // Diğer bölge para birimleri
    'AUD Pairs': ['USD-AUD', 'EUR-AUD'],
    'ZAR Pairs': ['USD-ZAR', 'EUR-ZAR'],
    'INR Pairs': ['USD-INR', 'EUR-INR'],
    'ILS Pairs': ['USD-ILS', 'EUR-ILS'],
    
    // Kripto para birimleri
    'Bitcoin': ['BTC-USD', 'BTC-EUR'],
    'Ethereum': ['ETH-USD', 'ETH-EUR'],
};

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Currency Tracker');
    
        this._extension = extension;
        this._settings = extension.getSettings();
        
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        this._currentPair = this._settings.get_string('currency-pair');
        
        this._icon = new St.Icon({
            icon_name: 'office-database-symbolic', // Fallback ikon
            style_class: 'system-status-icon currency-tracker-icon'
        });
        
        try {
            const iconPath = `${this._extension.path}/icons/icon.svg`;
            const file = Gio.File.new_for_path(iconPath);
            if (file.query_exists(null)) {
                this._icon.gicon = Gio.Icon.new_for_string(iconPath);
            }
        } catch (error) {
            console.error('Failed to load icon:', error);
        }
    
        this._label = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'currency-tracker-label'
        });
        
        if (this._settings.get_boolean('show-icon')) {
            this._panelBox.add_child(this._icon);
        }
        this._panelBox.add_child(this._label);
        this.add_child(this._panelBox);
        
        this._buildMenu();
        this._refresh();
    
        // Settings değişikliklerini dinle
        this._settingsChangedId = this._settings.connect('changed::show-icon', () => {
            this._updateIconVisibility();
        });
    
        // Percentage change ayarını dinle
        this._percentageChangedId = this._settings.connect('changed::show-percentage-change', () => {
            this._refresh();
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
            const categorySubMenu = new PopupMenu.PopupSubMenuMenuItem(category);
            
            for (const pair of pairs) {
                // Tanımlanmamış çiftler için kontrol ekliyoruz
                if (CURRENCY_PAIRS[pair]) {
                    const menuItem = new PopupMenu.PopupMenuItem(CURRENCY_PAIRS[pair]);
                    menuItem.connect('activate', () => {
                        this._currentPair = pair;
                        this._refresh();
                    });
                    categorySubMenu.menu.addMenuItem(menuItem);
                } else {
                    console.warn(`Tanımlanmamış para birimi çifti: ${pair}`);
                }
            }
            
            this.menu.addMenuItem(categorySubMenu);
        }
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Refresh butonu
        const refreshItem = new PopupMenu.PopupMenuItem('Refresh');
        refreshItem.connect('activate', () => {
            this._refresh();
        });
        this.menu.addMenuItem(refreshItem);

        // Settings butonu
        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }

    async _refresh() {
        try {
            this._label.set_text('Loading...');
            const pair = this._currentPair || this._settings.get_string('currency-pair');
            
            if (this._currentPair) {
                this._settings.set_string('currency-pair', this._currentPair);
            }
            
            const response = await this._fetchData(pair);
            
            const text = new TextDecoder().decode(response);
            const data = JSON.parse(text);
            const currencyData = data[pair.replace('-', '')];
            
            if (!currencyData) {
                throw new Error('Invalid currency data');
            }
    
            // Base display text without percentage
            let displayText = `${CURRENCY_PAIRS[pair]}: ${currencyData.bid}`;
    
            // Check settings for showing percentage change
            if (this._settings.get_boolean('show-percentage-change') && currencyData.pctChange) {
                const change = parseFloat(currencyData.pctChange);
                const changeText = change >= 0 ? `+${change}%` : `${change}%`;
                displayText += ` (${changeText})`;
            }
    
            this._label.set_text(displayText);
        } catch (error) {
            console.error('Refresh error:', error);
            this._label.set_text('Error: ' + error.message);
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
        if (this._percentageChangedId) {
            this._settings.disconnect(this._percentageChangedId);
        }
        super.destroy();
    }
});

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