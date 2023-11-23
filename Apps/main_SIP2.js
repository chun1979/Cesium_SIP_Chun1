import { loadTileset } from './loadTileset.js';
import { createModel } from './loadModel.js';
import { readBridgeJSON, readRoadJSON } from './readJSON.js';

let selectedBridge = null;
let selectedRoad = null;
let bridgeData = {};
let roadData = {};
let tileset = null;
let selectedType = null;
let selectedModel = null;
let modelData = {};
let photoData = {};  // 追加


function updateJSON(data, fileName) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateReferenceDataSelect(selectedData) {
    const referenceDataSelect = document.getElementById("referenceDataSelect");
    referenceDataSelect.innerHTML = "";
    if (selectedData && selectedData.referenceData) {
        selectedData.referenceData.forEach((data, index) => {
            const option = document.createElement("option");
            option.text = data.name;
            option.value = index;
            referenceDataSelect.add(option);
        });
    }
}

// photo_info.jsonを読み込む
async function readPhotoJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}


// 写真をプロットする関数を追加
function plotPhoto(viewer, latitude, longitude, url) {
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
            image: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',  // マーカーのアイコンへのパス
            width: 32,
            height: 32
        },
        description: `<img src="${url}" width="300" />`  // ポップアップで表示する内容
    });
}

// photo_overlay_info.jsonを読み込む
async function readPhotoOverlayJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// 画像をオーバーレイする
function overlayImage(viewer, latitude, longitude, width, height, imageUrl) {
    const cartographicCenter = Cesium.Cartographic.fromDegrees(longitude, latitude);
    const cartesianCenter = Cesium.Cartographic.toCartesian(cartographicCenter);
    
    const eastNorthUp = Cesium.Transforms.eastNorthUpToFixedFrame(cartesianCenter);
    
    const localRectangle = new Cesium.Rectangle(
        -width / 2.0,
        -height / 2.0,
        width / 2.0,
        height / 2.0
    );
    
    const rectangle = Cesium.Rectangle.fromCartesianArray([
        Cesium.Matrix4.multiplyByPoint(eastNorthUp, new Cesium.Cartesian3(localRectangle.west, localRectangle.south, 0.0), new Cesium.Cartesian3()),
        Cesium.Matrix4.multiplyByPoint(eastNorthUp, new Cesium.Cartesian3(localRectangle.east, localRectangle.north, 0.0), new Cesium.Cartesian3())
    ]);
    
    viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
        url: imageUrl,
        rectangle: rectangle,
        tileWidth: 256,  // 例えば，256x256ピクセルの画像を使用している場合，tileWidth と tileHeight もそれぞれ256に設定するのが一般的です．なのでまあこれおかしい．
        tileHeight: 256  // ここを追加
    }));
}

// KMLファイルを読み込む関数
function loadKmlFile(viewer, file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const kml = event.target.result;
      const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
      const url = URL.createObjectURL(blob);
      viewer.dataSources.add(Cesium.KmlDataSource.load(url, {
        camera: viewer.camera,
        canvas: viewer.canvas,
      }));
    };
    reader.readAsText(file);
  }

