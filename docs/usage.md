## Settings

Copy `config/env.sample` to `config/env`.

Open `config/env` and edit.

```
# testnet / mainnet
NEM_NETWORK=testnet

# Connecting node address (default: nem-sdk default)
# (e.g. http://62.75.171.41)
NEM_NODE=

# Connecting node port (default: 7890)
NEM_PORT=

# if set `0`, announce transaction.
MOSAICSALE_DRYRUN=1

# Transaction aggregate period.
# ISO8601 format (YYYY-MM-DDThh:mm:ssZ, YYYY-MM-DDThh:mm:ss+0900)
MOSAICSALE_MIN_TIME=2017-10-12T00:00:00+0900
MOSAICSALE_MAX_TIME=2017-10-12T23:59:59+0900

# Receiving xem address (if blank, use private key address)
MOSAICSALE_SINK=__PUT_XEM_RECEIVE_ADDRESS__

# PrivateKey which has mosaic you want to send.
MOSAICSALE_PKEY=__PUT_PRIVATE_KEY_MOSAIC_OWNED__

# PublicKey multisig address (if multisig address use)
MOSAICSALE_MSIG_PUB=__PUT_MULTISIG_PUBLIC_KEY__

# Mosaic full name you want to send
# (e.g. nem:xem)
MOSAICSALE_MOSAIC_FQN=__PUT_MOSAIC_FULL_NAME__

# Minimum receive xem amount. (1000000 = 1xem)
MOSAICSALE_MIN_XEM=1000000

# Message when sending mosaic.
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

それぞれの情報がこのファイルにまとめられます。

これは`mosaicsend`コマンド実行時に読み込まれて使用されます。

## Send Mosaic to candidates

```bash
npm run sendmosaic
```

`tmp/applicants.json`の`"candidates"`に記されたアドレスに割り当てられたモザイクを送信します。

送信時にも未承認、承認済みトランザクションの確認も行うため二重に実行しても重複してモザイクを送信しません。

### DRYRUN機能

`config/env`の`MOSAICSALE_DRYRUN`の値が`0`以外に設定されている場合、トランザクションを発行しません。

実際に送信する直前に、送信先が想定通りかを確認するための機能です。

`0`を設定した状態で`sendmosaic`を実行すると、実際の送信が行えます。
