# nem Petit ICO

*現在メインネット対応できていません。*

## 紹介

任意の期間に受け取ったnem.xemに対して、モザイクを返送するスクリプトです。

ICOっぽいこと(xemとモザイクの交換の自動化)を実現します。

指定量以上のxemを受信したら、そのアドレスにモザイクを送り返すというケースを想定しています。

全ての処理はチェーン上のトランザクションから判断するので、動作環境としてNodeJSとインターネットだけが必要です。

即時の返送を求めないのであれば、常に動作させておく必要はないので、お手元のPC上で動かすことも可能です。

サーバの設定が不得手な方や秘密鍵をサーバに配置することが不安な場合でも、簡易なICOを実現できます。

例えば、ICO受付期間を発表し、受付終了後に動作させてモザイクを配布というやり方もできます。

また、設定した期間内の集計において条件を満たしたアドレスへモザイクを返送するので、
設定を変更しなければ何度実行しても二重にモザイクを配布することはありません。

フィードバック・機能リクエスト募集です。

## コンセプト

* 極力最小限の環境構築で動作させられること
* サーバを用いなくても実現できること
* Windowsでも最小の労力で利用できること

## 機能

### できること

* xem受取アドレスに届いたxemの合計量を上回るとモザイクを返送します

### できないこと

* ICOの締切(受信拒否)
* 返送用モザイク枯渇時の自動対応

### この先できそうなこと

* 受信xemの量に応じたモザイク配布量

## 動作環境

Node.js 6.11.4 以上推奨

## 使い方

* [nem Petit ICO](https://44uk.github.io/nem-petit-ico/)

Windowsの場合、`npm`によるスクリプト実行は`_tokensale.bat`などのバッチファイルから実行することもできます。

## 仕様

### モザイク配布対象になるアドレス

* 指定期間内に確認された転送トランザクションである
* 指定期間内で受け取った合計xemが指定量以上である
* (xemモザイク転送、マルチシグ転送対応)

### モザイク引換対象になるアドレス

* 指定期間内に確認されたトランザクションである
* 指定モザイクを転送している
* (マルチシグ転送対応)

## その他

誤作動を防ぐため、受取・配布アドレスは専用に用意することを推奨します。

このプログラム使用によるいかなる損害も同情と問題解決には努めますが責任は負いません。

## ご意見・要望等

* [44uk/nem-petit-ico - gitter](https://gitter.im/44uk/nem-petit-ico)
* [@44uk_i3 - Twitter](https://twitter.com/44uk_i3)

## License

The gem is available as open source under the terms of the [MIT License](https://github.com/44uk/nem-petit-ico/blob/master/LICENSE).