async function initialize() {
    try {
        console.log("Initializing...");
        const viewer = new Cesium.Viewer("cesiumContainer", {
            terrain: Cesium.Terrain.fromWorldTerrain(),
            infoBox: true,
            selectionIndicator: false,
            shadows: false,
            shouldAnimate: true,
        });

        tileset = await loadTileset(viewer);

        const tilesetCheckbox = document.getElementById("tilesetCheckbox");
        tilesetCheckbox.addEventListener("change", function() {
            if (this.checked) {
                tileset.show = true;
            } else {
                tileset.show = false;
            }
        });

        bridgeData = await readBridgeJSON('./dataset/bridge_info.json');
        roadData = await readRoadJSON('./dataset/road_info.json');
        photoData = await readPhotoJSON('./dataset/photo_info.json');  // 追加
        
        const photoSelect = document.getElementById("photoSelect");
        const bridgeSelect = document.getElementById("bridgeSelect");
        const roadSelect = document.getElementById("roadSelect");

        for (const name in bridgeData) {
            const option = document.createElement("option");
            option.text = name;
            option.value = name;
            bridgeSelect.add(option);
        }

        for (const name in roadData) {
            const option = document.createElement("option");
            option.text = name;
            option.value = name;
            roadSelect.add(option);
        }

        for (const name in photoData) {
            const option = document.createElement("option");
            option.text = name;
            option.value = name;
            photoSelect.add(option);
        }

        const typeSelect = document.getElementById("typeSelect");
        typeSelect.addEventListener("change", function(event) {
            selectedType = event.target.value;
            if (selectedType === "bridge") {
                document.getElementById("bridgeSelectDiv").style.display = "block";
                document.getElementById("roadSelectDiv").style.display = "none";
            } else if (selectedType === "road") {
                document.getElementById("bridgeSelectDiv").style.display = "none";
                document.getElementById("roadSelectDiv").style.display = "block";
            }
        });

        bridgeSelect.addEventListener("change", async function(event) {
            selectedModel = event.target.value;
            const selectedData = bridgeData[selectedModel];
            if (selectedData) {
                document.getElementById("longitude").value = selectedData.coordinates.longitude;
                document.getElementById("latitude").value = selectedData.coordinates.latitude;
                document.getElementById("height").value = selectedData.height;
                document.getElementById("angle").value = selectedData.angle;
                document.getElementById("pitch").value = selectedData.pitch;
                document.getElementById("roll").value = selectedData.roll;
                updateReferenceDataSelect(selectedData);
        
                const entity = await createModel(
                    viewer,
                    selectedModel,
                    selectedData.modelUrl,
                    selectedData.coordinates.longitude,
                    selectedData.coordinates.latitude,
                    selectedData.height,
                    selectedData.angle,
                    selectedData.pitch,
                    selectedData.roll
                );
                document.getElementById("referenceDataDiv").style.display = "block";  // 追加

                viewer.flyTo(entity);
            }
        });
        
        roadSelect.addEventListener("change", async function(event) {
            selectedModel = event.target.value;
            const selectedData = roadData[selectedModel];
            if (selectedData) {
                document.getElementById("longitude").value = selectedData.coordinates.longitude;
                document.getElementById("latitude").value = selectedData.coordinates.latitude;
                document.getElementById("height").value = selectedData.height;
                document.getElementById("angle").value = selectedData.angle;
                document.getElementById("pitch").value = selectedData.pitch;
                document.getElementById("roll").value = selectedData.roll;
                updateReferenceDataSelect(selectedData);
        
                const entity = await createModel(
                    viewer,
                    selectedModel,
                    selectedData.modelUrl,
                    selectedData.coordinates.longitude,
                    selectedData.coordinates.latitude,
                    selectedData.height,
                    selectedData.angle,
                    selectedData.pitch,
                    selectedData.roll
                );

                document.getElementById("referenceDataDiv").style.display = "block";  // 追加

                viewer.flyTo(entity);
            }
        });

        // 写真のプルダウンメニューが変更されたときのイベントリスナーを追加
        photoSelect.addEventListener("change", function(event) {
            const selectedPhoto = event.target.value;
            const selectedData = photoData[selectedPhoto];
            if (selectedData) {
                plotPhoto(viewer, selectedData.latitude, selectedData.longitude, selectedData.url);  // 写真をプロット
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        selectedData.longitude,
                        selectedData.latitude,
                        1000.0
                    )
                });
            }
        });

        const jumpToReferenceDataButton = document.getElementById("jumpToReferenceData");
        jumpToReferenceDataButton.addEventListener("click", function() {
            if (selectedType && selectedModel) {
                let selectedData;
                if (selectedType === "bridge") {
                    selectedData = bridgeData[selectedModel];
                } else if (selectedType === "road") {
                    selectedData = roadData[selectedModel];
                }

                if (selectedData) {
                    const selectedIndex = document.getElementById("referenceDataSelect").value;
                    if (selectedIndex !== null && selectedIndex !== "") {
                        const url = selectedData.referenceData[selectedIndex].url;
                        if (url) {
                            window.open(url, "_blank");
                        }
                    }
                }
            }
        });

        document.getElementById("updateButton").addEventListener("click", async function() {
            if (selectedModel && selectedType) {
                const longitude = parseFloat(document.getElementById("longitude").value);
                const latitude = parseFloat(document.getElementById("latitude").value);
                const height = parseFloat(document.getElementById("height").value);
                const angle = parseFloat(document.getElementById("angle").value);
                const pitch = parseFloat(document.getElementById("pitch").value);
                const roll = parseFloat(document.getElementById("roll").value);

                if (selectedType === "bridge") {
                    await createModel(
                        viewer,
                        selectedModel,
                        bridgeData[selectedModel].modelUrl,
                        longitude,
                        latitude,
                        height,
                        angle,
                        pitch,
                        roll
                    );
                } else if (selectedType === "road") {
                    await createModel(
                        viewer,
                        selectedModel,
                        roadData[selectedModel].modelUrl,
                        longitude,
                        latitude,
                        height,
                        angle,
                        pitch,
                        roll
                    );
                }
            }
        });

    // photo_overlay_info.jsonを読み込む
    const photoOverlayData = await readPhotoOverlayJSON('./dataset/photo_overlay_info.json');

    // すべての画像をオーバーレイ
    for (const selectedPhoto in photoOverlayData) {
        const selectedData = photoOverlayData[selectedPhoto];
        if (selectedData) {
            overlayImage(viewer, selectedData.latitude, selectedData.longitude, selectedData.width, selectedData.height, selectedData.url);
        }
    }

    // KML読み込みボタンのイベントリスナーを設定
    const loadKmlButton = document.getElementById("loadKmlButton");
    loadKmlButton.addEventListener("click", function() {
        const kmlFileInput = document.getElementById("kmlFileInput");
        const kmlFile = kmlFileInput.files[0];
        if (kmlFile) {
            loadKmlFile(viewer, kmlFile);
        }
    });

