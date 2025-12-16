# Currency Tracker GNOME Extension

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=faymaz.currency-tracker)

A GNOME Shell extension that allows you to track various currency pairs and cryptocurrency rates in real-time. This extension uses the awesomeapi.com.br services to fetch currency rate data.

![Extension Screenshot 1](img/currency-tracker_1.png)
![Extension Screenshot 2](img/currency-tracker_2.png)

## Features

### Core Features
- Track multiple currency pairs including USD, EUR, GBP, CNY, TRY, and many more
- Bitcoin and Ethereum price tracking in multiple currencies
- Real-time updates with configurable refresh intervals (30-3600 seconds)
- Automatic refresh with configurable intervals
- Support for both light and dark GNOME themes
- Simple and intuitive interface
- Expandable currency pairs list

### Advanced Features
- **Smart Caching**: Offline mode with cached data when network is unavailable
- **Colored Indicators**: Visual feedback with green (↑) for gains and red (↓) for losses
- **Rate Limiting**: Prevents excessive API calls (minimum 10 seconds between manual refreshes)
- **Retry Mechanism**: Automatic retry with exponential backoff (1s, 2s, 4s) on failures
- **Price Alerts**: Get notifications when currency rates reach your threshold
- **Debug Mode**: Enable detailed logging for troubleshooting
- **Display Customization**: Configure decimal places (2-4) for rate display
- **Better Error Messages**: Clear, user-friendly error messages for all scenarios

## Requirements

- GNOME Shell 45 or later
- Internet connection for real-time currency updates

## Installation

