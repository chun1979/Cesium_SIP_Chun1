export async function loadTileset(viewer) {
  let tileset;
  try {
    tileset = await Cesium.Cesium3DTileset.fromUrl(
      //"./dataset/tileset/13101_chiyoda-ku/tileset.json"
      "./dataset/13114_nakano-ku/tileset.json"
    );
    viewer.scene.primitives.add(tileset);
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.zoomTo(
      tileset,
      new Cesium.HeadingPitchRange(
        0.0,
        -0.5,
        tileset.boundingSphere.radius * 2.0
      )
    );
  } catch (error) {
    console.log(`Error loading tileset: ${error}`);
  }
  return tileset;
}
