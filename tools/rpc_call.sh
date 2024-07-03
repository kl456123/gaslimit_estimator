#!/bin/bash

RPC_URL=https://bitcoin.drpc.org
curl ${RPC_URL} \
        -X POST \
            -H "Content-Type: application/json" \
                --data '{"method": "estimatesmartfee", "params": [10]}'
