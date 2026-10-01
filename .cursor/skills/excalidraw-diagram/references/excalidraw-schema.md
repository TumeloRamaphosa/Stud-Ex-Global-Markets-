# Excalidraw JSON schema (minimum)

Root:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin",
  "elements": [],
  "appState": { "gridSize": null, "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

Every element needs: `id`, `type` (`rectangle|text|arrow|ellipse|diamond`), `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `strokeStyle`, `roughness`, `opacity`, `groupIds`, `frameId`, `index`, `roundness`, `seed`, `version`, `versionNonce`, `isDeleted`, `boundElements`, `updated`, `link`, `locked`.

Text elements also need: `text`, `rawText`, `fontSize`, `fontFamily` (always 5), `textAlign`, `verticalAlign`, `containerId`, `originalText`, `autoResize`, `lineHeight`.

Arrows: set `points`, `startBinding` / `endBinding` when connecting boxes. Prefer simple two-point arrows (`[[0,0],[dx,dy]]`).
