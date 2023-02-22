import * as ecc from 'tiny-secp256k1';
import secp256k1 from '@vulpemventures/secp256k1-zkp';

export const proposer = async () => {
  const zkp = await secp256k1();
  return new PrivateKey({
    chain: 'regtest',
    type: IdentityType.PrivateKey,
    opts: {
      blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
      signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
    },
    ecclib: ecc,
    zkplib: zkp,
  });
};

export const responder = async () => {
  const zkp = await secp256k1();
  return new PrivateKey({
    chain: 'regtest',
    type: IdentityType.PrivateKey,
    opts: {
      blindingKeyWIF: 'cSv4PQtTpvYKHjfp9qih2RMeieBQAVADqc8JGXPvA7mkJ8yD5QC1',
      signingKeyWIF: 'cVcDj9Td96x8jcG1eudxKL6hdwziCTgvPhqBoazkDeFGSAR8pCG8',
    },
    ecclib: ecc,
    zkplib: zkp,
  });
};

export const proposerPubKey = Buffer.from(
  '02308c925b4e43e97750e132866d64b838ae784a1d555792fc1205c772e28919a4',
  'hex'
);
export const proposerBlindPrvKey = Buffer.from(
  '35522f2cd456611685fc66f56a50c3fdf99b3b07c23a8399a9a7f3720e58b91e',
  'hex'
);
export const proposerBlindPubKey = Buffer.from(
  '0251464420fcc98a2e4cd347afe28a32d769287dacd861476ab858baa43bd308f3',
  'hex'
);
