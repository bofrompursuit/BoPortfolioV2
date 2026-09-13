# Statue photography

Drop three files in this folder and the Contact & Connect panels pick them up
automatically — no code change:

    contact.jpg      Michelangelo's David
    contribute.jpg   Venus de Milo
    connect.jpg      Apollo Belvedere (or any classical marble)

Guidance: high-resolution, cinematic, black-and-white, tight crop on the face,
shoulders or hands rather than the whole figure. Portrait orientation suits the
panels best (roughly 1400x2000). Free sources: Unsplash, Pexels, Wikimedia
Commons (most classical sculpture photography there is public domain).

`.jpg` is what the code looks for. If you have `.png` or `.webp`, either convert
them or edit `PHOTO` in `src/connect/marble.js`.

Until the files exist, each panel falls back to a procedurally generated
chiaroscuro marble field, so the layout never shows a hole.
