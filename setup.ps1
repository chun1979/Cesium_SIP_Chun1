Copy-Item -Path "node_modules\cesium\Build\Cesium" -Destination public\ -Recurse
Remove-Item -Path public\*js