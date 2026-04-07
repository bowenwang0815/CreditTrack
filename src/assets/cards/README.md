# Card Image Assets

This folder is ready for one local image file per card.

Expected keys currently referenced by the app:

- `amex-blue-cash-everyday`
- `amex-blue-cash-preferred`
- `amex-gold`
- `amex-platinum`
- `amazon-prime-visa`
- `bank-of-america-customized-cash`
- `capital-one-platinum`
- `capital-one-quicksilver`
- `capital-one-savor`
- `chase-freedom`
- `chase-freedom-flex`
- `chase-freedom-unlimited`
- `chase-sapphire-preferred`
- `chase-sapphire-reserve`
- `citi-diamond-preferred`
- `citi-double-cash`
- `citi-prestige`
- `citi-simplicity`
- `discover-it`
- `hilton-aspire`
- `hilton-honors-amex`
- `marriott-bonvoy-boundless`
- `robinhood-gold-card`
- `uber-visa`
- `wells-fargo-propel`

To fully wire local art:

1. Add one file per card to this folder.
2. Update `src/assets/cards/index.ts` to import each file.
3. Keep the filename or asset key aligned with the card's `imageAssetKey`.

I did not auto-split the uploaded collage because the source image is not available as a local file inside the workspace yet.
