# Statue photography

Drop three files in this folder and the Contact & Connect panels pick them up
automatically — no code change:

    contact.jpg      Artemis, Diana of Versailles
    contribute.jpg   Venus de Milo
    connect.jpg      Winged Victory of Samothrace (or any draped classical marble)

Guidance: high resolution, tight crop on the head, shoulders or hands rather
than the whole figure — that reads as cinematic. Portrait orientation suits the panels best, roughly 1400x2000.
Colour is fine: the panel applies grayscale, so any photograph renders
black-and-white.

The panel anchors its crop to the TOP of the image, so put the face or the focal
detail in the upper third. Free sources: Wikimedia Commons (classical sculpture
photography is overwhelmingly public domain), Unsplash, Pexels.

`.jpg` is what the code looks for. If you have `.png` or `.webp`, either convert
them or edit `PHOTO` in `src/connect/marble.js`.

Until the files exist, each panel falls back to a procedurally generated
chiaroscuro marble field, so the layout never shows a hole.
