export async function readBridgeJSON(bridgeJsonPath) {
    const response = await fetch(bridgeJsonPath);
    const data = await response.json();
    return data.bridges.reduce((acc, bridge) => {
        acc[bridge.name] = bridge;
        return acc;
    }, {});
}

export async function readRoadJSON(roadJsonPath) {
    const response = await fetch(roadJsonPath);
    const data = await response.json();
    return data.roads.reduce((acc, road) => {
        acc[road.name] = road;
        return acc;
    }, {});
}