document.getElementById("updateJSONButton").addEventListener("click", function() {
    if (selectedType === "bridge" && selectedModel) {
        // Update the existing data
        bridgeData[selectedModel].coordinates.longitude = parseFloat(document.getElementById("longitude").value);
        bridgeData[selectedModel].coordinates.latitude = parseFloat(document.getElementById("latitude").value);
        bridgeData[selectedModel].height = parseFloat(document.getElementById("height").value);
        bridgeData[selectedModel].angle = parseFloat(document.getElementById("angle").value);
        bridgeData[selectedModel].pitch = parseFloat(document.getElementById("pitch").value);
        bridgeData[selectedModel].roll = parseFloat(document.getElementById("roll").value);
        
        // Update the JSON file
        updateJSON(bridgeData, "bridge_info.json");
    } else if (selectedType === "road" && selectedModel) {
        // Update the existing data
        const longitude = parseFloat(document.getElementById("longitude").value).toFixed(4);
        const latitude = parseFloat(document.getElementById("latitude").value).toFixed(4);
        const height = parseFloat(document.getElementById("height").value);
        const angle = parseFloat(document.getElementById("angle").value);
        const pitch = parseFloat(document.getElementById("pitch").value);
        const roll = parseFloat(document.getElementById("roll").value);
        
        // Create a new name based on the updated longitude and latitude
        const newName = `${longitude}_${latitude}`;
        roadData[newName] = {
            name: newName,
            modelUrl: roadData[selectedModel].modelUrl,
            coordinates: {
                longitude,
                latitude
            },
            height,
            angle,
            pitch,
            roll
        };
        
        // Delete the old data
        delete roadData[selectedModel];
        selectedModel = newName;
        
        // Update the JSON file
        updateJSON(roadData, "road_info.json");
    }
});

// ...（他のコードはそのまま）


        console.log("Initialization complete.");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);
