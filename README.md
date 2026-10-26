# DBP CUSTOMS — Static Website

A responsive HTML/CSS/JavaScript starter site for DBP CUSTOMS.

## Run it
- Keep `index.html`, `styles.css`, `script.js`, and the `assets/` folder together.
- Double-click `index.html` to preview in your browser, or use VS Code's Live Server extension.
- No build step or package installation is needed.

## Edit products
Open `index.html` to change product names/descriptions and `script.js` to change prices and WhatsApp number.
The Magnetic Car Antenna and Customized Car Hanging are set to "Ask for price" because their prices were not confirmed.
Bulk discount tiers are currently handled by WhatsApp inquiry; add your actual tiers when decided.

## Notes
- The hero is the corrected DBP CUSTOMS cinematic banner.
- This is a front-end starter: cart state is held in the browser only.
- Orders are sent as a WhatsApp message; this does not process online payments or store orders in a database.
- For live commerce, add a payment gateway, shipping/order workflow and any required policies before launch.
- Google Fonts need an internet connection; fallback fonts are included.


## Cinematic Fortuner hero update

The home hero now uses `assets/dbp-fortuner-reveal.mp4` as a muted, autoplaying background video that plays once per page load. The DBP / CUSTOMS / YOUR RIDE. YOUR RULES. text overlay begins revealing at approximately 3.15 seconds, timed to the drift in the supplied clip. The original product catalogue, prices, styling, cart, WhatsApp links, and remaining sections are preserved.

Open `index.html` in a local web server or deploy the whole `dbp-customs-website` folder. Keep the `assets` directory alongside the HTML file so the video and product images load correctly.


### Latest visual refinements
- The DBP CUSTOMS logo reveal is centered and begins around 5.2 seconds, after the Fortuner exits the frame in the supplied 8-second video.
- The video asset itself is preserved without recompression.
- Key content sections and product cards reveal subtly as they enter the viewport while scrolling; the motion is restrained and respects reduced-motion preferences.


Playback update: the hero video no longer loops. It plays once when the page opens and holds on its final frame; the DBP CUSTOMS logo reveal remains visible after the car exits. Refreshing or reopening the page starts the video again.


Cart Easter egg: there is no separate Remove button. The existing quantity minus (−) control escapes to distant screen corners three times, showing “↗ I am here”, “↓ Catch me”, and “↖ Last try”. On the next attempt it stops and shows “Okay, okay! You win 😂”; subsequent use of the same minus control changes quantity normally (and removes the item when quantity reaches zero).

Latest Easter egg polish: the first three hints now appear beside the moved minus button, in bold dark red, with an arrow between the hint and the button. The final win message remains unchanged.


Latest Easter egg update: the existing minus button escapes to three randomized, non-corner viewport positions per cart item. The hint remains readable and its arrow points toward the minus button; “Catch me” appears above the button with a downward arrow. After three escapes, the fourth attempt shows “Okay, okay! You win 😂” and normal quantity changes resume.
