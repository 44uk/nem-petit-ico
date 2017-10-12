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

# 0を設定することで実際の送金が行われます。
TOKENSALE_DRYRUN=1

# xem受信アドレスを指定します。(空白の場合は秘密鍵のアドレスが利用されます)
TOKENSALE_SINK=__PUT_XEM_RECEIVE_ADDRESS__

# 最低xem量を指定します。(1000000 = 1xem)
TOKENSALE_MIN_XEM=1000000

# 送信するモザイクを指定します。(e.g. nem:xem)
TOKENSALE_MOSAIC_FQN=__PUT_MOSAIC_FULL_NAME__

# モザイクを保有する秘密鍵を指定します。
TOKENSALE_PKEY=__PUT_PRIVATE_KEY_MOSAIC_OWNED__

# 対象とするトランザクションの期間を指定します。
# ISO8601形式で指定してください。
TOKENSALE_MIN_TIME=2017-10-12T00:00:00+0900
TOKENSALE_MAX_TIME=2017-10-12T23:59:59+0900
```

xem受取アドレスとは別のアカウント秘密鍵を設定することもできます。

## Tokensale

```bash
npm run tokensale
```

## Status

```bash
npm run status
```
