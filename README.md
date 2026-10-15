# Mallea

Building, Steering, Extending Interactive Worlds with Code.

Project website: https://lxycopper.github.io/Mallea/

The page presents adaptive representations, editable attributes, and open-ended rollouts through 20 whitebox/render comparison demos: five capability examples and fifteen additional Gallery examples.

## Edit and preview

- Website: `site/`
- Content and video mappings: `site/static/data/`
- Layout and player styles: `site/static/css/`
- Synchronized comparison players: `site/static/js/index.js`
- Videos and posters: `site/static/videos/`, `site/static/images/`
- Homepage video numbering: [01–20 whitebox/render pairs](site/static/videos/README.md)

Run `python3 -m http.server 8000 --directory site` and open http://localhost:8000/.

## Deploy

Push changes under `site/` to `main`. The existing GitHub Pages workflow deploys this directory. Current approved release: v014.

Template credits and licensing are retained in the website footer and `LICENSE.md`.
