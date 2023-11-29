document.addEventListener('DOMContentLoaded', function() {
    var categorySelect = document.getElementById('modelCategory');
    var detailsSelect = document.getElementById('modelDetails');
    var addButton = document.getElementById('addButton');
    var itemsList = document.getElementById('itemsList');
    var contextMenu = document.getElementById('contextMenu');
    var moveTo = document.getElementById('moveTo');
    var openReport = document.getElementById('openReport');
    var showData = document.getElementById('showData');
    var dataPopup = document.getElementById('dataPopup');
    //var selectedItem;

    var menuItems = document.querySelectorAll('#contextMenu li');
        
    function mapModelToMenuItemId(model) {
        var idMap = {
            'sfmmodel': 'sfmModel',
            'pointcloud': 'pointCloud',
            'bimcim': 'bimCim',
            'femmodel': 'femModel'
        };
        return idMap[model.toLowerCase()] || model;
    }

    // コンテキストメニュー項目のIDと対応するデータ属性名のマッピング
    var menuItemToDataAttribute = {
        'sfmModel': 'data-sfmmodel',
        'pointCloud': 'data-pointcloud',
        'bimCim': 'data-bimcim',
        'femModel': 'data-femmodel'
    };

    // 各モデル項目に対するクリックイベントハンドラを設定
    Object.keys(menuItemToDataAttribute).forEach(function(menuItemId) {
        var menuItem = document.getElementById(menuItemId);
        menuItem.addEventListener('click', function() {
            // 選択されたリストアイテムに対応するモデルのデータ属性を更新
            var dataAttribute = menuItemToDataAttribute[menuItemId];
            if (selectedItem && selectedItem.hasAttribute(dataAttribute)) {
                // チェックを移動
                updateCheckmark(menuItem);
            }
        });
    });


    // チェックを追加または削除する関数
    function updateCheckmark(selectedItem) {
        menuItems.forEach(function(item) {
            // チェックを追加する対象を限定する
            if (item.id === 'sfmModel' || item.id === 'pointCloud' || item.id === 'bimCim' || item.id === 'femModel') {
                var checkmark = item.querySelector('.checkmark');
                if (!checkmark) {
                    checkmark = document.createElement('span');
                    checkmark.className = 'checkmark';
                    checkmark.textContent = '✔ ';
                    item.insertBefore(checkmark, item.firstChild);
                }
                checkmark.style.display = (item === selectedItem) ? '' : 'none';
            }
        });
    }
    

    // 各メニュー項目のクリックイベントを設定
    menuItems.forEach(function(item) {
        if (!item.classList.contains('inactive')) { // 非アクティブな項目を除外
            item.addEventListener('click', function() {
                updateCheckmark(this);

                // ここで各項目の具体的な処理を実装
                // ...
            });
        }
    });

    // 閉じるボタンの取得
    var closeButton = document.querySelector('.data-popup .closeButton');

    // 閉じるボタンのイベントハンドラー
    closeButton.addEventListener('click', function() {
        // ポップアップウインドウを閉じる
        var popup = this.closest('.data-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    });

    var searchInput = document.querySelector('.search-container input');

    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            // Enterキーが押されたときの処理
            alert(this.value); // 検索窓の値をalertで表示
            this.value = '';   // 検索窓の中身をクリア
        }
    });

    
    document.getElementById('itemsList').addEventListener('contextmenu', function(event) {
        event.preventDefault();
        var target = event.target.closest('[data-category]');
        if (!target) return;
    
        var latitude = target.getAttribute('data-latitude');
        var longitude = target.getAttribute('data-longitude');
    
        // コンテキストメニューの位置を設定
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.display = 'block';

        // コンテキストメニューが表示されたアイテムをselectedItemに設定
        selectedItem = target;
    
        // 選択されたアイテムの初期モデルにチェックを入れる
        // 初期モデルまたは現在選択されているモデルに基づいてチェックを更新
        var initialModel = target.getAttribute('data-initialmodel');
        var initialModelId  = mapModelToMenuItemId(initialModel);
        updateCheckmark(document.getElementById(initialModelId));
    
        // 各モデルがnullの場合、対応するメニュー項目を非アクティブにする
        ['sfmModel', 'pointCloud', 'bimCim', 'femModel'].forEach(function(modelId) {
            var modelPath = target.getAttribute('data-' + modelId.toLowerCase());
            var menuItem = document.getElementById(modelId);
            if (modelPath === "") {
                menuItem.classList.add('inactive');
            } else {
                menuItem.classList.remove('inactive');
                menuItem.onclick = function() {
                    // 選択されたモデルをリストアイテムのdata-initialmodelに更新
                    target.setAttribute('data-initialmodel', modelId);
                    updateCheckmark(menuItem);
                };
            }
                    
        });
        
    
        // ここに移動のクリックイベント
        moveTo.onclick = function() {
            alert('Latitude: ' + latitude + ', Longitude: ' + longitude);
        };
    
        // 点検調書のクリックイベント
        openReport.onclick = function() {
            window.open('https://www.yahoo.co.jp/', '_blank');
        };

        showData.onclick = function() {
            // データポップアップの内容をクリア
            dataTable.innerHTML = '';
    
            if (selectedItem) {
                // データを表形式で表示
                var rowId = dataTable.insertRow();
                rowId.insertCell().textContent = 'ID';
                rowId.insertCell().textContent = selectedItem.getAttribute('data-id');
    
                var rowLat = dataTable.insertRow();
                rowLat.insertCell().textContent = '緯度';
                rowLat.insertCell().textContent = selectedItem.getAttribute('data-latitude');
    
                var rowLon = dataTable.insertRow();
                rowLon.insertCell().textContent = '経度';
                rowLon.insertCell().textContent = selectedItem.getAttribute('data-longitude');
            }
    
            dataPopup.style.display = 'block';
        };
    

    });

    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });

    /*showData.addEventListener('click', function() {
        // データポップアップの内容をクリア
        dataTable.innerHTML = '';
        console.log(selectedItem)

        if (selectedItem) {
            // データを表形式で表示
            var rowId = dataTable.insertRow();
            rowId.insertCell().textContent = 'ID';
            rowId.insertCell().textContent = selectedItem.getAttribute('data-id');
    
            // 緯度の行を追加
            var rowLat = dataTable.insertRow();
            rowLat.insertCell().textContent = '緯度';
            rowLat.insertCell().textContent = selectedItem.getAttribute('data-latitude');
    
            // 経度の行を追加
            var rowLon = dataTable.insertRow();
            rowLon.insertCell().textContent = '経度';
            rowLon.insertCell().textContent = selectedItem.getAttribute('data-longitude');
        }

        dataPopup.style.display = 'block';
    });*/


    categorySelect.addEventListener('change', function() {
        var selectedCategory = categorySelect.value;
        switch(selectedCategory) {
            case 'bridge':
                loadData('bridge.json', 'bridges', 'name');
                break;
            case 'road':
                loadData('road.json', 'roads', 'id');
                break;
            case 'ground':
                loadData('ground.json', 'grounds', 'id');
                break;
        }
    });

    function loadData(jsonFile, arrayProperty, displayProperty) {
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                updateDetailsSelect(data[arrayProperty], displayProperty);
            })
            .catch(error => console.error('Error:', error));
    }

    function updateDetailsSelect(items, property) {
        detailsSelect.innerHTML = '';
        var defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select Model';
        defaultOption.value = '';
        detailsSelect.appendChild(defaultOption);

        items.forEach(function(item) {
            var option = document.createElement('option');
            option.textContent = item[property];
            option.value = item['id'];
            detailsSelect.appendChild(option);
        });
    }

    var rangeButton = document.getElementById('rangeButton');
    var popupWindow = document.getElementById('popupWindow');
    var closeButton = document.getElementsByClassName('closeButton')[0];

    rangeButton.addEventListener('click', function() {
        popupWindow.style.display = 'block';
    });

    closeButton.addEventListener('click', function() {
        popupWindow.style.display = 'none';
    });

    var refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', function() {
        itemsList.innerHTML = ''; // itemsListの中身を全て消去
    });

    var applyButton = document.getElementById('applyButton');
    var latStart, latEnd, lonStart, lonEnd;

