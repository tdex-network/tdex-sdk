import { Swap } from '../src/swap';

describe('Swap', () => {
  const USDT =
    '2dcf5a8834645654911964ec3602426fd3b9b4017554d3f9c19403e7fc1411d3';
  const LBTC =
    '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225';

  const swap = new Swap();

  const initialPsbtOfAlice =
    'cHNidP8BALgCAAAAAAHtRVE1BkOnL3GYKskZnbmT/4wjiX+golY/TSLwpcWruQEAAAAA/////wIBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAABMS0AAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANnXmIRAAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkAAAAAAAEBQgHTERT85wOUwfnTVHUBtLnTb0ICNuxkGZFUVmQ0iFrPLQEAAA2kdavwAAAWABTFKMruAFIAZXwEtcX2ows9PlHleQAAAA==';
  const initialPsbtOfBob =
    'cHNidP8BAP1lAQIAAAAAAu1FUTUGQ6cvcZgqyRmduZP/jCOJf6CiVj9NIvClxau5AQAAAAD/////5gvIxOksvm3xwVCvGRe1AQLH8z0utX4L0e30r+VPt5cAAAAAAP////8EASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAATEtAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAADZ15iEQAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAAAAb8I6wAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAFqZXAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHAAAAAAABAUIB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANpHWr8AAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkAAQFCASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAF9eEAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHIgICgEVehMv0LB8AvJfc4SLP1VX1F0p6ebHBYKtzq3xbs8lHMEQCIHpIzr6p7OIGhW2PzOi6m/HKG5Gotnmt5TpylMuOSrE4AiAhxdQqlCGk4s7QaJnA2dVQc4lfWBOV3FBHaw25sM8xEQEAAAAAAA==';
  const finalPsbtOfAlice =
    'cHNidP8BAP1lAQIAAAAAAu1FUTUGQ6cvcZgqyRmduZP/jCOJf6CiVj9NIvClxau5AQAAAAD/////5gvIxOksvm3xwVCvGRe1AQLH8z0utX4L0e30r+VPt5cAAAAAAP////8EASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAATEtAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAADZ15iEQAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAAAAb8I6wAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAFqZXAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHAAAAAAABAUIB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANpHWr8AAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkiAgJp6A6eYQgEnPKMfCH5c49w+9u63C62sGGTzHIJL4ZaxEcwRAIgdN5MddCGTC9hRWvUbIOREbVwhEcARauaHT4pqavp9yACIBpEdlr8hBM6e6+S6cNqDkqkqVV0JTYqKuMt5FW/abJyAQABAUIBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAAX14QAAFgAUknxf1aDjvv5vpK6qVrOhP7fH4EciAgKARV6Ey/QsHwC8l9zhIs/VVfUXSnp5scFgq3OrfFuzyUcwRAIgekjOvqns4gaFbY/M6Lqb8cobkai2ea3lOnKUy45KsTgCICHF1CqUIaTiztBomcDZ1VBziV9YE5XcUEdrDbmwzzERAQAAAAAA';
  test('Alice can create a Swap Request message', () => {
    const psbtBase64 = initialPsbtOfAlice;
    const bytes = swap.request({
      assetToBeSent: USDT,
      amountToBeSent: 30000000000,
      assetToReceive: LBTC,
      amountToReceive: 5000000,
      psbtBase64,
    });

    expect(bytes).toBeDefined();
  });

  test('Bob can import a SwapRequest and create a SwapAccept message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: USDT,
      amountToBeSent: 30000000000,
      assetToReceive: LBTC,
      amountToReceive: 5000000,
      psbtBase64: initialPsbtOfAlice,
    });

    const psbtBase64 = initialPsbtOfBob;
    const bytes = swap.accept({ message: swapRequestMessage, psbtBase64 });

    expect(bytes).toBeDefined();
  });

  test('Alice can import a SwapAccept message and create a SwapComplete message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: USDT,
      amountToBeSent: 30000000000,
      assetToReceive: LBTC,
      amountToReceive: 5000000,
      psbtBase64: initialPsbtOfAlice,
    });

    const swapAcceptMessage = swap.accept({
      message: swapRequestMessage,
      psbtBase64: initialPsbtOfBob,
    });

    const bytes = swap.complete({
      message: swapAcceptMessage,
      psbtBase64: finalPsbtOfAlice,
    });

    expect(bytes).toBeDefined();
  });
});