### From GNOME Extensions Website
1. Visit [Currency Tracker on GNOME Extensions](https://extensions.gnome.org/extension/7862/currency-tracker/)
2. Click on the toggle switch to install

### Manual Installation
1. Clone this repository:
```bash
git clone https://github.com/faymaz/currency-tracker.git
```

2. Copy the extension to GNOME extensions directory:
```bash
cp -r currency-tracker ~/.local/share/gnome-shell/extensions/currency-tracker@faymaz.github.com
```

3. Restart GNOME Shell:
   - Press Alt+F2
   - Type 'r' and press Enter

4. Enable the extension using GNOME Extensions app or GNOME Tweaks

## Configuration

1. Click on the extension icon in the top panel
2. Select "Settings" from the menu
3. Adjust the following options:

### General Settings
   - **Default Currency Pair**: Select your preferred currency pair
   - **Refresh Interval**: Time between automatic updates (30-3600 seconds)

### Display Settings
   - **Show Percentage Change**: Display the percentage change with colored indicators
   - **Show Icon**: Toggle the currency icon in the panel
   - **Decimal Places**: Number of decimal places to display (2-4)

### Notification Settings
   - **Enable Notifications**: Turn on price alert notifications
   - **Notification Threshold**: Set the rate value to trigger notifications
   - **Notification Type**: Choose "Above Threshold" or "Below Threshold"

### Advanced Settings
   - **Enable Debug Logging**: Enable detailed logs for troubleshooting
     - View logs with: `journalctl -f -o cat /usr/bin/gnome-shell`

## Supported Currency Pairs

### Fiat Currencies
The extension supports a wide range of currency pairs including:
- USD/EUR, USD/GBP, USD/CNY, USD/TRY, USD/JPY, USD/AUD, USD/CAD, USD/CHF, and more
- EUR/USD, EUR/GBP, EUR/CNY, EUR/TRY, EUR/JPY, and more
- Many other cross-currency pairs

### Cryptocurrencies
- BTC/USD
- BTC/EUR
- BTC/GBP
- BTC/TRY
- BTC/JPY

## Customizing Currency Pairs

You can easily add or remove currency pairs from the extension by editing the `extension.js` file:

1. Open the file located at `~/.local/share/gnome-shell/extensions/currency-tracker@faymaz.github.com/extension.js`
2. Find the `CURRENCY_PAIRS` and `CURRENCY_CATEGORIES` objects

### Adding Currency Pairs
To add new currency pairs:
1. Add a new entry to the `CURRENCY_PAIRS` object:
   ```javascript
   'XXX-YYY': 'XXX/YYY',
   ```
   where XXX is the base currency code and YYY is the quote currency code

2. Add the pair to the appropriate category in `CURRENCY_CATEGORIES`:
   ```javascript
   'XXX Pairs': ['XXX-YYY', 'XXX-ZZZ'],
   ```
   
3. Or create a new category:
   ```javascript
   'New Category': ['XXX-YYY', 'YYY-ZZZ'],
   ```

### Removing Currency Pairs
To remove currency pairs:
1. Simply remove the pair from both `CURRENCY_PAIRS` and `CURRENCY_CATEGORIES` objects
2. If removing an entire category, delete the whole category entry from `CURRENCY_CATEGORIES`

After making changes, restart GNOME Shell (Alt+F2, type 'r', press Enter) to apply them.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

# Para Birimi Takip GNOME Eklentisi

GNOME Shell için gerçek zamanlı döviz kurları ve kripto para birimlerini takip etmenizi sağlayan bir eklenti. Bu eklenti döviz kuru verilerini awesomeapi.com.br servislerinden almaktadır.

## Özellikler

### Temel Özellikler
- USD, EUR, GBP, CNY, TRY ve daha fazlası dahil olmak üzere birden fazla para birimi çiftini takip etme
- Birden fazla para biriminde Bitcoin ve Ethereum fiyat takibi
- Ayarlanabilir yenileme aralıkları (30-3600 saniye) ile gerçek zamanlı güncellemeler
- Otomatik yenileme desteği
- Hem açık hem koyu GNOME temaları için destek
- Basit ve sezgisel arayüz
- Genişletilebilir para birimi çiftleri listesi

### Gelişmiş Özellikler
- **Akıllı Önbellekleme**: Ağ bağlantısı olmadığında önbellekli verilerle çalışma
- **Renkli Göstergeler**: Artış için yeşil (↑), düşüş için kırmızı (↓) görsel geri bildirim
- **Hız Sınırlama**: Aşırı API çağrılarını önleme (manuel yenilemeler arası minimum 10 saniye)
- **Yeniden Deneme Mekanizması**: Hatalarda exponential backoff ile otomatik yeniden deneme (1s, 2s, 4s)
- **Fiyat Uyarıları**: Kur belirli eşiğe ulaştığında bildirim alma
- **Hata Ayıklama Modu**: Sorun giderme için detaylı loglama
- **Görüntü Özelleştirme**: Kur gösteriminde ondalık basamak sayısını ayarlama (2-4)
- **Gelişmiş Hata Mesajları**: Tüm senaryolar için açık, kullanıcı dostu hata mesajları

## Gereksinimler

- GNOME Shell 45 veya üzeri
- Gerçek zamanlı döviz güncellemeleri için internet bağlantısı

## Kurulum

### GNOME Eklentiler Websitesinden
1. [GNOME Eklentiler'de Currency Tracker](https://extensions.gnome.org/extension/currency-tracker) sayfasını ziyaret edin
2. Kurulum için açma/kapama düğmesine tıklayın

### Manuel Kurulum
1. Bu depoyu klonlayın:
```bash
git clone https://github.com/faymaz/currency-tracker.git
```

2. Eklentiyi GNOME eklentiler dizinine kopyalayın:
```bash
cp -r currency-tracker ~/.local/share/gnome-shell/extensions/currency-tracker@faymaz.github.com
```

3. GNOME Shell'i yeniden başlatın:
   - Alt+F2 tuşlarına basın
   - 'r' yazın ve Enter'a basın

4. Eklentiyi GNOME Eklentiler uygulaması veya GNOME Tweaks ile etkinleştirin

## Yapılandırma

1. Üst paneldeki eklenti simgesine tıklayın
2. Menüden "Ayarlar"ı seçin
3. Aşağıdaki seçenekleri ayarlayın:

### Genel Ayarlar
   - **Varsayılan Para Birimi Çifti**: Tercih ettiğiniz para birimi çiftini seçin
   - **Yenileme Aralığı**: Otomatik güncellemeler arası süre (30-3600 saniye)

### Görüntüleme Ayarları
   - **Yüzde Değişimini Göster**: Renkli göstergelerle yüzde değişimini göster
   - **Simgeyi Göster**: Paneldeki para birimi simgesini aç/kapat
   - **Ondalık Basamak**: Gösterilecek ondalık basamak sayısı (2-4)

### Bildirim Ayarları
   - **Bildirimleri Etkinleştir**: Fiyat uyarı bildirimlerini aç
   - **Bildirim Eşiği**: Bildirimi tetikleyecek kur değeri
   - **Bildirim Türü**: "Eşiğin Üstünde" veya "Eşiğin Altında" seçin

### Gelişmiş Ayarlar
   - **Hata Ayıklama Loglarını Etkinleştir**: Sorun giderme için detaylı loglar
     - Logları görüntüleme: `journalctl -f -o cat /usr/bin/gnome-shell`

## Desteklenen Para Birimi Çiftleri

### Fiat Para Birimleri
Eklenti aşağıdakiler de dahil olmak üzere çok çeşitli para birimi çiftlerini destekler:
- USD/EUR, USD/GBP, USD/CNY, USD/TRY, USD/JPY, USD/AUD, USD/CAD, USD/CHF ve daha fazlası
- EUR/USD, EUR/GBP, EUR/CNY, EUR/TRY, EUR/JPY ve daha fazlası
- Diğer birçok çapraz kur çifti

### Kripto Para Birimleri
- BTC/USD
- BTC/EUR
- BTC/GBP
- BTC/TRY
- BTC/JPY

## Para Birimi Çiftlerini Özelleştirme

`extension.js` dosyasını düzenleyerek eklentiye kolayca para birimi çiftleri ekleyebilir veya çıkarabilirsiniz:

1. `~/.local/share/gnome-shell/extensions/currency-tracker@faymaz.github.com/extension.js` konumundaki dosyayı açın
2. `CURRENCY_PAIRS` ve `CURRENCY_CATEGORIES` nesnelerini bulun

### Para Birimi Çiftleri Ekleme
Yeni para birimi çiftleri eklemek için:
1. `CURRENCY_PAIRS` nesnesine yeni bir giriş ekleyin:
   ```javascript
   'XXX-YYY': 'XXX/YYY',
   ```
   burada XXX baz para birimi kodu ve YYY karşılaştırma para birimi kodudur

2. Çifti `CURRENCY_CATEGORIES` içindeki uygun kategoriye ekleyin:
   ```javascript
   'XXX Pairs': ['XXX-YYY', 'XXX-ZZZ'],
   ```
   
3. Veya yeni bir kategori oluşturun:
   ```javascript
   'Yeni Kategori': ['XXX-YYY', 'YYY-ZZZ'],
   ```

### Para Birimi Çiftlerini Kaldırma
Para birimi çiftlerini kaldırmak için:
1. Çifti hem `CURRENCY_PAIRS` hem de `CURRENCY_CATEGORIES` nesnelerinden kaldırın
2. Tüm bir kategoriyi kaldırıyorsanız, kategori girişini `CURRENCY_CATEGORIES`'den silin

Değişiklikleri yaptıktan sonra, uygulamak için GNOME Shell'i yeniden başlatın (Alt+F2, 'r' yazın, Enter'a basın).

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen Pull Request göndermekten çekinmeyin.

## Lisans

Bu proje GPL-3.0 Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.