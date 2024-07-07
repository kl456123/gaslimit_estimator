# -*- coding: utf-8 -*-

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import json
import os

if __name__ == '__main__':
    chain_names = [
        'Ethereum', 'Base', 'BSC', 'Optimisim', 'Arbitrum', 'opBNB', 'Scroll', 'Linea', 'Polygon',
        'ZkSync', 'Solana', 'Avalanche', 'Aurota', 'Metis', 'Mode', 'BTC', 'Gnosis', 'Fantom', 'Klaytn'
    ]
    gasLimits = []
    for chain_name in chain_names:
        filepath = os.path.join('./data/', '{:s}.json'.format(chain_name))
        if os.path.exists(filepath):
            data = json.load(open(filepath))
            gasLimits.extend(data.values())
    gasLimits = list(map(lambda item: int(item), gasLimits))
    gasLimits.sort()
    xs = range(0, len(gasLimits))

    plt.plot(xs, gasLimits)
    plt.title('gaslimit on multi chains')
    ax = plt.gca()
    plt.ylabel('gasLimit')
    plt.savefig('./data/gasLimit.png')
    plt.show()
