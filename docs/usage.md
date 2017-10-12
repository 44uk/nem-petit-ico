## Setting

`.env.sample`をコピーして`.env`として配置してください。

```
# testnet/mainnetを指定します。
NEM_NETWORK=testnet

# http://62.75.171.41 のようにノードを指定できます。(ポートはデフォルト7890のみ)
NEM_NODE=

# "0"にセットしない限りモザイクの送信はしません。
TOKENSALE_DRYRUN=1

# xemの受取アドレスを指定してください。
TOKENSALE_SINK=__PUT_XEM_RECEIVE_ADDRESS__

# 最低受領xemを指定してください。(1000000 = 1xem)
TOKENSALE_MIN_XEM=1000000

# モザイクを送信する秘密鍵を指定してください。
TOKENSALE_PKEY=__PUT_PRIVATE_KEY_MOSAIC_OWNED__

# nem:xem のようなフルネームで指定してください。
TOKENSALE_MOSAIC_FQN=__PUT_MOSAIC_FULL_NAME__

# 期間の開始を指定してください。
TOKENSALE_MIN_TIME=2017-10-10T00:00:00+0900

# 期間の終了を指定してください。
TOKENSALE_MAX_TIME=2017-10-10T23:59:59+0900
```

xem受取アドレスとは別のアカウント秘密鍵を設定することもできます。

`TOKENSALE_SINK`が未指定の場合は秘密鍵のアドレスが受取アドレスになります。

## Tokensale

```bash
npm run tokensale
```

Windowsの場合は`_tokensale.bat`をダブルクリックしても実行できます。

## Status

```bash
npm run status
```

Windowsの場合は`_status.bat`をダブルクリックしても実行できます。
