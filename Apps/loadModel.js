let entityCollection = {};

export function createModel(viewer, id, url, keido, ido, height, angle, pitch, roll) {
  // 既存のエンティティを削除
  if (entityCollection[id]) {
    viewer.entities.remove(entityCollection[id]);
  }
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

  const position = Cesium.Cartesian3.fromDegrees(
    keido,
    ido,
    height
  );
  const heading = Cesium.Math.toRadians(angle);//headingになってるのはそのうちangle_radianになおす
  const pitch_radian = Cesium.Math.toRadians(pitch);
  const roll_radian = Cesium.Math.toRadians(roll)
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch_radian, roll_radian);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );

  const entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 20000,
    },
  });

  // エンティティをコレクションに保存
  entityCollection[id] = entity;

  viewer.trackedEntity = entity;

  // エンティティを返す
  return entity;
}
