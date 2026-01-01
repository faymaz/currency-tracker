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
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const CURRENCY_PAIRS = {
    // USD pairs
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

    // EUR pairs
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

    // GBP pairs
    'GBP-USD': 'GBP/USD',
    'GBP-EUR': 'GBP/EUR',
    'GBP-JPY': 'GBP/JPY',
    'GBP-CNY': 'GBP/CNY',
    'GBP-TRY': 'GBP/TRY',

    // CNY pairs
    'CNY-USD': 'CNY/USD',
    'CNY-EUR': 'CNY/EUR',

    // TRY pairs
    'TRY-USD': 'TRY/USD',
    'TRY-EUR': 'TRY/EUR',

    // Other fiat pairs
    'MXN-USD': 'MXN/USD',
    'MXN-EUR': 'MXN/EUR',
    'JPY-USD': 'JPY/USD',
    'JPY-EUR': 'JPY/EUR',

    // Cryptocurrencies
    'BTC-USD': 'BTC/USD',
    'BTC-EUR': 'BTC/EUR',
    'BTC-GBP': 'BTC/GBP',
    'BTC-JPY': 'BTC/JPY',
    'BTC-TRY': 'BTC/TRY',
    'ETH-USD': 'ETH/USD',
    'ETH-EUR': 'ETH/EUR'
};

