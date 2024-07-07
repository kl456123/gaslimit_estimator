#!/bin/bash

# RPC_URL=https://bitcoin.drpc.org
# curl ${RPC_URL} \
        # -X POST \
            # -H "Content-Type: application/json" \
                # --data '{"method": "estimatesmartfee", "params": [10]}'
# curl https://api.arbiscan.io/api?module=account&action=txlist&address=0x111111125421cA6dc452d289314280a0f8842A65&startblock=229606075&endblock=latest&page=1&offset=10&sort=asc&apikey=34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV
# curl https://api.arbiscan.io/api?module=account&action=txlist&address=0x1a97a5a0063d837fd3365e71e5bdc3894e833e6d&startblock=0&endblock=latest&page=1&offset=10&sort=asc&apikey=34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV
wget https://api.arbiscan.io/api?module=account&action=txlist&address=0x111111125421cA6dc452d289314280a0f8842A65&startblock=229606075&endblock=latest&page=1&offset=10&sort=asc&apikey=34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV
