import {
    Address,
    beginCell,
    MessageRelaxed,
    toNano,
    TonClient,
    WalletContractV4,
    MultisigWallet,
    MultisigOrder,
    MultisigOrderBuilder,
} from 'ton';
import { KeyPair, mnemonicToPrivateKey } from 'ton-crypto';
import { getHttpEndpoint } from '@orbs-network/ton-access';

async function main() {
    const endpoint = await getHttpEndpoint();
    const client = new TonClient({ endpoint });

    let keyPairs: KeyPair[] = [];

    let mnemonics = [
        [
            'orbit',
            'feature',
            'kangaroo',
            'bargain',
            'found',
            'task',
            'siren',
            'differ',
            'submit',
            'inside',
            'stamp',
            'rather',
            'jar',
            'minimum',
            'car',
            'minimum',
            'deputy',
            'genre',
            'toe',
            'lumber',
            'purchase',
            'hard',
            'change',
            'supreme',
        ],
        [
            'sing',
            'pattern',
            'pepper',
            'lava',
            'tobacco',
            'tip',
            'wheat',
            'combine',
            'awesome',
            'possible',
            'oven',
            'find',
            'spot',
            'spoil',
            'labor',
            'bean',
            'never',
            'episode',
            'gossip',
            'hover',
            'jazz',
            'turkey',
            'february',
            'violin',
        ],
        [
            'piece',
            'deputy',
            'over',
            'trouble',
            'need',
            'crime',
            'grow',
            'skirt',
            'great',
            'motion',
            'text',
            'congress',
            'trap',
            'high',
            'screen',
            'mass',
            'ramp',
            'derive',
            'palm',
            'cry',
            'click',
            'waste',
            'dinner',
            'total',
        ],
        [
            'toss',
            'shadow',
            'over',
            'virus',
            'vocal',
            'choice',
            'work',
            'near',
            'about',
            'point',
            'door',
            'various',
            'owner',
            'dove',
            'fluid',
            'sight',
            'limb',
            'wrap',
            'pair',
            'mule',
            'wet',
            'jeans',
            'mention',
            'seek',
        ],
        [
            'guard',
            'nurse',
            'hip',
            'heart',
            'domain',
            'sauce',
            'stable',
            'ritual',
            'swear',
            'exist',
            'predict',
            'enough',
            'stool',
            'sunny',
            'exist',
            'tilt',
            'tiger',
            'basic',
            'head',
            'pottery',
            'swim',
            'romance',
            'box',
            'enrich',
        ],
    ];

    for (let i = 0; i < mnemonics.length; i++)
        keyPairs[i] = await mnemonicToPrivateKey(mnemonics[i]);

    let mw: MultisigWallet = new MultisigWallet(
        [keyPairs[0].publicKey, keyPairs[1].publicKey],
        0,
        0,
        1,
        { client }
    );

    let wallet: WalletContractV4 = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPairs[4].publicKey,
    });
    //wallet should be active and have some balance
    /*await mw.deployInternal(
        wallet.sender(
            client.provider(wallet.address, null),
            keyPairs[4].secretKey
        ),
        toNano('0.05')
    );*/

    let order1: MultisigOrderBuilder = new MultisigOrderBuilder(0);

    let msg: MessageRelaxed = {
        body: beginCell()
            .storeUint(0, 32)
            .storeBuffer(Buffer.from('Hello, world!'))
            .endCell(),
        info: {
            bounce: true,
            bounced: false,
            createdAt: 0,
            createdLt: 0n,
            dest: Address.parse(
                'EQArzP5prfRJtDM5WrMNWyr9yUTAi0c9o6PfR4hkWy9UQXHx'
            ),
            forwardFee: 0n,
            ihrDisabled: true,
            ihrFee: 0n,
            type: 'internal',
            value: { coins: toNano('0.01') },
        },
    };

    order1.addMessage(msg, 3);

    let order1b: MultisigOrder = order1.build();
    order1b.sign(0, keyPairs[0].secretKey);

    let order2: MultisigOrderBuilder = new MultisigOrderBuilder(0);
    order2.addMessage(msg, 3);
    let order2b = order2.build();
    order2b.sign(1, keyPairs[1].secretKey);

    order1b.unionSignatures(order2b); //Now order1b have also have all signatures from order2b

    await mw.sendOrder(order1b, keyPairs[0].secretKey);
}

main();