//**************************************************************************************** */
    applyButton.addEventListener('click', function() {
        latStart = parseFloat(document.getElementById('latitudeStart').value);
        latEnd = parseFloat(document.getElementById('latitudeEnd').value);
        lonStart = parseFloat(document.getElementById('longitudeStart').value);
        lonEnd = parseFloat(document.getElementById('longitudeEnd').value);
        var bridgeCheckbox = document.getElementById('bridgeCheckbox');
        var roadCheckbox = document.getElementById('roadCheckbox');
        var groundCheckbox = document.getElementById('groundCheckbox');

        if (bridgeCheckbox.checked) {
            loadData0('bridge.json', 'bridge');
        }
        if (roadCheckbox.checked) {
            loadData0('road.json', 'road');
        }
        if (groundCheckbox.checked) {
            loadData0('ground.json', 'ground');
        }

        popupWindow.style.display = 'none';
    });

    function loadData0(jsonFile, category) {
        fetch(jsonFile)// 指定されたJSONファイルを非同期に取得
            .then(response => response.json())// レスポンスをJSON形式に変換
            .then(data => {// 取得したデータのうち、指定されたカテゴリに属するアイテムを処理
                data[category + 's'].forEach(function(item) {
                    if (item.latitude >= latStart && item.latitude <= latEnd && 
                        item.longitude >= lonStart && item.longitude <= lonEnd) {
                        // addItemToListにはカテゴリとアイテム全体を渡す
                        addItemToList(category, item);
                    }
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function addItemToList(category, item) {
        var listItem = document.createElement('div');
        listItem.setAttribute('data-category', category);
        listItem.setAttribute('data-id', item.id);
        listItem.setAttribute('data-latitude', item.latitude);
        listItem.setAttribute('data-longitude', item.longitude);
        listItem.setAttribute('data-initialmodel', item.initialmodel || "");

        // 各モデルへのパスを属性として追加
        listItem.setAttribute('data-sfmmodel', item.model.sfmmodel || "");
        listItem.setAttribute('data-pointcloud', item.model.pointcloud || "");
        listItem.setAttribute('data-bimcim', item.model.bimcim || "");
        listItem.setAttribute('data-femmodel', item.model.femmodel || "");
    
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.id;
        checkbox.name = item.id;
        checkbox.checked = true;
    
        var categoryLabel = document.createElement('span');
        categoryLabel.style.fontWeight = 'bold';
    
        if (category === 'bridge') {
            categoryLabel.textContent = 'Bridges:';
            categoryLabel.style.color = 'red';
        } else if (category === 'road') {
            categoryLabel.textContent = 'Roads:';
            categoryLabel.style.color = 'blue';
        } else if (category === 'ground') {
            categoryLabel.textContent = 'Ground:';
            categoryLabel.style.color = 'green';
        }
    
        var textLabel = document.createElement('label');
        textLabel.htmlFor = item.id;
        textLabel.appendChild(document.createTextNode(' ' + (item.name || item.id)));
        
        listItem.appendChild(checkbox);
        listItem.appendChild(categoryLabel);
        listItem.appendChild(textLabel);
    
        itemsList.appendChild(listItem);
    }
//****************************************************************************************

    var showData = document.getElementById('showData');
    var dataPopup = document.getElementById('dataPopup');

    addButton.addEventListener('click', function() {
        var selectedCategoryIndex = categorySelect.selectedIndex;
        var selectedDetailsIndex = detailsSelect.selectedIndex-1;//最初のindexが"Select Model"のため
    
        // categorySelectの選択された値を小文字に変換
        var category = categorySelect.options[selectedCategoryIndex].value.toLowerCase();
    
        // JSONファイルの名前を決定（例：'bridge.json'）
        var jsonFile = category + '.json';
    
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                // detailsSelectの選択に基づいたアイテムを取得
                var item = data[category + 's'][selectedDetailsIndex];
                if (item) {
                    // アイテムをリストに追加
                    //console.log(item)
                    addItemToList(category, item);
                }
            })
            .catch(error => console.error('Error:', error));
    });

    /*addButton.addEventListener('click', function() {        
        var selectedCategory = categorySelect.value;
        var selectedText = detailsSelect.options[detailsSelect.selectedIndex].text;
        if (selectedText !== 'Select Model') {
            console.log(selectedText)
            addItemToList(selectedCategory, selectedText);
        }
    });*/


    
});