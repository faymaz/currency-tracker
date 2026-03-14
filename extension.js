'use strict';

import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';
import Clutter from 'gi://Clutter';
import Cairo from 'gi://cairo';

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

    // Cryptocurrencies (via awesomeapi)
    'BTC-USD': 'BTC/USD',
    'BTC-EUR': 'BTC/EUR',
    'BTC-GBP': 'BTC/GBP',
    'BTC-JPY': 'BTC/JPY',
    'BTC-TRY': 'BTC/TRY',
    'ETH-USD': 'ETH/USD',
    'ETH-EUR': 'ETH/EUR',

    // Kaspa (KAS) - via CoinGecko
    'KAS-USD': 'KAS/USD',
    'KAS-EUR': 'KAS/EUR',
    'KAS-TRY': 'KAS/TRY',

    // Argentine Dollar types - via dolarapi.com
    'USD-ARS-OFICIAL': 'USD/ARS (Oficial)',
    'USD-ARS-BLUE': 'USD/ARS (Blue)',
    'USD-ARS-BOLSA': 'USD/ARS (Bolsa)',
    'USD-ARS-CCL': 'USD/ARS (CCL)',
    'USD-ARS-TARJETA': 'USD/ARS (Tarjeta)',
    'USD-ARS-CRIPTO': 'USD/ARS (Cripto)',
    'USD-ARS-MAYORISTA': 'USD/ARS (Mayorista)',
};

const CURRENCY_CATEGORIES = {
    // All USD-based pairs
    'USD Pairs': [
        'USD-EUR', 'USD-GBP', 'USD-JPY', 'USD-CNY', 'USD-TRY',
        'USD-CAD', 'USD-AUD', 'USD-CHF', 'USD-MXN', 'USD-KRW',
        'USD-ARS', 'USD-BRL', 'USD-SEK', 'USD-NOK', 'USD-DKK',
        'USD-ZAR', 'USD-RUB', 'USD-INR', 'USD-ILS', 'USD-SGD',
    ],
    // All EUR-based pairs
    'EUR Pairs': [
        'EUR-USD', 'EUR-GBP', 'EUR-JPY', 'EUR-CNY', 'EUR-TRY',
        'EUR-CAD', 'EUR-AUD', 'EUR-CHF', 'EUR-MXN', 'EUR-KRW',
        'EUR-ARS', 'EUR-BRL', 'EUR-SEK', 'EUR-NOK', 'EUR-DKK',
        'EUR-ZAR', 'EUR-RUB', 'EUR-INR', 'EUR-ILS', 'EUR-SGD',
    ],
    // GBP-based pairs
    'GBP Pairs': ['GBP-USD', 'GBP-EUR', 'GBP-JPY', 'GBP-CNY', 'GBP-TRY'],
    // Reverse/cross pairs (non-USD/EUR base)
    'Other Fiat': ['JPY-USD', 'JPY-EUR', 'CNY-USD', 'CNY-EUR', 'TRY-USD', 'TRY-EUR', 'MXN-USD', 'MXN-EUR'],
    // Cryptocurrencies
    'Crypto': ['BTC-USD', 'BTC-EUR', 'BTC-GBP', 'BTC-JPY', 'BTC-TRY', 'ETH-USD', 'ETH-EUR', 'KAS-USD', 'KAS-EUR', 'KAS-TRY'],
    // Argentine Dollar types (dolarapi.com)
    'ARS Dolar': ['USD-ARS', 'USD-ARS-OFICIAL', 'USD-ARS-BLUE', 'USD-ARS-BOLSA', 'USD-ARS-CCL', 'USD-ARS-TARJETA', 'USD-ARS-CRIPTO', 'USD-ARS-MAYORISTA'],
};

// CoinGecko coin ID mapping for crypto pairs
const COINGECKO_COINS = {
    'KAS': 'kaspa',
};

