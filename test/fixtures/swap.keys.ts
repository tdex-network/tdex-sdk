import { PrivateKey } from '../../src/identities/privatekey';
import { IdentityType } from '../../src/identity';

export const proposer = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});

export const proposerAddress = proposer.getNextAddress().confidentialAddress;

export const responder = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cSv4PQtTpvYKHjfp9qih2RMeieBQAVADqc8JGXPvA7mkJ8yD5QC1',
    signingKeyWIF: 'cVcDj9Td96x8jcG1eudxKL6hdwziCTgvPhqBoazkDeFGSAR8pCG8',
  },
});

export const responderAddress = responder.getNextAddress().confidentialAddress;
