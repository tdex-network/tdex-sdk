import { Swap } from '../src/swap';

describe('Swap', () => {
  it('Request', () => {
    const swap = new Swap();
    const bytes = swap.request({
      assetToBeSent:
        'c5870288a7c9eb5db398a5b5e7221feb9753134439e8ed9f569b0eea5a423330',
      amountToBeSent: 300,
      assetToReceive:
        '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      amountToReceive: 0.05,
      psbtBase64:
        'cHNidP8BALgCAAAAAAE1qvpIjf4uGCZdIX/un58Fw6BPmzawfGURUlm73AOPoAAAAAAA/////wIBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAABMS0AAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkBMDNCWuoOm1af7eg5RBNTl+sfIue1pZizXevJp4gCh8UBAAAbQe80NAAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkAAAAAAAEBQgEwM0Ja6g6bVp/t6DlEE1OX6x8i57WlmLNd68mniAKHxQEAABtI61fgAAAWABTFKMruAFIAZXwEtcX2ows9PlHleQAAAA==',
    });

    expect(bytes).toBeDefined();
  });
});
