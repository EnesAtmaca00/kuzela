# Git Integration & Wix CLI <img align="left" src="https://user-images.githubusercontent.com/89579857/185785022-cab37bf5-26be-4f11-85f0-1fac63c07d3b.png">

This repo is part of Git Integration & Wix CLI, a set of tools that allows you to write, test, and publish code for your Wix site locally on your computer. 

Connect your site to GitHub, develop in your favorite IDE, test your code in real time, and publish your site from the command line.

## Set up this repository in your IDE
This repo is connected to a Wix site. That site tracks this repo's default branch. Any code committed and pushed to that branch from your local IDE appears on the site.

Before getting started, make sure you have the following things installed:
* [Git](https://git-scm.com/download)
* [Node](https://nodejs.org/en/download/), version 14.8 or later.
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://yarnpkg.com/getting-started/install)
* An SSH key [added to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).

To set up your local environment and start coding locally, do the following:

1. Open your terminal and navigate to where you want to store the repo.
1. Clone the repo by running `git clone <your-repository-url>`.
1. Navigate to the repo's directory by running `cd <directory-name>`.
1. Install the repo's dependencies by running `npm install` or `yarn install`.
1. Install the Wix CLI by running `npm install -g @wix/cli` or `yarn global add @wix/cli`.  
   Once you've installed the CLI globally, you can use it with any Wix site's repo.

For more information, see [Setting up Git Integration & Wix CLI](https://support.wix.com/en/article/velo-setting-up-git-integration-wix-cli-beta).

## Write Velo code in your IDE
Once your repo is set up, you can write code in it as you would in any other non-Wix project. The repo's file structure matches the [public](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#public), [backend](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#backend), and [page code](https://support.wix.com/en/article/velo-working-with-the-velo-sidebar#page-code) sections in Editor X.

Learn more about [this repo's file structure](https://support.wix.com/en/article/velo-understanding-your-sites-github-repository-beta).

## Test your code with the Local Editor
The Local Editor allows you test changes made to your site in real time. The code in your local IDE is synced with the Local Editor, so you can test your changes before committing them to your repo. You can also change the site design in the Local Editor and sync it with your IDE.

Start the Local Editor by navigating to this repo's directory in your terminal and running `wix dev`.

For more information, see [Working with the Local Editor](https://support.wix.com/en/article/velo-working-with-the-local-editor-beta).

## Preview and publish with the Wix CLI
The Wix CLI is a tool that allows you to work with your site locally from your computer's terminal. You can use it to build a preview version of your site and publish it. You can also use the CLI to install [approved npm packages](https://support.wix.com/en/article/velo-working-with-npm-packages) to your site.

Learn more about [working with the Wix CLI](https://support.wix.com/en/article/velo-working-with-the-wix-cli-beta).

## Invite contributors to work with you
Git Integration & Wix CLI extends Editor X's [concurrent editing](https://support.wix.com/en/article/editor-x-about-concurrent-editing) capabilities. Invite other developers as collaborators on your [site](https://support.wix.com/en/article/inviting-people-to-contribute-to-your-site) and your [GitHub repo](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository). Multiple developers can work on a site's code at once.

## Ana sayfa (Home) nasil calisiyor

Ana sayfada tek bir eleman var: `#html1` (HtmlComponent, yani bir iframe).
Sayfadaki butun tasarim bu iframe'in icinde.

- **Iframe icerigi:** `docs/index.html`. Bu dosya GitHub Pages ile
  <https://enesatmaca00.github.io/kuzela/> adresinden yayinlaniyor ve
  `src/pages/Home.c1dmp.js` iframe'i calisma aninda oraya yonlendiriyor.
  **Iceriği degistirmek icin `docs/index.html` duzenlenip push edilir;
  Wix editorune kod yapistirmaya gerek yok.**
- **Yukseklik:** Wix Studio'da `$w` elemanlarinin `height` ozelligi yok,
  yani iframe yuksekligi Velo'dan atanamiyor. Bunun yerine iframe kendi
  icerik yuksekligini `postMessage` ile bildiriyor, sayfa kodu bunu 100
  piksele yukari yuvarlayip sayfaya `kz-h-<piksel>` sinifi ekliyor ve
  `src/styles/global.css` icindeki uretilmis kurallar yuksekligi
  uyguluyor. Yukari yuvarlandigi icin icerik asla kesilmiyor ve iframe'in
  kendi kaydirma cubugu olusmuyor (sayfada tek scroll).
- **CSS secicileri:** Wix custom CSS'te yazdiginiz her sinif ve ID'nin
  basina `wixui-` ekleniyor. Siniflar icin sorun degil (Wix her iki adi da
  elemana koyuyor) ama **ID secici kullanilamaz** (`#c1dmp` ->
  `#wixui-c1dmp`, hicbir seye uymaz). Bu yuzden kurallar
  `.page.kz-h-N ~ div .section ...` bicimindeki kardes seciciyi kullaniyor.
- **Fiyatlar** sitenin kendi Online Siparisler sayfasindaki menuyle
  dogrulandi (Eylul 2026).

### Bilinen kisit

Wix, HtmlComponent iframe'ini ancak ziyaretci sayfayla etkilesime
girdiginde (kaydirma/dokunma) yukluyor. Bu yuzden ana sayfa ilk anda bos
gorunuyor. Bu Wix'in kendi davranisi; kalici cozumu tasarimi iframe yerine
gercek Wix bolumlerine veya bir Custom Element'e tasimak.

## Urun kartlari nereden geliyor

Ana sayfadaki alti kart artik elle yazilmiyor, **Wix Restaurants menusunden**
geliyor. Menude fiyat/ad/gorsel degisince ana sayfa da degisir.

Zincir: `src/backend/menu-data.js` menuyu okur -> `src/backend/menu.web.js`
yukseltilmis izinle cagirir -> `src/pages/Home.c1dmp.js` sonucu iframe'e
`postMessage` ile gonderir -> `docs/index.html` kartlari yeniden cizer.
Iframe baska bir origin'de oldugu icin Wix API'lerini kendisi cagiramaz.

**Hangi urunler secilir:** bolum basina en fazla bir urun, menudeki sirayla.
Bolumde `featured` isaretli urun varsa o secilir. Gorseli veya fiyati olmayan
urunler atlanir (kart bozuk gorunmesin diye).

Yani kontrol sende:
- Bir urunu one cikarmak icin menu panelinde **Featured** isaretle.
- Bir bolum hic cikmiyorsa, o bolumdeki urunlerin **gorseli yoktur** - menude
  gorsel ekleyince otomatik girer. (Su an Wings ve Desserts boyle.)

Menu okunamazsa `docs/index.html` icindeki yedek liste gosterilir ve sebep
tarayici konsoluna `[kuzela]` etiketiyle yazilir.

### Bu SDK'nin surprizleri

Islerken karsilasilan, belgelerde yazmayan davranislar:
- `listSections({ sectionIds })` ve `listItems({ itemIds })` **bos donuyor**.
  Filtresiz cekip id ile eslestirmek gerekiyor.
- Bolumler `id` alani **olmadan** donuyor, bu yuzden menunun `sectionIds`
  sirasi ile eslestirme tutmuyor; gelen sira kullaniliyor.
- `image` REST'te `{url}` nesnesi ama SDK'da duz medya kimligi (string).
  Ucuncu bir bicim olarak `wix:image://` de gelebiliyor.
- `priceInfo.formattedPrice` her zaman gelmiyor; `price` ham deger olarak var.

### Tiklama

Wix Restaurants urun basina URL uretmiyor (siparis sayfasinda urune tiklayinca
adres degismiyor, modal aciliyor). Bu yuzden kartlar siparis sayfasina
goturuyor, tek bir urune degil.

### Tiklama neden sayfa kodundan geciyor

Kartlar `target="_top"` ile calisiyordu ama Wix'in gomulu iframe'i sandbox'li:
ust pencereye gitmeye izin verilmiyor ve tiklayinca hicbir sey olmuyordu.
Iframe artik tiklamayi yakalayip `kuzelaNavigate` mesaji gonderiyor, gezinmeyi
`Home.c1dmp.js` yapiyor ve yalnizca bu sitenin adreslerini kabul ediyor.
Sayfa tek basina acildiginda normal gezinme calismaya devam ediyor.

### Bolum yuksekligi neden zincirin tamamina yaziliyor

Bolumun `min-height`'i editorde breakpoint basina sabit (orn. <=900px icin
9250px) ve bilesen `place-self: stretch` ile o yukseklige yayiliyor. Sadece
iframe'i boyutlandirmak kutuyu buyutebiliyor ama kucultemiyordu; dar ekranda
sayfanin altinda binlerce piksel bosluk kaliyordu. `min-height: 0` ve
`height: auto` de ise yaramadi (canli sayfada olculdu), bu yuzden olculen
yukseklik bolum, ara kapsayicilar, bilesen ve iframe'e aciktan yaziliyor.

### Onemli: degisiklikler 10 dakikaya kadar gecikebilir

GitHub Pages `Cache-Control: max-age=600` gonderiyor. `docs/index.html`
degistirip push ettikten sonra sitedeki gomulu icerik **10 dakikaya kadar**
eski kalabilir; tarayicinin kendi onbellegi de ayni sureyi tutuyor. Bir
degisikligin canliya gecmedigini dusunmeden once 10 dakika bekleyip sayfayi
sert yenile (Ctrl+F5). Test ederken bu yuzden yanlis "calismiyor" sonucu
cikarmak cok kolay.
