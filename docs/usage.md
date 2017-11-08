## Settings

Copy `config/env.sample` to `config/env` then edit `config/env`.

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

## Summary applicants

```bash
npm run applicants
```

Summarizeing XEM received for each address, then generating `tmp/applicants.json` for mosaic transferring.

* `candidates`: Destination to tranfer mosaic
* `receives`: Address that sent XEME to SINK ADDRESS
* `sents`: Address that already sent mosaic.

The file will be used by `mosaicsend` command.

## Send Mosaic to candidates

```bash
npm run sendmosaic
```

Sending mosaic to `"candidates"` addresses in `tmp/applicants.json`.

To check unconfirmed and confirmed transaction so as not to announce transaction duplicately.

### DRYRUN

To announce transactions, set `MOSAICSALE_DRYRUN` to `0`.
