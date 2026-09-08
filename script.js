(function () {

    "use strict";


    /* =====================================================
       TEKRAR ÇALIŞMAYI ENGELLE
    ====================================================== */

    var root =
        document.getElementById(
            "gon-birlesik-namaz"
        );


    if (!root) {
        return;
    }


    if (
        root.getAttribute(
            "data-gon-initialized"
        ) === "1"
    ) {

        return;

    }


    root.setAttribute(
        "data-gon-initialized",
        "1"
    );


    /* =====================================================
       API
    ====================================================== */

    var API =
        "https://ezanvakti.imsakiyem.com/api";


    var TURKIYE_ID =
        "2";


    /* =====================================================
       ELEMENTLER
    ====================================================== */

    var ilSelect =
        root.querySelector(
            "#gon-main-il"
        );


    var ilceSelect =
        root.querySelector(
            "#gon-main-ilce"
        );


    var statusElement =
        root.querySelector(
            "#gon-main-status"
        );


    var selectedIlElement =
        root.querySelector(
            "#gon-selected-il"
        );


    var selectedIlceElement =
        root.querySelector(
            "#gon-selected-ilce"
        );


    var nextPrayerElement =
        root.querySelector(
            "#gon-next-prayer"
        );


    var nextTimeElement =
        root.querySelector(
            "#gon-next-time-value"
        );


    var countdownElement =
        root.querySelector(
            "#gon-countdown"
        );


    var dateElement =
        root.querySelector(
            "#gon-date"
        );


    var tableBody =
        root.querySelector(
            "#gon-week-table-body"
        );


    /* =====================================================
       DEĞİŞKENLER
    ====================================================== */

    var provinces = [];

    var currentWeek = [];

    var timer = null;

    var requestId = 0;

    var districtRequestId = 0;


    /* =====================================================
       NAMAZ İSİMLERİ
    ====================================================== */

    var prayerNames = [

        {
            key:"imsak",
            name:"İmsak"
        },

        {
            key:"gunes",
            name:"Güneş"
        },

        {
            key:"ogle",
            name:"Öğle"
        },

        {
            key:"ikindi",
            name:"İkindi"
        },

        {
            key:"aksam",
            name:"Akşam"
        },

        {
            key:"yatsi",
            name:"Yatsı"
        }

    ];


    /* =====================================================
       TARİH
    ====================================================== */

    var aylar = [

        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık"

    ];


    var gunler = [

        "Pazar",
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi"

    ];


    function bugun() {

        var d =
            new Date();


        return (

            d.getFullYear()
            + "-"
            + String(
                d.getMonth() + 1
            ).padStart(2,"0")
            + "-"
            + String(
                d.getDate()
            ).padStart(2,"0")

        );

    }


    function tarihEkle(
        tarih,
        miktar
    ) {

        var p =
            tarih.split("-");


        var d =
            new Date(
                Number(p[0]),
                Number(p[1]) - 1,
                Number(p[2])
            );


        d.setDate(
            d.getDate() + miktar
        );


        return (

            d.getFullYear()
            + "-"
            + String(
                d.getMonth() + 1
            ).padStart(2,"0")
            + "-"
            + String(
                d.getDate()
            ).padStart(2,"0")

        );

    }


    function tarihGoster(
        tarih
    ) {

        if (!tarih) {
            return "-";
        }


        var temiz =
            String(tarih)
                .substring(0,10);


        var p =
            temiz.split("-");


        if (p.length !== 3) {
            return tarih;
        }


        var d =
            new Date(
                Number(p[0]),
                Number(p[1]) - 1,
                Number(p[2])
            );


        return (

            d.getDate()
            + " "
            + aylar[d.getMonth()]
            + " "
            + d.getFullYear()
            + " "
            + gunler[d.getDay()]

        );

    }


    function formatBugun() {

        return tarihGoster(
            bugun()
        );

    }


    /* =====================================================
       API'DEN VERİ AL
    ====================================================== */

    async function getir(
        url
    ) {

        var response =
            await fetch(
                url,
                {
                    method:"GET",

                    headers:{
                        "Accept":
                            "application/json"
                    },

                    cache:"no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        return await response.json();

    }


    /* =====================================================
       API LİSTE BUL
    ====================================================== */

    function listeBul(
        veri
    ) {

        if (
            Array.isArray(veri)
        ) {

            return veri;

        }


        if (
            veri &&
            Array.isArray(
                veri.data
            )
        ) {

            return veri.data;

        }


        if (
            veri &&
            veri.data &&
            Array.isArray(
                veri.data.data
            )
        ) {

            return veri.data.data;

        }


        if (
            veri &&
            Array.isArray(
                veri.result
            )
        ) {

            return veri.result;

        }


        return [];

    }


    /* =====================================================
       DURUM
    ====================================================== */

    function durumYaz(
        mesaj
    ) {

        statusElement.textContent =
            mesaj;

    }


    /* =====================================================
       İLLER
    ====================================================== */

    async function illeriGetir() {

        durumYaz(
            "📍 İller yükleniyor..."
        );


        var veri =
            await getir(

                API
                + "/locations/states"
                + "?countryId="
                + TURKIYE_ID

            );


        var iller =
            listeBul(veri);


        if (!iller.length) {

            throw new Error(
                "İl listesi boş."
            );

        }


        ilSelect.innerHTML =
            '<option value="">İl Seçiniz</option>';


        iller.forEach(
            function (il) {

                var option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    il._id ||
                    il.id ||
                    il.state_id;


                option.textContent =
                    il.name ||
                    il.state_name ||
                    "";


                ilSelect.appendChild(
                    option
                );

            }
        );


        Array.from(
            ilSelect.options
        )
        .slice(1)
        .sort(
            function(a,b) {

                return a.text.localeCompare(
                    b.text,
                    "tr"
                );

            }
        )
        .forEach(
            function(option) {

                ilSelect.appendChild(
                    option
                );

            }
        );


        var kayitliIl =
            localStorageGet(
                "gonOrtakIl"
            );


        var secilecekIl =
            kayitliIl ||
            "Konya";


        var konumOption =
            optionBul(
                ilSelect,
                secilecekIl
            );


        if (!konumOption) {

            konumOption =
                optionBul(
                    ilSelect,
                    "Konya"
                );

        }


        if (konumOption) {

            ilSelect.value =
                konumOption.value;


            await ilceleriGetir(
                konumOption.value,
                localStorageGet(
                    "gonOrtakIlce"
                ) || "Karatay"
            );

        }

    }


    /* =====================================================
       OPTION BUL
    ====================================================== */

    function optionBul(
        select,
        text
    ) {

        if (
            !select ||
            !text
        ) {

            return null;

        }


        var aranan =
            String(text)
                .trim()
                .toLocaleLowerCase(
                    "tr-TR"
                );


        return Array.from(
            select.options
        ).find(
            function(option) {

                return (

                    String(
                        option.textContent
                    )
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    ===
                    aranan

                );

            }
        ) || null;

    }


    /* =====================================================
       İLÇELER
    ====================================================== */

    async function ilceleriGetir(
        stateId,
        otomatikIlce
    ) {

        var currentRequest =
            ++districtRequestId;


        ilceSelect.disabled =
            true;


        ilceSelect.innerHTML =
            '<option value="">İlçeler yükleniyor...</option>';


        var veri =
            await getir(

                API
                + "/locations/districts"
                + "?stateId="
                + encodeURIComponent(
                    stateId
                )

            );


        if (
            currentRequest !==
            districtRequestId
        ) {

            return;

        }


        var ilceler =
            listeBul(veri);


        if (!ilceler.length) {

            throw new Error(
                "İlçe listesi boş."
            );

        }


        ilceSelect.innerHTML =
            '<option value="">İlçe Seçiniz</option>';


        ilceler.forEach(
            function(ilce) {

                var option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    ilce._id ||
                    ilce.id ||
                    ilce.district_id;


                option.textContent =
                    ilce.name ||
                    ilce.district_name ||
                    "";


                ilceSelect.appendChild(
                    option
                );

            }
        );


        Array.from(
            ilceSelect.options
        )
        .slice(1)
        .sort(
            function(a,b) {

                return a.text.localeCompare(
                    b.text,
                    "tr"
                );

            }
        )
        .forEach(
            function(option) {

                ilceSelect.appendChild(
                    option
                );

            }
        );


        ilceSelect.disabled =
            false;


        var ilceOption =
            optionBul(
                ilceSelect,
                otomatikIlce
            );


        if (ilceOption) {

            ilceSelect.value =
                ilceOption.value;


            await vakitleriGetir(
                ilceOption.value,
                ilceOption.textContent
            );

        }

    }


    /* =====================================================
       SEÇİM KAYDET
    ====================================================== */

    function localStorageGet(
        key
    ) {

        try {

            return localStorage.getItem(
                key
            );

        } catch(e) {

            return null;

        }

    }


    function secimiKaydet(
        il,
        ilce
    ) {

        try {

            localStorage.setItem(
                "gonOrtakIl",
                il
            );


            localStorage.setItem(
                "gonOrtakIlce",
                ilce
            );

        } catch(e) {}

    }


    /* =====================================================
       KONUM BAŞLIĞINI GÜNCELLE
    ====================================================== */

    function konumuGuncelle() {

        var ilAdi =
            ilSelect.options[
                ilSelect.selectedIndex
            ] ?
            ilSelect.options[
                ilSelect.selectedIndex
            ].text :
            "";


        var ilceAdi =
            ilceSelect.options[
                ilceSelect.selectedIndex
            ] ?
            ilceSelect.options[
                ilceSelect.selectedIndex
            ].text :
            "";


        if (ilAdi) {

            selectedIlElement.textContent =
                ilAdi.toLocaleUpperCase(
                    "tr-TR"
                );

        }


        if (ilceAdi) {

            selectedIlceElement.textContent =
                ilceAdi.toLocaleUpperCase(
                    "tr-TR"
                );

        }

    }


    /* =====================================================
       VAKİT TEMİZLE
    ====================================================== */

    function temizSaat(
        value
    ) {

        if (!value) {
            return "--:--";
        }


        var sonuc =
            String(value)
                .trim()
                .split(" ")[0]
                .substring(0,5);


        return sonuc || "--:--";

    }


    /* =====================================================
       TARİH ALANI
    ====================================================== */

    function kayitTarihi(
        kayit
    ) {

        return (

            kayit.date ||
            kayit.miladi_date ||
            kayit.MiladiTarih ||
            ""

        );

    }


    /* =====================================================
       VAKİTLERİ AL
    ====================================================== */

    function vakitleriAl(
        kayit
    ) {

        var times =
            kayit.times ||
            kayit.vakitler ||
            {};


        return {

            imsak:
                temizSaat(
                    times.imsak ||
                    times.Imsak ||
                    kayit.imsak ||
                    kayit.Imsak
                ),


            gunes:
                temizSaat(
                    times.gunes ||
                    times.Gunes ||
                    times.Sunrise ||
                    kayit.gunes ||
                    kayit.Gunes
                ),


            ogle:
                temizSaat(
                    times.ogle ||
                    times.Ogle ||
                    times.Dhuhr ||
                    kayit.ogle ||
                    kayit.Ogle
                ),


            ikindi:
                temizSaat(
                    times.ikindi ||
                    times.Ikindi ||
                    times.Asr ||
                    kayit.ikindi ||
                    kayit.Ikindi
                ),


            aksam:
                temizSaat(
                    times.aksam ||
                    times.Aksam ||
                    times.Maghrib ||
                    kayit.aksam ||
                    kayit.Aksam
                ),


            yatsi:
                temizSaat(
                    times.yatsi ||
                    times.Yatsi ||
                    times.Isha ||
                    kayit.yatsi ||
                    kayit.Yatsi
                )

        };

    }


    /* =====================================================
       HİCRİ TARİH
    ====================================================== */

    function hicriTarihiAl(
        kayit
    ) {

        var hicri =
            kayit.hijri_date ||
            kayit.hijri ||
            kayit.HicriTarih ||
            {};


        if (
            typeof hicri ===
            "string"
        ) {

            return hicri;

        }


        return (

            hicri.full_date ||
            hicri.date ||
            hicri.tarih ||
            "-"

        );

    }


    /* =====================================================
       BUGÜNÜ BUL
    ====================================================== */

    function bugununKaydi() {

        var today =
            bugun();


        return currentWeek.find(
            function(kayit) {

                var tarih =
                    kayitTarihi(
                        kayit
                    );


                return (

                    String(tarih)
                        .substring(0,10)
                    ===
                    today

                );

            }
        ) || null;

    }


    /* =====================================================
       HAFTALIK TABLO
    ====================================================== */

    function tabloyuOlustur() {

        tableBody.innerHTML =
            "";


        var today =
            bugun();


        currentWeek
            .slice(0,7)
            .forEach(
                function(kayit) {

                    var tr =
                        document.createElement(
                            "tr"
                        );


                    var tarih =
                        kayitTarihi(
                            kayit
                        );


                    if (
                        String(tarih)
                            .substring(0,10)
                        ===
                        today
                    ) {

                        tr.className =
                            "gon-today-row";

                    }


                    var vakit =
                        vakitleriAl(
                            kayit
                        );


                    tr.innerHTML =

                        "<td>"
                        +
                        tarihGoster(
                            tarih
                        )
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        hicriTarihiAl(
                            kayit
                        )
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.imsak
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.gunes
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.ogle
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.ikindi
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.aksam
                        +
                        "</td>"

                        +

                        "<td>"
                        +
                        vakit.yatsi
                        +
                        "</td>";


                    tableBody.appendChild(
                        tr
                    );

                }
            );

    }


    /* =====================================================
       BUGÜNÜN VAKİTLERİNİ GÖSTER
    ====================================================== */

    function bugununVakitleriniGoster() {

        var kayit =
            bugununKaydi();


        if (!kayit) {
            return;
        }


        var vakit =
            vakitleriAl(
                kayit
            );


        root.querySelector(
            "#gon-imsak"
        ).textContent =
            vakit.imsak;


        root.querySelector(
            "#gon-gunes"
        ).textContent =
            vakit.gunes;


        root.querySelector(
            "#gon-ogle"
        ).textContent =
            vakit.ogle;


        root.querySelector(
            "#gon-ikindi"
        ).textContent =
            vakit.ikindi;


        root.querySelector(
            "#gon-aksam"
        ).textContent =
            vakit.aksam;


        root.querySelector(
            "#gon-yatsi"
        ).textContent =
            vakit.yatsi;

    }


    /* =====================================================
       TARİH + SAAT
    ====================================================== */

    function saatTarih(
        saat
    ) {

        if (
            !saat ||
            saat === "--:--"
        ) {

            return null;

        }


        var p =
            saat.split(":");


        if (p.length < 2) {
            return null;
        }


        var d =
            new Date();


        d.setHours(
            Number(p[0]),
            Number(p[1]),
            0,
            0
        );


        return d;

    }


    /* =====================================================
       SONRAKİ NAMAZI BUL
    ====================================================== */

    function sonrakiNamaziBul() {

        var kayit =
            bugununKaydi();


        if (!kayit) {
            return null;
        }


        var vakit =
            vakitleriAl(
                kayit
            );


        var now =
            new Date();


        for (
            var i = 0;
            i < prayerNames.length;
            i++
        ) {

            var prayer =
                prayerNames[i];


            var date =
                saatTarih(
                    vakit[
                        prayer.key
                    ]
                );


            if (
                date &&
                date.getTime()
                >
                now.getTime()
            ) {

                return {

                    name:
                        prayer.name,

                    key:
                        prayer.key,

                    time:
                        vakit[
                            prayer.key
                        ],

                    date:
                        date

                };

            }

        }


        if (
            currentWeek.length
            >=
            2
        ) {

            var tomorrow =
                currentWeek[1];


            var tomorrowTimes =
                vakitleriAl(
                    tomorrow
                );


            var imsak =
                saatTarih(
                    tomorrowTimes.imsak
                );


            if (imsak) {

                imsak.setDate(
                    imsak.getDate() + 1
                );


                return {

                    name:"İmsak",

                    key:"imsak",

                    time:
                        tomorrowTimes.imsak,

                    date:imsak

                };

            }

        }


        return null;

    }


    /* =====================================================
       AKTİF VAKİT VURGUSU
    ====================================================== */

    function aktifVaktiGoster() {

        var cards =
            root.querySelectorAll(
                ".gon-vakit-card"
            );


        cards.forEach(
            function(card) {

                card.classList.remove(
                    "gon-active"
                );

            }
        );


        var now =
            new Date();


        var kayit =
            bugununKaydi();


        if (!kayit) {
            return;
        }


        var vakit =
            vakitleriAl(
                kayit
            );


        var aktifKey =
            null;


        for (
            var i = 0;
            i < prayerNames.length;
            i++
        ) {

            var current =
                prayerNames[i];


            var currentDate =
                saatTarih(
                    vakit[
                        current.key
                    ]
                );


            if (
                currentDate &&
                now >= currentDate
            ) {

                aktifKey =
                    current.key;

            }

        }


        if (aktifKey) {

            var aktifCard =
                root.querySelector(
                    '[data-prayer="' +
                    aktifKey +
                    '"]'
                );


            if (aktifCard) {

                aktifCard.classList.add(
                    "gon-active"
                );

            }

        }

    }


    /* =====================================================
       GERİ SAYIM
    ====================================================== */

    function geriSayimiGuncelle() {

        dateElement.textContent =
            formatBugun();


        var next =
            sonrakiNamaziBul();


        if (!next) {

            nextPrayerElement.textContent =
                "--";


            nextTimeElement.textContent =
                "--:--";


            countdownElement.textContent =
                "00:00:00";


            return;

        }


        nextPrayerElement.textContent =
            next.name;


        nextTimeElement.textContent =
            next.time;


        var now =
            new Date();


        var fark =
            next.date.getTime()
            -
            now.getTime();


        if (fark < 0) {
            fark = 0;
        }


        var totalSeconds =
            Math.floor(
                fark / 1000
            );


        var hours =
            Math.floor(
                totalSeconds / 3600
            );


        var minutes =
            Math.floor(
                (totalSeconds % 3600)
                / 60
            );


        var seconds =
            totalSeconds % 60;


        countdownElement.textContent =

            String(hours)
                .padStart(2,"0")

            + ":"

            + String(minutes)
                .padStart(2,"0")

            + ":"

            + String(seconds)
                .padStart(2,"0");


        aktifVaktiGoster();

    }


    /* =====================================================
       NAMAZ VAKİTLERİNİ GETİR
    ====================================================== */

    async function vakitleriGetir(
        districtId,
        districtName
    ) {

        var thisRequest =
            ++requestId;


        currentWeek =
            [];


        konumuGuncelle();


        statusElement.textContent =
            "🕌 "
            +
            districtName
            +
            " için haftalık namaz vakitleri yükleniyor...";


        tableBody.innerHTML =

            '<tr>'
            +
            '<td colspan="8" class="gon-loading">'
            +
            '🕌 '
            +
            districtName
            +
            ' için vakitler getiriliyor...'
            +
            '</td>'
            +
            '</tr>';


        var startDate =
            bugun();


        var endDate =
            tarihEkle(
                startDate,
                6
            );


        var url =

            API
            +
            "/prayer-times/"
            +
            encodeURIComponent(
                districtId
            )
            +
            "/weekly"
            +
            "?startDate="
            +
            startDate
            +
            "&endDate="
            +
            endDate
            +
            "&limit=7";


        try {

            var veri =
                await getir(
                    url
                );


            if (
                thisRequest !==
                requestId
            ) {

                return;

            }


            var liste =
                listeBul(
                    veri
                );


            if (
                !liste.length
                &&
                veri &&
                veri.data &&
                Array.isArray(
                    veri.data.items
                )
            ) {

                liste =
                    veri.data.items;

            }


            if (!liste.length) {

                throw new Error(
                    "Namaz verisi bulunamadı."
                );

            }


            liste.sort(
                function(a,b) {

                    return String(
                        kayitTarihi(a)
                    )
                    .localeCompare(
                        String(
                            kayitTarihi(b)
                        )
                    );

                }
            );


            currentWeek =
                liste.slice(0,7);


            tabloyuOlustur();

            bugununVakitleriniGoster();

            konumuGuncelle();

            geriSayimiGuncelle();


            var ilAdi =
                ilSelect.options[
                    ilSelect.selectedIndex
                ] ?
                ilSelect.options[
                    ilSelect.selectedIndex
                ].text :
                "";


            statusElement.textContent =

                "✓ "
                +
                ilAdi
                +
                " • "
                +
                districtName
                +
                " için güncel namaz vakitleri.";

        }
        catch(error) {

            if (
                thisRequest !==
                requestId
            ) {

                return;

            }


            console.error(
                "NAMAZ API HATASI:",
                error
            );


            currentWeek =
                [];


            tableBody.innerHTML =

                '<tr>'
                +
                '<td colspan="8" class="gon-loading">'
                +
                '⚠️ Namaz vakitleri alınamadı.'
                +
                '<br><br>'
                +
                '<small>'
                +
                'Lütfen sayfayı yenileyip tekrar deneyin.'
                +
                '</small>'
                +
                '</td>'
                +
                '</tr>';


            statusElement.textContent =
                "⚠️ "
                +
                districtName
                +
                " için vakitler alınamadı.";


            nextPrayerElement.textContent =
                "--";


            nextTimeElement.textContent =
                "--:--";


            countdownElement.textContent =
                "00:00:00";

        }

    }


    /* =====================================================
       İL DEĞİŞTİ
    ====================================================== */

    ilSelect.addEventListener(
        "change",
        async function() {

            var stateId =
                this.value;


            if (!stateId) {

                ilceSelect.innerHTML =
                    '<option value="">Önce il seçiniz</option>';


                ilceSelect.disabled =
                    true;


                return;

            }


            var ilAdi =
                this.options[
                    this.selectedIndex
                ].text;


            selectedIlElement.textContent =
                ilAdi.toLocaleUpperCase(
                    "tr-TR"
                );


            selectedIlceElement.textContent =
                "SEÇİNİZ";


            statusElement.textContent =
                "📍 "
                +
                ilAdi
                +
                " ilçeleri yükleniyor...";


            try {

                await ilceleriGetir(
                    stateId,
                    ilAdi === "Konya"
                        ? "Karatay"
                        : ""
                );


                secimiKaydet(
                    ilAdi,
                    ilceSelect.value
                        ?
                        ilceSelect.options[
                            ilceSelect.selectedIndex
                        ].text
                        :
                        ""
                );

            }
            catch(error) {

                console.error(
                    error
                );


                ilceSelect.innerHTML =
                    '<option value="">İlçeler alınamadı</option>';


                ilceSelect.disabled =
                    true;


                statusElement.textContent =
                    "⚠️ İlçeler yüklenemedi.";

            }

        }
    );


    /* =====================================================
       İLÇE DEĞİŞTİ
    ====================================================== */

    ilceSelect.addEventListener(
        "change",
        function() {

            var districtId =
                this.value;


            if (!districtId) {
                return;
            }


            var districtName =
                this.options[
                    this.selectedIndex
                ].text;


            var ilAdi =
                ilSelect.options[
                    ilSelect.selectedIndex
                ] ?
                ilSelect.options[
                    ilSelect.selectedIndex
                ].text :
                "";


            secimiKaydet(
                ilAdi,
                districtName
            );


            konumuGuncelle();


            vakitleriGetir(
                districtId,
                districtName
            );

        }
    );


    /* =====================================================
       BAŞLANGIÇ
    ====================================================== */

    async function baslat() {

        try {

            durumYaz(
                "🕌 Namaz vakitleri hazırlanıyor..."
            );


            await illeriGetir();


            konumuGuncelle();


            if (!timer) {

                timer =
                    setInterval(
                        function() {

                            geriSayimiGuncelle();

                        },
                        1000
                    );

            }


            geriSayimiGuncelle();

        }
        catch(error) {

            console.error(
                "BAŞLANGIÇ HATASI:",
                error
            );


            statusElement.textContent =
                "⚠️ Namaz sistemi başlatılamadı. Lütfen sayfayı yenileyin.";

        }

    }


    /* =====================================================
       BAŞLAT
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            baslat,
            {
                once:true
            }
        );

    }
    else {

        baslat();

    }


})();