## Setting

`config/env.sample`をコピーして`config/env`として配置してください。

`config/env`をテキストエディタで開き、内容を適宜編集してください。

```
# testnet/mainnet ネットワークを指定します。
NEM_NETWORK=testnet

# 接続するノードを指定します。(空白の場合はnem-sdkのデフォルトが利用されます)
# (e.g. http://62.75.171.41)
NEM_NODE=

# 接続するノードのポートを指定します。(default: 7890)
NEM_PORT=

# 0を設定することで実際の送金が行われます。(安全装置としてのフラグです)
MOSAICSALE_DRYRUN=1

# 対象とするトランザクションの期間を指定します。
# ISO8601形式で指定してください。
MOSAICSALE_MIN_TIME=2017-10-12T00:00:00+0900
MOSAICSALE_MAX_TIME=2017-10-12T23:59:59+0900

# xem受信アドレスを指定します。(空白の場合は秘密鍵のアドレスが利用されます)
MOSAICSALE_SINK=__PUT_XEM_RECEIVE_ADDRESS__

# 配布するモザイクをを保有する秘密鍵を指定します。
MOSAICSALE_PKEY=__PUT_PRIVATE_KEY_MOSAIC_OWNED__

# マルチシグアドレスの公開鍵を指定します。(モザイクの配布元をマルチシグにする場合)
MOSAICSALE_MSIG_PUB=__PUT_MULTISIG_PUBLIC_KEY__

# 送信するモザイクを指定します。(e.g. nem:xem)
MOSAICSALE_MOSAIC_FQN=__PUT_MOSAIC_FULL_NAME__

# 最低必要xem量を指定します。(1000000 = 1xem)
MOSAICSALE_MIN_XEM=1000000

# モザイク送信時のメッセージを指定します。
MOSAICSALE_MESSAGE=
```

xem受取アドレスとは別のアカウント秘密鍵を設定することもできます。

## Summary applicants

```bash
npm run applicants
```

アドレスごとに受け取ったxemの集計を行い、モザイク送信用の中間ファイルを生成します。

中間ファイルは`tmp/applicants.json`として保存されます。

* `candidates`: モザイクを送信するアドレス
* `receives`: xemを受け取ったアドレス
* `sents`: モザイクを送信したアドレス

それぞれの情報がまとめられています。

これは`mosaicsend`コマンドに使用されます。

## Send Mosaic to candidates

```bash
npm run sendmosaic
```

`tmp/applicants.json`の`"candidates"`に記されたアドレスに割り当てられたモザイクを送信します。

送信時にも未承認、承認済みトランザクションの確認も行うため二重に実行しても重複してモザイクを送信しません。