const CURRENCY_CATEGORIES = {
    // Major currencies
    'USD Pairs': ['USD-EUR', 'USD-GBP', 'USD-JPY', 'USD-CNY', 'USD-TRY', 'USD-CAD', 'USD-AUD', 'USD-CHF'],
    'EUR Pairs': ['EUR-USD', 'EUR-GBP', 'EUR-JPY', 'EUR-CNY', 'EUR-TRY', 'EUR-CAD', 'EUR-AUD', 'EUR-CHF'],
    'GBP Pairs': ['GBP-USD', 'GBP-EUR', 'GBP-JPY'],

    // Asian currencies
    'JPY Pairs': ['USD-JPY', 'EUR-JPY', 'GBP-JPY', 'JPY-USD', 'JPY-EUR'],
    'CNY Pairs': ['USD-CNY', 'EUR-CNY', 'GBP-CNY', 'CNY-USD', 'CNY-EUR'],
    'KRW Pairs': ['USD-KRW', 'EUR-KRW'],
    'SGD Pairs': ['USD-SGD', 'EUR-SGD'],

    // European currencies
    'TRY Pairs': ['USD-TRY', 'EUR-TRY', 'TRY-USD', 'TRY-EUR'],
    'CHF Pairs': ['USD-CHF', 'EUR-CHF'],
    'SEK Pairs': ['USD-SEK', 'EUR-SEK'],
    'NOK Pairs': ['USD-NOK', 'EUR-NOK'],
    'DKK Pairs': ['USD-DKK', 'EUR-DKK'],
    'RUB Pairs': ['USD-RUB', 'EUR-RUB'],

    // American currencies
    'CAD Pairs': ['USD-CAD', 'EUR-CAD'],
    'MXN Pairs': ['USD-MXN', 'EUR-MXN', 'MXN-USD', 'MXN-EUR'],
    'BRL Pairs': ['USD-BRL', 'EUR-BRL'],
    'ARS Pairs': ['USD-ARS', 'EUR-ARS'],

    // Other region currencies
    'AUD Pairs': ['USD-AUD', 'EUR-AUD'],
    'ZAR Pairs': ['USD-ZAR', 'EUR-ZAR'],
    'INR Pairs': ['USD-INR', 'EUR-INR'],
    'ILS Pairs': ['USD-ILS', 'EUR-ILS'],

    // Cryptocurrencies
    'Bitcoin': ['BTC-USD', 'BTC-EUR'],
    'Ethereum': ['ETH-USD', 'ETH-EUR'],
};

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Currency Tracker');

        this._extension = extension;
        this._settings = extension.getSettings();
        this._refreshTimeout = null;
        this._retryTimeout = null;
        this._lastRefreshTime = 0;
        this._retryCount = 0;
        this._maxRetries = 3;
        this._lastKnownValue = null;
        this._cachedData = new Map();
        this._notificationSource = null;
        this._lastNotificationRate = 0;
        this._activeSession = null;
        
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        this._currentPair = this._settings.get_string('currency-pair');
        
        this._icon = new St.Icon({
            icon_name: 'office-database-symbolic', 
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
            style_class: 'currency-tracker-label',
            reactive: true,
            track_hover: true
        });

       
        this._tooltipLabel = new St.Label({
            style_class: 'currency-tooltip',
            text: '',
            visible: false
        });

       
        this._label.connect('notify::hover', () => {
            if (this._label.hover && this._lastKnownValue) {
                this._tooltipLabel.set_text(this._lastKnownValue);
                this._tooltipLabel.visible = true;

               
                const [x, y] = this._label.get_transformed_position();
                const monitor = Main.layoutManager.primaryMonitor;
                this._tooltipLabel.set_position(x, monitor.y + Main.panel.height);

                Main.layoutManager.addChrome(this._tooltipLabel);
            } else {
                this._tooltipLabel.visible = false;
                Main.layoutManager.removeChrome(this._tooltipLabel);
            }
        });
        
        if (this._settings.get_boolean('show-icon')) {
            this._panelBox.add_child(this._icon);
        }
        this._panelBox.add_child(this._label);
        this.add_child(this._panelBox);
        
        this._buildMenu();
        this._refresh();
        this._setupAutoRefresh();

       
        this._settingsChangedId = this._settings.connect('changed::show-icon', () => {
            this._updateIconVisibility();
        });

        this._percentageChangedId = this._settings.connect('changed::show-percentage-change', () => {
            this._debugLog('Show percentage change setting toggled');
            this._refresh(true);  // Force immediate refresh to show/hide percentage
        });

        this._refreshIntervalChangedId = this._settings.connect('changed::refresh-interval', () => {
            this._setupAutoRefresh();
        });

        this._currencyPairChangedId = this._settings.connect('changed::currency-pair', () => {
            const newPair = this._settings.get_string('currency-pair');
            this._debugLog(`Currency pair changed via settings to: ${newPair}`);
            this._currentPair = newPair;
            this._lastKnownValue = null;  // Reset last known value for new pair
            this._refresh(true);
            this._setupAutoRefresh();
        });
    }

    _debugLog(message) {
        if (this._settings.get_boolean('enable-debug-log')) {
            console.log(`[Currency Tracker Debug] ${message}`);
        }
    }

    _setupAutoRefresh() {
        // Remove existing refresh timeout
        if (this._refreshTimeout) {
            GLib.source_remove(this._refreshTimeout);
            this._refreshTimeout = null;
        }

        // Remove any pending retry timeout
        if (this._retryTimeout) {
            GLib.source_remove(this._retryTimeout);
            this._retryTimeout = null;
        }

        const interval = this._settings.get_int('refresh-interval');
        this._debugLog(`Setting up auto-refresh with interval: ${interval} seconds`);

        // Set up new refresh timeout
        this._refreshTimeout = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            interval,
            () => {
                this._debugLog('Auto-refresh triggered');
                this._refresh();
                return GLib.SOURCE_CONTINUE;
            }
        );
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
        
        for (const [category, pairs] of Object.entries(CURRENCY_CATEGORIES)) {
            const categorySubMenu = new PopupMenu.PopupSubMenuMenuItem(category);
            
            for (const pair of pairs) {
                
                if (CURRENCY_PAIRS[pair]) {
                    const menuItem = new PopupMenu.PopupMenuItem(CURRENCY_PAIRS[pair]);
                    menuItem.connect('activate', () => {
                        this._currentPair = pair;
                        this._lastKnownValue = null;  // Reset last known value for new pair
                        this._debugLog(`Currency pair changed to: ${pair}`);
                        this._refresh(true);
                        this._setupAutoRefresh();
                    });
                    categorySubMenu.menu.addMenuItem(menuItem);
                } else {
                    console.warn(`Undefined currency pair: ${pair}`);
                }
            }
            
            this.menu.addMenuItem(categorySubMenu);
        }
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        

        const refreshItem = new PopupMenu.PopupMenuItem('Refresh');
        refreshItem.connect('activate', () => {
            this._refresh(true);
        });
        this.menu.addMenuItem(refreshItem);

       
        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }

    async _refresh(forceRefresh = false) {
        // Cancel any active session from previous refresh
        if (this._activeSession) {
            this._debugLog('Cancelling previous active session');
            this._activeSession.abort();
            this._activeSession = null;
        }

        const now = Date.now();
        const minInterval = 10000;
        if (!forceRefresh && now - this._lastRefreshTime < minInterval) {
            this._debugLog('Rate limit: Refresh request ignored (too frequent)');
            return;
        }
        this._lastRefreshTime = now;

        try {
            const pair = this._currentPair || this._settings.get_string('currency-pair');
            this._debugLog(`Refreshing currency pair: ${pair}`);

           
            if (this._lastKnownValue) {
                this._debugLog('Showing last known value during refresh');
            } else {
                this._label.set_text('Loading...');
            }

            if (this._currentPair) {
                this._settings.set_string('currency-pair', this._currentPair);
            }

            const response = await this._fetchDataWithRetry(pair);

            if (!response) {
                throw new Error('No response from API');
            }

            const text = new TextDecoder().decode(response);
            this._debugLog(`API Response for ${pair}: ${text}`);

            const data = JSON.parse(text);
            this._debugLog(`Parsed data: ${JSON.stringify(data)}`); 


           
            const possibleKeys = [
                pair.replace('-', ''),
                pair.replace('-', '').toUpperCase(),
                pair.replace('-', '').toLowerCase(),
                pair,
                pair.toUpperCase(),
                pair.toLowerCase()
            ];

            let currencyData = null;
            let usedKey = null;

            for (const key of possibleKeys) {
                if (data[key]) {
                    currencyData = data[key];
                    usedKey = key;
                    break;
                }
            }

            this._debugLog(`Found data with key: ${usedKey}`); 
            
            if (!currencyData) {
                console.error('Available keys in response:', Object.keys(data));
                throw new Error(`No currency data found for ${pair}. Available keys: ${Object.keys(data).join(', ')}`);
            }

           
            this._cachedData.set(pair, {data: currencyData, timestamp: Date.now()});

           
            const rateRaw = parseFloat(currencyData.bid || currencyData.ask || currencyData.high || 0);
            const decimalPlaces = this._settings.get_int('decimal-places');
            const rate = rateRaw > 0 ? rateRaw.toFixed(decimalPlaces) : 'N/A';
            let displayText = `${CURRENCY_PAIRS[pair]}: ${rate}`;

           
            this._checkNotificationThreshold(pair, rateRaw);

           
            let styleClass = 'currency-neutral';
            if (this._settings.get_boolean('show-percentage-change') && currencyData.pctChange) {
                const change = parseFloat(currencyData.pctChange);
                const arrow = change >= 0 ? '↑' : '↓';
                const changeText = change >= 0 ? `+${change}%` : `${change}%`;
                displayText += ` ${arrow}${changeText}`;

               
                styleClass = change >= 0 ? 'currency-positive' : 'currency-negative';
            }

           
            this._label.style_class = `currency-tracker-label ${styleClass}`;

            this._lastKnownValue = displayText;
            this._label.set_text(displayText);
            this._retryCount = 0;
            this._debugLog(`Successfully updated display: ${displayText}`);
        } catch (error) {
            console.error('Refresh error:', error);

           
            const pair = this._currentPair || this._settings.get_string('currency-pair');
            const cached = this._cachedData.get(pair);

            if (cached && this._lastKnownValue) {
                const age = Math.floor((Date.now() - cached.timestamp) / 1000);
                this._label.set_text(`${this._lastKnownValue} (${age}s ago)`);
                this._debugLog(`Using cached data (${age}s old) due to error`);
            } else {
                this._label.set_text('Error: Unable to fetch data');
            }

            this._debugLog(`Refresh error: ${error.message}`);
        }
    }

    _checkNotificationThreshold(pair, rate) {
        if (!this._settings.get_boolean('enable-notifications')) {
            return;
        }

        const threshold = this._settings.get_double('notification-threshold');
        if (threshold === 0.0) {
            return;
        }

        const notificationType = this._settings.get_string('notification-type');
        const shouldNotify = (notificationType === 'above' && rate >= threshold) ||
                           (notificationType === 'below' && rate <= threshold);

       
        const hasNotified = (notificationType === 'above' && this._lastNotificationRate >= threshold) ||
                          (notificationType === 'below' && this._lastNotificationRate <= threshold);

        if (shouldNotify && !hasNotified) {
            this._sendNotification(pair, rate, threshold, notificationType);
        }

        this._lastNotificationRate = rate;
    }

    _sendNotification(pair, rate, threshold, type) {
        const title = 'Currency Tracker Alert';
        const message = `${CURRENCY_PAIRS[pair]} is now ${rate.toFixed(2)}\n` +
                       `Threshold ${type} ${threshold.toFixed(2)} reached!`;

        if (!this._notificationSource) {
            this._notificationSource = new MessageTray.Source({
                title: 'Currency Tracker',
                iconName: 'dialog-information'
            });
            Main.messageTray.add(this._notificationSource);
        }

        const notification = new MessageTray.Notification({
            source: this._notificationSource,
            title: title,
            body: message,
            isTransient: true
        });

        this._notificationSource.showNotification(notification);
        this._debugLog(`Notification sent: ${message}`);
    }

    async _fetchDataWithRetry(pair, retryAttempt = 0) {
        try {
            return await this._fetchData(pair);
        } catch (error) {
            if (retryAttempt < this._maxRetries) {
                const backoffTime = Math.pow(2, retryAttempt) * 1000;
                this._debugLog(`Retry ${retryAttempt + 1}/${this._maxRetries} after ${backoffTime}ms`);

                // Remove any existing retry timeout before creating a new one
                if (this._retryTimeout) {
                    GLib.source_remove(this._retryTimeout);
                    this._retryTimeout = null;
                }

                await new Promise(resolve => {
                    this._retryTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, backoffTime, () => {
                        this._retryTimeout = null;
                        resolve();
                        return GLib.SOURCE_REMOVE;
                    });
                });

                return await this._fetchDataWithRetry(pair, retryAttempt + 1);
            }
            throw error;
        }
    }

    async _fetchData(pair) {
        let session = null;
        try {

            const apiPair = pair.replace('-', '-');
            const url = `https://economia.awesomeapi.com.br/json/last/${apiPair}`;
            this._debugLog(`Fetching from URL: ${url}`);

            session = new Soup.Session();
            this._activeSession = session;  // Track active session
            session.timeout = 10;

            const message = Soup.Message.new('GET', url);

            if (!message) {
                throw new Error('Failed to create HTTP message. Check your internet connection.');
            }

           
            message.request_headers.append('User-Agent', 'Currency-Tracker-GNOME-Extension/1.0');

            const bytes = await session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null
            );

            if (!bytes) {
                throw new Error('No response data received from API');
            }

           
            const statusCode = message.status_code;
            if (statusCode !== 200) {
                let errorMsg = `HTTP ${statusCode}`;
                switch (statusCode) {
                    case 404:
                        errorMsg = 'Currency pair not found';
                        break;
                    case 429:
                        errorMsg = 'Too many requests. Please wait.';
                        break;
                    case 500:
                    case 502:
                    case 503:
                        errorMsg = 'API server error. Try again later.';
                        break;
                    case 0:
                        errorMsg = 'Network connection failed';
                        break;
                    default:
                        errorMsg = `API error (${statusCode})`;
                }
                throw new Error(errorMsg);
            }

            return bytes.get_data();
        } catch (error) {
           
            let enhancedError = error;
            if (error.message && error.message.includes('Could not resolve host')) {
                enhancedError = new Error('No internet connection');
            } else if (error.message && error.message.includes('timeout')) {
                enhancedError = new Error('Request timeout. Check connection.');
            }

            console.error('Fetch error for pair', pair, ':', enhancedError);
            this._debugLog(`Fetch error details: ${enhancedError.message}`);
            throw enhancedError;
        } finally {
            if (session) {
                session.abort();
            }
            // Clear active session reference if it's the same session
            if (this._activeSession === session) {
                this._activeSession = null;
            }
        }
    }

    destroy() {
        // Cancel any active session
        if (this._activeSession) {
            this._activeSession.abort();
            this._activeSession = null;
        }

        // Remove refresh timeout
        if (this._refreshTimeout) {
            GLib.source_remove(this._refreshTimeout);
            this._refreshTimeout = null;
        }

        // Remove retry timeout
        if (this._retryTimeout) {
            GLib.source_remove(this._retryTimeout);
            this._retryTimeout = null;
        }

        // Destroy notification source
        if (this._notificationSource) {
            this._notificationSource.destroy();
            this._notificationSource = null;
        }

        // Clean up tooltip
        if (this._tooltipLabel) {
            if (this._tooltipLabel.visible) {
                Main.layoutManager.removeChrome(this._tooltipLabel);
            }
            this._tooltipLabel.destroy();
            this._tooltipLabel = null;
        }

        // Disconnect settings signals
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
        }
        if (this._percentageChangedId) {
            this._settings.disconnect(this._percentageChangedId);
        }
        if (this._refreshIntervalChangedId) {
            this._settings.disconnect(this._refreshIntervalChangedId);
        }
        if (this._currencyPairChangedId) {
            this._settings.disconnect(this._currencyPairChangedId);
        }

        // Clear cached data
        this._cachedData.clear();

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