// dolarapi.com "casa" mapping for ARS pair types
const DOLARAPI_CASA_MAP = {
    'USD-ARS-OFICIAL':   'oficial',
    'USD-ARS-BLUE':      'blue',
    'USD-ARS-BOLSA':     'bolsa',
    'USD-ARS-CCL':       'contadoconliqui',
    'USD-ARS-TARJETA':   'tarjeta',
    'USD-ARS-CRIPTO':    'cripto',
    'USD-ARS-MAYORISTA': 'mayorista',
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
        this._activeCancellable = null;

        // Sparkline historical data storage
        this._historicalData = new Map();  // pair -> [{timestamp, rate}, ...]
        this._maxHistoryAge = 24 * 60 * 60 * 1000;  // 24 hours in milliseconds
        this._maxHistoryPoints = 288;  // ~5 min intervals for 24 hours

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

        this._pairLabelChangedId = this._settings.connect('changed::show-pair-label', () => {
            this._debugLog('Show pair label setting toggled');
            this._refresh(true);
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
            this._updateSparkline();
        });

        this._sparklineChangedId = this._settings.connect('changed::show-sparkline', () => {
            this._debugLog('Sparkline visibility setting toggled');
            this._updateSparklineVisibility();
        });

        // Rebuild menu when custom coin settings change
        const rebuildOnCustomChange = () => {
            this._debugLog('Custom coin settings changed, rebuilding menu');
            this._rebuildMenu();
        };
        this._customCoinIdChangedId = this._settings.connect('changed::custom-coin-id', rebuildOnCustomChange);
        this._customCoinSymbolChangedId = this._settings.connect('changed::custom-coin-symbol', rebuildOnCustomChange);
        this._customCoinVsChangedId = this._settings.connect('changed::custom-coin-vs-currency', rebuildOnCustomChange);
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

    _updateSparklineVisibility() {
        if (!this._sparklineItem) {
            return;
        }

        const shouldShow = this._settings.get_boolean('show-sparkline');
        this._sparklineItem.visible = shouldShow;
        this._debugLog(`Sparkline visibility: ${shouldShow}`);
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
                        this._updateSparkline();
                    });
                    categorySubMenu.menu.addMenuItem(menuItem);
                } else {
                    console.warn(`Undefined currency pair: ${pair}`);
                }
            }
            
            this.menu.addMenuItem(categorySubMenu);
        }
        
        // Custom coin (if configured in preferences)
        const customPairId = this._getCustomPairId();
        if (customPairId) {
            const customSubMenu = new PopupMenu.PopupSubMenuMenuItem('Custom Coin');
            const customItem = new PopupMenu.PopupMenuItem(this._getCustomPairLabel());
            customItem.connect('activate', () => {
                this._currentPair = customPairId;
                this._lastKnownValue = null;
                this._debugLog(`Currency pair changed to custom: ${customPairId}`);
                this._refresh(true);
                this._setupAutoRefresh();
                this._updateSparkline();
            });
            customSubMenu.menu.addMenuItem(customItem);
            this.menu.addMenuItem(customSubMenu);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Create sparkline menu item
        this._sparklineItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });

        // Container box for sparkline
        const sparklineBox = new St.BoxLayout({
            vertical: true,
            style_class: 'sparkline-container',
            x_expand: true
        });

        // Title label
        this._sparklineTitle = new St.Label({
            text: 'Last 24 Hours',
            style_class: 'sparkline-title',
            x_align: Clutter.ActorAlign.START
        });
        sparklineBox.add_child(this._sparklineTitle);

        // Drawing area for chart
        this._sparklineCanvas = new St.DrawingArea({
            style_class: 'sparkline-canvas',
            x_expand: true,
            height: 60
        });

        this._sparklineCanvas.connect('repaint', () => {
            this._drawSparkline();
        });

        sparklineBox.add_child(this._sparklineCanvas);

        // Stats label (min/max/current)
        this._sparklineStats = new St.Label({
            text: '',
            style_class: 'sparkline-stats',
            x_align: Clutter.ActorAlign.START
        });
        sparklineBox.add_child(this._sparklineStats);

        this._sparklineItem.add_child(sparklineBox);

        // Set initial visibility based on settings
        this._sparklineItem.visible = this._settings.get_boolean('show-sparkline');

        this.menu.addMenuItem(this._sparklineItem);

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

    _rebuildMenu() {
        // Null out sparkline references before removing all items
        this._sparklineItem = null;
        this._sparklineCanvas = null;
        this._sparklineTitle = null;
        this._sparklineStats = null;
        this.menu.removeAll();
        this._buildMenu();
    }

    async _refresh(forceRefresh = false) {
        // Cancel any active request from previous refresh
        if (this._activeCancellable) {
            this._debugLog('Cancelling previous active request');
            this._activeCancellable.cancel();
            this._activeCancellable = null;
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
            this._debugLog(`API Response for ${pair}: ${JSON.stringify(data)}`);

            // Parse response based on pair type (awesomeapi / CoinGecko / dolarapi)
            const { rateRaw, pctChange } = this._parseResponse(pair, data);
            this._debugLog(`Parsed rate: ${rateRaw}, pctChange: ${pctChange}`);

            this._cachedData.set(pair, { rateRaw, pctChange, timestamp: Date.now() });

            // Store in historical data for sparkline
            this._updateHistoricalData(pair, rateRaw);

            const decimalPlaces = this._settings.get_int('decimal-places');
            const rate = rateRaw > 0 ? rateRaw.toFixed(decimalPlaces) : 'N/A';
            const pairLabel = CURRENCY_PAIRS[pair] || this._getCustomPairLabel();
            let displayText = this._settings.get_boolean('show-pair-label')
                ? `${pairLabel}: ${rate}`
                : rate;

            this._checkNotificationThreshold(pair, rateRaw);

            let styleClass = 'currency-neutral';
            if (this._settings.get_boolean('show-percentage-change') && pctChange) {
                const change = parseFloat(pctChange);
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

    _updateHistoricalData(pair, rate) {
        if (!this._historicalData.has(pair)) {
            this._historicalData.set(pair, []);
        }

        const history = this._historicalData.get(pair);
        const now = Date.now();

        // Add new data point
        history.push({
            timestamp: now,
            rate: rate
        });

        // Remove points older than 24 hours
        const cutoffTime = now - this._maxHistoryAge;
        const filtered = history.filter(point => point.timestamp >= cutoffTime);

        // Limit to max points (keep most recent if exceeded)
        if (filtered.length > this._maxHistoryPoints) {
            filtered.splice(0, filtered.length - this._maxHistoryPoints);
        }

        this._historicalData.set(pair, filtered);

        this._debugLog(`Historical data for ${pair}: ${filtered.length} points`);

        // Update sparkline if it exists and is visible
        if (this._sparklineItem && this._settings.get_boolean('show-sparkline')) {
            this._updateSparkline();
        }
    }

    _drawSparkline() {
        if (!this._sparklineCanvas) {
            return;
        }

        const pair = this._currentPair || this._settings.get_string('currency-pair');
        const history = this._historicalData.get(pair);

        // Edge case: no data or insufficient data
        if (!history || history.length < 2) {
            this._drawNoDataMessage();
            return;
        }

        const [width, height] = this._sparklineCanvas.get_surface_size();
        const cr = this._sparklineCanvas.get_context();

        // Clear canvas
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.paint();
        cr.setOperator(Cairo.Operator.OVER);

        // Extract rates and calculate bounds
        const rates = history.map(p => p.rate);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const range = maxRate - minRate;

        // Edge case: flat line (no change)
        const effectiveRange = range > 0 ? range : minRate * 0.01; // 1% of value

        // Padding
        const paddingX = 10;
        const paddingY = 10;
        const chartWidth = width - 2 * paddingX;
        const chartHeight = height - 2 * paddingY;

        // Map data points to canvas coordinates
        const points = history.map((point, index) => {
            const x = paddingX + (index / (history.length - 1)) * chartWidth;
            const normalized = (point.rate - minRate) / effectiveRange;
            const y = paddingY + chartHeight - (normalized * chartHeight);
            return {x, y};
        });

        // Determine line color based on trend
        const firstRate = rates[0];
        const lastRate = rates[rates.length - 1];
        const percentChange = ((lastRate - firstRate) / firstRate) * 100;

        let color;
        if (percentChange > 0.1) {
            color = [0.29, 0.87, 0.50]; // Green (#4ade80)
        } else if (percentChange < -0.1) {
            color = [0.97, 0.44, 0.44]; // Red (#f87171)
        } else {
            color = [0.60, 0.60, 0.60]; // Neutral gray
        }

        // Draw area fill with gradient
        const gradient = new Cairo.LinearGradient(0, paddingY, 0, height - paddingY);
        gradient.addColorStopRGBA(0, color[0], color[1], color[2], 0.3);
        gradient.addColorStopRGBA(1, color[0], color[1], color[2], 0.05);

        cr.moveTo(points[0].x, height - paddingY);
        points.forEach(p => cr.lineTo(p.x, p.y));
        cr.lineTo(points[points.length - 1].x, height - paddingY);
        cr.closePath();
        cr.setSource(gradient);
        cr.fill();

        // Draw line
        cr.setSourceRGBA(color[0], color[1], color[2], 1.0);
        cr.setLineWidth(2);
        cr.setLineCap(Cairo.LineCap.ROUND);
        cr.setLineJoin(Cairo.LineJoin.ROUND);

        cr.moveTo(points[0].x, points[0].y);
        points.forEach(p => cr.lineTo(p.x, p.y));
        cr.stroke();

        // Update stats label — always use 4 decimal places so Min/Max
        // don't appear equal when the change is in the 3rd/4th decimal place.
        const statsDecimals = Math.max(4, this._settings.get_int('decimal-places'));
        this._sparklineStats.text =
            `Min: ${minRate.toFixed(statsDecimals)} | ` +
            `Max: ${maxRate.toFixed(statsDecimals)} | ` +
            `Change: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;

        cr.$dispose();
    }

    _drawNoDataMessage() {
        const [width, height] = this._sparklineCanvas.get_surface_size();
        const cr = this._sparklineCanvas.get_context();

        // Clear canvas
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.paint();
        cr.setOperator(Cairo.Operator.OVER);

        // Draw "No data" message
        cr.setSourceRGBA(0.6, 0.6, 0.6, 1.0);
        cr.setFontSize(12);
        cr.selectFontFace('Sans', Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);

        const text = 'Collecting data...';
        const extents = cr.textExtents(text);
        const x = (width - extents.width) / 2;
        const y = (height + extents.height) / 2;

        cr.moveTo(x, y);
        cr.showText(text);

        this._sparklineStats.text = 'Waiting for historical data';

        cr.$dispose();
    }

    _updateSparkline() {
        if (this._sparklineCanvas) {
            this._sparklineCanvas.queue_repaint();
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

        // notification.show() replaces source.showNotification() from GNOME 47
        notification.show();
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

    _getCustomPairId() {
        const coinId = this._settings.get_string('custom-coin-id').trim();
        const symbol = this._settings.get_string('custom-coin-symbol').trim();
        if (!coinId || !symbol) return null;
        const vs = this._settings.get_string('custom-coin-vs-currency') || 'usd';
        return `CUSTOM-${vs.toUpperCase()}`;
    }

    _getCustomPairLabel() {
        const symbol = this._settings.get_string('custom-coin-symbol').trim().toUpperCase();
        const vs = this._settings.get_string('custom-coin-vs-currency').toUpperCase();
        return `${symbol}/${vs}`;
    }

    _getApiUrl(pair) {
        const fromCurrency = pair.split('-')[0];

        if (pair.startsWith('CUSTOM-')) {
            const coinId = this._settings.get_string('custom-coin-id').trim();
            const toCurrency = pair.split('-')[1].toLowerCase();
            return `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${toCurrency}`;
        }

        if (COINGECKO_COINS[fromCurrency]) {
            const toCurrency = pair.split('-')[1].toLowerCase();
            const coinId = COINGECKO_COINS[fromCurrency];
            return `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${toCurrency}`;
        }

        if (pair in DOLARAPI_CASA_MAP) {
            return 'https://dolarapi.com/v1/dolares';
        }

        return `https://economia.awesomeapi.com.br/json/last/${pair}`;
    }

    _parseResponse(pair, data) {
        const fromCurrency = pair.split('-')[0];

        // Custom coin via CoinGecko
        if (pair.startsWith('CUSTOM-')) {
            const coinId = this._settings.get_string('custom-coin-id').trim();
            const toCurrency = pair.split('-')[1].toLowerCase();
            if (!data[coinId] || data[coinId][toCurrency] === undefined) {
                throw new Error(`No CoinGecko data for custom coin '${coinId}'`);
            }
            return {
                rateRaw: parseFloat(data[coinId][toCurrency]),
                pctChange: null,
            };
        }

        // CoinGecko (KAS, and future coins)
        if (COINGECKO_COINS[fromCurrency]) {
            const coinId = COINGECKO_COINS[fromCurrency];
            const toCurrency = pair.split('-')[1].toLowerCase();
            if (!data[coinId] || data[coinId][toCurrency] === undefined) {
                throw new Error(`No CoinGecko data for ${pair}`);
            }
            return {
                rateRaw: parseFloat(data[coinId][toCurrency]),
                pctChange: null,
            };
        }

        // dolarapi.com (ARS types)
        if (pair in DOLARAPI_CASA_MAP) {
            if (!Array.isArray(data)) {
                throw new Error('Invalid dolarapi response: expected array');
            }
            const casa = DOLARAPI_CASA_MAP[pair];
            const entry = data.find(d => d.casa === casa);
            if (!entry) {
                throw new Error(`No dolarapi entry for casa: ${casa}`);
            }
            return {
                rateRaw: parseFloat(entry.venta || entry.compra || 0),
                pctChange: entry.variacion != null ? entry.variacion.toString() : null,
            };
        }

        // awesomeapi (all other pairs)
        const possibleKeys = [
            pair.replace('-', ''),
            pair.replace('-', '').toUpperCase(),
            pair.replace('-', '').toLowerCase(),
            pair,
            pair.toUpperCase(),
            pair.toLowerCase(),
        ];

        let currencyData = null;
        for (const key of possibleKeys) {
            if (data[key]) {
                currencyData = data[key];
                break;
            }
        }

        if (!currencyData) {
            throw new Error(`No currency data found for ${pair}. Available keys: ${Object.keys(data).join(', ')}`);
        }

        return {
            rateRaw: parseFloat(currencyData.bid || currencyData.ask || currencyData.high || 0),
            pctChange: currencyData.pctChange || null,
        };
    }

    async _fetchData(pair) {
        const url = this._getApiUrl(pair);
        this._debugLog(`Fetching from URL: ${url}`);

        const session = new Soup.Session();
        session.timeout = 10;

        // Use Gio.Cancellable to support request cancellation (Soup 3.0 compliant)
        const cancellable = new Gio.Cancellable();
        this._activeCancellable = cancellable;

        const message = Soup.Message.new('GET', url);
        if (!message)
            throw new Error('Failed to create HTTP message. Check your internet connection.');

        message.request_headers.append('User-Agent', 'Currency-Tracker-GNOME-Extension/1.0');

        try {
            const bytes = await session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                cancellable
            );

            if (!bytes)
                throw new Error('No response data received from API');

            const statusCode = message.status_code;
            if (statusCode !== 200) {
                let errorMsg;
                switch (statusCode) {
                    case 404: errorMsg = 'Currency pair not found'; break;
                    case 429: errorMsg = 'Too many requests. Please wait.'; break;
                    case 500:
                    case 502:
                    case 503: errorMsg = 'API server error. Try again later.'; break;
                    case 0: errorMsg = 'Network connection failed'; break;
                    default: errorMsg = `API error (${statusCode})`;
                }
                throw new Error(errorMsg);
            }

            return bytes.get_data();
        } catch (error) {
            // Cancellation is not a real error — rethrow silently
            if (error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                throw error;

            let enhancedError = error;
            if (error.message && error.message.includes('Could not resolve host'))
                enhancedError = new Error('No internet connection');
            else if (error.message && error.message.includes('timeout'))
                enhancedError = new Error('Request timeout. Check connection.');

            console.error('Fetch error for pair', pair, ':', enhancedError);
            this._debugLog(`Fetch error details: ${enhancedError.message}`);
            throw enhancedError;
        } finally {
            if (this._activeCancellable === cancellable)
                this._activeCancellable = null;
        }
    }

    destroy() {
        // Cancel any in-flight request
        if (this._activeCancellable) {
            this._activeCancellable.cancel();
            this._activeCancellable = null;
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
        if (this._pairLabelChangedId) {
            this._settings.disconnect(this._pairLabelChangedId);
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
        if (this._sparklineChangedId) {
            this._settings.disconnect(this._sparklineChangedId);
        }
        if (this._customCoinIdChangedId) {
            this._settings.disconnect(this._customCoinIdChangedId);
        }
        if (this._customCoinSymbolChangedId) {
            this._settings.disconnect(this._customCoinSymbolChangedId);
        }
        if (this._customCoinVsChangedId) {
            this._settings.disconnect(this._customCoinVsChangedId);
        }

        // Destroy sparkline components
        if (this._sparklineCanvas) {
            this._sparklineCanvas.destroy();
            this._sparklineCanvas = null;
        }
        if (this._sparklineItem) {
            this._sparklineItem.destroy();
            this._sparklineItem = null;
        }

        // Clear historical data
        if (this._historicalData) {
            this._historicalData.clear();
            this._historicalData = null;
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