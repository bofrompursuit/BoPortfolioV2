# Video assets

    intro.mp4        Hero. Scroll-scrubbed, cropped to fill (object-fit: cover).
    hand-reveal.mp4  Contact stage. Shown whole (object-fit: contain), 16:9.
    vision-pan.mp4   Panoramic backdrop behind the Vision & Services copy.

## vision-pan.mp4 is not in the repo yet

Until it is, that section falls back to a generated marble field, which is why
it renders rather than showing a hole. Drop the file in under exactly that name
and it takes over — no code change.

What to look for: a slow horizontal pan across classical marble, no hard cuts,
and a loop that does not jar when it restarts. It sits behind right-aligned copy
and is greyscaled and dimmed in CSS, so colour and contrast in the original do
not matter much; motion and composition do. Keep the left half comparatively
quiet — the text sits on the right.

Sources (all royalty-free, no attribution required for Pexels/Pixabay/Mixkit):

  Pexels    pexels.com/search/videos/  — "classical marble statues panoramic",
            "greek museum sculpture slow pan", "marble sculpture dolly"
  Pixabay   pixabay.com/videos/search/ — "ancient marble statue close up",
            "roman sculpture panoramic"
  Mixkit    mixkit.co/free-stock-video/ — "statue", "museum"

Specs: 1920x1080 or wider, H.264/MP4, 10-20 seconds, ideally under ~6 MB since
it autoplays on every visit. The element is muted, so strip the audio track if
the download has one.

I could not fetch or preview any of these from the build environment — its proxy
only allows GitHub — so the file has to come from you.
